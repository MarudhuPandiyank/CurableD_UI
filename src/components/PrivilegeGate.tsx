import React from 'react';
import usePrivilege from '../hooks/usePrivilege';
import { Privilege } from '../store/userSlice';

type Props = {
  menu: string;                         // e.g. 'Patient Registration' or '/preg'
  allow: Privilege | Privilege[];       // 'VIEW' | 'CREATE' | 'EDIT'
  mode?: 'hide' | 'disable';            // default: 'hide'
  children: React.ReactElement;
};

const PrivilegeGate: React.FC<Props> = ({ menu, allow, mode='hide', children }) => {
  const ok = usePrivilege(menu, allow);
  if (ok) return children;
  return mode === 'disable'
    ? React.cloneElement(children, { disabled: true, 'aria-disabled': true })
    : null;
};

export default PrivilegeGate;
