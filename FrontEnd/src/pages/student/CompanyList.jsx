import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../components/ToastProvider";
import { 
  Rocket, Search, Building2, User, LayoutDashboard, FileText,
  MapPin, Layers, Briefcase, Clock, CheckCircle2, XCircle, 
  Flag, ChevronRight, Bookmark, Filter, ShieldCheck, AlertTriangle, LogOut, Menu
} from "lucide-react";
import StudentSidebar from "../../components/StudentSidebar";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const CompanyList = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [student, setStudent] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
       navigate("/login");
       return;
    }

    const fetchData = async () => {
      try {
        const profileRes = await fetch(`${API_BASE_URL}/student/me`, {
          headers: { Authorization: "Bearer " + token },
        });
        if (!profileRes.ok) throw new Error("Failed to load profile");
        const profileData = await profileRes.json();
        setStudent(profileData);

        const companyRes = await fetch(`${API_BASE_URL}/company/list`);
        const companyData = await companyRes.json();

        const appRes = await fetch(`${API_BASE_URL}/student/applications`, {
          headers: { Authorization: "Bearer " + token },
        });
        const appData = await appRes.json();

        setCompanies(companyData);
        setApplications(appData.applications || []);
      } catch (err) {
        toast.error("Error", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, navigate]);

  const applyToCompany = async (companyId) => {
    setApplyingId(companyId);

    try {
      const res = await fetch(`${API_BASE_URL}/student/apply/${companyId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error("Application Failed", data.message);
        return;
      }

      toast.success("Application Submitted", "You have successfully applied to this company.");
      const companyApplied = companies.find(c => c._id === companyId);
      
      setApplications((prev) => [
        ...prev,
        { companyId, companyName: companyApplied?.companyName, status: "pending" }
      ]);
    } catch (err) {
      toast.error("Error", "Something went wrong while processing your application.");
    } finally {
      setApplyingId(null);
    }
  };

  if (loading) {
    return (
      <div className="pr-layout">
        <div className="pr-loading-page">
           <div className="pr-loading-spinner"></div>
           <p>Loading companies...</p>
        </div>
      </div>
    );
  }

  if (student?.profileStatus !== "verified") {
    return (
      <div className="pr-layout">
        <div className="pr-access-denied">
          <div className="pr-access-denied-card">
            <ShieldCheck size={48} color="var(--pr-warning)" style={{marginBottom:'24px'}} />
            <h2 className="pr-page-title" style={{marginBottom:'12px'}}>Verification Required</h2>
            <p className="pr-page-sub" style={{marginBottom:'32px', fontSize:'15px', lineHeight:'1.5'}}>
              Your profile is currently under review by the placement administration team. You will gain access to the company portal once your academic details are verified.
            </p>
            <button className="pr-btn-primary" onClick={() => navigate("/student/profile")}>
              Return to My Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  const appMap = {};
  applications.forEach((a) => {
    appMap[a.companyId] = a;
  });

  return (
    <div className="pr-layout">
      
      <StudentSidebar isMobileOpen={menuOpen} closeMobile={() => setMenuOpen(false)} />

      <main className="pr-main">
         
         <header className="pr-page-header-band">
            <div className="pr-page-header-left">
              <button className="pr-hamburger" onClick={() => setMenuOpen(true)} style={{ marginRight: '4px' }}>
                <Menu size={22} />
              </button>
              <div>
                <div className="pr-page-header-title">Companies</div>
                <div className="pr-page-header-sub">Browse verified placement partners that match your profile.</div>
              </div>
            </div>
            <div className="pr-page-header-right">
              <div className="pr-page-date">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
            </div>
         </header>

         <div className="pr-page-body">
            

            {companies.length === 0 ? (
               <div className="pr-empty">
                  <div className="pr-empty-icon"><Building2 size={32}/></div>
                  <div className="pr-empty-title">No companies found</div>
                  <div className="pr-empty-desc">There are no partner companies matching your criteria.</div>
               </div>
            ) : (
              <div className="pr-companies-grid">
                {companies.map(c => {
                  const app = appMap[c._id];
                  const isEligible = (Number(student.percentage) >= Number(c.minimumPercentage || 0)) && (student.domain === c.hiringType);

                  return (
                     <div key={c._id} className="pr-company-card-v2">
                        <div className="pr-company-card-top">
                           <div className="pr-company-logo-v2" style={{ background: 'linear-gradient(135deg, #18243D, #2a3f5f)' }}>
                            {c.companyName.charAt(0).toUpperCase()}
                          </div>
                          <div className="pr-company-head">
                            <h3 className="pr-company-name-v2">{c.companyName}</h3>
                            <div className="pr-company-location-row">
                               <MapPin size={12}/> {c.location || "Location TBD"}
                            </div>
                          </div>
                       </div>
                       
                       <div className="pr-company-skills">
                          {(c.roles || []).map((r, i) => <span key={i} className="pr-company-skill-tag">{r}</span>)}
                          {(!c.roles || c.roles.length === 0) && <span className="pr-company-skill-tag">General Hiring</span>}
                       </div>

                       <div className="pr-company-card-divider"></div>

                       <div className="pr-company-card-meta">
                          <div className="pr-company-meta-item-v2">
                            <span className="pr-company-meta-label">Domain</span>
                            <span className="pr-company-meta-val">{c.hiringType === "tech" ? "Technology" : "Non-Tech"}</span>
                          </div>
                          <div className="pr-company-meta-item-v2">
                            <span className="pr-company-meta-label">Min. %</span>
                            <span className="pr-company-meta-val">{c.minimumPercentage || "N/A"}%</span>
                          </div>
                       </div>

                       <div className="pr-company-card-footer">
                          {app ? (
                            <div className="pr-match-badge" style={{ color: app.status === 'rejected' ? '#EF4444' : '#10B981' }}>
                               {app.status === 'rejected' ? <XCircle size={14}/> : <CheckCircle2 size={14}/>} 
                               {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                            </div>
                          ) : isEligible ? (
                            <div className="pr-match-badge">
                               <CheckCircle2 size={14}/> Eligible Match
                            </div>
                          ) : (
                            <div className="pr-match-badge ineligible">
                               <AlertTriangle size={14}/> Not Eligible
                            </div>
                          )}

                          <button 
                            className={`pr-apply-btn ${app ? app.status : ''}`}
                            onClick={() => applyToCompany(c._id)}
                            disabled={applyingId === c._id || !!app || !isEligible}
                          >
                            {applyingId === c._id ? "..." : app ? "Applied" : "Apply Now"}
                          </button>
                       </div>
                    </div>
                  );
                })}
              </div>
            )}
         </div>
      </main>
    </div>
  );
};

export default CompanyList;
