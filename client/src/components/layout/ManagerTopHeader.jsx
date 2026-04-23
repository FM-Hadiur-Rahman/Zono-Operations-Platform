import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ManagerTopHeader({
  title = "Manager Area",
  subtitle = "",
}) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="mb-6 rounded-[28px] border border-white/40 bg-white/75 p-5 shadow-[0_12px_40px_rgba(49,31,18,0.08)] backdrop-blur-xl">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9a7b5f]">
            Zono Operations Platform
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-[#1f140f]">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-2 text-sm leading-7 text-[#6b5b52]">{subtitle}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="rounded-2xl border border-[#e7d7c8] bg-[#fcf8f4] px-4 py-3 shadow-sm">
            <p className="text-xs uppercase tracking-[0.14em] text-[#9a7b5f]">
              User
            </p>
            <p className="mt-1 text-sm font-semibold text-[#2d1c13]">
              {user?.name || "User"}
            </p>
          </div>

          <div className="rounded-2xl border border-[#e7d7c8] bg-[#fcf8f4] px-4 py-3 shadow-sm">
            <p className="text-xs uppercase tracking-[0.14em] text-[#9a7b5f]">
              Role
            </p>
            <p className="mt-1 text-sm font-semibold capitalize text-[#2d1c13]">
              {user?.role || "manager"}
            </p>
          </div>

          <div className="rounded-2xl border border-[#e7d7c8] bg-[#fcf8f4] px-4 py-3 shadow-sm">
            <p className="text-xs uppercase tracking-[0.14em] text-[#9a7b5f]">
              Branch
            </p>
            <p className="mt-1 text-sm font-semibold text-[#2d1c13]">
              {user?.location?.name || "Café Location"}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-2xl border border-[#d8c6b7] bg-white/80 px-5 py-3 text-sm font-semibold text-[#2d1c13] transition hover:bg-[#f8f2ec]"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
