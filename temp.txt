import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import Header1 from './Header1';
import config from '../config';
import './Common.css';
import './HomePage.css';
import './CreateNewUser.css';

type GenderUI = 'Male' | 'Female' | 'Other';
type GenderAPI = 'MALE' | 'FEMALE' | 'OTHER';

interface Role { id: number; name: string }
interface Hospital { id: number; name: string }

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d\S]{6,32}$/;

function toApiGender(g: GenderUI | ''): GenderAPI | null { return g ? (g.toUpperCase() as GenderAPI) : null; }

const CreateNewUser: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const incomingState = (location && (location.state as any)) || null;
  const editUser: any = incomingState?.user ?? null; // user object passed from EditUserManagement
  const incomingPrefill: any = incomingState?.prefill ?? null; // optional prefill from previous call
  const isEdit = !!(editUser && editUser.userId);

  // form state
  const [name, setName] = useState('');
  const [roleId, setRoleId] = useState<number | ''>('');
  const [roleLabel, setRoleLabel] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [gender, setGender] = useState<GenderUI | ''>('');
  // yearsExp removed per request
  const [password, setPassword] = useState('');
  const [hospitalIds, setHospitalIds] = useState<number[]>([]);

  // data
  const [roles, setRoles] = useState<Role[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);

  // ui
  const [submitting, setSubmitting] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  // edit-mode status: true = active, false = inactive
  const [isActive, setIsActive] = useState<boolean>(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showErrors, setShowErrors] = useState(false);

  // fetch roles & hospitals once
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    axios.get<any[]>(`${config.appURL}/curable/employeerolemaster`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        const list = Array.isArray(res.data) ? res.data : [];
        const mapped: Role[] = list.map((r: any) => ({ id: Number(r?.id ?? r?.employeeRoleMasterId), name: String(r?.name ?? r?.roleName ?? '') })).filter(r => r.id && r.name);
        setRoles(mapped);
      }).catch(() => {});

    axios.get<Hospital[]>(`${config.appURL}/curable/hospitals`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setHospitals(res.data || [])).catch(() => {});
  }, []);

  // when roles load, if we only had a roleLabel from prefill, try to resolve id
  useEffect(() => {
    if (!roleLabel || roleId) return;
    const match = roles.find(r => r.name?.toLowerCase() === roleLabel.toLowerCase());
    if (match) setRoleId(match.id);
  }, [roleLabel, roles, roleId]);

  // apply prefill priority: incomingPrefill -> candidatehistoryForPrefil(type:2) -> editUser
  useEffect(() => {
    const apply = (data: any) => {
      if (!data) return;
      if (data.name) setName(String(data.name));
      if (data.userName) setName(String(data.userName));
      if (data.email) setEmail(String(data.email));
      if (data.phoneNo) setPhoneNo(String(data.phoneNo));
      if (data.gender) setGender(String(data.gender).toLowerCase() === 'female' ? 'Female' : String(data.gender).toLowerCase() === 'male' ? 'Male' : 'Other');
      if (data.employeeRoleMasterId) setRoleId(Number(data.employeeRoleMasterId));
      else if (data.roleId) setRoleId(Number(data.roleId));
      else if (data.roleName) setRoleLabel(String(data.roleName));
      if (Array.isArray(data.hospitalId) && data.hospitalId.length) setHospitalIds(data.hospitalId.map((x: any) => Number(x)));
    };

    if (incomingPrefill) { apply(incomingPrefill); return; }

    if (isEdit) {
      const token = localStorage.getItem('token');
      (async () => {
        try {
          if (token) {
            const resp = await axios.post(`${config.appURL}/curable/1candidatehistoryForPrefil`, { candidateId: String(editUser.userId), type: 2 }, { headers: { Authorization: `Bearer ${token}` } });
            const data: any = resp?.data ?? null;
            if (data) { apply(data); return; }
          }
        } catch (err) {
          // ignore and fallback to editUser
          console.error('prefill api failed', err);
        }
        apply(editUser);
        // initialize isActive from editUser if present
        if (editUser && typeof editUser.isRecordDeleted !== 'undefined') {
          setIsActive(!Boolean(editUser.isRecordDeleted));
        }
      })();
    }
  }, [incomingPrefill, isEdit, editUser]);

  const validate = () => {
    // When editing we only allow status changes; skip other validations so Update can submit
    if (isEdit) return {};
    const e: Record<string, string> = {};
    if (!name || name.trim().length < 2 || name.trim().length > 60) e.name = 'Please enter a valid name (2–60 characters).';
    if (!roleId) e.roleId = 'Please select a role.';
    if (!emailRegex.test(email)) e.email = 'Please enter a valid email address.';
    if (!/^\d{10}$/.test(phoneNo)) e.phoneNo = 'Mobile number must be exactly 10 digits.';
    if (!gender) e.gender = 'Please select gender.';
    // yearsExp validation removed
    if (!isEdit && !passwordRegex.test(password)) e.password = 'Password must be 6–32 characters with letters and numbers.';
    return e;
  };

  const handleCreate = async () => {
    const v = validate(); setErrors(v); setShowErrors(true); if (Object.keys(v).length) return;
    const token = localStorage.getItem('token'); if (!token) { setErrors({ form: 'No token found. Please log in again.' }); return; }
    const hospitalIdsStr = localStorage.getItem('hospitalId'); const hospitalIdNum = hospitalIdsStr ? Number(hospitalIdsStr) : undefined;

    // ensure we send the role name — prefer resolved label, fall back to roles lookup
    const resolvedRoleLabel = roleLabel || (roles.find(r => r.id === Number(roleId))?.name) || '';
    const payload = {
      email,
      employeeRoleMasterId: Number(roleId),
      gender: toApiGender(gender)!,
      hospitalId: hospitalIdNum !== undefined ? [hospitalIdNum] : [],
      id: null,
      name: name.trim(),
      password,
      phoneNo,
      role: resolvedRoleLabel,
  // yearsExp removed
    };

    try {
      setSubmitting(true);
      if (isEdit) {
        // send the full user payload on edit (as you expect)
        const resolvedRoleLabelEdit = roleLabel || (roles.find(r => r.id === Number(roleId))?.name) || '';
        const editPayload = {
          id: editUser.userId,
          keycloakUserId: editUser?.keycloakUserId || 'aa-89-jj',
          email,
          employeeRoleMasterId: Number(roleId),
          gender: toApiGender(gender)!,
          hospitalId: hospitalIdNum !== undefined ? [hospitalIdNum] : [],
          name: name.trim(),
          // password is not shown/edited in edit mode but keep existing value if present
          password,
          phoneNo,
          role: resolvedRoleLabelEdit,
          // yearsExp removed
          // map UI toggle to isRecordDeleted expected by backend
          isRecordDeleted: !isActive,
        };

        const res = await axios.post(`${config.appURL}/curable/createUser`, editPayload, { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } });
        if (res.status === 200 || res.status === 201) { alert('User updated successfully.'); navigate(-1); }
        else setErrors({ form: 'Unable to update user. Please try again.' });
      } else {
        const res = await axios.post(`${config.appURL}/curable/createUser`, payload, { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } });
        if (res.status === 200 || res.status === 201) { alert('User created successfully.'); navigate(-1); }
        else setErrors({ form: 'Unable to create user. Please try again.' });
      }
    } catch (err: any) {
      const status = err?.response?.status; const message = err?.response?.data?.message || '';
      if (status === 409 && /email/i.test(message)) setErrors({ email: 'An account with this email already exists.' });
      else if (status === 409 && /phone/i.test(message)) setErrors({ phoneNo: 'An account with this mobile number already exists.' });
      else setErrors({ form: 'Network or server error. Please try again.' });
      setShowErrors(true);
    } finally { setSubmitting(false); }
  };

  const handleHospitalToggle = (id: number) => setHospitalIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));

  return (
    <div className="container2">
      <Header1 />
      <form className="clinic-details-form-newscreening" onSubmit={e => { e.preventDefault(); handleCreate(); }} noValidate>
        <h1 className="new-screening-title">{isEdit ? 'Edit User' : 'Create New User'}</h1>

        <div className="form-group">
          <label style={{ color: 'black' }}><strong>Name</strong> <span style={{ color: 'red' }}>*</span>:</label>
          <input type="text" placeholder="Enter Name" value={name} onChange={e => setName(e.target.value)} aria-invalid={!!errors.name} disabled={isEdit} />
          {showErrors && errors.name && <p className="errors_message">{errors.name}</p>}
        </div>

        <div className="form-group">
          <label style={{ color: 'black' }}><strong>Role</strong> <span style={{ color: 'red' }}>*</span>:</label>
          <select value={roleId} onChange={e => setRoleId(e.target.value ? Number(e.target.value) : '')} aria-invalid={!!errors.roleId} disabled={isEdit}>
            <option value="">Select</option>
            {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          {showErrors && errors.roleId && <p className="errors_message">{errors.roleId}</p>}
        </div>

        <div className="form-group">
          <label style={{ color: 'black' }}><strong>Email ID</strong> <span style={{ color: 'red' }}>*</span>:</label>
          <input type="email" placeholder="email" value={email} onChange={e => setEmail(e.target.value.trim())} aria-invalid={!!errors.email} disabled={isEdit} />
          {showErrors && errors.email && <p className="errors_message">{errors.email}</p>}
        </div>

        <div className="form-group">
          <label style={{ color: 'black' }}><strong>Mobile</strong> <span style={{ color: 'red' }}>*</span>:</label>
          <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={10} placeholder="10-digit number" value={phoneNo} onChange={e => { const v = e.target.value.replace(/\D/g, ''); if (v.length <= 10) setPhoneNo(v); }} aria-invalid={!!errors.phoneNo} disabled={isEdit} />
          {showErrors && errors.phoneNo && <p className="errors_message">{errors.phoneNo}</p>}
        </div>

        <div className="form-group">
          <label style={{ color: 'black' }}><strong>Gender</strong> <span style={{ color: 'red' }}>*</span>:</label>
          <div className="gender-group">{(['Male','Female','Other'] as GenderUI[]).map(g => <button key={g} type="button" disabled={isEdit} className={`gender-btn ${gender === g ? 'active' : ''}`} aria-pressed={gender === g} onClick={() => setGender(g)}>{g}</button>)}</div>
          {showErrors && errors.gender && <p className="errors_message">{errors.gender}</p>}
        </div>

        {/* Years of Experience removed per request */}

        {/* Password: hide in edit mode */}
        {!isEdit && (
          <div className="form-group">
            <label style={{ color: 'black' }}><strong>Password</strong> <span style={{ color: 'red' }}>*</span>:</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} aria-invalid={!!errors.password} placeholder="Enter password" />
            </div>
            {showErrors && errors.password && <p className="errors_message">{errors.password}</p>}
          </div>
        )}

        {/* Status toggle shown only in edit mode */}
        {isEdit && (
          <div className="form-group">
            <label style={{ color: 'black' }}><strong>Status</strong>:</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 ,marginLeft:'10px'}}>
              <span style={{marginTop:"10px"}} className="toggle-label">{isActive ? 'Active' : 'Inactive'}</span>

              <label className="toggle-switch" aria-label="Toggle user status">
  <input
    type="checkbox"
    checked={isActive}
    onChange={e => setIsActive(e.target.checked)}
    aria-checked={isActive}
    role="switch"
  />
  <span className="slider" />
</label>

            </div>
          </div>
        )}

        {showErrors && errors.form && <div className="errors_message" role="alert" aria-live="polite" style={{ marginBottom: 8 }}>{errors.form}</div>}

        <center style={{ marginTop: '30px' }}>
          <div className="buttons">
            <button type="button" className="Next-button Next-button_home" onClick={() => navigate(-1)} disabled={submitting}>Back</button>
            <button type="submit" className="Finish-createbutton" disabled={submitting}>{submitting ? 'Creating...' : (isEdit ? 'Update' : 'Create')}</button>
          </div>
        </center>
      </form>

      <br />

      <footer className="footer-container-fixed">
        <div className="footer-content">
          <p className="footer-text">Powered By</p>
          <img src="/assets/Curable logo - rectangle with black text.png" alt="Curable Logo" className="footer-logo" />
        </div>
      </footer>
    </div>
  );
};

export default CreateNewUser;
