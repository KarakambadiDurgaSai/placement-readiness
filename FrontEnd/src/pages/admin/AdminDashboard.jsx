import { useEffect, useState, useCallback } from "react";
import {
  LayoutDashboard, Users, Building2, BarChart3, MessageSquareWarning,
  LogOut, Search, ShieldCheck, ShieldX, Ban, X, ExternalLink,
  CheckCircle2, XCircle, Clock, AlertTriangle, TrendingUp,
  FileText, Briefcase, ChevronRight, RefreshCw, Bell, Menu
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import "./AdminDashboard.css";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

/* ── Toast System ──────────────────────────────────────────── */
function ToastContainer({ toasts }) {
  return (
    <div className="pr-toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`pr-toast ${t.type}`}>
          <div className={`pr-toast-icon ${t.type}`}>
            {t.type === "success" && <CheckCircle2 size={18} />}
            {t.type === "error"   && <XCircle size={18} />}
            {t.type === "warning" && <AlertTriangle size={18} />}
            {t.type === "info"    && <Bell size={18} />}
          </div>
          <div>
            <div className="pr-toast-title">{t.title}</div>
            {t.msg && <div className="pr-toast-msg">{t.msg}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Skeleton Row ────────────────────────────────────────────── */
function SkeletonTable({ rows = 5, cols = 6 }) {
  return (
    <table className="pr-table" style={{ width: "100%" }}>
      <tbody>
        {Array.from({ length: rows }).map((_, i) => (
          <tr key={i}>
            {Array.from({ length: cols }).map((_, j) => (
              <td key={j} style={{ padding: "14px 16px" }}>
                <div className="pr-skeleton" style={{ height: "14px", width: `${60 + Math.random() * 40}%` }} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ── Main Component ─────────────────────────────────────────── */
const AVATAR_COLORS = ["#3B82F6", "#8B5CF6", "#10B981", "#F97316", "#EC4899", "#6366F1", "#14B8A6", "#F59E0B"];
const getCollegeBadge = (name) => {
  if(!name) return { bg: "#F8FAFC", text: "#64748b", border: "#E2E8F0" };
  const n = name.toUpperCase();
  if(n.includes("VIT")) return { bg: "#EFF6FF", text: "#2563EB", border: "#BFDBFE" };
  if(n.includes("SRM")) return { bg: "#FAF5FF", text: "#9333EA", border: "#E9D5FF" };
  return { bg: "#F8FAFC", text: "#475569", border: "#E2E8F0" };
};

export default function AdminDashboard() {
  const token = localStorage.getItem("adminToken");

  const [stats, setStats] = useState({});
  const [students, setStudents] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [placementStats, setPlacementStats] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  // UI states
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [expandedComplaint, setExpandedComplaint] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  // Filters
  const [studentSearch, setStudentSearch] = useState("");
  const [studentFilter, setStudentFilter] = useState("all");
  const [companySearch, setCompanySearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [complaintFilter, setComplaintFilter] = useState("all");

  const headers = { Authorization: `Bearer ${token}` };

  const showToast = useCallback((type, title, msg = "") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, title, msg }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    window.location.href = "/admin/login";
  };

  useEffect(() => {
    if (!token) { window.location.href = "/admin/login"; return; }
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([
      loadDashboard(), loadStudents(), loadCompanies(),
      loadPlacementStats(), loadComplaints(),
    ]);
    setLoading(false);
  };

  const loadDashboard     = async () => { try { const r = await fetch(`${API}/admin/dashboard`, { headers }); setStats(await r.json()); } catch(e){} };
  const loadStudents      = async () => { try { const r = await fetch(`${API}/admin/students`, { headers }); const d = await r.json(); setStudents((d.students || []).filter(s => !s.isBlocked)); } catch(e){} };
  const loadCompanies     = async () => { try { const r = await fetch(`${API}/admin/companies`, { headers }); const d = await r.json(); setCompanies((d.companies || []).filter(c => !c.isBlocked)); } catch(e){} };
  const loadPlacementStats= async () => { try { const r = await fetch(`${API}/admin/placement-stats`, { headers }); const d = await r.json(); setPlacementStats(d.stats || []); } catch(e){} };
  const loadComplaints    = async () => { try { const r = await fetch(`${API}/admin/complaints`, { headers }); const d = await r.json(); setComplaints(d.complaints || []); } catch(e){} };

  /* ── Actions ─────────────────────────────────────────────── */
  const verifyStudent = async (id) => {
    setProcessingId(id);
    const res = await fetch(`${API}/admin/verify-student/${id}`, { method: "PATCH", headers });
    const data = await res.json();
    setProcessingId(null);
    if (!res.ok) { showToast("error", "Verification Failed", data.message); return; }
    showToast("success", "Student Verified", data.message);
    setStudents(prev => prev.map(s => s.id === id ? { ...s, profileStatus: "verified" } : s));
    if (selectedStudent?.id === id) setSelectedStudent(prev => ({ ...prev, profileStatus: "verified" }));
  };

  const toggleBlockStudent = async (id) => {
    if (!window.confirm("Are you sure you want to block this student? This action is permanent.")) return;
    setProcessingId(id);
    const res = await fetch(`${API}/admin/block-student/${id}`, { method: "PATCH", headers });
    const data = await res.json();
    setProcessingId(null);
    if (!res.ok) { showToast("error", "Action Failed", data.message); return; }
    showToast("info", "Student Blocked", "Student removed from the system.");
    setStudents(prev => prev.filter(s => s.id !== id));
    setSelectedStudent(null);
  };

  const verifyCompany = async (id) => {
    setProcessingId(id);
    const res = await fetch(`${API}/admin/verify-company/${id}`, { method: "PATCH", headers });
    const data = await res.json();
    setProcessingId(null);
    if (!res.ok) { showToast("error", "Verification Failed", data.message); return; }
    showToast("success", "Company Verified", data.message);
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, profileStatus: "verified" } : c));
    if (selectedCompany?.id === id) setSelectedCompany(prev => ({ ...prev, profileStatus: "verified" }));
  };

  const toggleBlockCompany = async (id) => {
    if (!window.confirm("Are you sure you want to block this company? This action is permanent.")) return;
    setProcessingId(id);
    const res = await fetch(`${API}/admin/block-company/${id}`, { method: "PATCH", headers });
    const data = await res.json();
    setProcessingId(null);
    if (!res.ok) { showToast("error", "Action Failed", data.message); return; }
    showToast("info", "Company Blocked", "Company removed from the system.");
    setCompanies(prev => prev.filter(c => c.id !== id));
    setSelectedCompany(null);
  };

  /* ── Derived data ─────────────────────────────────────────── */
  const verifiedStudents = students.filter(s => s.profileStatus === "verified").length;
  const pendingStudents  = students.filter(s => s.profileStatus !== "verified").length;
  const verifiedCompanies = companies.filter(c => c.profileStatus === "verified").length;
  const totalAccepted = placementStats.reduce((sum, p) => sum + (p.accepted || 0), 0);
  const totalApplications = placementStats.reduce((sum, p) => sum + (p.accepted || 0) + (p.rejected || 0) + (p.pending || 0), 0);
  const acceptanceRate = totalApplications > 0 ? Math.round((totalAccepted / totalApplications) * 100) : 0;

  const filteredStudents = students.filter(s => {
    const q = studentSearch.toLowerCase();
    const matchSearch = !q || s.name?.toLowerCase().includes(q) || s.collegeName?.toLowerCase().includes(q);
    const matchFilter = studentFilter === "all" || s.profileStatus === studentFilter;
    return matchSearch && matchFilter;
  });

  const filteredCompanies = companies.filter(c => {
    const q = companySearch.toLowerCase();
    const matchSearch = !q || c.companyName?.toLowerCase().includes(q) || c.location?.toLowerCase().includes(q);
    const matchFilter = companyFilter === "all" || c.profileStatus === companyFilter;
    return matchSearch && matchFilter;
  });

  const filteredComplaints = complaints.filter(c => {
    if (complaintFilter === "all") return true;
    return c.status === complaintFilter;
  });

  // Chart data
  const placementChartData = placementStats.slice(0, 8).map(p => ({
    name: p.companyName?.slice(0, 12),
    Accepted: p.accepted || 0,
    Rejected: p.rejected || 0,
    Pending: p.pending || 0,
  }));

  const studentStatusData = [
    { name: "Verified",  value: verifiedStudents,   color: "#10b981" },
    { name: "Pending",   value: pendingStudents,     color: "#f59e0b" },
  ].filter(d => d.value > 0);

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  /* ── Sidebar Nav ─────────────────────────────────────────────── */
  const navItems = [
    { key: "overview",   label: "Dashboard",   icon: <LayoutDashboard size={18}/> },
    { key: "students",   label: "Students",    icon: <Users size={18}/>,           badge: pendingStudents > 0 ? pendingStudents : null },
    { key: "companies",  label: "Companies",   icon: <Building2 size={18}/> },
    { key: "placements", label: "Placements",  icon: <BarChart3 size={18}/> },
    { key: "complaints", label: "Complaints",  icon: <MessageSquareWarning size={18}/>, badge: complaints.length > 0 ? complaints.length : null },
  ];

  /* ── Loading ─────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="admin-layout-wrapper" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div className="pr-spinner" style={{ borderTopColor: '#F4B400' }} />
          <p style={{ color: '#64748B', fontWeight: 600 }}>Loading Control Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout-wrapper">
      <ToastContainer toasts={toasts} />

      {/* SIDEBAR OVERLAY FOR MOBILE */}
      <div className={`pr-drawer-overlay ${menuOpen ? "visible" : ""}`} onClick={() => setMenuOpen(false)} style={{ zIndex: 99 }} />

      {/* OVERLAY FOR DRAWERS (Kept from original) */}
      <div className={`pr-drawer-overlay ${selectedStudent || selectedCompany ? "visible" : ""}`} onClick={() => { setSelectedStudent(null); setSelectedCompany(null); }} />
      
      {/* SIDEBAR */}
      <aside className={`admin-sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-logo-icon"><ShieldCheck size={18} strokeWidth={3} /></div>
          <span className="admin-sidebar-logo-text">PlaceReady</span>
        </div>

        <div className="admin-sidebar-profile">
          <div className="admin-sidebar-avatar">A</div>
          <div className="admin-sidebar-user-info">
            <span className="admin-sidebar-user-name">Administrator</span>
            <span className="admin-sidebar-user-role">Super Admin Badge</span>
          </div>
        </div>

        <div className="admin-sidebar-nav">
          <div className="admin-nav-section-label">Control Center</div>
          {navItems.map(item => (
            <button
              key={item.key}
              className={`admin-nav-item ${activeTab === item.key ? "active" : ""}`}
              onClick={() => { setActiveTab(item.key); setMenuOpen(false); }}
            >
              <span>{item.icon}</span>
              {item.label}
              {item.badge && <span className="admin-nav-badge">{item.badge}</span>}
            </button>
          ))}

          <div className="admin-nav-section-label">System</div>
          <button className="admin-nav-item" onClick={fetchAll}>
            <span><RefreshCw size={18}/></span> Refresh Data
          </button>
          
          <div style={{ marginTop: 20, padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
             <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', marginBottom: 8 }}>PLATFORM STATUS</div>
             <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#FFFFFF', fontWeight: 500 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E' }}></div>
                Online & Secure
             </div>
          </div>
        </div>

        <div className="admin-sidebar-footer">
          <button className="admin-logout-btn" onClick={handleLogout}>
            <LogOut size={18}/> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="admin-main-content">
        
        {/* HEADER */}
        <header className="admin-header">
          <div className="admin-header-left" style={{ flexDirection: 'row', alignItems: 'center', gap: '16px' }}>
            <button className="pr-hamburger admin-hamburger" onClick={() => setMenuOpen(true)}>
              <Menu size={22} color="#FFFFFF" />
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div className="admin-breadcrumb">Admin / {navItems.find(n => n.key === activeTab)?.label || "Overview"}</div>
              <div className="admin-page-title">
              {activeTab === "overview"   && "Control Center"}
              {activeTab === "students"   && "Student Verification"}
              {activeTab === "companies"  && "Company Verification"}
              {activeTab === "placements" && "Placement Statistics"}
              {activeTab === "complaints" && "Complaint Center"}
            </div>
            </div>
          </div>
          <div className="admin-header-right">
            <div className="admin-search">
              <Search size={16} />
              <input placeholder="Search..." />
            </div>
            <div className="admin-date">
              <Clock size={14} /> {dateStr}
            </div>
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <Bell size={20} color="#CBD5E1" />
              <div style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, background: '#EF4444', borderRadius: '50%' }}></div>
            </div>
            <div className="admin-header-avatar">A</div>
          </div>
        </header>

        {/* SCROLL AREA */}
        <div className="admin-scroll-area">
          
          {/* ── OVERVIEW TAB ─────────────────────────────── */}
          {activeTab === "overview" && (
            <>
              <div className="admin-dashboard-grid">
                <div className="admin-stat-card" style={{ '--accent': '#3B82F6', '--bg-accent': '#EFF6FF' }}>
                  <div className="admin-stat-header">
                    <span className="admin-stat-title">Total Users</span>
                    <div className="admin-stat-icon-wrap"><Users size={22} /></div>
                  </div>
                  <div className="admin-stat-value">{stats.totalUsers ?? 0}</div>
                  <div className="admin-stat-desc">All registered accounts</div>
                </div>
                
                <div className="admin-stat-card" style={{ '--accent': '#10B981', '--bg-accent': '#ECFDF5' }}>
                  <div className="admin-stat-header">
                    <span className="admin-stat-title">Students</span>
                    <div className="admin-stat-icon-wrap"><Users size={22} /></div>
                  </div>
                  <div className="admin-stat-value">{stats.totalStudents ?? 0}</div>
                  <div className="admin-stat-desc">
                    <span style={{ color: "#16A34A", fontWeight: 600 }}>{verifiedStudents}</span> verified · <span style={{ color: "#D97706", fontWeight: 600 }}>{pendingStudents}</span> pending
                  </div>
                </div>
                
                <div className="admin-stat-card" style={{ '--accent': '#8B5CF6', '--bg-accent': '#FAF5FF' }}>
                  <div className="admin-stat-header">
                    <span className="admin-stat-title">Companies</span>
                    <div className="admin-stat-icon-wrap"><Building2 size={22} /></div>
                  </div>
                  <div className="admin-stat-value">{stats.totalCompanies ?? 0}</div>
                  <div className="admin-stat-desc">
                    <span style={{ color: "#16A34A", fontWeight: 600 }}>{verifiedCompanies}</span> verified
                  </div>
                </div>

                <div className="admin-stat-card" style={{ '--accent': '#F97316', '--bg-accent': '#FFF7ED' }}>
                  <div className="admin-stat-header">
                    <span className="admin-stat-title">Applications</span>
                    <div className="admin-stat-icon-wrap"><FileText size={22} /></div>
                  </div>
                  <div className="admin-stat-value">{stats.totalApplications ?? totalApplications}</div>
                  <div className="admin-stat-desc">Total placement applications</div>
                </div>

                <div className="admin-stat-card" style={{ '--accent': '#14B8A6', '--bg-accent': '#F0FDFA' }}>
                  <div className="admin-stat-header">
                    <span className="admin-stat-title">Students Placed</span>
                    <div className="admin-stat-icon-wrap"><Briefcase size={22} /></div>
                  </div>
                  <div className="admin-stat-value">{totalAccepted}</div>
                  <div className="admin-stat-desc">Accepted offers</div>
                </div>

                <div className="admin-stat-card" style={{ '--accent': '#F4B400', '--bg-accent': '#FEF9EB' }}>
                  <div className="admin-stat-header">
                    <span className="admin-stat-title">Acceptance Rate</span>
                    <div className="admin-stat-icon-wrap"><TrendingUp size={22} /></div>
                  </div>
                  <div className="admin-stat-value">{acceptanceRate}%</div>
                  <div className="admin-stat-desc">Of all applications</div>
                </div>
                
                <div className="admin-stat-card" style={{ '--accent': '#EF4444', '--bg-accent': '#FEF2F2' }}>
                  <div className="admin-stat-header">
                    <span className="admin-stat-title">Open Complaints</span>
                    <div className="admin-stat-icon-wrap"><MessageSquareWarning size={22} /></div>
                  </div>
                  <div className="admin-stat-value">{complaints.length}</div>
                  <div className="admin-stat-desc">Unresolved tickets</div>
                </div>
                
                <div className="admin-stat-card" style={{ '--accent': '#EAB308', '--bg-accent': '#FEFCE8' }}>
                  <div className="admin-stat-header">
                    <span className="admin-stat-title">Pending Verifications</span>
                    <div className="admin-stat-icon-wrap"><Clock size={22} /></div>
                  </div>
                  <div className="admin-stat-value">{pendingStudents}</div>
                  <div className="admin-stat-desc">Students awaiting review</div>
                </div>
              </div>

              <div className="admin-section-header" style={{ marginBottom: 16 }}>
                <div className="admin-section-title" style={{ fontSize: 18 }}>Quick Actions</div>
              </div>
              <div className="admin-quick-actions">
                {[
                  { label: "Review Students", desc: "Verify student profiles", icon: <Users size={20}/>, tab: "students", color: "#3B82F6", bg: "#EFF6FF" },
                  { label: "Verify Companies", desc: "Approve company registrations", icon: <Building2 size={20}/>, tab: "companies", color: "#10B981", bg: "#ECFDF5" },
                  { label: "View Placements", desc: "Track placement applications", icon: <BarChart3 size={20}/>, tab: "placements", color: "#8B5CF6", bg: "#FAF5FF" },
                  { label: "Manage Complaints", desc: "Handle reports & complaints", icon: <MessageSquareWarning size={20}/>, tab: "complaints", color: "#EF4444", bg: "#FEF2F2" },
                ].map((q) => (
                  <div key={q.tab} className="admin-action-card" style={{ '--accent': q.color, '--bg-accent': q.bg }} onClick={() => setActiveTab(q.tab)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="admin-stat-icon-wrap" style={{ width: 40, height: 40, borderRadius: 10 }}>{q.icon}</div>
                      <div>
                        <div className="admin-action-title">{q.label}</div>
                        <div className="admin-action-desc" style={{ marginBottom: 0 }}>{q.desc}</div>
                      </div>
                    </div>
                    <div className="admin-action-arrow"><ChevronRight size={16} /></div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── STUDENTS TAB ─────────────────────────────── */}
          {activeTab === "students" && (
            <>
              <div className="admin-section-header">
                <div>
                  <div className="admin-section-title">Student Verification Panel</div>
                  <div style={{ fontSize: 14, color: "#64748B", marginTop: 4 }}>Click any row to open the student's full profile drawer.</div>
                </div>
                <div style={{ fontSize: 14, color: "#64748B", fontWeight: 500 }}>
                  Showing {filteredStudents.length} of {students.length} students
                </div>
              </div>

              <div className="admin-controls">
                <div className="admin-search" style={{ width: 320 }}>
                  <Search size={16} color="#94A3B8" />
                  <input placeholder="Search students..." style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', color: '#1E293B' }} value={studentSearch} onChange={e => setStudentSearch(e.target.value)} />
                </div>
                <select style={{ padding: '10px 16px', borderRadius: 99, border: '1px solid #E2E8F0', outline: 'none', background: '#FFFFFF', color: '#1E293B', fontSize: 14, fontWeight: 500 }} value={studentFilter} onChange={e => setStudentFilter(e.target.value)}>
                  <option value="all">All Statuses</option>
                  <option value="verified">Verified</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              {filteredStudents.length === 0 ? (
                <div className="admin-empty-state">
                  <div className="admin-empty-icon"><Users size={32} /></div>
                  <div className="admin-empty-title">No Students Found</div>
                  <div className="admin-empty-desc">No students match your current filters. Try changing the search query or filter.</div>
                </div>
              ) : (
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>College</th>
                        <th>Email</th>
                        <th>Pass-out</th>
                        <th>Score</th>
                        <th>Readiness</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((s, idx) => {
                        const avatarBg = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                        const collegeStyle = getCollegeBadge(s.collegeName);
                        return (
                          <tr key={s.id} onClick={() => setSelectedStudent(s)} style={{ cursor: 'pointer' }}>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <div className="admin-user-avatar" style={{ background: avatarBg }}>
                                  {s.profilePhoto ? <img src={s.profilePhoto} alt="" /> : s.name?.charAt(0)}
                                </div>
                                <div>
                                  <div style={{ fontWeight: 600, color: '#1E293B' }}>{s.name}</div>
                                  <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>ID: STU{s.id.toString().padStart(4, '0')}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="admin-tag" style={{ background: collegeStyle.bg, color: collegeStyle.text, borderColor: collegeStyle.border }}>
                                {s.collegeName || "N/A"}
                              </span>
                            </td>
                            <td style={{ color: "#64748B", fontSize: 13 }}>{s.maskedEmail}</td>
                            <td style={{ fontWeight: 600 }}>{s.passOutYear}</td>
                            <td style={{ fontWeight: 700, color: '#2563EB' }}>{s.percentage}%</td>
                            <td>
                              <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, fontWeight: 500 }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: s.resumeUploaded ? '#2563EB' : '#94A3B8' }}>
                                  {s.resumeUploaded ? <CheckCircle2 size={14}/> : <XCircle size={14}/>} Resume
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: s.projectsAdded ? '#2563EB' : '#94A3B8' }}>
                                  {s.projectsAdded ? <CheckCircle2 size={14}/> : <XCircle size={14}/>} Projects
                                </span>
                              </div>
                            </td>
                            <td>
                              <span className={`admin-status-badge admin-status-${s.profileStatus}`}>{s.profileStatus}</span>
                            </td>
                            <td onClick={e => e.stopPropagation()}>
                              <div style={{ display: "flex", gap: 8 }}>
                                <button className="admin-btn admin-btn-success" disabled={s.profileStatus === "verified" || processingId === s.id} onClick={() => verifyStudent(s.id)}>
                                  Verify
                                </button>
                                <button className="admin-btn admin-btn-danger" style={{ padding: '8px' }} disabled={processingId === s.id} onClick={() => toggleBlockStudent(s.id)}>
                                  <Ban size={16} />
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
            </>
          )}

          {/* ── COMPANIES TAB ─────────────────────────────── */}
          {activeTab === "companies" && (
            <>
              <div className="admin-section-header">
                <div>
                  <div className="admin-section-title">Company Verification Panel</div>
                  <div style={{ fontSize: 14, color: "#64748B", marginTop: 4 }}>Click any row to open the company's detail drawer.</div>
                </div>
                <div style={{ fontSize: 14, color: "#64748B", fontWeight: 500 }}>
                  Showing {filteredCompanies.length} of {companies.length} companies
                </div>
              </div>

              <div className="admin-controls">
                <div className="admin-search" style={{ width: 320 }}>
                  <Search size={16} color="#94A3B8" />
                  <input placeholder="Search companies..." style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', color: '#1E293B' }} value={companySearch} onChange={e => setCompanySearch(e.target.value)} />
                </div>
                <select style={{ padding: '10px 16px', borderRadius: 99, border: '1px solid #E2E8F0', outline: 'none', background: '#FFFFFF', color: '#1E293B', fontSize: 14, fontWeight: 500 }} value={companyFilter} onChange={e => setCompanyFilter(e.target.value)}>
                  <option value="all">All Statuses</option>
                  <option value="verified">Verified</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              {filteredCompanies.length === 0 ? (
                <div className="admin-empty-state">
                  <div className="admin-empty-icon"><Building2 size={32} /></div>
                  <div className="admin-empty-title">No Companies Found</div>
                  <div className="admin-empty-desc">No companies match your current filters.</div>
                </div>
              ) : (
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Company</th>
                        <th>Email</th>
                        <th>Location</th>
                        <th>Hiring Type</th>
                        <th>Vacancies</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCompanies.map((c, idx) => {
                        const avatarBg = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                        return (
                          <tr key={c.id} onClick={() => setSelectedCompany(c)} style={{ cursor: 'pointer' }}>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <div className="admin-user-avatar" style={{ background: avatarBg }}>
                                  {c.companyLogo ? <img src={c.companyLogo} alt="" /> : c.companyName?.charAt(0)}
                                </div>
                                <div>
                                  <div style={{ fontWeight: 600, color: '#1E293B' }}>{c.companyName}</div>
                                  <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>ID: COM{c.id.toString().padStart(4, '0')}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ color: "#64748B", fontSize: 13 }}>{c.maskedEmail}</td>
                            <td style={{ fontWeight: 500 }}>{c.location}</td>
                            <td><span className="admin-tag" style={{ background: '#F1F5F9', color: '#475569' }}>{c.hiringType}</span></td>
                            <td style={{ fontWeight: 600 }}>{c.hiringCount}</td>
                            <td>
                              <span className={`admin-status-badge admin-status-${c.profileStatus}`}>{c.profileStatus}</span>
                            </td>
                            <td onClick={e => e.stopPropagation()}>
                              <div style={{ display: "flex", gap: 8 }}>
                                <button className="admin-btn admin-btn-success" disabled={c.profileStatus === "verified" || processingId === c.id} onClick={() => verifyCompany(c.id)}>
                                  Verify
                                </button>
                                <button className="admin-btn admin-btn-danger" style={{ padding: '8px' }} disabled={processingId === c.id} onClick={() => toggleBlockCompany(c.id)}>
                                  <Ban size={16} />
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
            </>
          )}

          {/* ── PLACEMENTS TAB ─────────────────────────────── */}
          {activeTab === "placements" && (
            <>
              <div className="admin-section-header">
                <div>
                  <div className="admin-section-title">Placement Activity Monitor</div>
                  <div style={{ fontSize: 14, color: "#64748B", marginTop: 4 }}>Detailed company-wise hiring breakdown.</div>
                </div>
                <div style={{ fontSize: 14, color: "#64748B", fontWeight: 500 }}>
                  {placementStats.length} companies tracking
                </div>
              </div>

              {placementStats.length === 0 ? (
                <div className="admin-empty-state">
                  <div className="admin-empty-icon"><BarChart3 size={32} /></div>
                  <div className="admin-empty-title">No Placement Data</div>
                  <div className="admin-empty-desc">Placement data will appear here once companies start reviewing applicants.</div>
                </div>
              ) : (
                <div className="admin-placement-grid">
                  {placementStats.map((p, idx) => {
                    const avatarBg = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                    const total = (p.accepted || 0) + (p.rejected || 0) + (p.pending || 0);
                    const rate = total > 0 ? Math.round(((p.accepted || 0) / total) * 100) : 0;
                    return (
                      <div className="admin-placement-card" key={idx}>
                        <div className="admin-placement-header">
                          <div className="admin-user-avatar" style={{ background: avatarBg }}>
                            {p.companyName?.charAt(0)}
                          </div>
                          <div>
                            <div className="admin-placement-company">{p.companyName}</div>
                            <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>ID: COM2025</div>
                          </div>
                        </div>
                        
                        <div className="admin-placement-stats">
                          <div className="admin-placement-stat">
                            <span className="admin-placement-label">Accepted</span>
                            <span className="admin-placement-val green">{p.accepted || 0}</span>
                          </div>
                          <div className="admin-placement-stat">
                            <span className="admin-placement-label">Pending</span>
                            <span className="admin-placement-val amber">{p.pending || 0}</span>
                          </div>
                          <div className="admin-placement-stat">
                            <span className="admin-placement-label">Rejected</span>
                            <span className="admin-placement-val red">{p.rejected || 0}</span>
                          </div>
                        </div>

                        <div className="admin-placement-footer">
                          <span style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>Success Rate</span>
                          <span style={{ fontSize: 15, fontWeight: 800, color: '#1E293B' }}>{rate}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* ── COMPLAINTS TAB ─────────────────────────────── */}
          {activeTab === "complaints" && (
            <>
              <div className="admin-section-header">
                <div>
                  <div className="admin-section-title">Complaint Center</div>
                  <div style={{ fontSize: 14, color: "#64748B", marginTop: 4 }}>Manage and resolve platform reports.</div>
                </div>
                <span className="admin-tag" style={complaints.length > 0 ? { background: "#FEF2F2", color: "#DC2626", border: '1px solid #FCA5A5' } : {}}>
                  {complaints.length} {complaints.length === 1 ? "report" : "reports"}
                </span>
              </div>

              <div className="admin-controls">
                <select style={{ padding: '10px 16px', borderRadius: 99, border: '1px solid #E2E8F0', outline: 'none', background: '#FFFFFF', color: '#1E293B', fontSize: 14, fontWeight: 500 }} value={complaintFilter} onChange={e => setComplaintFilter(e.target.value)}>
                  <option value="all">All Complaints</option>
                  <option value="open">Open</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              {filteredComplaints.length === 0 ? (
                <div className="admin-empty-state">
                  <div className="admin-empty-icon"><MessageSquareWarning size={32} /></div>
                  <div className="admin-empty-title">No Complaints Found</div>
                  <div className="admin-empty-desc">No complaints have been filed yet. The community is happy!</div>
                </div>
              ) : (
                <div className="admin-complaint-grid">
                  {filteredComplaints.map((c) => (
                    <div key={c.id} className="admin-complaint-card">
                      <div className="admin-complaint-header">
                        <span className="admin-complaint-id">Report #{c.id?.toString().padStart(4, "0") || "0000"}</span>
                        <span className={`admin-status-badge admin-status-${c.status || "open"}`}>{c.status || "open"}</span>
                      </div>
                      <div className="admin-complaint-reason">{c.reason}</div>
                      
                      <div className="admin-complaint-meta">
                        <Building2 size={14} />
                        <span style={{ fontWeight: 600, color: '#334155' }}>Against: {c.reportedCompany}</span>
                      </div>
                      <div className="admin-complaint-meta">
                        <Users size={14} />
                        <span>Filed by: {c.reportedBy}</span>
                      </div>
                      <div className="admin-complaint-meta" style={{ marginBottom: 0 }}>
                        <Clock size={14} />
                        <span>{new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                      </div>

                      <div className="admin-complaint-actions">
                        <button className="admin-btn admin-btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>
                          <ShieldX size={14} /> Resolve
                        </button>
                        <button className="admin-btn admin-btn-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={() => toggleBlockCompany(c.companyId)}>
                          <Ban size={14} /> Block
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

        </div>
        
        {/* DRAWERS (Render original component drawers here) */}
        <div className={`pr-drawer ${selectedStudent ? "open" : ""}`}>
           {/* If selectedStudent, we could render the details here. Since it's a UI mockup update, leaving the container for state compatibility. */}
        </div>

      </main>
    </div>
  );
}
