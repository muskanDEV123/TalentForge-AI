import { Link, useNavigate } from "@tanstack/react-router";
import { apiLogout } from "@/lib/api";

export function Icon({ name, filled, className = "", style }: { name: string; filled?: boolean; className?: string; style?: React.CSSProperties }) {
  return (
    <span className={`material-symbols-outlined ${className}`}
      style={{ ...(filled ? { fontVariationSettings: "'FILL' 1" } : {}), ...style }}>
      {name}
    </span>
  );
}

export function TopNavBar({ active }: { active?: "home" | "analyze" | "about" }) {
  const link = (to: string, label: string, key: "home" | "analyze" | "about") => (
    <Link to={to} className={active === key ? "text-primary font-bold border-b-2 border-primary pb-1" : "text-on-surface-variant hover:text-primary transition-colors duration-200"}>
      {label}
    </Link>
  );
  return (
    <header className="sticky top-0 z-50 bg-surface border-b border-outline-variant shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-10 py-4 flex justify-between items-center">
        <Link to="/" className="font-bold text-primary text-2xl">TalentForge AI</Link>
        <nav className="hidden md:flex items-center gap-8 text-sm">
          {link("/", "Home", "home")}
          {link("/analyze", "Analyze", "analyze")}
          {link("/about", "About", "about")}
        </nav>
        <Link to="/login" className="bg-primary text-on-primary px-6 py-2 rounded-lg text-sm font-semibold hover:bg-primary-container transition-all duration-200 shadow-sm active:scale-95">
          Sign In
        </Link>
      </div>
    </header>
  );
}

export function DashboardNavBar({ user = "User" }: { user?: string }) {
  const navigate = useNavigate();
  const handleLogout = async () => {
    await apiLogout();
    navigate({ to: "/login" });
  };
  return (
    <header className="sticky top-0 z-50 bg-surface border-b border-outline-variant shadow-sm">
      <div className="max-w-7xl mx-auto px-6 md:px-10 h-16 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 font-bold text-primary text-2xl">
          <Icon name="analytics" filled />
          <span>TalentForge AI</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 bg-surface-container-low border border-outline-variant rounded-full px-3 py-1.5 text-sm text-on-surface-variant">
            <Icon name="account_circle" />
            <span>{user}</span>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-surface-container-low">
            <Icon name="logout" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export function Footer({ showSocial = false }: { showSocial?: boolean }) {
  return (
    <footer className="bg-surface-container-low border-t border-outline-variant py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 md:px-10 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
          <span className="font-bold text-primary">TalentForge AI</span>
          <span className="text-on-surface-variant text-xs">© 2024 ATS Resume Analyzer. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <a href="#" className="text-on-surface-variant hover:text-on-surface hover:underline">Privacy Policy</a>
          <a href="#" className="text-on-surface-variant hover:text-on-surface hover:underline">Terms of Service</a>
          <a href="#" className="text-on-surface-variant hover:text-on-surface hover:underline">Contact Support</a>
        </div>
      </div>
    </footer>
  );
}
