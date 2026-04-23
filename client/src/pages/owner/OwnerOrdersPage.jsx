import { useEffect, useState } from "react";
import api from "../../lib/api";
import { getToken } from "../../utils/storage";
import { useAuth } from "../../context/AuthContext";
import OwnerLayout from "../../components/layout/OwnerLayout";
import MiniBarList from "../../components/charts/MiniBarList";

export default function OwnerOrdersPage() {
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
        setError(err.response?.data?.message || "Failed to load owner orders.");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const totalSpend = orders.reduce(
    (sum, order) => sum + (order.subtotalAmount || 0),
    0,
  );
  const totalQuantity = orders.reduce(
    (sum, order) => sum + (order.totalQuantity || 0),
    0,
  );
  const totalSupplierOrders = orders.reduce(
    (sum, order) => sum + (order.supplierOrders?.length || 0),
    0,
  );

  if (loading) {
    return (
      <OwnerLayout
        title="Owner Orders"
        subtitle={`Welcome back, ${user?.name || "Owner"}. Review all company orders and inspect supplier split details.`}
      >
        <div className="rounded-[32px] border border-white/40 bg-white/75 p-8 text-[#6b5b52] shadow-[0_20px_80px_rgba(49,31,18,0.12)] backdrop-blur-xl">
          Loading orders...
        </div>
      </OwnerLayout>
    );
  }

  if (error) {
    return (
      <OwnerLayout
        title="Owner Orders"
        subtitle={`Welcome back, ${user?.name || "Owner"}. Review all company orders and inspect supplier split details.`}
      >
        <div className="rounded-[32px] border border-red-200 bg-red-50 p-8 text-red-700 shadow-sm">
          {error}
        </div>
      </OwnerLayout>
    );
  }

  return (
    <OwnerLayout
      title="Owner Orders"
      subtitle={`Welcome back, ${user?.name || "Owner"}. Review all company orders and inspect supplier split details.`}
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[28px] border border-[#eadccf] bg-gradient-to-br from-[#f7eadb] to-[#eddac7] p-5 shadow-sm">
            <p className="text-sm text-[#8b7768]">Orders</p>
            <p className="mt-3 text-3xl font-semibold text-[#1f140f]">
              {orders.length}
            </p>
          </div>

          <div className="rounded-[28px] border border-[#eadccf] bg-gradient-to-br from-[#f8efe6] to-[#efe1d2] p-5 shadow-sm">
            <p className="text-sm text-[#8b7768]">Supplier Orders</p>
            <p className="mt-3 text-3xl font-semibold text-[#1f140f]">
              {totalSupplierOrders}
            </p>
          </div>

          <div className="rounded-[28px] border border-[#eadccf] bg-gradient-to-br from-[#f7eadb] to-[#ead7c3] p-5 shadow-sm">
            <p className="text-sm text-[#8b7768]">Total Quantity</p>
            <p className="mt-3 text-3xl font-semibold text-[#1f140f]">
              {totalQuantity}
            </p>
          </div>

          <div className="rounded-[28px] border border-[#eadccf] bg-gradient-to-br from-[#f4e3d3] to-[#e7cfb9] p-5 shadow-sm">
            <p className="text-sm text-[#8b7768]">Total Spend</p>
            <p className="mt-3 text-3xl font-semibold text-[#1f140f]">
              €{Number(totalSpend || 0).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[32px] border border-white/40 bg-white/75 p-6 shadow-[0_20px_80px_rgba(49,31,18,0.12)] backdrop-blur-xl sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#9a7b5f]">
              Order History
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[#1f140f]">
              Full company order list
            </h2>

            <div className="mt-5 space-y-5">
              {orders.length === 0 ? (
                <div className="rounded-2xl border border-[#f0e3d7] bg-[#fffdfa] p-4 text-sm text-[#6b5b52]">
                  No orders found.
                </div>
              ) : (
                orders.map((order) => {
                  const isExpanded = expandedOrderId === order.id;

                  return (
                    <div
                      key={order.id}
                      className="rounded-[24px] border border-[#f0e3d7] bg-[#fffdfa] p-5"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#9a7b5f]">
                            {order.orderNumber}
                          </p>
                          <h3 className="mt-2 text-xl font-semibold text-[#2d1c13]">
                            {order.location?.name || "Unknown Location"}
                          </h3>
                          <p className="mt-1 text-sm text-[#8b7768]">
                            {order.location?.city || "Germany"} · Qty{" "}
                            {order.totalQuantity}
                          </p>
                          <p className="mt-1 text-sm text-[#8b7768]">
                            Created by:{" "}
                            {order.createdBy?.name || "Unknown User"}
                          </p>
                          <p className="mt-1 text-sm text-[#8b7768]">
                            {new Date(order.createdAt).toLocaleString()}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <div className="text-right">
                            <p className="text-lg font-semibold text-[#1f140f]">
                              €{Number(order.subtotalAmount || 0).toFixed(2)}
                            </p>
                            <p className="mt-1 text-sm text-[#8b7768]">
                              {order.supplierOrders?.length || 0} supplier
                              orders
                            </p>
                          </div>

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
                        <div className="mt-5 border-t border-[#f2e6db] pt-5">
                          <div className="grid gap-4 md:grid-cols-2">
                            {order.supplierOrders?.length ? (
                              order.supplierOrders.map((supplierOrder) => (
                                <div
                                  key={supplierOrder.id}
                                  className="rounded-2xl border border-[#f0e3d7] bg-[#fcf8f4] p-4"
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
                            ) : (
                              <div className="rounded-2xl border border-[#f0e3d7] bg-[#fcf8f4] p-4 text-sm text-[#6b5b52]">
                                No supplier orders found for this order.
                              </div>
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

          <MiniBarList
            title="Location Order Value"
            subtitle="Compare total order value by location from real order history."
            items={Object.values(
              orders.reduce((acc, order) => {
                const key =
                  order.location?.id || order.location?.name || "unknown";
                if (!acc[key]) {
                  acc[key] = {
                    id: key,
                    label: order.location?.name || "Unknown Location",
                    subtext: `${order.location?.city || "Germany"}`,
                    value: 0,
                  };
                }
                acc[key].value += order.subtotalAmount || 0;
                return acc;
              }, {}),
            )}
            valueKey="value"
            labelKey="label"
            formatter={(value) => `€${Number(value || 0).toFixed(2)}`}
          />
        </div>
      </div>
    </OwnerLayout>
  );
}
