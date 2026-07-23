import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createStudentProfile, updateStudentProfile } from "../../api/api";
import { isValidEmail, isValidPhone, isAlphaOnly, filterAlphaInput, getTodayISO, isValidCollegeEmail, isValidSkill, isValidProjectTitle, isValidURL } from "../../utils/validation";
import { useToast } from "../../components/ToastProvider";
import { 
  Rocket, Search, Bell, LogOut, User, Building, Settings, FileText, 
  AlertTriangle, UploadCloud, ChevronDown, CheckCircle2, XCircle, LayoutDashboard,
  ShieldCheck, HelpCircle, Menu
} from "lucide-react";
import StudentSidebar from "../../components/StudentSidebar";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const PREDEFINED_BRANCHES = ["CSE", "ECE", "AIML", "IT", "MECH", "CIVIL", "OTHER"];
const PREDEFINED_ROLES = ["Frontend Developer", "Backend Developer", "Full Stack Developer", "AI Engineer", "Data Analyst", "Other"];
const PREDEFINED_DEGREES = ["B.Tech", "B.E.", "B.Sc", "BCA", "B.Com", "BBA", "M.Tech", "MCA", "MBA", "M.Sc", "Diploma", "PhD", "Other"];

const StudentProfile = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [verified, setVerified] = useState(false);
  const [profileExists, setProfileExists] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [originalSkills, setOriginalSkills] = useState([]);
  const [initialProjCount, setInitialProjCount] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [form, setForm] = useState({
    readinessScore: 0,
    firstName: "",
    lastName: "",
    dob: "",
    state: "",
    address: "",
    personalEmail: "",
    phone: "",
    collegeName: "",
    collegeEmail: "",
    joinYear: "",
    passOutYear: "",
    degree: "",
    branch: "",
    percentage: "",
    skills: "",
    domain: "tech",
    roleType: "",
    projects: [{ title: "", link: "" }],
    resume: "",
    profilePhoto: "",
  });

  const [customBranch, setCustomBranch] = useState("");
  const [customRoleType, setCustomRoleType] = useState("");
  const [customDegree, setCustomDegree] = useState("");

  const [tempWarnings, setTempWarnings] = useState({});
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [globalError, setGlobalError] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const formatDateDMY = (isoDate) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateISO = (isoDate) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getScoreColorClass = (score) => {
    if (score <= 25) return "red";
    if (score <= 50) return "amber";
    if (score <= 75) return "blue";
    return "";
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token || role !== "student") return;

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/student/me`, {
          headers: { Authorization: "Bearer " + token },
        });

        if (!res.ok) return;
        const data = await res.json();

        const fetchedBranch = data.branch ?? "";
        const isBranchOther = fetchedBranch && !PREDEFINED_BRANCHES.includes(fetchedBranch);
        
        const fetchedRole = data.roleType ?? "";
        const isRoleOther = fetchedRole && !PREDEFINED_ROLES.includes(fetchedRole);

        const fetchedDegree = data.degree ?? "";
        const isDegreeOther = fetchedDegree && !PREDEFINED_DEGREES.includes(fetchedDegree);

        const fetchedProjects = data.projects?.length ? data.projects : [{ title: "", link: "" }];

        setForm(prev => ({
          ...prev,
          readinessScore: data.readinessScore || 0,
          firstName: data.firstName ?? "",
          lastName: data.lastName ?? "",
          dob: data.dob ? formatDateISO(data.dob) : "",
          state: data.state ?? "",
          address: data.address ?? "",
          personalEmail: data.personalEmail ?? "",
          phone: data.phone ?? "",
          collegeName: data.collegeName ?? "",
          collegeEmail: data.collegeEmail ?? "",
          joinYear: data.joinYear ?? "",
          passOutYear: data.passOutYear ?? "",
          degree: isDegreeOther ? "Other" : fetchedDegree,
          branch: isBranchOther ? "OTHER" : fetchedBranch,
          percentage: data.percentage ?? "",
          skills: Array.isArray(data.skills) ? data.skills.join(", ") : "",
          domain: data.domain ?? "tech",
          roleType: isRoleOther ? "Other" : fetchedRole,
          projects: fetchedProjects,
          resume: data.resume ?? "",
          profilePhoto: data.profilePhoto ?? "",
        }));

        if (isBranchOther) setCustomBranch(fetchedBranch);
        if (isRoleOther) setCustomRoleType(fetchedRole);
        if (isDegreeOther) setCustomDegree(fetchedDegree);

        setOriginalSkills(Array.isArray(data.skills) ? data.skills : []);
        setInitialProjCount(fetchedProjects.length);
        setVerified(data.profileStatus === "verified");
        setProfileExists(true);
        setIsEditing(false);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Upload Failed', 'Image size must be less than 5 MB.');
      return;
    }

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("photo", file);

    try {
      const res = await fetch(`${API_BASE_URL}/upload/profile-photo`, {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error('Upload Failed', data.message || 'Upload failed. Please try again.');
        return;
      }

      setForm(prev => ({ ...prev, profilePhoto: data.imageUrl }));
      setErrors(prev => ({ ...prev, profilePhoto: "" }));

      await fetch(`${API_BASE_URL}/student/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ profilePhoto: data.imageUrl }),
      });
      toast.success("Success", "Profile photo updated successfully.");
    } catch (err) {
      toast.error("Upload Failed", "Upload failed. Please try again.");
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.type !== "application/pdf") {
      setErrors(prev => ({ ...prev, resume: "Please upload your resume (PDF required)" }));
      return;
    }

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await fetch(`${API_BASE_URL}/upload/resume`, {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setForm(prev => ({ ...prev, resume: data.fileUrl }));
      setErrors(prev => ({ ...prev, resume: "" }));

      await fetch(`${API_BASE_URL}/student/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ resume: data.fileUrl }),
      });
      toast.success("Success", "Resume uploaded successfully");
    } catch (err) {
      toast.error("Upload failed", err.message);
    }
  };

  // ─── Sequential field order for Personal Details ─────────────────────────
  const personalFieldOrder = ["firstName", "lastName", "dob", "state", "personalEmail", "phone", "address"];
  
  // ─── Sequential field order for College Details ──────────────────────────
  const collegeFieldOrder = ["collegeName", "collegeEmail", "degree", "branch", "joinYear", "passOutYear", "percentage"];
  
  // ─── Sequential field order for Professional Details ──────────────────────
  const professionalFieldOrder = ["skills", "domain", "roleType", "projects", "resume"];

  const isFieldEnabled = (fieldName, tab = "personal") => {
    let fieldOrder = personalFieldOrder;
    if (tab === "college") fieldOrder = collegeFieldOrder;
    else if (tab === "professional") fieldOrder = professionalFieldOrder;
    const idx = fieldOrder.indexOf(fieldName);
    
    if (idx <= 0) return true; 
    
    for (let i = 0; i < idx; i++) {
      const prevField = fieldOrder[i];
      let prevValue = form[prevField];
      
      if (prevField === "degree" && prevValue === "Other") prevValue = customDegree;
      if (prevField === "branch" && prevValue === "OTHER") prevValue = customBranch;
      if (prevField === "roleType" && prevValue === "Other") prevValue = customRoleType;
      
      if (prevField === "projects") {
        if (form.domain === "tech") {
          const hasValid = Array.isArray(prevValue) && prevValue.some(p => isValidProjectTitle(p.title) && isValidURL(p.link));
          if (!hasValid) return false;
        }
        continue;
      }

      if (!prevValue || (typeof prevValue === "string" && !prevValue.trim())) return false;
      if (errors[prevField]) return false;
      
      if (prevField === "degree" && form.degree === "Other" && errors.customDegree) return false;
      if (prevField === "branch" && form.branch === "OTHER" && errors.customBranch) return false;
      if (prevField === "roleType" && form.roleType === "Other" && errors.customRoleType) return false;
    }
    return true;
  };

  const validateField = (name, value) => {
    let err = "";
    switch (name) {
      case "firstName":
      case "lastName": {
        const label = name === "firstName" ? "First name" : "Last name";
        if (!value || !value.trim()) err = `${label} is required`;
        else if (!isAlphaOnly(value)) err = "Only alphabets and spaces are allowed";
        break;
      }
      case "dob":
        if (!value) err = "Please select a valid date";
        else if (new Date(value) > new Date()) err = "Date of birth cannot be in the future";
        break;
      case "state":
        if (!value || !value.trim()) err = "State is required";
        else if (!isAlphaOnly(value)) err = "Only alphabets and spaces are allowed";
        break;
      case "personalEmail":
        if (!value) err = "Personal email is required.";
        else if (!isValidEmail(value)) err = "Please enter a valid email address.";
        break;
      case "phone":
        if (!value) err = "Phone number is required";
        else if (value.length !== 10) err = "Phone number must be exactly 10 digits";
        else if (!isValidPhone(value)) err = "Phone number must start with a digit between 6 and 9";
        break;
      case "collegeName":
        if (!value || !value.trim()) err = "College name is required";
        else if (!isAlphaOnly(value)) err = "Only alphabets and spaces are allowed";
        break;
      case "collegeEmail":
        if (!value) err = "College email is required";
        else if (!isValidCollegeEmail(value)) err = "Please enter a valid college email address.";
        break;
      case "degree":
        if (!value) err = "Please select a degree.";
        break;
      case "customDegree":
        if (form.degree === "Other" && !value.trim()) err = "Please specify your degree";
        else if (form.degree === "Other" && !isAlphaOnly(value)) err = "Only letters are allowed.";
        break;
      case "branch":
        if (!value) err = "Please select a branch.";
        break;
      case "customBranch":
        if (form.branch === "OTHER" && !value.trim()) err = "Please specify your branch";
        else if (form.branch === "OTHER" && !isAlphaOnly(value)) err = "Only letters are allowed.";
        break;
      case "percentage":
        if (value === "") err = "Percentage is required";
        else if (Number(value) < 0 || Number(value) > 100) err = "Percentage must be between 0 and 100";
        break;
      case "joinYear":
        if (!value) err = "Join year is required";
        else if (!/^\d{4}$/.test(value) || Number(value) <= 0) err = "Join year must be a valid 4-digit year.";
        break;
      case "passOutYear":
        if (!value) err = "Pass out year is required";
        else if (!/^\d{4}$/.test(value) || Number(value) <= 0) err = "Pass out year must be a valid 4-digit year.";
        else if (form.joinYear && Number(form.joinYear) >= Number(value)) err = "Pass out year must be greater than Join year.";
        break;
      case "skills": {
        if (!value || !value.trim()) { err = "Skills are required."; break; }
        const skillList = value.split(",").map(s => s.trim()).filter(Boolean);
        if (skillList.length === 0) { err = "Please enter at least one skill."; break; }
        const badSkill = skillList.find(s => !isValidSkill(s));
        if (badSkill) { err = `Skill "${badSkill}" must contain at least one alphabet.`; break; }
        break;
      }
      case "domain":
        if (!value) err = "Please select a domain.";
        break;
      case "roleType":
        if (!value) err = "Please select a role type.";
        break;
      case "customRoleType":
        if (form.roleType === "Other" && !value.trim()) err = "Please specify your role type.";
        else if (form.roleType === "Other" && !isAlphaOnly(value)) err = "Only letters and spaces are allowed.";
        break;
      case "projects": {
        if (form.domain === "non-tech") { err = ""; break; }
        if (!Array.isArray(value)) break;
        const invalidTitle = value.find(p => p.title && !isValidProjectTitle(p.title));
        if (invalidTitle) { err = "Project title must contain at least one alphabet."; break; }
        const invalidLink = value.find(p => p.link && !isValidURL(p.link));
        if (invalidLink) { err = "Please enter a valid project URL (starting with http:// or https://)."; break; }
        const hasValidProj = value.some(p => isValidProjectTitle(p.title) && isValidURL(p.link));
        if (!hasValidProj) err = "At least one project is required for Tech students.";
        break;
      }
      default:
        if (typeof value === "string" && !value.trim() && name !== "profilePhoto" && name !== "readinessScore" && name !== "customBranch" && name !== "customRoleType") {
          err = "This field is required";
        }
        break;
    }
    return err;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let filtered = value;

    if (tempWarnings[name]) {
      setTempWarnings(prev => ({ ...prev, [name]: "" }));
    }

    if (name === "firstName" || name === "lastName" || name === "state" || name === "collegeName") {
      filtered = filterAlphaInput(value);
    } else if (name === "personalEmail" || name === "collegeEmail") {
      filtered = value.toLowerCase();
    } else if (name === "phone") {
      const rawDigits = value.replace(/\D/g, "");
      if (rawDigits.length > 10) {
        setTempWarnings(prev => ({ ...prev, phone: "Maximum 10 digits allowed." }));
      }
      filtered = rawDigits.slice(0, 10);
      if (value !== filtered) {
         e.target.value = filtered; 
      }
    } else if (name === "joinYear" || name === "passOutYear") {
      filtered = value.replace(/\D/g, "").slice(0, 4);
    } else if (name === "domain") {
      setForm(prev => ({ ...prev, domain: value }));
      const projectsErrForNewDomain = (() => {
        if (value === "non-tech") return "";
        const hasValidProj = form.projects.some(p => isValidProjectTitle(p.title) && isValidURL(p.link));
        if (!hasValidProj) return "At least one project is required for Tech students.";
        return "";
      })();
      setErrors(prev => {
        const next = { ...prev, domain: "", projects: projectsErrForNewDomain };
        Object.keys(next).forEach(k => { if (k.startsWith("project_")) delete next[k]; });
        return next;
      });
      return; 
    }

    setForm(prev => ({ ...prev, [name]: filtered }));
    const errorMsg = validateField(name, filtered);
    setErrors(prev => ({ ...prev, [name]: errorMsg }));
    
    if (name === "joinYear" && form.passOutYear) {
      setErrors(prev => ({ ...prev, passOutYear: validateField("passOutYear", form.passOutYear) }));
    }
  };

  const handleCustomDegreeChange = (e) => {
    const filtered = filterAlphaInput(e.target.value);
    setCustomDegree(filtered);
    setErrors(prev => ({ ...prev, customDegree: validateField("customDegree", filtered) }));
  };

  const handleCustomBranchChange = (e) => {
    const filtered = filterAlphaInput(e.target.value);
    setCustomBranch(filtered);
    setErrors(prev => ({ ...prev, customBranch: validateField("customBranch", filtered) }));
  };

  const handleCustomRoleChange = (e) => {
    const filtered = filterAlphaInput(e.target.value);
    setCustomRoleType(filtered);
    setErrors(prev => ({ ...prev, customRoleType: validateField("customRoleType", filtered) }));
  };

  const handleProjectChange = (index, field, value) => {
    const updated = [...form.projects];
    updated[index][field] = value;
    setForm({ ...form, projects: updated });

    const newProjectErrors = { ...errors };
    if (field === "title" && value && !isValidProjectTitle(value)) {
      newProjectErrors[`project_${index}_title`] = "Project title must contain at least one alphabet.";
    } else {
      delete newProjectErrors[`project_${index}_title`];
    }
    if (field === "link" && value && !isValidURL(value)) {
      newProjectErrors[`project_${index}_link`] = "Please enter a valid project URL (starting with http:// or https://).";
    } else {
      delete newProjectErrors[`project_${index}_link`];
    }

    const err = validateField("projects", updated);
    newProjectErrors.projects = err;
    setErrors(newProjectErrors);
  };

  const addProject = () => {
    setForm({ ...form, projects: [...form.projects, { title: "", link: "" }] });
  };

  const validateAll = () => {
    setErrors({});
    let isValid = true;

    // 1. Personal Details
    const personalOrder = ["firstName", "lastName", "dob", "state", "personalEmail", "phone", "address"];
    for (const key of personalOrder) {
      const err = validateField(key, form[key]);
      if (err) {
        if (isValid) setActiveTab("personal"); // switch to first tab with error
        setErrors(prev => ({...prev, [key]: err}));
        isValid = false;
      }
    }

    // 2. College Details
    const collegeOrder = ["collegeName", "collegeEmail", "degree", "customDegree", "branch", "customBranch", "joinYear", "passOutYear", "percentage"];
    for (const key of collegeOrder) {
      let value = form[key];
      if (key === "customBranch") value = customBranch;
      if (key === "customDegree") value = customDegree;
      const err = validateField(key, value);
      if (err) {
        if (isValid) setActiveTab("college");
        setErrors(prev => ({...prev, [key]: err}));
        isValid = false;
      }
    }

    // 3. Professional Details
    const professionalOrder = ["skills", "domain", "roleType", "customRoleType", "projects", "resume"];
    for (const key of professionalOrder) {
      let value = form[key];
      if (key === "customRoleType") value = customRoleType;
      if (key === "projects" && form.domain === "non-tech") continue;
      
      const err = validateField(key, value);
      if (err) {
        if (isValid) setActiveTab("professional");
        setErrors(prev => ({...prev, [key]: err}));
        isValid = false;
      }
    }

    return isValid;
  };

  const handleSaveClick = (e) => {
    e.preventDefault();
    if (validateAll()) {
      setShowConfirmModal(true);
    } else {
      toast.error("Validation Error", "Please fill all required fields correctly.");
    }
  };

  const confirmSubmit = async () => {
    setShowConfirmModal(false);
    setLoading(true);

    try {
      const payload = {
        ...form,
        degree: form.degree === "Other" ? customDegree : form.degree,
        branch: form.branch === "OTHER" ? customBranch : form.branch,
        roleType: form.roleType === "Other" ? customRoleType : form.roleType,
        joinYear: Number(form.joinYear),
        passOutYear: Number(form.passOutYear),
        percentage: Number(form.percentage),
        skills: form.skills ? form.skills.split(",").map((s) => s.trim()) : [],
      };

      if (profileExists) {
        await updateStudentProfile(payload);
        toast.success("Profile Updated", "Your profile has been updated successfully.");
      } else {
        await createStudentProfile(payload);
        toast.success("Profile Created", "Your profile has been saved successfully.");
      }
      
      setProfileExists(true);
      setIsEditing(false);
      setOriginalSkills(form.skills ? form.skills.split(",").map((s) => s.trim()) : []);
      setInitialProjCount(form.projects.length);
    } catch (err) {
      toast.error("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const hasAnyErrors = Object.values(errors).some(err => err !== "");

  // Helper to determine completion percentage based on filled fields
  const calculateCompletion = () => {
     let filled = 0;
     let total = 0;
     const check = (val) => { total++; if (val && String(val).trim().length > 0) filled++; };
     
     check(form.firstName); check(form.lastName); check(form.dob); check(form.state); check(form.phone); check(form.address);
     check(form.collegeName); check(form.collegeEmail); check(form.degree); check(form.branch); check(form.joinYear); check(form.passOutYear); check(form.percentage);
     check(form.skills); check(form.roleType); check(form.resume); check(form.profilePhoto);
     if (form.domain === "tech") {
        total++;
        if (form.projects.some(p => p.title && p.link)) filled++;
     }
     
     return Math.round((filled / total) * 100);
  };
  const completionPct = calculateCompletion();

  return (
    <div className="pr-layout">
      
      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <StudentSidebar isMobileOpen={menuOpen} closeMobile={() => setMenuOpen(false)} />

      {/* ── Main Content ────────────────────────────────────────────── */}
      <main className="pr-main">
         
         {/* ── Premium Page Header Band ─────────────────────────────── */}
         <header className="pr-page-header-band">
            <div className="pr-page-header-left">
              <button className="pr-hamburger" onClick={() => setMenuOpen(true)} style={{ marginRight: '4px' }}>
                <Menu size={22} />
              </button>
              <div>
                <div className="pr-page-header-title">My Profile</div>
                <div className="pr-page-header-sub">Manage your personal, academic, and professional information.</div>
              </div>
            </div>
            <div className="pr-page-header-right">
              <div className="pr-page-date">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
              {verified ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16,185,129,0.1)', color: '#059669', padding: '7px 14px', borderRadius: '999px', fontSize: '13px', fontWeight: '600', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <ShieldCheck size={15}/> Verified
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(245,158,11,0.1)', color: '#D97706', padding: '7px 14px', borderRadius: '999px', fontSize: '13px', fontWeight: '600', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <AlertTriangle size={15}/> Pending Verification
                </div>
              )}
            </div>
         </header>

         {/* ── Page Body ─────────────────────────────────────────────── */}
         <div className="pr-page-body">

             {/* Tabs across the top */}
             <div style={{ background: '#FFFFFF', borderRadius: '14px', border: '1px solid var(--pr-border)', boxShadow: '0 2px 8px rgba(24,36,61,0.05)', overflow: 'hidden' }}>
               {/* Tab Bar */}
               <div style={{ display: 'flex', borderBottom: '1px solid var(--pr-border)' }}>
                 <button
                   className={`pr-seg-btn ${activeTab === "personal" ? "active" : ""}`}
                   style={{ flex: 1, padding: '16px 0', fontSize: '14px', borderRadius: 0 }}
                   onClick={() => setActiveTab("personal")}
                 >
                   <span className="pr-seg-btn-icon"><User size={17}/></span> Personal Details
                 </button>
                 <button
                   className={`pr-seg-btn ${activeTab === "college" ? "active" : ""}`}
                   style={{ flex: 1, padding: '16px 0', fontSize: '14px', borderRadius: 0 }}
                   onClick={() => setActiveTab("college")}
                 >
                   <span className="pr-seg-btn-icon"><Building size={17}/></span> Academic Details
                 </button>
                 <button
                   className={`pr-seg-btn ${activeTab === "professional" ? "active" : ""}`}
                   style={{ flex: 1, padding: '16px 0', fontSize: '14px', borderRadius: 0 }}
                   onClick={() => setActiveTab("professional")}
                 >
                   <span className="pr-seg-btn-icon"><FileText size={17}/></span> Professional Details
                 </button>
               </div>
                  
                  <div style={{ padding: '32px 36px' }}>
                     
                     {activeTab === "personal" && (
                        <div>
                           <div className="pr-section-head">
                             <div className="pr-section-icon"><User size={20}/></div>
                             <div>
                               <div className="pr-section-title">Personal Information</div>
                               <div className="pr-section-desc">Basic details to help companies identify you.</div>
                             </div>
                           </div>

                           <div className="pr-grid-2">
                              <div className="pr-field">
                                <label className="pr-label">First Name</label>
                                <div className="pr-input-wrap">
                                  <input className={`pr-input no-icon ${errors.firstName ? 'is-error' : ''}`} name="firstName" value={form.firstName} onChange={handleChange} placeholder="John" disabled={(profileExists && !isEditing) || !isFieldEnabled("firstName")} />
                                  {!errors.firstName && form.firstName && <span className="pr-icon-right pr-icon-valid"><CheckCircle2 size={16}/></span>}
                                </div>
                                {errors.firstName && <span className="pr-field-error"><AlertTriangle size={12}/> {errors.firstName}</span>}
                              </div>

                              <div className="pr-field">
                                <label className="pr-label">Last Name</label>
                                <div className="pr-input-wrap">
                                  <input className={`pr-input no-icon ${errors.lastName ? 'is-error' : ''}`} name="lastName" value={form.lastName} onChange={handleChange} placeholder="Doe" disabled={(profileExists && !isEditing) || !isFieldEnabled("lastName")} />
                                  {!errors.lastName && form.lastName && <span className="pr-icon-right pr-icon-valid"><CheckCircle2 size={16}/></span>}
                                </div>
                                {errors.lastName && <span className="pr-field-error"><AlertTriangle size={12}/> {errors.lastName}</span>}
                              </div>

                              <div className="pr-field">
                                <label className="pr-label">Date of Birth</label>
                                <div className="pr-input-wrap">
                                  <input className={`pr-input no-icon ${errors.dob ? 'is-error' : ''}`} name="dob" type="date" value={form.dob} onChange={handleChange} max={getTodayISO()} disabled={(profileExists && !isEditing) || !isFieldEnabled("dob")} />
                                </div>
                                {errors.dob && <span className="pr-field-error"><AlertTriangle size={12}/> {errors.dob}</span>}
                              </div>

                              <div className="pr-field">
                                <label className="pr-label">State</label>
                                <div className="pr-input-wrap">
                                  <input className={`pr-input no-icon ${errors.state ? 'is-error' : ''}`} name="state" value={form.state} onChange={handleChange} placeholder="e.g. Maharashtra" disabled={(profileExists && !isEditing) || !isFieldEnabled("state")} />
                                </div>
                                {errors.state && <span className="pr-field-error"><AlertTriangle size={12}/> {errors.state}</span>}
                              </div>
                              
                              <div className="pr-field">
                                <label className="pr-label">Personal Email</label>
                                <div className="pr-input-wrap">
                                  <input className={`pr-input no-icon ${errors.personalEmail ? 'is-error' : ''}`} name="personalEmail" type="email" value={form.personalEmail} onChange={handleChange} placeholder="john@example.com" disabled={(profileExists && !isEditing) || !isFieldEnabled("personalEmail")} />
                                  {!errors.personalEmail && form.personalEmail && <span className="pr-icon-right pr-icon-valid"><CheckCircle2 size={16}/></span>}
                                </div>
                                {errors.personalEmail && <span className="pr-field-error"><AlertTriangle size={12}/> {errors.personalEmail}</span>}
                              </div>

                              <div className="pr-field">
                                <label className="pr-label">Phone Number</label>
                                <div className="pr-input-wrap">
                                  <input 
                                     className={`pr-input no-icon ${errors.phone ? 'is-error' : ''}`} 
                                     name="phone" type="tel" value={form.phone} onChange={handleChange} 
                                     onBlur={() => setTempWarnings(prev => ({ ...prev, phone: "" }))}
                                     placeholder="10-digit number" disabled={(profileExists && !isEditing) || !isFieldEnabled("phone")} 
                                  />
                                  {!errors.phone && form.phone && <span className="pr-icon-right pr-icon-valid"><CheckCircle2 size={16}/></span>}
                                </div>
                                {errors.phone ? (
                                  <span className="pr-field-error"><AlertTriangle size={12}/> {errors.phone}</span>
                                ) : tempWarnings.phone ? (
                                  <span className="pr-field-warning"><AlertTriangle size={12}/> {tempWarnings.phone}</span>
                                ) : null}
                              </div>

                              <div className="pr-field pr-col-span-2">
                                <label className="pr-label">Address</label>
                                <div className="pr-input-wrap">
                                  <input className={`pr-input no-icon ${errors.address ? 'is-error' : ''}`} name="address" value={form.address} onChange={handleChange} placeholder="Full physical address" disabled={(profileExists && !isEditing) || !isFieldEnabled("address")} />
                                </div>
                                {errors.address && <span className="pr-field-error"><AlertTriangle size={12}/> {errors.address}</span>}
                              </div>
                           </div>
                        </div>
                     )}

                     {activeTab === "college" && (
                        <div>
                           <div className="pr-section-head">
                             <div className="pr-section-icon"><Building size={20}/></div>
                             <div>
                               <div className="pr-section-title">Academic Details</div>
                               <div className="pr-section-desc">Information verified by your institution admins.</div>
                             </div>
                           </div>

                           {verified && !isEditing && (
                             <div className="pr-info-banner success">
                                <ShieldCheck size={16} style={{marginTop:'2px'}}/>
                                <div>Your academic details have been officially verified by administrators.</div>
                             </div>
                           )}

                           <div className="pr-grid-2">
                              <div className="pr-field">
                                <label className="pr-label">College Name</label>
                                <div className="pr-input-wrap">
                                  <input className={`pr-input no-icon ${errors.collegeName ? 'is-error' : ''}`} name="collegeName" value={form.collegeName} onChange={handleChange} placeholder="e.g. VIT" disabled={profileExists || !isFieldEnabled("collegeName", "college")} />
                                </div>
                                {errors.collegeName && <span className="pr-field-error"><AlertTriangle size={12}/> {errors.collegeName}</span>}
                              </div>

                              <div className="pr-field">
                                <label className="pr-label">College Email</label>
                                <div className="pr-input-wrap">
                                  <input className={`pr-input no-icon ${errors.collegeEmail ? 'is-error' : ''}`} name="collegeEmail" type="email" value={form.collegeEmail} onChange={handleChange} placeholder="student@college.ac.in" disabled={profileExists || !isFieldEnabled("collegeEmail", "college")} />
                                </div>
                                {errors.collegeEmail && <span className="pr-field-error"><AlertTriangle size={12}/> {errors.collegeEmail}</span>}
                              </div>

                              <div className="pr-field">
                                <label className="pr-label">Degree</label>
                                <div className="pr-input-wrap">
                                  {form.degree === "Other" ? (
                                    <input className={`pr-input no-icon ${errors.customDegree ? 'is-error' : ''}`} name="customDegree" value={customDegree} onChange={handleCustomDegreeChange} placeholder="Enter custom degree" disabled={profileExists || !isFieldEnabled("degree", "college")} />
                                  ) : (
                                    <select className="pr-input no-icon pr-select" name="degree" value={form.degree} onChange={handleChange} disabled={profileExists || !isFieldEnabled("degree", "college")}>
                                      <option value="">Select Degree</option>
                                      {PREDEFINED_DEGREES.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                  )}
                                </div>
                                {errors.degree && <span className="pr-field-error"><AlertTriangle size={12}/> {errors.degree}</span>}
                                {errors.customDegree && <span className="pr-field-error"><AlertTriangle size={12}/> {errors.customDegree}</span>}
                              </div>

                              <div className="pr-field">
                                <label className="pr-label">Branch</label>
                                <div className="pr-input-wrap">
                                  {form.branch === "OTHER" ? (
                                    <input className={`pr-input no-icon ${errors.customBranch ? 'is-error' : ''}`} name="customBranch" value={customBranch} onChange={handleCustomBranchChange} placeholder="Enter branch" disabled={profileExists || !isFieldEnabled("branch", "college")} />
                                  ) : (
                                    <select className="pr-input no-icon pr-select" name="branch" value={form.branch} onChange={handleChange} disabled={profileExists || !isFieldEnabled("branch", "college")}>
                                      <option value="">Select Branch</option>
                                      {PREDEFINED_BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                  )}
                                </div>
                                {errors.branch && <span className="pr-field-error"><AlertTriangle size={12}/> {errors.branch}</span>}
                                {errors.customBranch && <span className="pr-field-error"><AlertTriangle size={12}/> {errors.customBranch}</span>}
                              </div>

                              <div className="pr-field">
                                <label className="pr-label">Join Year</label>
                                <div className="pr-input-wrap">
                                  <input className={`pr-input no-icon ${errors.joinYear ? 'is-error' : ''}`} name="joinYear" type="text" value={form.joinYear} onChange={handleChange} placeholder="YYYY" disabled={profileExists || !isFieldEnabled("joinYear", "college")} />
                                </div>
                                {errors.joinYear && <span className="pr-field-error"><AlertTriangle size={12}/> {errors.joinYear}</span>}
                              </div>

                              <div className="pr-field">
                                <label className="pr-label">Passout Year</label>
                                <div className="pr-input-wrap">
                                  <input className={`pr-input no-icon ${errors.passOutYear ? 'is-error' : ''}`} name="passOutYear" type="text" value={form.passOutYear} onChange={handleChange} placeholder="YYYY" disabled={profileExists || !isFieldEnabled("passOutYear", "college")} />
                                </div>
                                {errors.passOutYear && <span className="pr-field-error"><AlertTriangle size={12}/> {errors.passOutYear}</span>}
                              </div>
                              
                              <div className="pr-field">
                                <label className="pr-label">Percentage</label>
                                <div className="pr-input-wrap">
                                  <input className={`pr-input no-icon ${errors.percentage ? 'is-error' : ''}`} name="percentage" type="number" value={form.percentage} onChange={handleChange} onWheel={(e) => e.target.blur()} placeholder="0-100" disabled={profileExists || !isFieldEnabled("percentage", "college")} />
                                </div>
                                {errors.percentage && <span className="pr-field-error"><AlertTriangle size={12}/> {errors.percentage}</span>}
                              </div>
                           </div>
                        </div>
                     )}

                     {activeTab === "professional" && (
                        <div>
                           <div className="pr-section-head">
                             <div className="pr-section-icon"><FileText size={20}/></div>
                             <div>
                               <div className="pr-section-title">Professional Experience</div>
                               <div className="pr-section-desc">Skills, projects, and your resume.</div>
                             </div>
                           </div>

                           <div className="pr-grid-1">
                              
                              <div className="pr-field">
                                <label className="pr-label">Technical & Soft Skills</label>
                                <div className="pr-input-wrap">
                                  <input className={`pr-input no-icon ${errors.skills ? 'is-error' : ''}`} name="skills" value={form.skills} onChange={handleChange} placeholder="React, Node.js, Leadership (Comma separated)" disabled={profileExists && !isEditing} />
                                </div>
                                <div className="pr-hint">Skill must contain at least one alphabet. Separate multiple skills with commas.</div>
                                {errors.skills && <span className="pr-field-error"><AlertTriangle size={12}/> {errors.skills}</span>}
                              </div>

                              <div className="pr-grid-2">
                                <div className="pr-field">
                                  <label className="pr-label">Primary Domain</label>
                                  <div className="pr-input-wrap">
                                    <select className="pr-input no-icon pr-select" name="domain" value={form.domain} onChange={handleChange} disabled={(profileExists && !isEditing) || !isFieldEnabled("domain", "professional")}>
                                      <option value="tech">Tech</option>
                                      <option value="non-tech">Non-Tech</option>
                                    </select>
                                  </div>
                                  {errors.domain && <span className="pr-field-error"><AlertTriangle size={12}/> {errors.domain}</span>}
                                </div>

                                <div className="pr-field">
                                  <label className="pr-label">Target Role</label>
                                  <div className="pr-input-wrap">
                                    {form.roleType === "Other" ? (
                                      <input className={`pr-input no-icon ${errors.customRoleType ? 'is-error' : ''}`} name="customRoleType" value={customRoleType} onChange={handleCustomRoleChange} placeholder="Enter your role" disabled={(profileExists && !isEditing) || !isFieldEnabled("roleType", "professional")} />
                                    ) : (
                                      <select className="pr-input no-icon pr-select" name="roleType" value={form.roleType} onChange={handleChange} disabled={(profileExists && !isEditing) || !isFieldEnabled("roleType", "professional")}>
                                        <option value="">Select Role</option>
                                        {PREDEFINED_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                      </select>
                                    )}
                                  </div>
                                  {errors.roleType && <span className="pr-field-error"><AlertTriangle size={12}/> {errors.roleType}</span>}
                                  {errors.customRoleType && <span className="pr-field-error"><AlertTriangle size={12}/> {errors.customRoleType}</span>}
                                </div>
                              </div>

                              <div className="pr-field" style={{marginTop: '12px'}}>
                                <label className="pr-label" style={{display:'flex',justifyContent:'space-between'}}>
                                   Projects
                                   {isFieldEnabled("projects", "professional") && (
                                     <button type="button" onClick={addProject} style={{background:'none',border:'none',color:'var(--pr-primary)',fontSize:'12px',fontWeight:'600',cursor:'pointer'}}>+ Add Project</button>
                                   )}
                                </label>
                                
                                {(() => {
                                  const hasValidProj = form.projects.some(p => isValidProjectTitle(p.title) && isValidURL(p.link));
                                  if (form.domain === "tech") {
                                    if (!hasValidProj) {
                                      return <div className="pr-info-banner warning"><AlertTriangle size={16}/> <span>At least one project is mandatory for the Tech domain.</span></div>;
                                    } else {
                                      return <div className="pr-info-banner success"><CheckCircle2 size={16}/> <span>Project requirement met.</span></div>;
                                    }
                                  } else {
                                    return <div className="pr-info-banner info"><HelpCircle size={16}/> <span>Projects are optional for the Non-Tech domain.</span></div>;
                                  }
                                })()}
                                
                                <div className="pr-project-grid">
                                  {form.projects.map((proj, idx) => (
                                    <div key={idx} className="pr-project-card">
                                      <div className="pr-project-label">Project {idx + 1}</div>
                                      <div className="pr-field">
                                         <input className={`pr-input no-icon ${errors[`project_${idx}_title`] ? 'is-error' : ''}`} style={{height:'38px'}} placeholder="Project Title" value={proj.title} onChange={(e) => handleProjectChange(idx, "title", e.target.value)} disabled={!isFieldEnabled("projects", "professional")} />
                                         {errors[`project_${idx}_title`] && <span className="pr-field-error"><AlertTriangle size={12}/> {errors[`project_${idx}_title`]}</span>}
                                      </div>
                                      <div className="pr-field">
                                         <input className={`pr-input no-icon ${errors[`project_${idx}_link`] ? 'is-error' : ''}`} style={{height:'38px'}} placeholder="Project URL (https://...)" value={proj.link} onChange={(e) => handleProjectChange(idx, "link", e.target.value)} disabled={!isFieldEnabled("projects", "professional")} />
                                         {errors[`project_${idx}_link`] && <span className="pr-field-error"><AlertTriangle size={12}/> {errors[`project_${idx}_link`]}</span>}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                {errors.projects && errors.projects !== "At least one project is required for Tech students." && <span className="sp-field-error"><AlertTriangle size={12}/> {errors.projects}</span>}
                              </div>

                              <div className="pr-field" style={{marginTop: '12px'}}>
                                <label className="pr-label">Resume / CV</label>
                                {form.domain === "tech" && !form.projects.some(p => isValidProjectTitle(p.title) && isValidURL(p.link)) && isFieldEnabled("projects", "professional") && (
                                  <div className="pr-info-banner danger"><AlertTriangle size={16}/> Please add at least one project before uploading your resume.</div>
                                )}
                                
                                {form.resume ? (
                                  <div className="pr-resume-preview">
                                    <a href={form.resume} target="_blank" rel="noreferrer" className="pr-resume-file">
                                      <FileText size={20} /> View Uploaded Resume (PDF)
                                    </a>
                                    {isFieldEnabled("resume", "professional") && (
                                      <button type="button" style={{background:'none',border:'none',color:'var(--pr-text-muted)',cursor:'pointer',fontSize:'13px',fontWeight:'600'}} onClick={() => { setForm(prev => ({...prev, resume: ""})); setErrors(prev => ({...prev, resume: "Please upload your resume"})); }}>Replace File</button>
                                    )}
                                  </div>
                                ) : (
                                  <label className="pr-upload-zone" style={{opacity: !isFieldEnabled("resume", "professional") ? 0.5 : 1, pointerEvents: !isFieldEnabled("resume", "professional") ? 'none' : 'auto'}}>
                                    <div className="pr-upload-icon"><UploadCloud size={24}/></div>
                                    <div className="pr-upload-label">Click or drag PDF to upload</div>
                                    <div className="pr-upload-sub">Maximum file size 5MB</div>
                                    <input type="file" accept="application/pdf" onChange={handleResumeUpload} disabled={!isFieldEnabled("resume", "professional")} />
                                  </label>
                                )}
                                {errors.resume && <span className="pr-field-error"><AlertTriangle size={12}/> {errors.resume}</span>}
                              </div>

                           </div>
                        </div>
                     )}
                  </div>

                  {(!profileExists || isEditing) ? (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '20px 28px', borderTop: '1px solid var(--pr-border)', background: '#FAFBFC' }}>
                      <button onClick={handleSaveClick} className="pr-btn-primary" style={{ height: '44px', padding: '0 28px', borderRadius: '10px', background: '#18243D', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }} disabled={loading || hasAnyErrors}>
                        {loading ? "Saving..." : "Save Profile Details"}
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '20px 28px', borderTop: '1px solid var(--pr-border)', background: '#FAFBFC' }}>
                      <button onClick={() => setIsEditing(true)} className="pr-btn-secondary" style={{ height: '44px', padding: '0 24px', borderRadius: '10px', fontSize: '14px', fontWeight: '600' }}>
                        Edit Profile
                      </button>
                    </div>
                  )}
               </div>
         </div>
      </main>

      {/* ── Confirm Modal ── */}
      {showConfirmModal && (
        <div className="pr-modal-overlay">
          <div className="pr-modal">
            <div className="pr-modal-icon"><AlertTriangle size={24}/></div>
            <h3 className="pr-modal-title">Confirm Save</h3>
            <p className="pr-modal-desc">
              Please review all your details carefully. Some fields like academic details cannot be edited after initial submission without admin approval.
            </p>
            <div className="pr-modal-actions">
              <button className="pr-btn pr-btn-secondary" style={{ flex: 1 }} onClick={() => setShowConfirmModal(false)}>Go Back</button>
              <button className="pr-btn pr-btn-primary" style={{ flex: 1 }} onClick={confirmSubmit}>Confirm & Save</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentProfile;
