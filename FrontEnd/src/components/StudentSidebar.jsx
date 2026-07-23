import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { User, Building2, Briefcase, LogOut, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '../components/ToastProvider';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

function StudentSidebar({ isMobileOpen, closeMobile }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const toast = useToast();
  const photoInputRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch(`${API_BASE_URL}/student/me`, {
        headers: { Authorization: "Bearer " + token },
      })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch profile");
        }
        return res.json();
      })
      .then(data => setUser(data))
      .catch(err => {
        console.error("Error fetching student profile:", err);
        // Fallback user state so readiness score defaults to 0 instead of crashing/blank
        setUser({ readinessScore: 0, profileStatus: 'pending' });
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    toast.success('Success', 'Logged out successfully');
    navigate('/login');
  };

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

      const imageUrl = data.imageUrl;
      setUser(prev => ({ ...prev, profilePhoto: imageUrl }));
      
      await fetch(`${API_BASE_URL}/student/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ profilePhoto: imageUrl }),
      });
      
      toast.success("Success", "Profile photo updated successfully.");
    } catch (err) {
      toast.error('Upload Failed', 'Upload failed. Please try again.');
    }
    e.target.value = '';
  };

  const navItems = [
    { name: 'My Profile', path: '/student/profile', icon: User },
    { name: 'Companies', path: '/student/companies', icon: Building2 },
    { name: 'Applications', path: '/student/applications', icon: Briefcase },
  ];

  return (
    <>
      <div className={`pr-overlay ${isMobileOpen ? 'visible' : ''}`} onClick={closeMobile}></div>
      
      <aside className={`pr-sidebar ${isMobileOpen ? 'open' : ''}`}>
        
        {/* ── Brand Logo ── */}
        <div style={{ padding: '28px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
          <div style={{ fontSize: '19px', fontWeight: '800', color: 'white', letterSpacing: '-0.5px' }}>
            Smart<span style={{ color: '#F4B400' }}>Placement</span>
          </div>
        </div>

        {/* ── Profile Block ── */}
        <div className="pr-sidebar-profile">
          <div className="pr-sidebar-photo-wrap">
            {user?.profilePhoto ? (
              <img src={user.profilePhoto} alt="Student" className="pr-sidebar-photo" />
            ) : (
              <div className="pr-sidebar-photo-placeholder">
                {user?.firstName?.charAt(0) || 'S'}
              </div>
            )}
            <div className="pr-sidebar-photo-overlay" onClick={() => photoInputRef.current?.click()}>
              <span style={{ fontSize: '11px', fontWeight: '700', textAlign: 'center', lineHeight: 1.3 }}>Update<br/>Profile</span>
            </div>
          </div>
          
          <div className="pr-sidebar-user-info" style={{ textAlign: 'center', marginTop: '10px' }}>
            <div className="pr-sidebar-name">{user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Student Name'}</div>
            <div className="pr-sidebar-role" style={{ marginTop: '4px' }}>{user?.degree || 'Degree'} · {user?.branch || 'Branch'}</div>
          </div>

          <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'center' }}>
            {user?.profileStatus === 'verified' ? (
              <span className="pr-sidebar-verified"><CheckCircle size={13}/> Verified</span>
            ) : (
              <span className="pr-sidebar-pending"><Clock size={13}/> Pending Review</span>
            )}
          </div>

          {/* Update Profile button */}
          <input
            ref={photoInputRef}
            type="file"
            accept="image/jpeg, image/png, image/webp"
            style={{ display: 'none' }}
            onChange={handlePhotoUpload}
          />
          <button
            onClick={() => photoInputRef.current?.click()}
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

        {/* ── Readiness Score Widget (below Applications) ── */}
        <div className="pr-readiness-widget" style={{ marginBottom: 'auto' }}>
          <div className="pr-readiness-label">Placement Readiness</div>
          <div className="pr-readiness-ring-wrap">
            <div className="pr-readiness-ring">
              <svg viewBox="0 0 100 100">
                <circle className="pr-readiness-ring-bg" cx="50" cy="50" r="45"></circle>
                <circle 
                  className="pr-readiness-ring-fill" 
                  cx="50" cy="50" r="45" 
                  strokeDasharray="283" 
                  strokeDashoffset={283 - (283 * (user?.readinessScore || 0)) / 100}
                ></circle>
              </svg>
              <div className="pr-readiness-inner">
                <div className="pr-readiness-score">{user?.readinessScore || 0}</div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)', marginTop: '1px' }}>/100</div>
              </div>
            </div>
            <div className="pr-readiness-info">
              <div className="pr-readiness-tag">Score</div>
              <div className="pr-readiness-bar-wrap">
                <div className="pr-readiness-bar-fill" style={{ width: `${user?.readinessScore || 0}%` }}></div>
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '6px' }}>
                {user?.readinessScore >= 70 ? 'Ready for Placement' : user?.readinessScore >= 40 ? 'In Progress' : 'Complete Profile'}
              </div>
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

export default StudentSidebar;
