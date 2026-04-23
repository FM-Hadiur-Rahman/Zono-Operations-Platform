import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/api";
import { getToken } from "../../utils/storage";
import MiniBarList from "../../components/charts/MiniBarList";
import MiniStatTrend from "../../components/charts/MiniStatTrend";
import OrdersTrendChart from "../../components/charts/OrdersTrendChart";
import SpendTrendChart from "../../components/charts/SpendTrendChart";
import ManagerLayout from "../../components/layout/ManagerLayout";

export default function ManagerDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const token = getToken();

        const { data } = await api.get("/dashboard/manager", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setDashboard(data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load manager dashboard.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const stats = dashboard?.stats || {};
  const supplierOverview = dashboard?.supplierOverview || [];
  const recentOrders = dashboard?.recentOrders || [];
  const monthlyTrend = dashboard?.monthlyTrend || [];

  const quickStats = [
    {
      label: "Orders This Week",
      value: stats.ordersThisWeek ?? 0,
      tone: "from-[#f7eadb] to-[#eddac7]",
    },
    {
      label: "Suppliers",
      value: stats.suppliers ?? 0,
      tone: "from-[#f8efe6] to-[#efe1d2]",
    },
    {
      label: "Total Spend",
      value: `€${Number(stats.totalSpend || 0).toFixed(2)}`,
      tone: "from-[#f4e3d3] to-[#e7cfb9]",
    },
  ];

  const quickActions = [
    {
      title: "Start New Order",
      description:
        "Browse supplier products and build a fresh branch basket for today's ordering cycle.",
      to: "/manager/products",
      primary: true,
    },
    {
      title: "Open Basket",
      description:
        "Review selected supplier items, quantities, and totals before sending split orders.",
      to: "/manager/basket",
      primary: false,
    },
    {
      title: "Order History",
      description:
        "Inspect branch order history, supplier split details, and previous purchasing activity.",
      to: "/manager/orders",
      primary: false,
    },
  ];

  if (loading) {
    return (
      <ManagerLayout
        title="Manager Dashboard"
        subtitle="Manage branch purchasing with real-time stats, supplier activity, and monthly order insights."
      >
        <div className="rounded-[32px] border border-white/40 bg-white/75 p-8 text-[#6b5b52] shadow-[0_20px_80px_rgba(49,31,18,0.12)] backdrop-blur-xl">
          Loading manager dashboard...
        </div>
      </ManagerLayout>
    );
  }

  if (error) {
    return (
      <ManagerLayout
        title="Manager Dashboard"
        subtitle="Manage branch purchasing with real-time stats, supplier activity, and monthly order insights."
      >
        <div className="rounded-[32px] border border-red-200 bg-red-50 p-8 text-red-700 shadow-sm">
          {error}
        </div>
      </ManagerLayout>
    );
  }

  return (
    <ManagerLayout
      title="Manager Dashboard"
      subtitle="Manage branch purchasing with real-time stats, supplier activity, and monthly order insights."
    >
      <div className="space-y-6">
        <div className="overflow-hidden rounded-[32px] border border-white/40 bg-white/75 shadow-[0_20px_80px_rgba(49,31,18,0.12)] backdrop-blur-xl">
          <div className="grid gap-6 px-6 py-6 sm:px-8 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                {quickStats.map((item) => (
                  <div
                    key={item.label}
                    className={`rounded-3xl border border-[#eadccf] bg-gradient-to-br ${item.tone} p-5 shadow-sm`}
                  >
                    <p className="text-sm text-[#8b7768]">{item.label}</p>
                    <p className="mt-3 text-3xl font-semibold text-[#1f140f]">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="grid gap-4">
                {quickActions.map((action) => (
                  <Link
                    key={action.title}
                    to={action.to}
                    className={`group rounded-[28px] border p-6 transition ${
                      action.primary
                        ? "border-[#4e342e] bg-[linear-gradient(135deg,#2d1c13_0%,#4e342e_100%)] text-white shadow-[0_15px_40px_rgba(62,39,35,0.25)]"
                        : "border-[#eadccf] bg-white/90 text-[#2d1c13] hover:bg-[#fbf6f1]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-semibold">
                          {action.title}
                        </h2>
                        <p
                          className={`mt-3 max-w-xl text-sm leading-7 ${
                            action.primary ? "text-white/80" : "text-[#6b5b52]"
                          }`}
                        >
                          {action.description}
                        </p>
                      </div>

                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-semibold ${
                          action.primary
                            ? "bg-white/10 text-white"
                            : "bg-[#f3e8dc] text-[#4e342e]"
                        }`}
                      >
                        →
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="rounded-[28px] border border-[#eadccf] bg-white/90 p-6 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#9a7b5f]">
                  Recent Orders
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-[#1f140f]">
                  Latest branch activity
                </h3>

                <div className="mt-4 space-y-4">
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
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-semibold text-[#2d1c13]">
                              Order #{String(order.id).slice(-6)}
                            </p>
                            <p className="mt-1 text-sm text-[#8b7768]">
                              Qty: {order.totalQuantity}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="font-semibold text-[#1f140f]">
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

              <MiniBarList
                title="Supplier Spend Distribution"
                subtitle="See which suppliers are receiving the most spend from this branch."
                items={supplierOverview.map((supplier) => ({
                  id: supplier.id,
                  label: supplier.name,
                  subtext: `${supplier.orders} orders`,
                  value: supplier.totalAmount,
                }))}
                valueKey="value"
                labelKey="label"
                formatter={(value) => `€${Number(value || 0).toFixed(2)}`}
              />
            </div>

            <div className="space-y-4">
              <MiniStatTrend
                title="Weekly Order Pace"
                subtitle="Real branch ordering pace based on submitted orders this week."
                value={stats.ordersThisWeek ?? 0}
                max={Math.max(stats.totalOrders ?? 1, 5)}
                footer={`${stats.totalOrders ?? 0} total orders`}
              />

              <div className="rounded-[28px] border border-[#eadccf] bg-[linear-gradient(180deg,#fffaf5_0%,#f7eee6_100%)] p-6 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#9a7b5f]">
                  Branch Status
                </p>

                <div className="mt-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#6b5b52]">
                      Ordering Window
                    </span>
                    <span className="rounded-full bg-[#e8f5e9] px-3 py-1 text-sm font-medium text-[#2e7d32]">
                      Open
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#6b5b52]">Location</span>
                    <span className="text-sm font-medium text-[#2d1c13]">
                      {stats.locationName || "Branch"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#6b5b52]">
                      Total Quantity Ordered
                    </span>
                    <span className="text-sm font-medium text-[#2d1c13]">
                      {stats.totalQuantity ?? 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-[#eadccf] bg-white/90 p-6 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#9a7b5f]">
                  Supplier Activity
                </p>

                <div className="mt-4 space-y-4">
                  {supplierOverview.length === 0 ? (
                    <div className="rounded-2xl border border-[#f0e3d7] bg-[#fffdfa] p-4 text-sm text-[#6b5b52]">
                      No supplier activity yet.
                    </div>
                  ) : (
                    supplierOverview.slice(0, 4).map((supplier) => (
                      <div
                        key={supplier.id}
                        className="rounded-2xl border border-[#f0e3d7] bg-[#fffdfa] p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold text-[#2d1c13]">
                              {supplier.name}
                            </p>
                            <p className="mt-1 text-sm text-[#8b7768]">
                              Orders: {supplier.orders}
                            </p>
                          </div>

                          <span className="rounded-full bg-[#e8f5e9] px-3 py-1 text-sm font-medium text-[#2e7d32]">
                            {supplier.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <MiniStatTrend
                title="Quantity Ordered"
                subtitle="Live total quantity ordered by this branch."
                value={stats.totalQuantity ?? 0}
                max={Math.max((stats.totalOrders ?? 1) * 10, 20)}
                footer={`${stats.suppliers ?? 0} active suppliers`}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <OrdersTrendChart
            data={monthlyTrend}
            title="Orders Over Time"
            subtitle="Interactive monthly order activity for this branch."
          />

          <SpendTrendChart
            data={monthlyTrend}
            title="Spend Trend"
            subtitle="Interactive monthly purchasing spend for this branch."
          />
        </div>
      </div>
    </ManagerLayout>
  );
}
