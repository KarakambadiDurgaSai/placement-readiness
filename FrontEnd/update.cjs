const fs = require('fs');
const filePath = 'src/pages/admin/AdminDashboard.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update Dashboard Metric Cards
const startMarker = '              {/* Metric Cards */}';
const endMarker = '              {/* Quick Links */}';
const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf(endMarker);

if(startIdx !== -1 && endIdx !== -1) {
    const newDashboardContent = `              {/* Dashboard Metric Cards */}
              <div className="admin-dashboard-cards">
                <div className="admin-dash-card" style={{ '--accent': '#3B82F6', '--bg-accent': '#EFF6FF' }}>
                  <div className="admin-dash-header">
                    <span className="admin-dash-title">Total Users</span>
                    <div className="admin-dash-icon"><Users size={20} /></div>
                  </div>
                  <div className="admin-dash-value">{stats.totalUsers ?? 0}</div>
                  <div className="admin-dash-desc">All registered accounts</div>
                </div>
                
                <div className="admin-dash-card" style={{ '--accent': '#9333EA', '--bg-accent': '#FAF5FF' }}>
                  <div className="admin-dash-header">
                    <span className="admin-dash-title">Students</span>
                    <div className="admin-dash-icon"><Users size={20} /></div>
                  </div>
                  <div className="admin-dash-value">{stats.totalStudents ?? 0}</div>
                  <div className="admin-dash-desc">
                    <span style={{ color: "#16A34A", fontWeight: 600 }}>{verifiedStudents}</span> verified · <span style={{ color: "#D97706", fontWeight: 600 }}>{pendingStudents}</span> pending
                  </div>
                </div>
                
                <div className="admin-dash-card" style={{ '--accent': '#F97316', '--bg-accent': '#FFF7ED' }}>
                  <div className="admin-dash-header">
                    <span className="admin-dash-title">Companies</span>
                    <div className="admin-dash-icon"><Building2 size={20} /></div>
                  </div>
                  <div className="admin-dash-value">{stats.totalCompanies ?? 0}</div>
                  <div className="admin-dash-desc">
                    <span style={{ color: "#16A34A", fontWeight: 600 }}>{verifiedCompanies}</span> verified
                  </div>
                </div>

                <div className="admin-dash-card" style={{ '--accent': '#10B981', '--bg-accent': '#ECFDF5' }}>
                  <div className="admin-dash-header">
                    <span className="admin-dash-title">Applications</span>
                    <div className="admin-dash-icon"><FileText size={20} /></div>
                  </div>
                  <div className="admin-dash-value">{stats.totalApplications ?? totalApplications}</div>
                  <div className="admin-dash-desc">Total placement applications</div>
                </div>

                <div className="admin-dash-card" style={{ '--accent': '#D4A017', '--bg-accent': '#FDF9F0' }}>
                  <div className="admin-dash-header">
                    <span className="admin-dash-title">Students Placed</span>
                    <div className="admin-dash-icon"><Briefcase size={20} /></div>
                  </div>
                  <div className="admin-dash-value">{totalAccepted}</div>
                  <div className="admin-dash-desc">Accepted offers</div>
                </div>

                <div className="admin-dash-card" style={{ '--accent': '#6366F1', '--bg-accent': '#EEF2FF' }}>
                  <div className="admin-dash-header">
                    <span className="admin-dash-title">Acceptance Rate</span>
                    <div className="admin-dash-icon"><TrendingUp size={20} /></div>
                  </div>
                  <div className="admin-dash-value">{acceptanceRate}%</div>
                  <div className="admin-dash-desc">Of all applications</div>
                </div>
                
                <div className="admin-dash-card" style={{ '--accent': '#EF4444', '--bg-accent': '#FEF2F2' }}>
                  <div className="admin-dash-header">
                    <span className="admin-dash-title">Open Complaints</span>
                    <div className="admin-dash-icon"><MessageSquareWarning size={20} /></div>
                  </div>
                  <div className="admin-dash-value">{complaints.length}</div>
                  <div className="admin-dash-desc">Unresolved tickets</div>
                </div>
                
                <div className="admin-dash-card" style={{ '--accent': '#EAB308', '--bg-accent': '#FEFCE8' }}>
                  <div className="admin-dash-header">
                    <span className="admin-dash-title">Pending Verifications</span>
                    <div className="admin-dash-icon"><Clock size={20} /></div>
                  </div>
                  <div className="admin-dash-value">{pendingStudents}</div>
                  <div className="admin-dash-desc">Students awaiting review</div>
                </div>
              </div>\n\n`;
    content = content.substring(0, startIdx) + newDashboardContent + content.substring(endIdx);
    console.log("Updated Dashboard");
} else {
    console.error('Dashboard markers not found');
}

// 2. Update Student Table
const startMarker2 = '                <div className="pr-table-wrap">';
const endMarker2 = '              )}\n            </>\n          )}\n\n          {/* ── COMPANIES TAB ─────────────────────────────── */}';
const startIdx2 = content.indexOf(startMarker2);
const endIdx2 = content.indexOf(endMarker2);

if(startIdx2 !== -1 && endIdx2 !== -1) {
    const newStudentContent = `                <div className="pr-table-wrap">
                  <table className="pr-table admin-student-table">
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
                                <div className="pr-sidebar-avatar" style={{ width: 36, height: 36, fontSize: 14, flexShrink: 0, background: avatarBg, color: "#fff", border: "none" }}>
                                  {s.profilePhoto ? <img src={s.profilePhoto} alt="" /> : s.name?.charAt(0)}
                                </div>
                                <span className="name-cell" style={{ fontWeight: 600 }}>{s.name}</span>
                              </div>
                            </td>
                            <td>
                              <span className="admin-college-badge" style={{ background: collegeStyle.bg, color: collegeStyle.text, borderColor: collegeStyle.border }}>
                                {s.collegeName || "N/A"}
                              </span>
                            </td>
                            <td style={{ color: "#64748B" }}>{s.maskedEmail}</td>
                            <td style={{ fontWeight: 500 }}>{s.passOutYear}</td>
                            <td style={{ fontWeight: 600 }}>{s.percentage}%</td>
                            <td>
                              <div style={{ display: "flex", gap: 10 }}>
                                <span className={\`pr-indicator \${s.resumeUploaded ? "ok" : "no"}\`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                  {s.resumeUploaded ? <CheckCircle2 size={14}/> : <XCircle size={14}/>} Resume
                                </span>
                                <span className={\`pr-indicator \${s.projectsAdded ? "ok" : "no"}\`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                  {s.projectsAdded ? <CheckCircle2 size={14}/> : <XCircle size={14}/>} Projects
                                </span>
                              </div>
                            </td>
                            <td>
                              <span className={\`admin-status-pill admin-status-\${s.profileStatus}\`}>{s.profileStatus}</span>
                            </td>
                            <td onClick={e => e.stopPropagation()}>
                              <div style={{ display: "flex", gap: 8 }}>
                                <button
                                  className="admin-btn-verify"
                                  disabled={s.profileStatus === "verified" || processingId === s.id}
                                  onClick={() => verifyStudent(s.id)}
                                >
                                  <ShieldCheck size={14} />
                                  {s.profileStatus === "verified" ? "Verified" : "Verify"}
                                </button>
                                <button
                                  className="admin-btn-reject"
                                  disabled={processingId === s.id}
                                  onClick={() => toggleBlockStudent(s.id)}
                                >
                                  <Ban size={14} /> Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>\n`;
    content = content.substring(0, startIdx2) + newStudentContent + content.substring(endIdx2);
    console.log("Updated Student Table");
} else {
    console.error('Student table markers not found');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done!');
