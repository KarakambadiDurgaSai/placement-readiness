import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../components/ToastProvider";
import { 
  Building, LayoutDashboard, Users, FileText, Settings, LogOut, 
  Search, Filter, ShieldCheck, AlertTriangle, Briefcase, Mail, Phone,
  CheckCircle2, XCircle, Clock, ChevronRight, X, ExternalLink, Download, Menu
} from "lucide-react";
import CompanySidebar from "../../components/CompanySidebar";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const AVATAR_PALETTE = [
  { bg: '#EFF6FF', color: '#1D4ED8' },
  { bg: '#FAF5FF', color: '#7C3AED' },
  { bg: '#FFF7ED', color: '#C2410C' },
  { bg: '#F0FDF4', color: '#15803D' },
  { bg: '#FDF2F8', color: '#BE185D' },
  { bg: '#F0FDFA', color: '#0F766E' },
  { bg: '#FEF9C3', color: '#92400E' },
  { bg: '#FEF2F2', color: '#B91C1C' },
];

const CompanyApplicants = () => {
  const navigate = useNavigate();
  const toast = useToast();
  
  // Data states
  const [applicants, setApplicants] = useState([]);
  const [maxHiringLimit, setMaxHiringLimit] = useState(0);
  const [loading, setLoading] = useState(true);
  const [companyData, setCompanyData] = useState({});
  
  // UX states
  const [viewMode, setViewMode] = useState("kanban"); // "list" or "kanban"
  const [filterMode, setFilterMode] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("score_desc");
  const [processingId, setProcessingId] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        // Fetch Company info for sidebar
        const compRes = await fetch(`${API_BASE_URL}/company/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (compRes.ok) {
           setCompanyData(await compRes.json());
        }

        // Fetch Applicants
        const res = await fetch(`${API_BASE_URL}/company/applicants`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to load applicants");

        const data = await res.json();
        setApplicants(data.applicants || []);
        setMaxHiringLimit(data.maxHiringLimit || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleStatusChange = async (applicationId, newStatus) => {
    if (processingId === applicationId) return;
    setProcessingId(applicationId);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/company/applications/${applicationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error("Status Update Failed", data.message);
        setProcessingId(null);
        return;
      }

      // Update local state
      setApplicants(prev =>
        prev.map(app =>
          app.applicationId === applicationId
            ? { ...app, status: newStatus, email: data.email, phone: data.phone }
            : app
        )
      );
      
      // Update drawer if open
      if (selectedApplicant?.applicationId === applicationId) {
        setSelectedApplicant(prev => ({ ...prev, status: newStatus, email: data.email, phone: data.phone }));
      }

      if (newStatus === "accepted") {
        toast.success("Applicant Accepted", `You can now contact ${data.name}.`);
      } else {
        toast.info("Status Updated", `Applicant moved to ${newStatus}.`);
      }

    } catch (err) {
      toast.error("Error", "Something went wrong while updating status.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  // -----------------------------------------
  // Filtering and Sorting
  // -----------------------------------------
  let processedApplicants = applicants.filter(a => {
     if (filterMode !== "all" && a.status !== filterMode) return false;
     if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (a.name?.toLowerCase().includes(query) || a.roleType?.toLowerCase().includes(query) || a.college?.toLowerCase().includes(query));
     }
     return true;
  });

  processedApplicants.sort((a, b) => {
    if (sortBy === "score_desc") return (b.score || 0) - (a.score || 0);
    if (sortBy === "role_asc") return (a.roleType || "").localeCompare(b.roleType || "");
    if (sortBy === "name_asc") return (a.name || "").localeCompare(b.name || "");
    return 0;
  });

  // Calculate stats
  const totalCount = applicants.length;
  const pendingCount = applicants.filter(a => a.status === "pending").length;
  const acceptedCount = applicants.filter(a => a.status === "accepted").length;
  const rejectedCount = applicants.filter(a => a.status === "rejected").length;
  
  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedApplicants = processedApplicants.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(processedApplicants.length / itemsPerPage);

  if (loading) {
    return (
       <div className="pr-layout">
         <div className="pr-loading-page">
           <div className="pr-loading-spinner"></div>
           <p>Loading ATS Dashboard...</p>
         </div>
       </div>
    );
  }

  return (
    <div className="pr-layout">
      
      {/* ── Sidebar ── */}
      <CompanySidebar isMobileOpen={menuOpen} closeMobile={() => setMenuOpen(false)} />

      {/* ── Side Drawer for Applicant Details ──────────────────────────────── */}
      <div className={`pr-drawer-overlay ${selectedApplicant ? 'visible' : ''}`} onClick={() => setSelectedApplicant(null)}></div>
      <div className={`pr-drawer ${selectedApplicant ? 'open' : ''}`}>
         {selectedApplicant && (
           <>
             <div className="pr-drawer-header">
                <div className="pr-drawer-profile">
                   <div className="pr-drawer-avatar">
                      {selectedApplicant.profilePhoto ? <img src={selectedApplicant.profilePhoto} alt="Profile" /> : (selectedApplicant.name?.charAt(0) || "U")}
                   </div>
                   <div>
                      <div className="pr-drawer-name">{selectedApplicant.name}</div>
                      <div className="pr-drawer-role">{selectedApplicant.roleType}</div>
                   </div>
                </div>
                <button className="pr-drawer-close" onClick={() => setSelectedApplicant(null)}><X size={18}/></button>
             </div>

             <div className="pr-drawer-body">
                
                {/* Status Alert */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--pr-surface-secondary)', borderRadius: 'var(--pr-radius-md)', border: '1px solid var(--pr-border)' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600' }}>
                     Status: 
                     <span className={`pr-status ${selectedApplicant.status}`}>
                        {selectedApplicant.status === "pending" && <Clock size={14}/>}
                        {selectedApplicant.status === "accepted" && <CheckCircle2 size={14}/>}
                        {selectedApplicant.status === "rejected" && <XCircle size={14}/>}
                        {selectedApplicant.status}
                     </span>
                   </div>
                   <div className={`pr-applicant-score ${selectedApplicant.score >= 75 ? 'high' : selectedApplicant.score >= 40 ? 'medium' : 'low'}`} style={{ fontSize: '14px', padding: '4px 10px' }}>
                      {selectedApplicant.score}% Readiness
                   </div>
                </div>

                {/* Contact Info (Only if accepted) */}
                {selectedApplicant.status === "accepted" ? (
                   <div style={{ marginTop: '24px' }}>
                      <div className="pr-drawer-section-title">Contact Information</div>
                      <div className="pr-drawer-info-grid" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '16px', borderRadius: 'var(--pr-radius-md)' }}>
                         <div className="pr-drawer-info-item">
                            <span className="pr-drawer-info-label"><Mail size={12} style={{marginRight:'4px'}}/>Email</span>
                            <span className="pr-drawer-info-value">{selectedApplicant.email}</span>
                         </div>
                         <div className="pr-drawer-info-item">
                            <span className="pr-drawer-info-label"><Phone size={12} style={{marginRight:'4px'}}/>Phone</span>
                            <span className="pr-drawer-info-value">{selectedApplicant.phone || 'N/A'}</span>
                         </div>
                      </div>
                   </div>
                ) : (
                   <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#f8fafc', border: '1px dashed var(--pr-border)', borderRadius: 'var(--pr-radius-md)', fontSize: '13px', color: 'var(--pr-text-muted)' }}>
                      <ShieldCheck size={16}/> Contact details are locked until you accept the application.
                   </div>
                )}

                {/* Background */}
                <div style={{ marginTop: '24px' }}>
                   <div className="pr-drawer-section-title">Academic Background</div>
                   <div className="pr-drawer-info-grid">
                      <div className="pr-drawer-info-item">
                         <span className="pr-drawer-info-label">College / University</span>
                         <span className="pr-drawer-info-value">{selectedApplicant.college}</span>
                      </div>
                      <div className="pr-drawer-info-item">
                         <span className="pr-drawer-info-label">Degree</span>
                         <span className="pr-drawer-info-value">{selectedApplicant.degree || 'N/A'}</span>
                      </div>
                      <div className="pr-drawer-info-item">
                         <span className="pr-drawer-info-label">Branch</span>
                         <span className="pr-drawer-info-value">{selectedApplicant.branch || 'N/A'}</span>
                      </div>
                      <div className="pr-drawer-info-item">
                         <span className="pr-drawer-info-label">Percentage</span>
                         <span className="pr-drawer-info-value">{selectedApplicant.percentage ? `${selectedApplicant.percentage}%` : 'N/A'}</span>
                      </div>
                   </div>
                </div>

                {/* Skills */}
                {selectedApplicant.skills && selectedApplicant.skills.length > 0 && (
                   <div style={{ marginTop: '24px' }}>
                      <div className="pr-drawer-section-title">Verified Skills</div>
                      <div className="pr-drawer-skills">
                         {selectedApplicant.skills.map((skill, i) => (
                           <span key={i} className="pr-skill-chip">{skill}</span>
                         ))}
                      </div>
                   </div>
                )}

                {/* Projects */}
                {selectedApplicant.projects && selectedApplicant.projects.length > 0 && (
                   <div style={{ marginTop: '24px' }}>
                      <div className="pr-drawer-section-title">Portfolio Projects</div>
                      {selectedApplicant.projects.map((p, i) => (
                        <div key={i} className="pr-project-card" style={{ marginBottom: '12px' }}>
                           <div className="pr-project-title">{p.title}</div>
                           {p.link && (
                             <a href={p.link} target="_blank" rel="noreferrer" className="pr-project-link">
                               View Live Project <ExternalLink size={12}/>
                             </a>
                           )}
                        </div>
                      ))}
                   </div>
                )}

                {/* Resume */}
                <div style={{ marginTop: '24px' }}>
                   <div className="pr-drawer-section-title">Attached Document</div>
                   {selectedApplicant.resume ? (
                      <a href={selectedApplicant.resume} target="_blank" rel="noreferrer" className="pr-btn-secondary" style={{width: '100%', marginTop: '8px'}}>
                         <Download size={16}/> View Resume Document
                      </a>
                   ) : (
                      <div style={{ marginTop: '8px', padding: '16px', background: '#f8fafc', borderRadius: 'var(--pr-radius-md)', fontSize: '13px', color: 'var(--pr-text-muted)', textAlign: 'center', border: '1px dashed var(--pr-border)' }}>
                         No resume uploaded.
                      </div>
                   )}
                </div>

             </div>

             {/* Footer Actions */}
             <div className="pr-drawer-footer">
                {selectedApplicant.status === "pending" ? (
                   <>
                     <button 
                       className="pr-btn-danger" 
                       style={{flex: 1}} 
                       disabled={processingId === selectedApplicant.applicationId}
                       onClick={() => handleStatusChange(selectedApplicant.applicationId, "rejected")}
                     >
                       Reject
                     </button>
                     <button 
                       className="pr-btn-primary" 
                       style={{flex: 1}}
                       disabled={processingId === selectedApplicant.applicationId}
                       onClick={() => handleStatusChange(selectedApplicant.applicationId, "accepted")}
                     >
                       Accept Candidate
                     </button>
                   </>
                ) : (
                   <button className="pr-btn-ghost" style={{flex: 1}} onClick={() => setSelectedApplicant(null)}>
                     Close Profile
                   </button>
                )}
             </div>
           </>
         )}
      </div>

      {/* ── Main Content Area ── */}
      <main className="pr-main company-main">
         
         <header className="pr-page-header-band">
            <div className="pr-page-header-left">
               <button className="pr-hamburger" onClick={() => setMenuOpen(true)} style={{ marginRight: '4px' }}>
                 <Menu size={22} />
               </button>
               <div>
                 <div className="pr-page-header-title">Hiring Dashboard</div>
                 <div className="pr-page-header-sub">Manage and review applicant profiles for your target roles.</div>
               </div>
            </div>
            <div className="pr-page-header-right">
               <div className="pr-page-date">
                 {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
               </div>
            </div>
         </header>

         <div className="pr-page-body">
            
            {/* METRICS DASHBOARD */}
            <div className="pr-metrics-grid">
               <div className="pr-metric-card blue">
                  <div className="pr-metric-header">
                     <span className="pr-metric-title">Total Applications</span>
                     <div className="pr-metric-icon blue"><FileText size={18}/></div>
                  </div>
                  <div className="pr-metric-value">{totalCount}</div>
               </div>
               <div className="pr-metric-card orange">
                  <div className="pr-metric-header">
                     <span className="pr-metric-title">Pending Review</span>
                     <div className="pr-metric-icon orange"><Clock size={18}/></div>
                  </div>
                  <div className="pr-metric-value">{pendingCount}</div>
               </div>
               <div className="pr-metric-card green">
                  <div className="pr-metric-header">
                     <span className="pr-metric-title">Accepted Offers</span>
                     <div className="pr-metric-icon green"><CheckCircle2 size={18}/></div>
                  </div>
                  <div className="pr-metric-value">{acceptedCount} <span style={{fontSize: '14px', color: 'var(--pr-text-muted)', fontWeight: 'normal'}}>/ {maxHiringLimit || '∞'}</span></div>
               </div>
               <div className="pr-metric-card red">
                  <div className="pr-metric-header">
                     <span className="pr-metric-title">Rejected</span>
                     <div className="pr-metric-icon red"><XCircle size={18}/></div>
                  </div>
                  <div className="pr-metric-value">{rejectedCount}</div>
               </div>
            </div>

            {/* CONTROLS BAR */}
            <div className="pr-controls-bar" style={{ marginTop: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', background: '#FFFFFF', padding: '16px', borderRadius: '14px', border: '1px solid var(--pr-border)', boxShadow: '0 2px 8px rgba(24,36,61,0.05)' }}>
               
               <div className="pr-filters" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', flex: 1 }}>
                  <div className="pr-input-wrap" style={{width: '260px'}}>
                     <Search size={16} className="pr-icon-right" style={{color: 'var(--pr-text-muted)', right: 'auto', left: '12px'}}/>
                     <input 
                        type="text" 
                        className="pr-input" 
                        placeholder="Search candidates..." 
                        style={{paddingLeft: '36px', height: '40px'}}
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                     />
                  </div>
                  <select 
                     className="pr-input pr-select" 
                     style={{width: '150px', height: '40px'}}
                     value={filterMode} 
                     onChange={(e) => { setFilterMode(e.target.value); setCurrentPage(1); }}
                  >
                     <option value="all">All Statuses</option>
                     <option value="pending">Pending</option>
                     <option value="accepted">Accepted</option>
                     <option value="rejected">Rejected</option>
                  </select>
                  <select 
                     className="pr-input pr-select" 
                     style={{width: '160px', height: '40px'}}
                     value={sortBy} 
                     onChange={(e) => setSortBy(e.target.value)}
                  >
                     <option value="score_desc">Highest Score</option>
                     <option value="role_asc">Role (A-Z)</option>
                     <option value="name_asc">Name (A-Z)</option>
                  </select>
               </div>

               <div style={{ fontSize: '13px', color: 'var(--pr-text-muted)', fontWeight: '500' }}>
                  Showing {processedApplicants.length === 0 ? 0 : startIndex + 1}-{Math.min(startIndex + itemsPerPage, processedApplicants.length)} of {processedApplicants.length} applicants
               </div>
            </div>

            {/* APPLICANTS TABLE */}
            <div style={{ marginTop: '24px', background: '#FFFFFF', borderRadius: '14px', border: '1px solid var(--pr-border)', boxShadow: '0 2px 8px rgba(24,36,61,0.05)', overflow: 'hidden' }}>
               
               {applicants.length === 0 ? (
                  <div className="pr-empty" style={{ padding: '60px 20px', textAlign: 'center' }}>
                     <div className="pr-empty-icon" style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}><Users size={48} color="var(--pr-text-muted)"/></div>
                     <div className="pr-empty-title" style={{ fontSize: '18px', fontWeight: '600', color: 'var(--pr-text-heading)', marginBottom: '8px' }}>No Applicants Yet</div>
                     <div className="pr-empty-desc" style={{ fontSize: '14px', color: 'var(--pr-text-body)' }}>Your job postings haven't received any applications yet. Wait for students to discover and apply.</div>
                  </div>
               ) : paginatedApplicants.length === 0 ? (
                  <div className="pr-empty" style={{ padding: '60px 20px', textAlign: 'center' }}>
                     <div className="pr-empty-icon" style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}><Search size={48} color="var(--pr-text-muted)"/></div>
                     <div className="pr-empty-title" style={{ fontSize: '18px', fontWeight: '600', color: 'var(--pr-text-heading)', marginBottom: '8px' }}>No matches found</div>
                     <div className="pr-empty-desc" style={{ fontSize: '14px', color: 'var(--pr-text-body)' }}>Try adjusting your search or filters to find what you're looking for.</div>
                  </div>
               ) : (
                  <div className="pr-table-wrap">
                     <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                           <tr style={{ background: 'var(--pr-surface-hover)', borderBottom: '1px solid var(--pr-border)' }}>
                              <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: 'var(--pr-text-heading)' }}>Candidate</th>
                              <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: 'var(--pr-text-heading)' }}>Role</th>
                              <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: 'var(--pr-text-heading)' }}>Status</th>
                              <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: 'var(--pr-text-heading)' }}>Score</th>
                              <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: 'var(--pr-text-heading)' }}>Applied</th>
                              <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: 'var(--pr-text-heading)', textAlign: 'right' }}>Actions</th>
                           </tr>
                        </thead>
                        <tbody>
                           {paginatedApplicants.map((app, appIdx) => {
                              const avatarStyle = AVATAR_PALETTE[appIdx % AVATAR_PALETTE.length];
                              return (
                                 <tr key={app.applicationId} style={{ borderBottom: '1px solid var(--pr-border)', transition: 'background var(--pr-duration) ease' }} className="pr-table-row">
                                    <td style={{ padding: '16px 24px' }}>
                                       <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: avatarStyle.bg, color: avatarStyle.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px', flexShrink: 0, overflow: 'hidden' }}>
                                             {app.profilePhoto ? <img src={app.profilePhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (app.name?.charAt(0) || "U")}
                                          </div>
                                          <div>
                                             <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--pr-text-heading)' }}>{app.name}</div>
                                             <div style={{ fontSize: '13px', color: 'var(--pr-text-muted)' }}>{app.college}</div>
                                          </div>
                                       </div>
                                    </td>
                                    <td style={{ padding: '16px 24px', fontSize: '14px', color: 'var(--pr-text-body)', fontWeight: '500' }}>
                                       {app.roleType}
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                       <span className={`pr-badge ${app.status === 'accepted' ? 'success' : app.status === 'rejected' ? 'danger' : 'warning'}`}>
                                          {app.status === 'accepted' && <CheckCircle2 size={12}/>}
                                          {app.status === 'rejected' && <XCircle size={12}/>}
                                          {app.status === 'pending' && <Clock size={12}/>}
                                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                       </span>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                       <span style={{ fontWeight: '700', color: app.score >= 75 ? '#10B981' : app.score >= 40 ? '#F59E0B' : '#EF4444' }}>
                                          {app.score}%
                                       </span>
                                    </td>
                                    <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--pr-text-body)' }}>
                                       {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                       <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                          <button 
                                             onClick={() => setSelectedApplicant(app)}
                                             className="pr-btn-secondary"
                                             style={{ height: '36px', padding: '0 16px', fontSize: '13px', fontWeight: '600' }}
                                          >
                                             View Profile
                                          </button>
                                       </div>
                                    </td>
                                 </tr>
                              );
                           })}
                        </tbody>
                     </table>
                  </div>
               )}
               
               {/* Pagination */}
               {totalPages > 1 && (
                  <div style={{ padding: '16px 24px', borderTop: '1px solid var(--pr-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
                     <button 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="pr-btn-secondary"
                        style={{ height: '36px', padding: '0 16px', fontSize: '13px' }}
                     >
                        Previous
                     </button>
                     <div style={{ display: 'flex', gap: '8px' }}>
                        {[...Array(totalPages)].map((_, i) => (
                           <button
                              key={i}
                              onClick={() => setCurrentPage(i + 1)}
                              style={{ 
                                 width: '32px', 
                                 height: '32px', 
                                 borderRadius: '8px', 
                                 display: 'flex', 
                                 alignItems: 'center', 
                                 justifyContent: 'center', 
                                 fontSize: '13px', 
                                 fontWeight: '600',
                                 cursor: 'pointer',
                                 border: currentPage === i + 1 ? 'none' : '1px solid var(--pr-border)',
                                 background: currentPage === i + 1 ? 'var(--pr-primary)' : 'transparent',
                                 color: currentPage === i + 1 ? '#FFFFFF' : 'var(--pr-text-heading)',
                                 transition: 'all 0.2s ease'
                              }}
                           >
                              {i + 1}
                           </button>
                        ))}
                     </div>
                     <button 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="pr-btn-secondary"
                        style={{ height: '36px', padding: '0 16px', fontSize: '13px' }}
                     >
                        Next
                     </button>
                  </div>
               )}
            </div>

         </div>
      </main>
    </div>
  );
};

export default CompanyApplicants;
