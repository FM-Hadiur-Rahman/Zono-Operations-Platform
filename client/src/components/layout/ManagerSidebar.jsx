import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useBasket } from "../../context/BasketContext";
import api from "../../lib/api";
import { getToken } from "../../utils/storage";

const navItems = [
  { label: "Dashboard", to: "/manager" },
  { label: "Products", to: "/manager/products" },
  { label: "Basket", to: "/manager/basket" },
  { label: "Orders", to: "/manager/orders" },
];

export default function ManagerSidebar() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { basket } = useBasket();

  const [stats, setStats] = useState({
    ordersThisWeek: 0,
    suppliers: 0,
  });

  useEffect(() => {
    const loadSidebarStats = async () => {
      try {
        const token = getToken();

        const { data } = await api.get("/dashboard/manager", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setStats({
          ordersThisWeek: data?.stats?.ordersThisWeek || 0,
          suppliers: data?.stats?.suppliers || 0,
        });
      } catch (error) {
        console.error("Failed to load manager sidebar stats:", error);
      }
    };

    loadSidebarStats();
  }, []);

  const basketItemCount = basket.reduce((sum, item) => sum + item.qty, 0);

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
          Manager Panel
        </h2>
        <p className="mt-2 text-sm leading-7 text-[#6b5b52]">
          {user?.name || "Manager"}
        </p>
        <p className="text-sm text-[#8b7768]">
          {user?.location?.name || "Café Location"}
        </p>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-[#eadccf] bg-[#fcf8f4] px-3 py-3 text-center">
          <p className="text-[10px] uppercase tracking-[0.12em] text-[#9a7b5f]">
            Basket
          </p>
          <p className="mt-1 text-sm font-semibold text-[#2d1c13]">
            {basketItemCount}
          </p>
        </div>

        <div className="rounded-xl border border-[#eadccf] bg-[#fcf8f4] px-3 py-3 text-center">
          <p className="text-[10px] uppercase tracking-[0.12em] text-[#9a7b5f]">
            Week
          </p>
          <p className="mt-1 text-sm font-semibold text-[#2d1c13]">
            {stats.ordersThisWeek}
          </p>
        </div>

        <div className="rounded-xl border border-[#eadccf] bg-[#fcf8f4] px-3 py-3 text-center">
          <p className="text-[10px] uppercase tracking-[0.12em] text-[#9a7b5f]">
            Suppliers
          </p>
          <p className="mt-1 text-sm font-semibold text-[#2d1c13]">
            {stats.suppliers}
          </p>
        </div>
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
