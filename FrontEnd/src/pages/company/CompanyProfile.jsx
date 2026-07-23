import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isValidCompanyContact, isValidCompanyEmail, isValidLocation, isAlphaOnly, filterAlphaInput } from "../../utils/validation";
import { Building, LayoutDashboard, Users, FileText, Settings, LogOut, ShieldCheck, AlertTriangle, CheckCircle2, Menu } from "lucide-react";
import CompanySidebar from "../../components/CompanySidebar";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const PREDEFINED_ROLES = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "AI Engineer",
  "Data Analyst",
  "DevOps Engineer",
  "Mobile App Developer",
  "Other"
];

const CompanyProfile = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    companyName: "",
    companyEmail: "",
    helplineNumber: "",
    location: "",
    hiringType: "",
    techHiringCount: "",
    nonTechHiringCount: "",
    roles: [],
    offerType: "",
    minimumPercentage: "",
    companyLogo: "",
  });

  const [customRole, setCustomRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileExists, setProfileExists] = useState(false);
  const [verified, setVerified] = useState(false);
  const [errors, setErrors] = useState({});
  const [tempWarnings, setTempWarnings] = useState({});
  const [globalMessage, setGlobalMessage] = useState(null);
  
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchCompany = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/company/me`, {
          headers: { Authorization: "Bearer " + token },
        });

        if (!res.ok) return;

        const data = await res.json();
        
        let loadedRoles = [];
        let loadedCustomRole = "";
        
        if (data.roles && Array.isArray(data.roles)) {
            data.roles.forEach(r => {
                if (PREDEFINED_ROLES.includes(r) && r !== "Other") {
                    loadedRoles.push(r);
                } else {
                    loadedRoles.push("Other");
                    loadedCustomRole = r;
                }
            });
            loadedRoles = [...new Set(loadedRoles)];
        }

        setForm({
          companyName: data.companyName || "",
          companyEmail: data.companyEmail || "",
          helplineNumber: data.helplineNumber || "",
          location: data.location || "",
          hiringType: data.hiringType || "",
          techHiringCount: data.techHiringCount || "",
          nonTechHiringCount: data.nonTechHiringCount || "",
          roles: loadedRoles,
          offerType: data.offerType || "",
          minimumPercentage: data.minimumPercentage || "",
          companyLogo: data.companyLogo || "",
        });
        
        setCustomRole(loadedCustomRole);
        setProfileExists(true);
        setVerified(data.profileStatus === "verified");
      } catch (err) {
        console.error("Fetch company profile failed", err);
      }
    };

    fetchCompany();
  }, []);

  const fieldOrder = [
    "companyName", "companyEmail", "helplineNumber", "location",
    "hiringType", "offerType", "vacancies", "minimumPercentage",
    "roles", "customRole"
  ];

  const isFieldEnabled = (fieldName) => {
    const idx = fieldOrder.indexOf(fieldName);
    if (idx <= 0) return true;
    
    for (let i = 0; i < idx; i++) {
      const prevField = fieldOrder[i];
      let prevValue = form[prevField];
      
      if (prevField === "vacancies") {
        if (form.hiringType === "tech" || form.hiringType === "both") {
          if (!form.techHiringCount || errors.techHiringCount) return false;
        }
        if (form.hiringType === "non-tech" || form.hiringType === "both") {
          if (!form.nonTechHiringCount || errors.nonTechHiringCount) return false;
        }
        continue;
      }
      
      if (prevField === "customRole") {
        if (form.roles.includes("Other")) {
           if (!customRole || !customRole.trim() || errors.customRole) return false;
        }
        continue;
      }

      if (prevField === "roles") {
         if (!form.roles || form.roles.length === 0 || errors.roles) return false;
         continue;
      }

      if (prevField === "minimumPercentage") {
        if (errors.minimumPercentage) return false;
        continue;
      }

      if (!prevValue || (typeof prevValue === "string" && !prevValue.trim())) return false;
      if (errors[prevField]) return false;
    }
    return true;
  };

  const validateField = (name, value, dependencyState = form) => {
    let err = "";
    switch (name) {
      case "companyName":
        if (!value || !value.trim()) err = "This field is required";
        else if (!isAlphaOnly(value)) err = "Only alphabets and spaces are allowed.";
        break;
      case "location":
        if (!value || !value.trim()) err = "This field is required";
        else if (!isValidLocation(value)) err = "Location must contain at least one alphabet.";
        break;
      case "offerType":
      case "hiringType":
        if (!value || (typeof value === "string" && !value.trim())) err = "This field is required";
        break;
      case "companyEmail":
        if (!value) err = "Company email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) err = "Please enter a valid company email address.";
        else if (!isValidCompanyEmail(value)) err = "Only official company email addresses are allowed.";
        break;
      case "helplineNumber":
        if (!value) err = "Helpline number is required";
        else if (!isValidCompanyContact(value)) err = "Please enter a valid company contact number.";
        break;
      case "techHiringCount":
        if (dependencyState.hiringType === "tech" || dependencyState.hiringType === "both") {
          if (!value || Number(value) < 1) err = "Enter valid numeric volume";
        }
        break;
      case "nonTechHiringCount":
        if (dependencyState.hiringType === "non-tech" || dependencyState.hiringType === "both") {
          if (!value || Number(value) < 1) err = "Enter valid numeric volume";
        }
        break;
      case "minimumPercentage":
        if (value !== "" && (Number(value) < 0 || Number(value) > 100)) err = "Must be exactly between 0 and 100";
        break;
      case "roles":
        if (!value || value.length === 0) err = "You must select at least one role";
        break;
      case "customRole":
        if (dependencyState.roles.includes("Other")) {
            if (!value || !value.trim()) err = "Specify your custom role or un-toggle 'Other'";
            else if (!isAlphaOnly(value)) err = "Only letters are allowed.";
        }
        break;
      default:
        break;
    }
    return err;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let filtered = value;

    if (tempWarnings[name]) setTempWarnings(prev => ({ ...prev, [name]: "" }));

    if (name === "helplineNumber") {
      const rawContact = value.replace(/[^\d\s-]/g, "");
      if (rawContact.replace(/[\s-]/g, "").length > 11) {
        setTempWarnings(prev => ({ ...prev, helplineNumber: "Maximum length reached." }));
      }
      filtered = rawContact.slice(0, 15);
      if (value !== filtered) e.target.value = filtered;
    } else if (name === "companyName") {
      filtered = filterAlphaInput(value);
    }

    const newForm = { ...form, [name]: filtered };
    setForm(newForm);
    
    if (name === "hiringType") {
      newForm.techHiringCount = value === "tech" || value === "both" ? form.techHiringCount : "";
      newForm.nonTechHiringCount = value === "non-tech" || value === "both" ? form.nonTechHiringCount : "";
      setForm(newForm);
    }
    
    setErrors(prev => ({ ...prev, [name]: validateField(name, filtered, newForm) }));
  };
  
  const handleCustomRoleChange = (e) => {
      const filtered = filterAlphaInput(e.target.value);
      setCustomRole(filtered);
      setErrors(prev => ({ ...prev, customRole: validateField("customRole", filtered) }));
  };

  const handleRoleToggle = (role) => {
    setForm(prev => {
      let updatedRoles;
      if (prev.roles.includes(role)) {
         updatedRoles = prev.roles.filter(r => r !== role);
      } else {
         updatedRoles = [...prev.roles, role];
      }
      const newForm = { ...prev, roles: updatedRoles };
      setErrors(currErrs => ({ ...currErrs, roles: validateField("roles", updatedRoles, newForm) }));
      return newForm;
    });
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setGlobalMessage({ type: "error", text: "Image size must be less than 2MB" });
      return;
    }

    const formData = new FormData();
    formData.append("photo", file);

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE_URL}/company/upload-photo`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setForm(prev => ({ ...prev, companyLogo: data.photoUrl }));
      } else {
        setGlobalMessage({ type: "error", text: data.message });
      }
    } catch (err) {
      setGlobalMessage({ type: "error", text: "Failed to upload photo." });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalMessage(null);

    const newErrors = {};
    Object.keys(form).forEach(key => {
       const err = validateField(key, form[key]);
       if (err) newErrors[key] = err;
    });
    
    if (form.roles.includes("Other")) {
       const crErr = validateField("customRole", customRole);
       if (crErr) newErrors.customRole = crErr;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setGlobalMessage({ type: "error", text: "Please fix the validation errors before submitting." });
      return;
    }

    setLoading(true);

    const finalRoles = form.roles.map(r => r === "Other" ? customRole : r);
    const payload = { ...form, roles: finalRoles };
    if (form.hiringType === "tech") payload.nonTechHiringCount = 0;
    if (form.hiringType === "non-tech") payload.techHiringCount = 0;

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_BASE_URL}/company/profile`, {
        method: profileExists ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      setProfileExists(true);
      setVerified(result.profileStatus === "verified");
      setGlobalMessage({ type: "success", text: "Profile configuration saved successfully!" });
    } catch (err) {
      setGlobalMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const hasAnyErrors = Object.values(errors).some(err => err !== "");

  // Derived Stats
  const totalVacancies = (Number(form.techHiringCount) || 0) + (Number(form.nonTechHiringCount) || 0);
  const activeRoles = form.roles.length;
  
  return (
    <div className="pr-layout">
      
      {/* ── Sidebar ── */}
      <CompanySidebar isMobileOpen={menuOpen} closeMobile={() => setMenuOpen(false)} />

      {/* ── Main Content Area ── */}
      <main className="pr-main company-main">
         
         <header className="pr-page-header-band">
            <div className="pr-page-header-left">
               <button className="pr-hamburger" onClick={() => setMenuOpen(true)} style={{ marginRight: '4px' }}>
                 <Menu size={22} />
               </button>
               <div>
                 <div className="pr-page-header-title">Company Profile</div>
                 <div className="pr-page-header-sub">Manage your company information and hiring configuration.</div>
               </div>
            </div>
            <div className="pr-page-header-right">
               <div className="pr-page-date">
                 {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
               </div>
               {verified ? (
                 <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16,185,129,0.1)', color: '#059669', padding: '7px 14px', borderRadius: '999px', fontSize: '13px', fontWeight: '600', border: '1px solid rgba(16,185,129,0.2)' }}>
                   <ShieldCheck size={15}/> Identity Verified
                 </div>
               ) : (
                 <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(245,158,11,0.1)', color: '#D97706', padding: '7px 14px', borderRadius: '999px', fontSize: '13px', fontWeight: '600', border: '1px solid rgba(245,158,11,0.2)' }}>
                   <AlertTriangle size={15}/> Verification Pending
                 </div>
               )}
            </div>
         </header>

         <div className="pr-page-body">
            
            {globalMessage && (
               <div className={`sp-global-alert sp-alert-${globalMessage.type}`} style={{ marginBottom: "24px" }}>
                  {globalMessage.text}
               </div>
            )}

            <div style={{ background: '#FFFFFF', borderRadius: '14px', border: '1px solid var(--pr-border)', boxShadow: '0 2px 8px rgba(24,36,61,0.05)', overflow: 'hidden' }}>
               <div style={{ padding: '32px 36px' }}>

                  <div className="pr-section-head">
                     <div className="pr-section-icon"><Building size={20}/></div>
                     <div>
                       <div className="pr-section-title">Company Identity</div>
                       <div className="pr-section-desc">Official details for candidate communication.</div>
                     </div>
                  </div>

                  <div className="pr-grid-2">
                     <div className="pr-field">
                       <label className="pr-label">Registered Company Name</label>
                       <div className="pr-input-wrap">
                         <input className={`pr-input no-icon ${errors.companyName ? 'is-error' : ''}`} name="companyName" value={form.companyName} onChange={handleChange} placeholder="Acme Corp" disabled={profileExists || !isFieldEnabled("companyName")} />
                         {!errors.companyName && form.companyName && <span className="pr-icon-right pr-icon-valid"><CheckCircle2 size={16}/></span>}
                       </div>
                       {errors.companyName && <span className="pr-field-error"><AlertTriangle size={12}/> {errors.companyName}</span>}
                     </div>

                     <div className="pr-field">
                       <label className="pr-label">Official Email</label>
                       <div className="pr-input-wrap">
                         <input className={`pr-input no-icon ${errors.companyEmail ? 'is-error' : ''}`} name="companyEmail" type="email" value={form.companyEmail} onChange={handleChange} placeholder="hiring@acme.com" disabled={profileExists || !isFieldEnabled("companyEmail")} />
                         {!errors.companyEmail && form.companyEmail && <span className="pr-icon-right pr-icon-valid"><CheckCircle2 size={16}/></span>}
                       </div>
                       {errors.companyEmail && <span className="pr-field-error"><AlertTriangle size={12}/> {errors.companyEmail}</span>}
                     </div>

                     <div className="pr-field">
                       <label className="pr-label">Helpline Number</label>
                       <div className="pr-input-wrap">
                         <input className={`pr-input no-icon ${errors.helplineNumber ? 'is-error' : ''}`} name="helplineNumber" type="tel" value={form.helplineNumber} onChange={handleChange} placeholder="Mobile or Toll-Free" disabled={profileExists || !isFieldEnabled("helplineNumber")} />
                         {!errors.helplineNumber && form.helplineNumber && <span className="pr-icon-right pr-icon-valid"><CheckCircle2 size={16}/></span>}
                       </div>
                       {errors.helplineNumber ? (
                         <span className="pr-field-error"><AlertTriangle size={12}/> {errors.helplineNumber}</span>
                       ) : tempWarnings.helplineNumber ? (
                         <span className="pr-field-warning" style={{color: "#d97706"}}><AlertTriangle size={12}/> {tempWarnings.helplineNumber}</span>
                       ) : null}
                     </div>

                     <div className="pr-field">
                       <label className="pr-label">Primary HQ Location</label>
                       <div className="pr-input-wrap">
                         <input className={`pr-input no-icon ${errors.location ? 'is-error' : ''}`} name="location" value={form.location} onChange={handleChange} placeholder="San Francisco, CA" disabled={profileExists || !isFieldEnabled("location")} />
                         {!errors.location && form.location && <span className="pr-icon-right pr-icon-valid"><CheckCircle2 size={16}/></span>}
                       </div>
                       {errors.location && <span className="pr-field-error"><AlertTriangle size={12}/> {errors.location}</span>}
                     </div>
                  </div>

                  {profileExists && (
                       <div style={{ marginTop: "24px", display: "flex", alignItems: "flex-start", gap: "10px", padding: "14px 16px", background: "#EFF6FF", borderRadius: "10px", fontSize: "13px", color: "#1E40AF", border: "1px solid #BFDBFE", fontWeight: "500" }}>
                         <svg style={{ flexShrink: 0, marginTop: '1px' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                         <span>Core identity fields (Company Name, Email, Location) are securely locked after registration to prevent misrepresentation.</span>
                       </div>
                   )}

                  <div className="pr-section-head" style={{ borderTop: "1px solid var(--pr-border)", marginTop: "40px", paddingTop: "40px" }}>
                     <div className="pr-section-icon"><Settings size={20}/></div>
                     <div>
                       <div className="pr-section-title">Hiring Parameters</div>
                       <div className="pr-section-desc">Define your recruitment target criteria.</div>
                     </div>
                  </div>

                  <div className="pr-grid-2">
                     <div className="pr-field">
                       <label className="pr-label">Hiring Domain Target</label>
                       <div className="pr-input-wrap">
                         <select className={`pr-input no-icon pr-select ${errors.hiringType ? 'is-error' : ''}`} name="hiringType" value={form.hiringType} onChange={handleChange} disabled={!isFieldEnabled("hiringType")}>
                           <option value="">Select Target...</option>
                           <option value="tech">Tech Candidates</option>
                           <option value="non-tech">Non-Tech Candidates</option>
                           <option value="both">Both (Multidisciplinary)</option>
                         </select>
                       </div>
                       {errors.hiringType && <span className="pr-field-error"><AlertTriangle size={12}/> {errors.hiringType}</span>}
                     </div>

                     <div className="pr-field">
                       <label className="pr-label">Offer Structure</label>
                       <div className="pr-input-wrap">
                         <select className={`pr-input no-icon pr-select ${errors.offerType ? 'is-error' : ''}`} name="offerType" value={form.offerType} onChange={handleChange} disabled={!isFieldEnabled("offerType")}>
                           <option value="">Select Offer...</option>
                           <option value="Internship">Internship Only</option>
                           <option value="Full-Time">Full-Time Only</option>
                           <option value="Both">Internship & Full-Time</option>
                         </select>
                       </div>
                       {errors.offerType && <span className="pr-field-error"><AlertTriangle size={12}/> {errors.offerType}</span>}
                     </div>

                     {(form.hiringType === "tech" || form.hiringType === "both") && (
                         <div className="pr-field">
                           <label className="pr-label">Tech Vacancies</label>
                           <div className="pr-input-wrap">
                             <input className={`pr-input no-icon ${errors.techHiringCount ? 'is-error' : ''}`} name="techHiringCount" type="number" min="1" value={form.techHiringCount} onChange={handleChange} placeholder="e.g. 5" disabled={!isFieldEnabled("vacancies")} />
                           </div>
                           {errors.techHiringCount && <span className="pr-field-error"><AlertTriangle size={12}/> {errors.techHiringCount}</span>}
                         </div>
                     )}

                     {(form.hiringType === "non-tech" || form.hiringType === "both") && (
                         <div className="pr-field">
                           <label className="pr-label">Non-Tech Vacancies</label>
                           <div className="pr-input-wrap">
                             <input className={`pr-input no-icon ${errors.nonTechHiringCount ? 'is-error' : ''}`} name="nonTechHiringCount" type="number" min="1" value={form.nonTechHiringCount} onChange={handleChange} placeholder="e.g. 3" disabled={!isFieldEnabled("vacancies")} />
                           </div>
                           {errors.nonTechHiringCount && <span className="pr-field-error"><AlertTriangle size={12}/> {errors.nonTechHiringCount}</span>}
                         </div>
                     )}
                     
                     <div className="pr-field">
                       <label className="pr-label">Min. Percentage Filter (%)</label>
                       <div className="pr-input-wrap">
                         <input className={`pr-input no-icon ${errors.minimumPercentage ? 'is-error' : ''}`} name="minimumPercentage" type="number" min="0" max="100" value={form.minimumPercentage} onChange={handleChange} placeholder="Leave blank for no limit" disabled={!isFieldEnabled("minimumPercentage")} />
                       </div>
                       {errors.minimumPercentage && <span className="pr-field-error"><AlertTriangle size={12}/> {errors.minimumPercentage}</span>}
                     </div>
                  </div>

                  <div className="pr-field full" style={{ marginTop: "24px" }}>
                     <label className="pr-label">Target Roles Needed</label>
                     <p style={{fontSize: "13px", color: "var(--pr-text-muted)", marginBottom: "12px"}}>Select exactly what expertise profiles you are strictly looking to absorb.</p>
                     <div className="pr-drawer-skills">
                       {PREDEFINED_ROLES.map((role) => {
                           const isSelected = form.roles.includes(role);
                           return (
                             <button
                                 key={role}
                                 type="button"
                                 onClick={() => handleRoleToggle(role)}
                                 disabled={!isFieldEnabled("roles")}
                                 style={{
                                   padding: "8px 16px",
                                   borderRadius: "var(--pr-radius-pill)",
                                   fontSize: "13px",
                                   fontWeight: "600",
                                   cursor: "pointer",
                                   border: isSelected ? "1px solid var(--pr-primary)" : "1px solid var(--pr-border)",
                                   backgroundColor: isSelected ? "var(--pr-primary-light)" : "var(--pr-surface-secondary)",
                                   color: isSelected ? "var(--pr-primary)" : "var(--pr-text-body)",
                                   transition: "all var(--pr-duration-fast) ease"
                                 }}
                             >
                               {role} 
                             </button>
                           );
                       })}
                     </div>
                     {errors.roles && <span className="pr-field-error" style={{marginTop: "8px"}}><AlertTriangle size={12}/> {errors.roles}</span>}
                  </div>

                  {form.roles.includes("Other") && (
                     <div className="pr-field" style={{ marginTop: "16px" }}>
                       <label className="pr-label">Specify Custom Role</label>
                       <div className="pr-input-wrap">
                         <input className={`pr-input no-icon ${errors.customRole ? 'is-error' : ''}`} name="customRole" value={customRole} onChange={handleCustomRoleChange} placeholder="e.g. Graphic Designer" disabled={!isFieldEnabled("customRole")} />
                       </div>
                       {errors.customRole && <span className="pr-field-error"><AlertTriangle size={12}/> {errors.customRole}</span>}
                     </div>
                  )}

                  <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end' }}>
                     <button onClick={handleSubmit} className="pr-btn pr-btn-primary" disabled={loading || hasAnyErrors}>
                       {loading ? "Persisting Data..." : (profileExists ? "Update Configuration" : "Initialize Profile")}
                     </button>
                  </div>

               </div>
            </div>

         </div>
      </main>
    </div>
  );
};

export default CompanyProfile;