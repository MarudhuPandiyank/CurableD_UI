// src/store/userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './index';

export type Privilege = 'VIEW' | 'CREATE' | 'EDIT';

export interface MenuItem {
  menu: string;
  menuOrder: number;
  url: string;
  privileges: Privilege[];
}

export interface UserState {
  isAuthed: boolean;
  token?: string | null;
  userId?: number | null;
  userName?: string | null;
  email?: string | null;
  roleName?: string | null;
  roleId?: number | null;
  hospitalId?: number | null;
  tenantName?: string | null;
  menus: MenuItem[];
}

const initialState: UserState = {
  isAuthed: false,
  token: null,
  userId: null,
  userName: null,
  email: null,
  roleName: null,
  roleId: null,
  hospitalId: null,
  tenantName: null,
  menus: [],
};

type AuthorizeApi = {
  userId: number;
  userName: string;
  email: string;
  roleName: string;
  roleId: number;
  isRecordDeleted: boolean;
  gender: string;
  phoneNo: string;
  customMenuDTOs: Array<{
    menu: string;
    menuOrder: number;
    url: string;
    privileges: string[];   // <-- accept raw strings from API
  }>;
  message: string | null;
  hospitalId: number;
  tenantName: string;
};


const normalizeUrl = (url: string) => (url || '').trim().replace(/\s+/g, '');

const toPrivileges = (arr: string[] | undefined): Privilege[] => {
  const allowed: Privilege[] = ['VIEW', 'CREATE', 'EDIT'];
  const up = (arr || []).map((s) => (s || '').toUpperCase().trim());
  return up.filter((s): s is Privilege => (allowed as string[]).includes(s));
};




const slice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string | null>) {
      state.token = action.payload;
      state.isAuthed = !!action.payload;
    },
    setAuthorizedUser(state, action: PayloadAction<AuthorizeApi>) {
      const p = action.payload;

      const mustHave: MenuItem = {
        menu: 'Modify Patient Information',
        menuOrder: 9999,
        url: '/PatientEdit',
        privileges: ['VIEW', 'EDIT'],
      };

    const incoming = (p.customMenuDTOs || []).map((m) => ({
  ...m,
  url: normalizeUrl(m.url || ''),
  menuOrder: Number.isFinite(m.menuOrder as any) ? Number(m.menuOrder) : 999,
  privileges: toPrivileges(m.privileges),   // <-- convert here
}));


      const exists = incoming.some(
        (m) => m.menu === mustHave.menu || normalizeUrl(m.url) === normalizeUrl(mustHave.url)
      );

      const merged = [...incoming, ...(exists ? [] : [mustHave])];
      state.menus = merged.sort((a, b) => a.menuOrder - b.menuOrder);

      state.isAuthed = true;
      state.userId = p.userId;
      state.userName = p.userName;
      state.email = p.email;
      state.roleName = p.roleName;
      state.roleId = p.roleId;
      state.hospitalId = p.hospitalId;
      state.tenantName = p.tenantName;
    },
    logout(state) {
      Object.assign(state, initialState);
    },
  },
});

export const { setToken, setAuthorizedUser, logout } = slice.actions;
export default slice.reducer;

// selectors
export const selectTenantName = (state: RootState) => state.user.tenantName || 'Cancer Institute';
export const selectUserName = (state: RootState) => state.user.userName || 'Guest';
export const selectMenus = (state: RootState) => state.user.menus;

// privilege selector
const norm = (url: string) => (url || '').trim().replace(/\s+/g, '');
export const hasPrivilege =
  (menuOrUrl: string, need: Privilege | Privilege[]) =>
  (state: RootState) => {
    const target = state.user.menus.find(
      (m) => m.menu === menuOrUrl || norm(m.url) === norm(menuOrUrl)
    );
    if (!target) return false;
    const needs = Array.isArray(need) ? need : [need];
    return needs.every((n) => target.privileges.includes(n));
  };

  export const selectPrivilegeFlags =
  (menuOrUrl: string) =>
  (state: RootState) => {
    const dto = state.user.menus.find(
      (m) => m.menu === menuOrUrl || norm(m.url) === norm(menuOrUrl)
    );
    const set = new Set(dto?.privileges ?? []);
    console.log(set,"sjs")
    return {
      canView: set.has('VIEW'),
      canCreate: set.has('CREATE'),
      canEdit: set.has('EDIT'),
      dto, // if you also want the menu dto itself
    };
  };

  
  // ===== Common, reusable privilege checkers =====
// const norm = (url: string) => (url || '').trim().replace(/\s+/g, '');

// const getDto = (state: RootState, menuOrUrl: string) =>
//   state.user.menus.find(
//     (m) => m.menu === menuOrUrl || norm(m.url) === norm(menuOrUrl)
//   );

// keep your existing norm + RootState import
const getDto = (state: RootState, menuOrUrl: string) => {
  const normalizedQuery = norm(menuOrUrl);
  console.log(normalizedQuery,"normalizedQuery")

  // DEBUG: entire menus array
  console.groupCollapsed('[userSlice/getDto] debug');
  console.log('menuOrUrl:', normalizedQuery, 'normalized:', normalizedQuery);
  console.log('state.user.menus:', state.user.menus);

  const dto = state.user.menus.find((m) => {
    const match =
      m.menu === menuOrUrl ||
      norm(m.url) === normalizedQuery;

    // DEBUG: each item checked
    console.log('checking m:', m, '→ match?', match);
    return match;
  });

  console.log('matched dto:', dto);
  console.groupEnd();

  return dto;
};


// True if user has EVERY privilege in `req`
export const canAll =
  (menuOrUrl: string, ...req: Privilege[]) =>
  (state: RootState) => {
    const dto = getDto(state, menuOrUrl);
    if (!dto) return false;
    const set = new Set(dto.privileges || []);
    return req.every((p) => set.has(p));
  };

// True if user has AT LEAST ONE in `req`
export const canAny =
  (menuOrUrl: string, ...req: Privilege[]) =>
  (state: RootState) => {
    const dto = getDto(state, menuOrUrl);
    if (!dto) return false;
    const set = new Set(dto.privileges || []);
    return req.some((p) => set.has(p));
  };

// True if user has EXACTLY the privileges in `exact` (no more, no less)
export const canExactly =
  (menuOrUrl: string, exact: Privilege[]) =>
  (state: RootState) => {
    const dto = getDto(state, menuOrUrl);
    if (!dto) return false;
    const set = new Set(dto.privileges || []);
    if (set.size !== exact.length) return false;
    return exact.every((p) => set.has(p));
  };

// Flexible rule: combine allOf / anyOf / noneOf / exactly
export const can =
  (
    menuOrUrl: string,
    rules: {
      allOf?: Privilege[];
      anyOf?: Privilege[];
      noneOf?: Privilege[];
      exactly?: Privilege[]; // if set, must match exactly
    } = {}
  ) =>
  (state: RootState) => {
    const dto = getDto(state, menuOrUrl);
    if (!dto) return false;
    const set = new Set(dto.privileges || []);

    // exactly (if provided, it overrides by requiring exact match)
    if (rules.exactly) {
      if (set.size !== rules.exactly.length) return false;
      for (const p of rules.exactly) if (!set.has(p)) return false;
    }

    if (rules.allOf && !rules.allOf.every((p) => set.has(p))) return false;
    if (rules.anyOf && !rules.anyOf.some((p) => set.has(p))) return false;
    if (rules.noneOf && rules.noneOf.some((p) => set.has(p))) return false;

    return true;
  };
