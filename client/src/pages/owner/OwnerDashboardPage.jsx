import { useEffect, useState } from "react";
import api from "../../lib/api";
import { getToken } from "../../utils/storage";
import { useAuth } from "../../context/AuthContext";
import MiniBarList from "../../components/charts/MiniBarList";
import MiniStatTrend from "../../components/charts/MiniStatTrend";
import OwnerLayout from "../../components/layout/OwnerLayout";

export default function OwnerDashboardPage() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const token = getToken();

        const { data } = await api.get("/dashboard/owner", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setDashboard(data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load dashboard data.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <OwnerLayout
        title="Executive Operations Dashboard"
        subtitle={`Welcome back, ${user?.name || "Owner"}. Monitor branches, suppliers, orders, and spend from one elegant control center.`}
      >
        <div className="rounded-[32px] border border-white/40 bg-white/75 p-8 text-[#6b5b52] shadow-[0_20px_80px_rgba(49,31,18,0.12)] backdrop-blur-xl">
          Loading executive dashboard...
        </div>
      </OwnerLayout>
    );
  }

  if (error) {
    return (
      <OwnerLayout
        title="Executive Operations Dashboard"
        subtitle={`Welcome back, ${user?.name || "Owner"}. Monitor branches, suppliers, orders, and spend from one elegant control center.`}
      >
        <div className="rounded-[32px] border border-red-200 bg-red-50 p-8 text-red-700 shadow-sm">
          {error}
        </div>
      </OwnerLayout>
    );
  }

  const stats = dashboard?.stats || {};
  const branchOverview = dashboard?.branchOverview || [];
  const supplierOverview = dashboard?.supplierOverview || [];
  const recentOrders = dashboard?.recentOrders || [];

  const statCards = [
    {
      label: "Locations",
      value: stats.locations ?? 0,
      subtext: "Active branches",
      accent: "from-[#f7eadb] to-[#eddac7]",
    },
    {
      label: "Suppliers",
      value: stats.suppliers ?? 0,
      subtext: "Connected partners",
      accent: "from-[#f8efe6] to-[#efe1d2]",
    },
    {
      label: "Orders This Week",
      value: stats.ordersThisWeek ?? 0,
      subtext: "Across all cafés",
      accent: "from-[#f7eadb] to-[#ead7c3]",
    },
    {
      label: "Total Spend",
      value: `€${Number(stats.totalSpend || 0).toFixed(2)}`,
      subtext: "All recorded orders",
      accent: "from-[#f4e3d3] to-[#e7cfb9]",
    },
  ];

  return (
    <OwnerLayout
      title="Executive Operations Dashboard"
      subtitle={`Welcome back, ${user?.name || "Owner"}. Monitor branches, suppliers, orders, and spend from one elegant control center.`}
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className={`rounded-[28px] border border-[#eadccf] bg-gradient-to-br ${stat.accent} p-5 shadow-sm`}
            >
              <p className="text-sm text-[#8b7768]">{stat.label}</p>
              <p className="mt-3 text-3xl font-semibold text-[#1f140f]">
                {stat.value}
              </p>
              <p className="mt-2 text-sm text-[#7f6b60]">{stat.subtext}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <div className="rounded-[30px] border border-[#eadccf] bg-white/90 p-6 shadow-sm">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#9a7b5f]">
                    Branch Overview
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-[#1f140f]">
                    Real Branch Activity
                  </h2>
                </div>

                <div className="rounded-full bg-[#f5ebe2] px-4 py-2 text-sm font-medium text-[#6d4c41]">
                  Live Snapshot
                </div>
              </div>

              <div className="space-y-4">
                {branchOverview.length === 0 ? (
                  <div className="rounded-2xl border border-[#f0e3d7] bg-[#fffdfa] p-4 text-sm text-[#6b5b52]">
                    No branch activity yet.
                  </div>
                ) : (
                  branchOverview.map((branch) => (
                    <div
                      key={branch.id}
                      className="rounded-2xl border border-[#f0e3d7] bg-[#fffdfa] p-4"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <p className="text-lg font-semibold text-[#2d1c13]">
                            {branch.name}
                          </p>
                          <p className="mt-1 text-sm text-[#8b7768]">
                            {branch.city || "Location activity"}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-6">
                          <div>
                            <p className="text-xs uppercase tracking-[0.14em] text-[#a08d81]">
                              Orders
                            </p>
                            <p className="mt-1 text-lg font-semibold text-[#1f140f]">
                              {branch.orders}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs uppercase tracking-[0.14em] text-[#a08d81]">
                              Spend
                            </p>
                            <p className="mt-1 text-lg font-semibold text-[#1f140f]">
                              €{Number(branch.spend || 0).toFixed(2)}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs uppercase tracking-[0.14em] text-[#a08d81]">
                              Status
                            </p>
                            <p className="mt-1 inline-flex rounded-full bg-[#f3e8dc] px-3 py-1 text-sm font-medium text-[#7a5a43]">
                              {branch.status}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <MiniBarList
              title="Branch Spend Trend"
              subtitle="Real spending distribution across active locations."
              items={branchOverview.map((branch) => ({
                id: branch.id,
                label: branch.name,
                subtext: `${branch.city || "Germany"} · ${branch.orders} orders`,
                value: branch.spend,
              }))}
              valueKey="value"
              labelKey="label"
              formatter={(value) => `€${Number(value || 0).toFixed(2)}`}
            />

            <div className="rounded-[30px] border border-[#eadccf] bg-white/90 p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#9a7b5f]">
                Recent Orders
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[#1f140f]">
                Latest activity
              </h2>

              <div className="mt-5 space-y-4">
                {recentOrders.length === 0 ? (
                  <div className="rounded-2xl border border-[#f0e3d7] bg-[#fffdfa] p-4 text-sm text-[#6b5b52]">
                    No recent orders found.
                  </div>
                ) : (
                  recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="rounded-2xl border border-[#f0e3d7] bg-[#fffdfa] p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold text-[#2d1c13]">
                            {order.location?.name || "Unknown Location"}
                          </p>
                          <p className="mt-1 text-sm text-[#8b7768]">
                            Qty: {order.totalQuantity}
                          </p>
                        </div>

                        <div className="sm:text-right">
                          <p className="text-lg font-semibold text-[#1f140f]">
                            €{Number(order.subtotalAmount || 0).toFixed(2)}
                          </p>
                          <p className="mt-1 text-sm text-[#8b7768]">
                            {new Date(order.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <MiniStatTrend
              title="Order Coverage"
              subtitle="How active the owner network is based on real submitted orders."
              value={stats.totalOrders ?? 0}
              max={Math.max((stats.locations ?? 1) * 5, 10)}
              footer={`${stats.locations ?? 0} active locations`}
            />

            <div className="rounded-[30px] border border-[#eadccf] bg-[linear-gradient(180deg,#fffaf5_0%,#f7eee6_100%)] p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#9a7b5f]">
                Purchasing Insight
              </p>
              <h3 className="mt-3 text-2xl font-semibold text-[#1f140f]">
                Live spend visibility
              </h3>
              <p className="mt-3 text-sm leading-7 text-[#6b5b52]">
                The dashboard now reflects real order activity from the
                database, making the demo far more convincing for owners.
              </p>

              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3">
                  <span className="text-sm text-[#6b5b52]">Total Orders</span>
                  <span className="text-lg font-semibold text-[#2d1c13]">
                    {stats.totalOrders ?? 0}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3">
                  <span className="text-sm text-[#6b5b52]">Total Spend</span>
                  <span className="text-lg font-semibold text-[#2d1c13]">
                    €{Number(stats.totalSpend || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <MiniBarList
              title="Supplier Order Volume"
              subtitle="Which suppliers currently receive the most operational activity."
              items={supplierOverview.map((supplier) => ({
                id: supplier.id,
                label: supplier.name,
                subtext: `${supplier.orders} orders · ${supplier.status}`,
                value: supplier.totalAmount,
              }))}
              valueKey="value"
              labelKey="label"
              formatter={(value) => `€${Number(value || 0).toFixed(2)}`}
            />

            <div className="rounded-[30px] border border-[#eadccf] bg-[linear-gradient(135deg,#2d1c13_0%,#4e342e_100%)] p-6 text-white shadow-[0_12px_30px_rgba(62,39,35,0.22)]">
              <p className="text-sm text-white/75">System Status</p>
              <p className="mt-2 text-2xl font-semibold">Operational</p>
              <p className="mt-3 text-sm leading-7 text-white/80">
                Central ordering, supplier coordination, and branch-level
                purchasing visibility are all aligned inside one premium private
                platform.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[30px] border border-[#eadccf] bg-white/90 p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#9a7b5f]">
                Executive Summary
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-[#1f140f]">
                One brand. One control center. Real data.
              </h3>
              <p className="mt-3 text-sm leading-7 text-[#6b5b52]">
                This dashboard now demonstrates real backend-connected
                multi-location visibility, making the demo much stronger for
                client presentation.
              </p>
            </div>

            <div className="rounded-2xl bg-[#f5ebe2] px-6 py-5 text-[#2d1c13] shadow-sm">
              <p className="text-sm text-[#7d6b60]">Live Control</p>
              <p className="mt-2 text-2xl font-semibold">Owner Ready</p>
            </div>
          </div>
        </div>
      </div>
    </OwnerLayout>
  );
}
