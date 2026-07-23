import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Rocket,
  BarChart3,
  UserCheck,
  Filter,
  ShieldCheck,
  MessageSquareWarning,
  PieChart,
  ArrowRight,
  CheckCircle2,
  Menu,
  X,
  GraduationCap,
  Building2,
  FileCheck2,
  Trophy,
  Briefcase,
  Users,
  Building,
  FileText,
  TrendingUp,
  Globe,
  Mail,
  ExternalLink,
  Share2,
  Star,
  CheckCheck,
  Lock,
  Zap,
  LayoutDashboard,
} from "lucide-react";
import "./LandingPage.css";

const LandingPage = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const animateRefs = useRef([]);

  // ── Scroll handler ───────────────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ── Intersection observer for scroll-reveal ──────────────────────────────
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.12 }
    );
    animateRefs.current.forEach((el) => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  const addRef = (el) => {
    if (el && !animateRefs.current.includes(el)) animateRefs.current.push(el);
  };

  // ── Smooth scroll helper ─────────────────────────────────────────────────
  const scrollTo = (id) => {
    setMenuOpen(false);
    if (id === "top") { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  // ── Data ─────────────────────────────────────────────────────────────────
  const features = [
    {
      icon: <BarChart3 className="lp-feat-icon" />,
      color: "lp-feat-color-blue",
      title: "Relative Scoring",
      text: "Students are ranked using a fair, percentile-based scoring system across the entire platform.",
    },
    {
      icon: <UserCheck className="lp-feat-icon" />,
      color: "lp-feat-color-navy",
      title: "Admin Verification",
      text: "Every profile is manually verified by administrators before becoming visible to companies.",
    },
    {
      icon: <Filter className="lp-feat-icon" />,
      color: "lp-feat-color-teal",
      title: "Smart Eligibility",
      text: "Only highly qualified and eligible students can apply, ensuring quality matches every time.",
    },
    {
      icon: <ShieldCheck className="lp-feat-icon" />,
      color: "lp-feat-color-gold",
      title: "Privacy-Controlled Hiring",
      text: "Student contact details are securely locked until a company accepts the application.",
    },
    {
      icon: <MessageSquareWarning className="lp-feat-icon" />,
      color: "lp-feat-color-red",
      title: "Complaint System",
      text: "Built-in complaint filing ensures complete accountability and platform integrity.",
    },
    {
      icon: <PieChart className="lp-feat-icon" />,
      color: "lp-feat-color-green",
      title: "Placement Analytics",
      text: "Institutions get real-time dashboards with complete placement data and hiring trends.",
    },
  ];

  const steps = [
    { icon: <GraduationCap size={26} />, title: "Create Profile",   desc: "Build your comprehensive academic and skills profile" },
    { icon: <FileCheck2 size={26} />,    title: "Verification",     desc: "Admins verify your credentials for authenticity" },
    { icon: <Trophy size={26} />,        title: "Readiness Score",  desc: "Receive your percentile-based competitive rank" },
    { icon: <Building2 size={26} />,     title: "Company Matching", desc: "Get matched with companies that fit your profile" },
    { icon: <Briefcase size={26} />,     title: "Interview",        desc: "Connect with shortlisted companies and interview" },
    { icon: <Star size={26} />,          title: "Placement",        desc: "Accept your offer and start your career journey" },
  ];

  const stats = [
    { icon: <Users size={24} />,      value: "2,500+", label: "Verified Students",     trend: "+18% this month" },
    { icon: <Building size={24} />,   value: "200+",   label: "Top Companies",         trend: "+12 new this week" },
    { icon: <FileText size={24} />,   value: "15k+",   label: "Applications Processed",trend: "+8% this quarter" },
    { icon: <TrendingUp size={24} />, value: "850+",   label: "Successful Placements", trend: "+24% YoY" },
  ];

  // Bar chart heights for the analytics card mockup
  const barHeights = [28, 40, 20, 52, 36, 48, 32];

  // ── JSX ──────────────────────────────────────────────────────────────────
  return (
    <div className="landing-page">

      {/* ================================================================
          NAVBAR
          ================================================================ */}
      <nav className={`lp-navbar ${scrolled ? "scrolled" : ""}`} id="lp-navbar" role="navigation" aria-label="Main navigation">

        {/* Logo — clicking returns to landing page */}
        <Link to="/" className="lp-nav-brand" aria-label="PlaceReady home">
          <div className="lp-nav-logo">
            <Rocket size={20} strokeWidth={2.5} />
          </div>
          <span className="lp-nav-name">PlaceReady</span>
        </Link>

        {/* Desktop center links */}
        <div className="lp-nav-center">
          <button className="lp-nav-link" onClick={() => scrollTo("top")}>Home</button>
          <button className="lp-nav-link" onClick={() => scrollTo("features")}>Features</button>
          <button className="lp-nav-link" onClick={() => scrollTo("how-it-works")}>How It Works</button>
          <button className="lp-nav-link" onClick={() => scrollTo("roles")}>For You</button>
        </div>

        {/* Desktop right actions + mobile menu */}
        <div className={`lp-nav-links ${menuOpen ? "open" : ""}`}>
          {/* Mobile-only nav links */}
          <div className="lp-nav-mobile-links">
            <button className="lp-nav-link" onClick={() => scrollTo("top")}>Home</button>
            <button className="lp-nav-link" onClick={() => scrollTo("features")}>Features</button>
            <button className="lp-nav-link" onClick={() => scrollTo("how-it-works")}>How It Works</button>
            <button className="lp-nav-link" onClick={() => scrollTo("roles")}>For You</button>
          </div>
          {/* Auth buttons */}
          <div className="lp-nav-actions">
            <Link to="/login"    className="lp-nav-btn-login" onClick={() => setMenuOpen(false)}>Login</Link>
            <Link to="/register" className="lp-nav-btn-start" onClick={() => setMenuOpen(false)}>
              Get Started <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        <button
          className="lp-hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>


      {/* ================================================================
          HERO
          ================================================================ */}
      <section className="lp-hero" id="hero" aria-label="Hero section">
        {/* Orb backgrounds */}
        <div className="lp-hero-bg" aria-hidden="true">
          <div className="lp-hero-orb orb-1" />
          <div className="lp-hero-orb orb-2" />
          <div className="lp-hero-orb orb-3" />
        </div>
        <div className="lp-hero-grid" aria-hidden="true" />

        <div className="lp-hero-inner">
          {/* ── Left: text ─────────────────────────────────────────────── */}
          <div className="lp-hero-content">
            <div className="lp-badge" role="status">
              <span className="lp-badge-dot" aria-hidden="true" />
              Placement Readiness Platform
            </div>

            <h1 className="lp-title">
              Build Skills.<br />
              Get <span className="lp-title-gradient">Verified.</span><br />
              Get Placed.
            </h1>

            <p className="lp-subtitle">
              A premium career intelligence platform connecting verified talent
              with top companies through intelligent scoring, fair rankings,
              and transparent hiring workflows.
            </p>

            <div className="lp-actions">
              <Link to="/register" className="lp-btn-primary" id="hero-cta-primary">
                Get Started Free <ArrowRight size={16} />
              </Link>
              <button
                className="lp-btn-secondary"
                onClick={() => scrollTo("features")}
                id="hero-cta-secondary"
              >
                Explore Features
              </button>
            </div>

            <div className="lp-trust" role="list">
              <div className="lp-trust-item" role="listitem">
                <CheckCircle2 size={15} className="lp-trust-icon" aria-hidden="true" />
                <span>Verified Students</span>
              </div>
              <div className="lp-trust-item" role="listitem">
                <CheckCircle2 size={15} className="lp-trust-icon" aria-hidden="true" />
                <span>Top-Tier Companies</span>
              </div>
              <div className="lp-trust-item" role="listitem">
                <CheckCircle2 size={15} className="lp-trust-icon" aria-hidden="true" />
                <span>Secure Platform</span>
              </div>
            </div>
          </div>

          {/* ── Right: Custom Hero Illustration ─────────────────────────── */}
          <div className="lp-hero-visual" aria-hidden="true">
            <div className="lp-illustration-wrapper">

              {/* Animated AI Connection Lines */}
              <svg className="lp-ill-svg-lines" viewBox="0 0 500 500" preserveAspectRatio="none">
                <path d="M 250 250 Q 150 100 80 200" />
                <path d="M 250 250 Q 400 150 450 250" />
                <path d="M 250 250 Q 150 400 100 350" />
                <path d="M 250 250 Q 350 450 420 380" />
              </svg>

              {/* Core Center Card — Verified Candidate Profile */}
              <div className="lp-ill-center">
                <div className="lp-ill-badge-verified" aria-label="Verified">
                  <CheckCircle2 size={18} strokeWidth={3} />
                </div>

                <div className="lp-ill-center-header">
                  <div className="lp-ill-avatar"><UserCheck size={22} /></div>
                  <div className="lp-ill-lines">
                    <div className="lp-ill-line-1" />
                    <div className="lp-ill-line-2" />
                  </div>
                </div>

                <div className="lp-ill-body-line" />
                <div className="lp-ill-body-line" style={{ width: '85%' }} />
                <div className="lp-ill-body-line" style={{ width: '60%' }} />

                {/* Placement Readiness Score Bar */}
                <div className="lp-ill-score-bar">
                  <div className="lp-ill-score-label">
                    <span>Readiness Score</span>
                    <span>84 / 100</span>
                  </div>
                  <div className="lp-ill-score-track">
                    <div className="lp-ill-score-fill" />
                  </div>
                </div>
              </div>

              {/* Status Pills */}
              <div className="lp-ill-status placed">
                <CheckCheck size={12} /> Placed
              </div>
              <div className="lp-ill-status shortlist">
                <Star size={11} /> Shortlisted
              </div>

              {/* Floating Company Pills */}
              <div className="lp-ill-company c1">
                <Globe className="lp-ill-company-icon" size={14} /> Google
              </div>
              <div className="lp-ill-company c2">
                <Zap className="lp-ill-company-icon" size={14} /> Microsoft
              </div>
              <div className="lp-ill-company c3">
                <Star className="lp-ill-company-icon" size={14} /> Amazon
              </div>
              <div className="lp-ill-company c4">
                <FileCheck2 className="lp-ill-company-icon" size={14} /> Deloitte
              </div>
              <div className="lp-ill-company c5">
                <Building className="lp-ill-company-icon" size={14} /> Infosys
              </div>

              {/* Floating Accent Icons */}
              <div className="lp-ill-icon i1">
                <Trophy size={24} strokeWidth={2.5} />
              </div>
              <div className="lp-ill-icon i2">
                <Briefcase size={24} strokeWidth={2.5} />
              </div>

            </div>
          </div>
        </div>
      </section>


      {/* ================================================================
          FEATURES
          ================================================================ */}
      <section className="lp-section lp-section-white" id="features" aria-label="Platform features">
        <div className="lp-container">
          <div className="lp-section-head" ref={addRef}>
            <div className="lp-section-eyebrow">
              <LayoutDashboard size={13} /> Platform Features
            </div>
            <h2 className="lp-section-title">Built for Fair Placements</h2>
            <p className="lp-section-desc">
              A comprehensive toolkit designed to bring transparency, efficiency,
              and equity to the entire hiring lifecycle.
            </p>
          </div>

          <div className="lp-features-grid">
            {features.map((f, idx) => (
              <div className="lp-feature-card lp-animate" key={idx} ref={addRef}>
                <div className={`lp-feature-icon-wrapper ${f.color}`}>
                  {f.icon}
                </div>
                <h3 className="lp-feature-title">{f.title}</h3>
                <p className="lp-feature-text">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ================================================================
          HOW IT WORKS — 6-step Horizontal Timeline
          ================================================================ */}
      <section className="lp-section lp-section-tint" id="how-it-works" aria-label="How PlaceReady works">
        <div className="lp-container">
          <div className="lp-section-head" ref={addRef}>
            <div className="lp-section-eyebrow">
              <Zap size={13} /> The Process
            </div>
            <h2 className="lp-section-title">How PlaceReady Works</h2>
            <p className="lp-section-desc">
              A streamlined, verified pipeline from profile creation to receiving
              your final job offer — in six clear steps.
            </p>
          </div>

          <div className="lp-process-track" ref={addRef}>
            {steps.map((step, idx) => (
              <div className="lp-process-node lp-animate" key={idx} ref={addRef}>
                <div className="lp-pn-circle">
                  {step.icon}
                  <div className="lp-pn-number" aria-hidden="true">{idx + 1}</div>
                </div>
                <div>
                  <div className="lp-pn-title">{step.title}</div>
                  <p className="lp-pn-desc">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ================================================================
          ROLES — Student & Company
          ================================================================ */}
      <section id="roles" aria-label="Platform roles">
        <div className="lp-roles-wrapper">
          <div className="lp-container" style={{ padding: 0, maxWidth: "100%" }}>
            {/* Section header */}
            <div className="lp-section-head" ref={addRef} style={{ paddingBottom: 0, marginBottom: 56 }}>
              <div className="lp-section-eyebrow">
                <Users size={13} /> Who It&apos;s For
              </div>
              <h2 className="lp-section-title">Designed for Everyone</h2>
              <p className="lp-section-desc">
                Whether you&apos;re a student ready to launch your career or a company
                seeking verified top talent — PlaceReady has you covered.
              </p>
            </div>

            <div className="lp-roles-split">
              {/* Student */}
              <div className="lp-role-panel lp-animate" ref={addRef}>
                <div className="lp-role-icon-wrap lp-role-icon-student">
                  <GraduationCap size={34} />
                </div>
                <span className="lp-role-tag">For Students</span>
                <h3 className="lp-role-title">Launch Your Dream Career</h3>
                <p className="lp-role-desc">
                  Showcase your true potential. Get scored objectively based on your
                  academics and skills, and apply to companies where you&apos;re a perfect match.
                </p>
                <ul className="lp-role-benefits" role="list">
                  <li>
                    <span className="lp-role-benefit-icon" aria-hidden="true"><CheckCircle2 size={13} /></span>
                    Verified academic credentials
                  </li>
                  <li>
                    <span className="lp-role-benefit-icon" aria-hidden="true"><CheckCircle2 size={13} /></span>
                    Transparent percentile rankings
                  </li>
                  <li>
                    <span className="lp-role-benefit-icon" aria-hidden="true"><CheckCircle2 size={13} /></span>
                    Data privacy until shortlisting
                  </li>
                  <li>
                    <span className="lp-role-benefit-icon" aria-hidden="true"><CheckCircle2 size={13} /></span>
                    Real-time application tracking
                  </li>
                </ul>
                <Link to="/register" className="lp-role-btn" id="student-cta">
                  Join as Student <ArrowRight size={16} />
                </Link>
              </div>

              {/* Company */}
              <div className="lp-role-panel lp-animate" ref={addRef}>
                <div className="lp-role-icon-wrap lp-role-icon-company">
                  <Building2 size={34} />
                </div>
                <span className="lp-role-tag company">For Companies</span>
                <h3 className="lp-role-title">Hire Top Talent Faster</h3>
                <p className="lp-role-desc">
                  Access a pool of pre-verified, ranked candidates and filter them
                  based on your exact eligibility criteria — zero noise, pure signal.
                </p>
                <ul className="lp-role-benefits" role="list">
                  <li>
                    <span className="lp-role-benefit-icon" aria-hidden="true"><CheckCircle2 size={13} /></span>
                    Zero fake profiles guaranteed
                  </li>
                  <li>
                    <span className="lp-role-benefit-icon" aria-hidden="true"><CheckCircle2 size={13} /></span>
                    Automated eligibility filtering
                  </li>
                  <li>
                    <span className="lp-role-benefit-icon" aria-hidden="true"><CheckCircle2 size={13} /></span>
                    Streamlined hiring workflow
                  </li>
                  <li>
                    <span className="lp-role-benefit-icon" aria-hidden="true"><CheckCircle2 size={13} /></span>
                    Compliant, privacy-safe contacts
                  </li>
                </ul>
                <Link to="/register" className="lp-role-btn outline" id="company-cta">
                  Register Company <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ================================================================
          STATISTICS
          ================================================================ */}
      <section className="lp-section lp-section-white" aria-label="Platform statistics">
        <div className="lp-container">
          <div className="lp-section-head" ref={addRef}>
            <div className="lp-section-eyebrow">
              <TrendingUp size={13} /> By the Numbers
            </div>
            <h2 className="lp-section-title">Trusted at Scale</h2>
            <p className="lp-section-desc">
              Real numbers from a growing community of students and companies who
              rely on PlaceReady for transparent, efficient hiring.
            </p>
          </div>

          <div className="lp-stats-grid">
            {stats.map((stat, idx) => (
              <div className="lp-stat-card lp-animate" key={idx} ref={addRef}>
                <div className="lp-stat-icon-wrap">{stat.icon}</div>
                <div className="lp-stat-val">{stat.value}</div>
                <div className="lp-stat-label">{stat.label}</div>
                <div className="lp-stat-trend">
                  <TrendingUp size={10} /> {stat.trend}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ================================================================
          CTA
          ================================================================ */}
      <section className="lp-cta-section" aria-label="Call to action">
        <div className="lp-cta-inner">
          {/* Gold top accent line */}
          <div className="lp-cta-gold-line" aria-hidden="true" />
          {/* Decorative orbs */}
          <div className="lp-cta-orb c1" aria-hidden="true" />
          <div className="lp-cta-orb c2" aria-hidden="true" />

          <div className="lp-animate" ref={addRef} style={{ position: "relative", zIndex: 1 }}>
            <div className="lp-cta-eyebrow">Start Your Journey Today</div>
            <h2 className="lp-cta-title">
              <span style={{ color: '#FFFFFF', fontWeight: 800 }}>Ready to Begin Your</span><br />
              <span style={{ color: '#D4A017', fontWeight: 800 }}>Placement Journey?</span>
            </h2>
            <p className="lp-cta-desc">
              Join thousands of students and top companies building their future on
              PlaceReady&apos;s trusted intelligence platform. It&apos;s free to get started.
            </p>
            <div className="lp-cta-actions">
              <Link to="/register" className="lp-btn-white" id="cta-register">
                Get Started Free <ArrowRight size={16} />
              </Link>
              <Link to="/login" className="lp-btn-ghost-white" id="cta-login">
                Sign In to Dashboard
              </Link>
            </div>
            <div className="lp-cta-trust">
              <div className="lp-cta-trust-item"><Lock size={13} /> Enterprise-grade Security</div>
              <div className="lp-cta-trust-item"><CheckCircle2 size={13} /> Free to Get Started</div>
              <div className="lp-cta-trust-item"><Users size={13} /> 2,500+ Students</div>
            </div>
          </div>
        </div>
      </section>


      {/* ================================================================
          FOOTER
          ================================================================ */}
      <footer className="lp-footer" role="contentinfo">
        <div className="lp-footer-grid">
          {/* Brand */}
          <div className="lp-footer-brand">
            <div className="lp-footer-logo">
              <div className="lp-footer-logo-icon">
                <Rocket size={18} strokeWidth={2.5} />
              </div>
              <span className="lp-footer-logo-name">PlaceReady</span>
            </div>
            <p className="lp-footer-brand-desc">
              A premium career intelligence platform connecting verified talent
              with top companies through fair, transparent hiring.
            </p>
            <div className="lp-social" role="list">
              <a href="#" className="lp-social-btn" aria-label="GitHub" role="listitem">
                <ExternalLink size={16} />
              </a>
              <a href="#" className="lp-social-btn" aria-label="LinkedIn" role="listitem">
                <Share2 size={16} />
              </a>
              <a href="#" className="lp-social-btn" aria-label="Website" role="listitem">
                <Globe size={16} />
              </a>
              <a href="#" className="lp-social-btn" aria-label="Email" role="listitem">
                <Mail size={16} />
              </a>
            </div>
          </div>

          {/* Platform links */}
          <div className="lp-footer-col">
            <h4>Platform</h4>
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#roles">For Students</a>
            <a href="#roles">For Companies</a>
          </div>

          {/* Resources */}
          <div className="lp-footer-col">
            <h4>Resources</h4>
            <a href="#">Help Center</a>
            <a href="#">Documentation</a>
            <a href="#">Placement Guidelines</a>
            <a href="#">Success Stories</a>
          </div>

          {/* Company */}
          <div className="lp-footer-col">
            <h4>Company</h4>
            <a href="#">About Us</a>
            <a href="#">Contact</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="lp-footer-bottom">
          <span>© {new Date().getFullYear()} PlaceReady Inc. All rights reserved.</span>
          <div className="lp-footer-bottom-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Cookies</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
