import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import { getToken } from "../../utils/storage";
import { useBasket } from "../../context/BasketContext";
import ManagerLayout from "../../components/layout/ManagerLayout";

export default function BasketPage() {
  const navigate = useNavigate();
  const { basket, updateQty, removeFromBasket, clearBasket } = useBasket();

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const total = basket.reduce((sum, item) => sum + item.qty * item.price, 0);

  const supplierGroups = basket.reduce((acc, item) => {
    const supplierName = item.supplierId?.name || "Unknown Supplier";
    if (!acc[supplierName]) acc[supplierName] = [];
    acc[supplierName].push(item);
    return acc;
  }, {});

  const supplierCount = Object.keys(supplierGroups).length;

  const handleSubmitOrder = async () => {
    try {
      setSubmitting(true);
      setSubmitError("");

      const token = getToken();

      const payload = {
        items: basket.map((item) => ({
          productId: item._id,
          quantity: item.qty,
        })),
        notes: "Submitted from manager basket",
      };

      const { data } = await api.post("/orders", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      clearBasket();

      navigate("/manager/order-success", {
        state: {
          orderData: data,
        },
      });
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Failed to submit order.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ManagerLayout
      title="Basket Review"
      subtitle="Review selected items before the system creates supplier-specific orders."
    >
      <div className="overflow-hidden rounded-[32px] border border-white/40 bg-white/75 shadow-[0_20px_80px_rgba(49,31,18,0.12)] backdrop-blur-xl">
        <div className="grid gap-6 px-6 py-6 sm:px-8 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-[#eadccf] bg-[#fffdfa] p-5 shadow-sm">
                <p className="text-sm text-[#8b7768]">Basket Items</p>
                <p className="mt-3 text-3xl font-semibold text-[#1f140f]">
                  {basket.length}
                </p>
              </div>

              <div className="rounded-3xl border border-[#eadccf] bg-[#fffdfa] p-5 shadow-sm">
                <p className="text-sm text-[#8b7768]">Suppliers</p>
                <p className="mt-3 text-3xl font-semibold text-[#1f140f]">
                  {supplierCount}
                </p>
              </div>

              <div className="rounded-3xl border border-[#eadccf] bg-[#fffdfa] p-5 shadow-sm">
                <p className="text-sm text-[#8b7768]">Basket Value</p>
                <p className="mt-3 text-3xl font-semibold text-[#1f140f]">
                  €{total.toFixed(2)}
                </p>
              </div>
            </div>

            {basket.length === 0 ? (
              <div className="rounded-[30px] border border-[#eadccf] bg-white/90 p-8 text-center shadow-sm">
                <h2 className="text-2xl font-semibold text-[#1f140f]">
                  Your basket is empty
                </h2>
                <p className="mt-3 text-sm leading-7 text-[#6b5b52]">
                  Add products from the catalog to prepare supplier orders.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {Object.entries(supplierGroups).map(([supplier, items]) => {
                  const supplierTotal = items.reduce(
                    (sum, item) => sum + item.qty * item.price,
                    0,
                  );

                  return (
                    <div
                      key={supplier}
                      className="rounded-[30px] border border-[#eadccf] bg-white/90 p-5 shadow-sm"
                    >
                      <div className="flex flex-col gap-3 border-b border-[#f0e3d7] pb-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#9a7b5f]">
                            Supplier Group
                          </p>
                          <h2 className="mt-2 text-2xl font-semibold text-[#1f140f]">
                            {supplier}
                          </h2>
                        </div>

                        <div className="rounded-2xl bg-[#f7eee6] px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.14em] text-[#9a7b5f]">
                            Subtotal
                          </p>
                          <p className="mt-1 text-lg font-semibold text-[#2d1c13]">
                            €{supplierTotal.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-4">
                        {items.map((item) => (
                          <div
                            key={item._id}
                            className="rounded-2xl border border-[#f0e3d7] bg-[#fffdfa] p-4"
                          >
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-[#2d1c13]">
                                  {item.name}
                                </h3>
                                <p className="mt-2 text-sm leading-7 text-[#6b5b52]">
                                  Ready for branch purchasing and structured
                                  supplier dispatch.
                                </p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                  <span className="rounded-full border border-[#e7d7c8] bg-[#fcf8f4] px-3 py-1 text-sm text-[#7d6b60]">
                                    {item.category}
                                  </span>
                                  <span className="rounded-full border border-[#e7d7c8] bg-[#fcf8f4] px-3 py-1 text-sm text-[#7d6b60]">
                                    {item.unit}
                                  </span>
                                </div>
                              </div>

                              <div className="sm:text-right">
                                <p className="text-sm text-[#8b7768]">
                                  Unit Price
                                </p>
                                <p className="mt-1 text-lg font-semibold text-[#1f140f]">
                                  €{item.price.toFixed(2)}
                                </p>
                              </div>
                            </div>

                            <div className="mt-4 flex flex-col gap-3 rounded-2xl bg-[#fcf8f4] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    updateQty(item._id, item.qty - 1)
                                  }
                                  className="h-9 w-9 rounded-xl border border-[#d8c6b7] bg-white text-[#2d1c13]"
                                >
                                  -
                                </button>

                                <span className="min-w-[32px] text-center font-semibold text-[#1f140f]">
                                  {item.qty}
                                </span>

                                <button
                                  onClick={() =>
                                    updateQty(item._id, item.qty + 1)
                                  }
                                  className="h-9 w-9 rounded-xl border border-[#d8c6b7] bg-white text-[#2d1c13]"
                                >
                                  +
                                </button>
                              </div>

                              <div className="flex items-center justify-between gap-4">
                                <span className="text-sm text-[#6b5b52]">
                                  Line Total
                                </span>
                                <span className="text-lg font-semibold text-[#1f140f]">
                                  €{(item.qty * item.price).toFixed(2)}
                                </span>
                                <button
                                  onClick={() => removeFromBasket(item._id)}
                                  className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-5">
            <div className="rounded-[30px] border border-[#eadccf] bg-[linear-gradient(180deg,#fffaf5_0%,#f7eee6_100%)] p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#9a7b5f]">
                Smart Basket Summary
              </p>
              <h3 className="mt-3 text-2xl font-semibold text-[#1f140f]">
                Ready for automatic split orders
              </h3>
              <p className="mt-3 text-sm leading-7 text-[#6b5b52]">
                The system detects supplier boundaries automatically and can
                prepare separate purchase orders while preserving one simple
                manager workflow.
              </p>

              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3">
                  <span className="text-sm text-[#6b5b52]">Items</span>
                  <span className="font-semibold text-[#2d1c13]">
                    {basket.length}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3">
                  <span className="text-sm text-[#6b5b52]">Suppliers</span>
                  <span className="font-semibold text-[#2d1c13]">
                    {supplierCount}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3">
                  <span className="text-sm text-[#6b5b52]">Total</span>
                  <span className="font-semibold text-[#2d1c13]">
                    €{total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-[30px] border border-[#eadccf] bg-white/90 p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#9a7b5f]">
                What Happens Next
              </p>

              <div className="mt-4 space-y-4">
                <div className="rounded-2xl border border-[#f0e3d7] bg-[#fffdfa] p-4">
                  <p className="font-semibold text-[#2d1c13]">
                    1. Basket is validated
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[#6b5b52]">
                    All selected branch items are checked and grouped by
                    supplier.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#f0e3d7] bg-[#fffdfa] p-4">
                  <p className="font-semibold text-[#2d1c13]">
                    2. Orders are split automatically
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[#6b5b52]">
                    Each supplier receives a clean, structured order with only
                    their own items.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#f0e3d7] bg-[#fffdfa] p-4">
                  <p className="font-semibold text-[#2d1c13]">
                    3. Branch keeps one simple workflow
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[#6b5b52]">
                    Managers order once, while the backend handles supplier
                    distribution.
                  </p>
                </div>
              </div>
            </div>

            {submitError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
                {submitError}
              </div>
            ) : null}

            {basket.length > 0 && (
              <>
                <button
                  onClick={clearBasket}
                  disabled={submitting}
                  className="w-full rounded-[24px] border border-red-200 bg-red-50 px-6 py-4 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-60"
                >
                  Clear Basket
                </button>

                <button
                  onClick={handleSubmitOrder}
                  disabled={submitting}
                  className="w-full rounded-[28px] bg-[linear-gradient(135deg,#2d1c13_0%,#4e342e_100%)] px-6 py-5 text-left text-white shadow-[0_16px_36px_rgba(62,39,35,0.22)] transition hover:scale-[1.01] disabled:opacity-70"
                >
                  <p className="text-sm text-white/75">Confirm Basket</p>
                  <p className="mt-2 text-2xl font-semibold">
                    {submitting ? "Submitting Order..." : "Place Order"}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-white/80">
                    Proceed to the supplier order processing step.
                  </p>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </ManagerLayout>
  );
}
