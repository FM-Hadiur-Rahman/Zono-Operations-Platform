import { useEffect, useState } from "react";
import api from "../../lib/api";
import { getToken } from "../../utils/storage";
import { useAuth } from "../../context/AuthContext";
import ManagerLayout from "../../components/layout/ManagerLayout";

export default function OrdersPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const token = getToken();

        const { data } = await api.get("/orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setOrders(data.orders || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  if (loading) {
    return (
      <ManagerLayout
        title="Orders"
        subtitle={
          user?.role === "owner"
            ? "Review all orders across the company and inspect supplier splits."
            : "Review your branch orders and supplier split details."
        }
      >
        <div className="rounded-[32px] border border-white/40 bg-white/75 p-8 text-[#6b5b52] shadow-[0_20px_80px_rgba(49,31,18,0.12)] backdrop-blur-xl">
          Loading orders...
        </div>
      </ManagerLayout>
    );
  }

  if (error) {
    return (
      <ManagerLayout
        title="Orders"
        subtitle={
          user?.role === "owner"
            ? "Review all orders across the company and inspect supplier splits."
            : "Review your branch orders and supplier split details."
        }
      >
        <div className="rounded-[32px] border border-red-200 bg-red-50 p-8 text-red-700 shadow-sm">
          {error}
        </div>
      </ManagerLayout>
    );
  }

  return (
    <ManagerLayout
      title="Orders"
      subtitle={
        user?.role === "owner"
          ? "Review all orders across the company and inspect supplier splits."
          : "Review your branch orders and supplier split details."
      }
    >
      <div className="rounded-[32px] border border-white/40 bg-white/75 p-6 shadow-[0_20px_80px_rgba(49,31,18,0.12)] backdrop-blur-xl sm:p-8">
        <div className="space-y-5">
          {orders.length === 0 ? (
            <div className="rounded-2xl border border-[#eadccf] bg-white/90 p-6 text-[#6b5b52] shadow-sm">
              No orders found yet.
            </div>
          ) : (
            orders.map((order) => {
              const isExpanded = expandedOrderId === order.id;

              return (
                <div
                  key={order.id}
                  className="rounded-[28px] border border-[#eadccf] bg-white/90 p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#9a7b5f]">
                        {order.orderNumber}
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold text-[#1f140f]">
                        {order.location?.name || "Unknown Location"}
                      </h2>
                      <p className="mt-2 text-sm text-[#6b5b52]">
                        {order.location?.city || "Germany"} · Qty{" "}
                        {order.totalQuantity}· €
                        {Number(order.subtotalAmount || 0).toFixed(2)}
                      </p>
                      <p className="mt-1 text-sm text-[#8b7768]">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-[#e8f5e9] px-3 py-1 text-sm font-medium text-[#2e7d32]">
                        {order.status}
                      </span>

                      <button
                        onClick={() =>
                          setExpandedOrderId(isExpanded ? null : order.id)
                        }
                        className="rounded-xl border border-[#d8c6b7] bg-white px-4 py-2 text-sm font-medium text-[#2d1c13] transition hover:bg-[#f8f2ec]"
                      >
                        {isExpanded ? "Hide Details" : "View Details"}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-5 border-t border-[#f0e3d7] pt-5">
                      <div className="grid gap-4 md:grid-cols-2">
                        {order.supplierOrders.length === 0 ? (
                          <div className="rounded-2xl border border-[#f0e3d7] bg-[#fffdfa] p-4 text-sm text-[#6b5b52]">
                            No supplier orders found for this order.
                          </div>
                        ) : (
                          order.supplierOrders.map((supplierOrder) => (
                            <div
                              key={supplierOrder.id}
                              className="rounded-2xl border border-[#f0e3d7] bg-[#fffdfa] p-4"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <p className="font-semibold text-[#2d1c13]">
                                    {supplierOrder.supplier?.name ||
                                      "Unknown Supplier"}
                                  </p>
                                  <p className="mt-1 text-sm text-[#8b7768]">
                                    {supplierOrder.supplierOrderNumber}
                                  </p>
                                  <p className="mt-1 text-sm text-[#8b7768]">
                                    Qty: {supplierOrder.totalQuantity}
                                  </p>
                                </div>

                                <div className="text-right">
                                  <p className="font-semibold text-[#1f140f]">
                                    €
                                    {Number(
                                      supplierOrder.subtotalAmount || 0,
                                    ).toFixed(2)}
                                  </p>
                                  <p className="mt-1 text-sm text-[#8b7768]">
                                    {supplierOrder.status}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </ManagerLayout>
  );
}
