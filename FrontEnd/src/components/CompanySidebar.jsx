import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Building, Users, LogOut, CheckCircle, Clock, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useToast } from '../components/ToastProvider';
import './CompanySidebar.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

function CompanySidebar({ isMobileOpen, closeMobile }) {
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [appCount, setAppCount] = useState(0);
  const toast = useToast();
  const logoInputRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Fetch company details
      fetch(`${API_BASE_URL}/company/me`, {
        headers: { Authorization: "Bearer " + token },
      })
      .then(res => res.json())
      .then(data => setCompany(data))
      .catch(err => console.error("Error fetching company profile:", err));

      // Fetch applicants count
      fetch(`${API_BASE_URL}/company/applicants`, {
        headers: { Authorization: "Bearer " + token },
      })
      .then(res => res.json())
      .then(data => {
        if(data && data.applicants) {
           setAppCount(data.applicants.length);
        }
      })
      .catch(err => console.error("Error fetching applications:", err));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    toast.success('Success', 'Logged out successfully');
    navigate('/login');
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Upload Failed', 'Image size must be less than 5 MB.');
      return;
    }

    const formData = new FormData();
    formData.append('photo', file);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${API_BASE_URL}/upload/profile-photo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      
      if (!res.ok) {
        toast.error('Upload Failed', data.message || 'Upload failed. Please try again.');
        return;
      }
      
      const newLogoUrl = data.imageUrl;
      setCompany(prev => ({ ...prev, companyLogo: newLogoUrl }));
      
      // Persist to backend if company profile exists
      if (company) {
        await fetch(`${API_BASE_URL}/company/profile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ ...company, companyLogo: newLogoUrl })
        });
      }
      
      toast.success('Success', 'Profile photo updated successfully.');
    } catch (err) {
      toast.error('Upload Failed', 'Upload failed. Please try again.');
    }
    // Reset so same file can be re-selected
    e.target.value = '';
  };

  const navItems = [
    { name: 'Company Profile', path: '/company/profile', icon: Building },
    { name: 'Applicants', path: '/company/applicants', icon: Users },
  ];
  
  const totalVacancies = ((Number(company?.techHiringCount) || 0) + (Number(company?.nonTechHiringCount) || 0));
  const activeRoles = company?.roles?.length || 0;
  const isVerified = company?.profileStatus === 'verified';

  return (
    <>
      <div className={`pr-overlay ${isMobileOpen ? 'visible' : ''}`} onClick={closeMobile}></div>
      
      <aside className={`pr-sidebar company-sidebar ${isMobileOpen ? 'open' : ''}`}>
        
        {/* ── Brand Logo ── */}
        <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
          <div style={{ fontSize: '19px', fontWeight: '800', color: 'white', letterSpacing: '-0.5px' }}>
            Smart<span style={{ color: '#F4B400' }}>Placement</span>
          </div>
        </div>

        {/* ── Profile Block ── */}
        <div className="pr-sidebar-profile">
          <div className="pr-sidebar-photo-wrap">
            {company?.companyLogo ? (
              <img src={company.companyLogo} alt="Company" className="pr-sidebar-photo" />
            ) : (
              <div className="pr-sidebar-photo-placeholder">
                {company?.companyName?.charAt(0) || 'C'}
              </div>
            )}
            <div className="pr-sidebar-photo-overlay" onClick={() => logoInputRef.current?.click()}>
              <span style={{ fontSize: '11px', fontWeight: '700', textAlign: 'center', lineHeight: 1.3 }}>Update<br/>Profile</span>
            </div>
          </div>
          
          <div className="pr-sidebar-user-info" style={{ textAlign: 'center', marginTop: '10px' }}>
            <div className="pr-sidebar-name">{company?.companyName || 'Company Name'}</div>
            <div className="pr-sidebar-role" style={{ marginTop: '4px' }}>Recruiter / Admin</div>
          </div>

          <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'center' }}>
            {isVerified ? (
              <span className="pr-sidebar-verified"><CheckCircle size={13}/> Verified</span>
            ) : (
              <span className="pr-sidebar-pending"><Clock size={13}/> Pending Review</span>
            )}
          </div>

          {/* Update Profile button — triggers logo upload */}
          <input
            ref={logoInputRef}
            type="file"
            accept="image/jpeg, image/png, image/webp"
            style={{ display: 'none' }}
            onChange={handleLogoUpload}
          />
          <button
            onClick={() => logoInputRef.current?.click()}
            className="pr-sidebar-upload-btn"
            style={{ marginTop: '10px' }}
          >
            Update Profile
          </button>
        </div>

        {/* ── Navigation ── */}
        <nav className="pr-sidebar-nav-section" style={{ flexGrow: 0, marginBottom: '8px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => `pr-nav-item ${isActive ? 'active' : ''}`}
                onClick={closeMobile}
              >
                <span className="pr-nav-icon"><Icon size={19} /></span>
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* ── Company Overview Widget ── */}
        <div className="pr-readiness-widget" style={{ marginBottom: 'auto' }}>
          <div className="pr-readiness-label">Company Overview</div>
          <div className="pr-readiness-ring-wrap" style={{ display: 'block', padding: '16px', background: 'rgba(0,0,0,0.1)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>Vacancies</span>
              <span style={{ color: 'white', fontSize: '12px', fontWeight: '600' }}>{totalVacancies > 0 ? totalVacancies : "Not Set"}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>Applications</span>
              <span style={{ color: 'white', fontSize: '12px', fontWeight: '600' }}>{appCount}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>Target Roles</span>
              <span style={{ color: 'white', fontSize: '12px', fontWeight: '600' }}>{activeRoles}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>Min Score</span>
              <span style={{ color: 'white', fontSize: '12px', fontWeight: '600' }}>{company?.minimumPercentage ? `${company.minimumPercentage}%` : "None"}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>Status</span>
              <span style={{ color: isVerified ? '#10B981' : '#F59E0B', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {isVerified ? <><ShieldCheck size={12}/> Verified</> : <><AlertTriangle size={12}/> Pending</>}
              </span>
            </div>

          </div>
        </div>

        {/* ── Logout ── */}
        <div className="pr-sidebar-logout-area">
          <button onClick={handleLogout} className="pr-sidebar-logout-btn">
            <LogOut size={18} />
            Logout
          </button>
        </div>

      </aside>
    </>
  );
}

export default CompanySidebar;
