import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../components/ToastProvider";
import { 
  Building2, Briefcase, Clock, CheckCircle2, XCircle, 
  Flag, ShieldCheck, Menu, FileText, ExternalLink
} from "lucide-react";
import StudentSidebar from "../../components/StudentSidebar";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const StudentApplications = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [student, setStudent] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [complained, setComplained] = useState({});
  const [filterType, setFilterType] = useState("all");

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

  const handleComplaint = async (companyId, reason) => {
    if (!reason) return;
    try {
      const res = await fetch(`${API_BASE_URL}/complaint`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ companyId, reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      toast.success("Report Submitted", "Your complaint has been forwarded to the admin team.");
      setComplained((prev) => ({ ...prev, [companyId]: true }));
    } catch (err) {
      if (err.message.includes("already complained")) {
         setComplained((prev) => ({ ...prev, [companyId]: true }));
         toast.info("Report Exists", "You have already filed a report against this company.");
      } else {
         toast.error("Submission Failed", err.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="pr-layout">
        <div className="pr-loading-page">
           <div className="pr-loading-spinner"></div>
           <p>Loading applications...</p>
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
              Your profile is currently under review by the placement administration team.
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

  const appList = applications.map(app => {
    const comp = companies.find(c => c._id === app.companyId) || { companyName: app.companyName };
    return { ...app, company: comp };
  });

  const getStatusIcon = (status) => {
    switch(status) {
      case 'accepted': return <CheckCircle2 size={16} />;
      case 'rejected': return <XCircle size={16} />;
      case 'shortlisted': return <Briefcase size={16} />;
      case 'pending':
      default: return <Clock size={16} />;
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'pending': return 'Under Review';
      case 'shortlisted': return 'Shortlisted';
      case 'accepted': return 'Offer Extended';
      case 'rejected': return 'Closed';
      default: return 'Applied';
    }
  };

  const filteredApps = appList.filter(app => {
    if (filterType === 'all') return true;
    return app.status === filterType;
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
                <div className="pr-page-header-title">My Applications</div>
                <div className="pr-page-header-sub">Track the status of all your applications and offers in one place.</div>
              </div>
            </div>
            <div className="pr-page-header-right">
              <div className="pr-page-date">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
            </div>
         </header>

         <div className="pr-page-body">
            
            <div className="pr-apps-filter-tabs" style={{ marginBottom: '32px' }}>
              <button className={`pr-apps-filter-tab ${filterType === 'all' ? 'active' : ''}`} onClick={() => setFilterType('all')}>
                All Applications
              </button>
              <button className={`pr-apps-filter-tab ${filterType === 'pending' ? 'active' : ''}`} onClick={() => setFilterType('pending')}>
                Under Review
              </button>
              <button className={`pr-apps-filter-tab ${filterType === 'shortlisted' ? 'active' : ''}`} onClick={() => setFilterType('shortlisted')}>
                Shortlisted
              </button>
              <button className={`pr-apps-filter-tab ${filterType === 'accepted' ? 'active' : ''}`} onClick={() => setFilterType('accepted')}>
                Offers
              </button>
              <button className={`pr-apps-filter-tab ${filterType === 'rejected' ? 'active' : ''}`} onClick={() => setFilterType('rejected')}>
                Closed
              </button>
            </div>

            
            {filteredApps.length === 0 ? (
               <div className="pr-empty">
                  <div className="pr-empty-icon"><FileText size={32}/></div>
                  <div className="pr-empty-title">No applications found</div>
                  <div className="pr-empty-desc">You haven't submitted any applications that match this status.</div>
                  <button className="pr-btn-secondary" style={{ marginTop: '12px' }} onClick={() => navigate("/student/companies")}>Browse Companies</button>
               </div>
            ) : (
              <div className="pr-app-page-grid">
                {filteredApps.map(app => (
                  <div key={app.companyId} className={`pr-app-status-card ${app.status}`}>
                     
                     <div className="pr-app-company-logo" style={{ background: app.status === 'rejected' ? '#e2e8f0' : 'linear-gradient(135deg, #16233B, #2a3f5f)', color: app.status === 'rejected' ? '#94a3b8' : 'white' }}>
                       {app.company.companyName.charAt(0).toUpperCase()}
                     </div>
                     
                     <div className="pr-app-company-info">
                       <h3 className="pr-app-company-name" style={{ color: app.status === 'rejected' ? 'var(--pr-text-muted)' : 'var(--pr-text-heading)' }}>
                         {app.company.companyName}
                       </h3>
                       <div className="pr-app-company-meta">
                          <span className="pr-app-company-meta-item">
                            <Briefcase size={14}/> {app.company.hiringType === "tech" ? "Technology Role" : "Non-Tech Role"}
                          </span>
                       </div>

                       {app.status === 'accepted' && (
                         <div className="pr-app-message-v2 accepted">
                           <strong>Offer Extended</strong><br/>
                           Congratulations! {app.company.companyName} has decided to proceed with your candidacy. Please check your email inbox ({student.personalEmail}) for next steps.
                         </div>
                       )}

                       {app.status === 'rejected' && (
                         <div className="pr-app-message-v2 rejected">
                           <strong>Application Closed</strong><br/>
                           {app.company.companyName} has decided not to move forward at this time.
                         </div>
                       )}

                       {app.status === 'accepted' && (
                         <div className="pr-complaint-wrap">
                           {!complained[app.companyId] ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <select
                                  className="pr-complaint-select"
                                  style={{ maxWidth: '240px' }}
                                  defaultValue=""
                                  onChange={(e) => handleComplaint(app.companyId, e.target.value)}
                                >
                                  <option value="" disabled>Report Issue / Fake Hiring...</option>
                                  <option value="Fake hiring">Fake Hiring</option>
                                  <option value="Asking money">Asking For Money</option>
                                  <option value="No response after selection">No Response Post-Selection</option>
                                  <option value="Mismatch job details">Job Details Mismatch</option>
                                  <option value="Suspicious company">Suspicious Activity</option>
                                </select>
                              </div>
                           ) : (
                              <div style={{ fontSize:'12px', color:'var(--pr-text-muted)', fontWeight:'600' }}>
                                <Flag size={14} style={{display:'inline', marginBottom:'-2px'}}/> Report Filed
                              </div>
                           )}
                         </div>
                       )}
                     </div>

                     <div className="pr-app-status-badge">
                       <div className={`pr-app-status-pill ${app.status}`}>
                         {getStatusIcon(app.status)} {getStatusText(app.status)}
                       </div>
                       <div className="pr-app-date">
                         {/* We don't have application date in this mock DB, so fallback */}
                         Updated Recently
                       </div>
                     </div>
                  </div>
                ))}
              </div>
            )}
         </div>
      </main>
    </div>
  );
};

export default StudentApplications;
