import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Header1 from "./Header1";
import config from "../config";
import "./Common.css";
import "./HomePage.css";

type GenderUI = "Male" | "Female" | "Other";
type GenderAPI = "MALE" | "FEMALE" | "OTHER";

interface Role { id: number; name: string; }
interface Hospital { id: number; name: string; }

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d\S]{6,32}$/;

function toApiGender(g: GenderUI | ""): GenderAPI | null {
  return g ? (g.toUpperCase() as GenderAPI) : null;
}

const CreateNewUser: React.FC = () => {
  const navigate = useNavigate();

  // form state
  const [name, setName] = useState("");
  const [roleId, setRoleId] = useState<number | "">("");
  const [roleLabel, setRoleLabel] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [gender, setGender] = useState<GenderUI | "">("");
  const [yearsExp, setYearsExp] = useState<number | "">("");
  const [password, setPassword] = useState("");
  const [hospitalIds, setHospitalIds] = useState<number[]>([]);

  // data sources
  const [roles, setRoles] = useState<Role[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);

  // ui
  const [submitting, setSubmitting] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  // validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showErrors, setShowErrors] = useState(false); // show only after Create

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // ✅ Fetch roles from API: /curable/employeerolemaster
    axios
      .get<any[]>(`${config.appURL}/curable/employeerolemaster`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        // be defensive about field names (id/name vs employeeRoleMasterId/roleName)
        const mapped: Role[] = list
          .map((r: any) => ({
            id: Number(r?.id ?? r?.employeeRoleMasterId),
            name: String(r?.name ?? r?.roleName ?? ""),
          }))
          .filter((r) => r.id && r.name);
        setRoles(mapped);
      })
      .catch(() => {
        // keep roles empty if fetch fails
      });

    // keep your existing hospitals fetch (even if UI is commented)
    axios
      .get<Hospital[]>(`${config.appURL}/curable/hospitals`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setHospitals(res.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const lbl = roles.find((r) => r.id === roleId)?.name || "";
    setRoleLabel(lbl);
  }, [roleId, roles]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name || name.trim().length < 2 || name.trim().length > 60)
      e.name = "Please enter a valid name (2–60 characters).";
    if (!roleId) e.roleId = "Please select a role.";
    if (!emailRegex.test(email)) e.email = "Please enter a valid email address.";
    if (!/^\d{10}$/.test(phoneNo)) e.phoneNo = "Mobile number must be exactly 10 digits.";
    if (!gender) e.gender = "Please select gender.";
    if (yearsExp === "" || !Number.isInteger(Number(yearsExp)) || Number(yearsExp) < 0 || Number(yearsExp) > 60)
      e.yearsExp = "Enter years of experience between 0 and 60.";
    // if (!hospitalIds.length) e.hospitalIds = "Select at least one hospital.";
    if (!passwordRegex.test(password))
      e.password = "Password must be 6–32 characters with letters and numbers.";
    return e;
  };

  const handleCreate = async () => {
    const v = validate();
    setErrors(v);
    setShowErrors(true);
    if (Object.keys(v).length) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setErrors({ form: "No token found. Please log in again." });
      return;
    }

    // hospital id from localStorage, send as array
    const hospitalIdsStr = localStorage.getItem("hospitalId");
    const hospitalIdNum = hospitalIdsStr ? Number(hospitalIdsStr) : undefined;

    const payload = {
      email,
      employeeRoleMasterId: Number(roleId), // <-- send selected role master id
      gender: toApiGender(gender)!,
      hospitalId: hospitalIdNum !== undefined ? [hospitalIdNum] : [], // matches your current approach
      id: null,
      name: name.trim(),
      password,
      phoneNo,
      role: roleLabel, // label as provided by the roles API
      yearsExp: Number(yearsExp),
    };

    try {
      setSubmitting(true);
      const res = await axios.post(`${config.appURL}/curable/createUser`, payload, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });

      if (res.status === 200 || res.status === 201) {
        alert("User created successfully.");
        navigate(-1);
      } else {
        setErrors({ form: "Unable to create user. Please try again." });
      }
    } catch (err: any) {
      const status = err?.response?.status;
      const message = err?.response?.data?.message || "";
      if (status === 409 && /email/i.test(message)) {
        setErrors({ email: "An account with this email already exists." });
      } else if (status === 409 && /phone/i.test(message)) {
        setErrors({ phoneNo: "An account with this mobile number already exists." });
      } else {
        setErrors({ form: "Network or server error. Please try again." });
      }
      setShowErrors(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleHospitalToggle = (id: number) => {
    setHospitalIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <div className="container2">
      <Header1 />

      <form
        className="clinic-details-form-newscreening"
        onSubmit={(e) => {
          e.preventDefault();
          handleCreate();
        }}
        noValidate
      >
        <h1 className="new-screening-title">Create New User</h1>

        {/* Name */}
        <div className="form-group">
          <label style={{ color: "black" }}>
            <strong>Name</strong> <span style={{ color: "red" }}>*</span>:
          </label>
          <input
            type="text"
            placeholder="Enter Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={!!errors.name}
          />
          {showErrors && errors.name && <p className="errors_message">{errors.name}</p>}
        </div>

        {/* Role (from API) */}
        <div className="form-group">
          <label style={{ color: "black" }}>
            <strong>Role</strong> <span style={{ color: "red" }}>*</span>:
          </label>
          <select
            value={roleId}
            onChange={(e) => setRoleId(e.target.value ? Number(e.target.value) : "")}
            aria-invalid={!!errors.roleId}
          >
            <option value="">Select</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          {showErrors && errors.roleId && <p className="errors_message">{errors.roleId}</p>}
        </div>

        {/* Email */}
        <div className="form-group">
          <label style={{ color: "black" }}>
            <strong>Email ID</strong> <span style={{ color: "red" }}>*</span>:
          </label>
          <input
            type="email"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value.trim())}
            aria-invalid={!!errors.email}
          />
        {showErrors && errors.email && <p className="errors_message">{errors.email}</p>}
        </div>

        {/* Mobile */}
        <div className="form-group">
          <label style={{ color: "black" }}>
            <strong>Mobile</strong> <span style={{ color: "red" }}>*</span>:
          </label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={10}
            placeholder="10-digit number"
            value={phoneNo}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "");
              if (v.length <= 10) setPhoneNo(v);
            }}
            aria-invalid={!!errors.phoneNo}
          />
          {showErrors && errors.phoneNo && <p className="errors_message">{errors.phoneNo}</p>}
        </div>

        {/* Gender */}
        <div className="form-group">
          <label style={{ color: "black" }}>
            <strong>Gender</strong> <span style={{ color: "red" }}>*</span>:
          </label>
          <div className="gender-group">
            {(["Male", "Female", "Other"] as GenderUI[]).map((g) => (
              <button
                key={g}
                type="button"
                className={`gender-btn ${gender === g ? "active" : ""}`}
                aria-pressed={gender === g}
                onClick={() => setGender(g)}
              >
                {g}
              </button>
            ))}
          </div>
          {showErrors && errors.gender && <p className="errors_message">{errors.gender}</p>}
        </div>

        {/* Years of Experience */}
        <div className="form-group">
          <label style={{ color: "black" }}>
            <strong>Years of Experience</strong> <span style={{ color: "red" }}>*</span>:
          </label>
          <input
            type="number"
            min={0}
            max={60}
            step={1}
            value={yearsExp}
            onChange={(e) => {
              const n = e.target.value === "" ? "" : Number(e.target.value);
              if (n === "" || (Number.isInteger(n) && n >= 0 && n <= 60)) setYearsExp(n as number | "");
            }}
            onWheel={(e) => e.currentTarget.blur()}
            onKeyDown={(e) => {
              if (["e", "E", "+", "-", "."].includes(e.key)) e.preventDefault();
            }}
            aria-invalid={!!errors.yearsExp}
          />
          {showErrors && errors.yearsExp && <p className="errors_message">{errors.yearsExp}</p>}
        </div>

        {/* Password */}
        <div className="form-group">
          <label style={{ color: "black" }}>
            <strong>Password</strong> <span style={{ color: "red" }}>*</span>:
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type={showPwd ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!errors.password}
              placeholder="Enter password"
            />
          </div>
          {showErrors && errors.password && (
            <p className="errors_message">{errors.password}</p>
          )}
        </div>

        {/* Form-level error (bottom, as in your snippet) */}
        {showErrors && errors.form && (
          <div className="errors_message" role="alert" aria-live="polite" style={{ marginBottom: 8 }}>
            {errors.form}
          </div>
        )}

        {/* Actions */}
        <center style={{ marginTop: "30px" }}>
          <div className="buttons">
            <button
              type="button"
              className="Next-button Next-button_home"
              onClick={() => navigate(-1)}
              disabled={submitting}
            >
              Back
            </button>
            <button type="submit" className="Finish-createbutton" disabled={submitting}>
              {submitting ? "Creating..." : "Create"}
            </button>
          </div>
        </center>
      </form>

      <br />

      <footer className="footer-container-fixed">
        <div className="footer-content">
          <p className="footer-text">Powered By</p>
          <img
            src="/assets/Curable logo - rectangle with black text.png"
            alt="Curable Logo"
            className="footer-logo"
          />
        </div>
      </footer>
    </div>
  );
};

export default CreateNewUser;
