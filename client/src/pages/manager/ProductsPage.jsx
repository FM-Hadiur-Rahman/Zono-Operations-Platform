import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/api";
import { getToken } from "../../utils/storage";
import { useBasket } from "../../context/BasketContext";
import ManagerLayout from "../../components/layout/ManagerLayout";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const { basket, addToBasket, updateQty } = useBasket();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const token = getToken();

        const { data } = await api.get("/products", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setProducts(data.products || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load products.");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase()),
  );

  const supplierCount = new Set(
    filteredProducts.map((item) => item.supplierId?.name),
  ).size;

  const categoryCount = new Set(filteredProducts.map((item) => item.category))
    .size;

  const basketItemCount = basket.reduce((sum, item) => sum + item.qty, 0);
  const basketTotal = basket.reduce(
    (sum, item) => sum + item.qty * item.price,
    0,
  );

  const hasBasketItems = basketItemCount > 0;

  const getBasketItem = (productId) => {
    return basket.find((item) => item._id === productId);
  };

  if (loading) {
    return (
      <ManagerLayout
        title="Supplier Products"
        subtitle="Browse approved branch items and prepare a mixed supplier basket."
      >
        <div className="rounded-[32px] border border-white/40 bg-white/75 p-8 text-[#6b5b52] shadow-[0_20px_80px_rgba(49,31,18,0.12)] backdrop-blur-xl">
          Loading products...
        </div>
      </ManagerLayout>
    );
  }

  if (error) {
    return (
      <ManagerLayout
        title="Supplier Products"
        subtitle="Browse approved branch items and prepare a mixed supplier basket."
      >
        <div className="rounded-[32px] border border-red-200 bg-red-50 p-8 text-red-700 shadow-sm">
          {error}
        </div>
      </ManagerLayout>
    );
  }

  return (
    <ManagerLayout
      title="Supplier Products"
      subtitle="Browse approved branch items and prepare a mixed supplier basket."
    >
      <div className="overflow-hidden rounded-[32px] border border-white/40 bg-white/75 shadow-[0_20px_80px_rgba(49,31,18,0.12)] backdrop-blur-xl">
        <div className="grid gap-6 px-6 py-6 sm:px-8 xl:grid-cols-[1.25fr_0.75fr]">
          <div className="pb-28 xl:pb-0">
            <div className="mb-5 rounded-3xl border border-[#eadccf] bg-white/90 p-4 shadow-sm">
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-[#e6d8ca] bg-white px-4 py-3 text-[#1f140f] outline-none focus:border-[#9a7b5f] focus:ring-4 focus:ring-[#c8a27c]/20"
              />
            </div>

            <div className="mb-5 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-[#eadccf] bg-[#fffdfa] p-5 shadow-sm">
                <p className="text-sm text-[#8b7768]">Available Products</p>
                <p className="mt-3 text-3xl font-semibold text-[#1f140f]">
                  {filteredProducts.length}
                </p>
              </div>

              <div className="rounded-3xl border border-[#eadccf] bg-[#fffdfa] p-5 shadow-sm">
                <p className="text-sm text-[#8b7768]">Suppliers</p>
                <p className="mt-3 text-3xl font-semibold text-[#1f140f]">
                  {supplierCount}
                </p>
              </div>

              <div className="rounded-3xl border border-[#eadccf] bg-[#fffdfa] p-5 shadow-sm">
                <p className="text-sm text-[#8b7768]">Categories</p>
                <p className="mt-3 text-3xl font-semibold text-[#1f140f]">
                  {categoryCount}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {filteredProducts.map((product) => {
                const basketItem = getBasketItem(product._id);

                return (
                  <div
                    key={product._id}
                    className="rounded-[28px] border border-[#eadccf] bg-white/90 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(49,31,18,0.08)]"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-semibold text-[#1f140f]">
                            {product.name}
                          </h2>
                          <span className="rounded-full bg-[#f3e8dc] px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-[#7a5a43]">
                            {product.category}
                          </span>
                        </div>

                        <p className="mt-3 text-sm leading-7 text-[#6b5b52]">
                          Supplied by{" "}
                          <span className="font-medium text-[#2d1c13]">
                            {product.supplierId?.name}
                          </span>
                          . {product.description}
                        </p>
                      </div>

                      <div className="sm:text-right">
                        <p className="text-sm text-[#8b7768]">Unit Price</p>
                        <p className="mt-1 text-2xl font-semibold text-[#1f140f]">
                          €{product.price.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full border border-[#e7d7c8] bg-[#fcf8f4] px-3 py-1 text-sm text-[#7d6b60]">
                          {product.unit}
                        </span>
                        <span className="rounded-full border border-[#e7d7c8] bg-[#fcf8f4] px-3 py-1 text-sm text-[#7d6b60]">
                          {product.supplierId?.code}
                        </span>
                      </div>

                      {!basketItem ? (
                        <button
                          onClick={() => addToBasket(product)}
                          className="rounded-2xl bg-[linear-gradient(135deg,#2d1c13_0%,#4e342e_100%)] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(62,39,35,0.22)] transition hover:scale-[1.01]"
                        >
                          Add to Basket
                        </button>
                      ) : (
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() =>
                              updateQty(product._id, basketItem.qty - 1)
                            }
                            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#d8c6b7] bg-white text-lg font-semibold text-[#2d1c13] transition hover:bg-[#f8f2ec]"
                          >
                            -
                          </button>

                          <div className="min-w-[72px] rounded-2xl bg-[#f3e8dc] px-4 py-3 text-center text-base font-semibold text-[#2d1c13]">
                            {basketItem.qty}
                          </div>

                          <button
                            onClick={() =>
                              updateQty(product._id, basketItem.qty + 1)
                            }
                            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#d8c6b7] bg-white text-lg font-semibold text-[#2d1c13] transition hover:bg-[#f8f2ec]"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-[28px] border border-[#d9c1a7] bg-[linear-gradient(180deg,#f7eadb_0%,#ead7c3_100%)] p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#8a6548]">
                Basket Status
              </p>
              <h3 className="mt-3 text-2xl font-semibold text-[#1f140f]">
                {basketItemCount} item{basketItemCount !== 1 ? "s" : ""}{" "}
                selected
              </h3>
              <p className="mt-3 text-sm leading-7 text-[#6b5b52]">
                Your basket updates instantly as products are added. This makes
                branch ordering faster and much clearer for managers.
              </p>

              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3">
                  <span className="text-sm text-[#6b5b52]">
                    Items in Basket
                  </span>
                  <span className="font-semibold text-[#2d1c13]">
                    {basketItemCount}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3">
                  <span className="text-sm text-[#6b5b52]">
                    Estimated Total
                  </span>
                  <span className="font-semibold text-[#2d1c13]">
                    €{basketTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="mt-5">
                {hasBasketItems ? (
                  <Link
                    to="/manager/basket"
                    className="block w-full rounded-2xl bg-[linear-gradient(135deg,#2d1c13_0%,#4e342e_100%)] px-5 py-4 text-center text-sm font-semibold text-white shadow-[0_10px_24px_rgba(62,39,35,0.22)] transition hover:scale-[1.01]"
                  >
                    Proceed to Basket →
                  </Link>
                ) : (
                  <div className="block w-full cursor-not-allowed rounded-2xl bg-[#d8d2cb] px-5 py-4 text-center text-sm font-semibold text-[#7e756d]">
                    Select items first
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[28px] border border-[#eadccf] bg-white/90 p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#9a7b5f]">
                Purchasing Tips
              </p>

              <div className="mt-4 space-y-4">
                <div className="rounded-2xl border border-[#f0e3d7] bg-[#fffdfa] p-4">
                  <p className="font-semibold text-[#2d1c13]">
                    Compare by supplier
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[#6b5b52]">
                    Keep product selection centralized while maintaining clean
                    supplier separation.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#f0e3d7] bg-[#fffdfa] p-4">
                  <p className="font-semibold text-[#2d1c13]">
                    Faster branch ordering
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[#6b5b52]">
                    Reduce back-and-forth by preparing all daily items in a
                    single session.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {hasBasketItems ? (
        <div className="fixed bottom-4 left-4 right-4 z-40 xl:hidden">
          <div className="mx-auto flex max-w-6xl items-center justify-between rounded-[24px] border border-[#d9c1a7] bg-white/95 px-4 py-4 shadow-[0_18px_40px_rgba(49,31,18,0.18)] backdrop-blur-xl">
            <div>
              <p className="text-sm text-[#6b5b52]">
                {basketItemCount} item{basketItemCount !== 1 ? "s" : ""}
              </p>
              <p className="font-semibold text-[#1f140f]">
                €{basketTotal.toFixed(2)}
              </p>
            </div>

            <Link
              to="/manager/basket"
              className="rounded-xl bg-[linear-gradient(135deg,#2d1c13_0%,#4e342e_100%)] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(62,39,35,0.22)]"
            >
              Continue →
            </Link>
          </div>
        </div>
      ) : null}
    </ManagerLayout>
  );
}
