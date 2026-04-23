import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import SupplierEmailPreview from "../../components/common/SupplierEmailPreview";
import ManagerLayout from "../../components/layout/ManagerLayout";

export default function OrderSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedSupplierOrder, setSelectedSupplierOrder] = useState(null);

  const orderData = location.state?.orderData;

  useEffect(() => {
    if (!orderData) {
      navigate("/manager", { replace: true });
    }
  }, [orderData, navigate]);

  if (!orderData) return null;

  const { order, supplierOrders, summary } = orderData;

  return (
    <ManagerLayout
      title="Order Success"
      subtitle="Your basket has been submitted and automatically split into supplier orders."
    >
      <div className="overflow-hidden rounded-[32px] border border-white/40 bg-white/75 shadow-[0_20px_80px_rgba(49,31,18,0.12)] backdrop-blur-xl">
        <div className="grid gap-6 px-6 py-6 sm:px-8 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-5">
            <div className="rounded-[30px] border border-[#eadccf] bg-[linear-gradient(180deg,#fffaf5_0%,#f7eee6_100%)] p-6 shadow-sm">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e8f5e9] text-3xl shadow-sm">
                ✅
              </div>

              <h2 className="mt-5 text-2xl font-semibold text-[#1f140f]">
                Smart split completed
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#6b5b52]">
                The system grouped one manager basket into multiple
                supplier-ready orders. This is the core operational value of the
                platform.
              </p>
            </div>

            <div className="rounded-[30px] border border-[#eadccf] bg-white/90 p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#9a7b5f]">
                Main Order
              </p>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-2xl bg-[#fcf8f4] px-4 py-3">
                  <span className="text-sm text-[#6b5b52]">Order Number</span>
                  <span className="font-semibold text-[#2d1c13]">
                    {order.orderNumber}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-[#fcf8f4] px-4 py-3">
                  <span className="text-sm text-[#6b5b52]">Location</span>
                  <span className="font-semibold text-[#2d1c13]">
                    {order.location.name}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-[#fcf8f4] px-4 py-3">
                  <span className="text-sm text-[#6b5b52]">
                    Total Suppliers
                  </span>
                  <span className="font-semibold text-[#2d1c13]">
                    {summary.totalSuppliers}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-[#fcf8f4] px-4 py-3">
                  <span className="text-sm text-[#6b5b52]">Total Quantity</span>
                  <span className="font-semibold text-[#2d1c13]">
                    {summary.totalQuantity}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-[#fcf8f4] px-4 py-3">
                  <span className="text-sm text-[#6b5b52]">Subtotal</span>
                  <span className="font-semibold text-[#2d1c13]">
                    €{Number(summary.subtotalAmount || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-[30px] border border-[#eadccf] bg-[linear-gradient(135deg,#2d1c13_0%,#4e342e_100%)] p-6 text-white shadow-[0_16px_36px_rgba(62,39,35,0.22)]">
              <p className="text-sm text-white/75">Operational Result</p>
              <h3 className="mt-2 text-2xl font-semibold">
                One basket. Multiple supplier orders.
              </h3>
              <p className="mt-3 text-sm leading-7 text-white/80">
                Managers keep one clean workflow while the backend handles
                supplier separation automatically.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-[30px] border border-[#eadccf] bg-white/90 p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#9a7b5f]">
                Supplier Order Preview
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[#1f140f]">
                What each supplier receives
              </h2>

              <div className="mt-5 space-y-5">
                {supplierOrders.map((supplierOrder) => (
                  <div
                    key={supplierOrder.id}
                    className="rounded-[24px] border border-[#f0e3d7] bg-[#fffdfa] p-5"
                  >
                    <div className="flex flex-col gap-4 border-b border-[#f2e6db] pb-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-lg font-semibold text-[#2d1c13]">
                            {supplierOrder.supplier.name}
                          </p>
                          <p className="mt-1 text-sm text-[#8b7768]">
                            Supplier Order: {supplierOrder.supplierOrderNumber}
                          </p>
                          <p className="mt-1 text-sm text-[#8b7768]">
                            Delivery Method:{" "}
                            {supplierOrder.supplier.orderMethod}
                          </p>
                          <p className="mt-1 text-sm text-[#8b7768]">
                            Contact: {supplierOrder.supplier.email}
                          </p>
                        </div>

                        <span className="rounded-full bg-[#e8f5e9] px-3 py-1 text-sm font-medium text-[#2e7d32]">
                          {supplierOrder.status}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      {supplierOrder.items?.length ? (
                        supplierOrder.items.map((item, index) => (
                          <div
                            key={`${supplierOrder.id}-${index}`}
                            className="flex items-center justify-between rounded-2xl bg-[#fcf8f4] px-4 py-3"
                          >
                            <div>
                              <p className="font-medium text-[#2d1c13]">
                                {item.name}
                              </p>
                              <p className="mt-1 text-sm text-[#8b7768]">
                                SKU: {item.sku} · Unit: {item.unit}
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="font-semibold text-[#1f140f]">
                                × {item.quantity}
                              </p>
                              <p className="mt-1 text-sm text-[#8b7768]">
                                €{Number(item.lineTotal || 0).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-2xl bg-[#fcf8f4] px-4 py-3 text-sm text-[#6b5b52]">
                          Item preview will appear here once supplier order
                          items are included in the response.
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#f3e8dc] px-4 py-3">
                      <span className="text-sm text-[#6b5b52]">
                        Supplier Subtotal
                      </span>
                      <span className="text-lg font-semibold text-[#2d1c13]">
                        €{Number(supplierOrder.subtotalAmount || 0).toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedSupplierOrder(supplierOrder)}
                      className="mt-4 rounded-xl border border-[#d8c6b7] bg-white px-4 py-2 text-sm font-medium text-[#2d1c13] transition hover:bg-[#f8f2ec]"
                    >
                      Preview Email
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <Link
              to="/manager"
              className="block rounded-[28px] border border-[#d8c6b7] bg-white/90 px-6 py-5 text-[#2d1c13] shadow-sm transition hover:bg-[#f8f2ec]"
            >
              <p className="text-sm text-[#7d6b60]">Continue</p>
              <p className="mt-2 text-2xl font-semibold">Back to Dashboard</p>
              <p className="mt-2 text-sm leading-7 text-[#6b5b52]">
                Return to the manager overview and start a new order cycle.
              </p>
            </Link>
          </div>
        </div>
      </div>

      <SupplierEmailPreview
        isOpen={Boolean(selectedSupplierOrder)}
        onClose={() => setSelectedSupplierOrder(null)}
        supplierOrder={selectedSupplierOrder}
        mainOrder={order}
        location={order.location}
      />
    </ManagerLayout>
  );
}
