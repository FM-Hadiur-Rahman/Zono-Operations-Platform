import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { label: "Dashboard", to: "/platform/dashboard" },
  { label: "Companies", to: "/platform/companies" },
  { label: "Create Company", to: "/platform/companies/new" },
];

export default function PlatformSidebar() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="w-full rounded-[28px] border border-white/40 bg-white/75 p-5 shadow-[0_12px_40px_rgba(49,31,18,0.08)] backdrop-blur-xl lg:w-[280px]">
      <div className="border-b border-[#eadccf] pb-5">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9a7b5f]">
          Zono Operations Platform
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-[#1f140f]">
          Platform Admin
        </h2>
        <p className="mt-2 text-sm leading-7 text-[#6b5b52]">
          {user?.name || "Platform Admin"}
        </p>
        <p className="text-sm text-[#8b7768]">
          {user?.email || "admin@zono.app"}
        </p>
      </div>

      <nav className="mt-5 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `block rounded-2xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-[linear-gradient(135deg,#2d1c13_0%,#4e342e_100%)] text-white shadow-[0_10px_24px_rgba(62,39,35,0.18)]"
                  : "bg-[#fcf8f4] text-[#2d1c13] hover:bg-[#f3e8dc]"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        className="mt-6 w-full rounded-2xl border border-[#d8c6b7] bg-white/80 px-4 py-3 text-sm font-semibold text-[#2d1c13] transition hover:bg-[#f8f2ec]"
      >
        Logout
      </button>
    </aside>
  );
}
