import { useEffect, useState } from "react";
import api from "../../lib/api";
import { getToken } from "../../utils/storage";
import OwnerLayout from "../../components/layout/OwnerLayout";

const initialForm = {
  supplierId: "",
  name: "",
  sku: "",
  category: "",
  description: "",
  unit: "",
  price: "",
  currency: "EUR",
};

export default function OwnerProductsPage() {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      const [productsRes, suppliersRes] = await Promise.all([
        api.get("/owner/catalog/products", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get("/owner/catalog/suppliers", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setProducts(productsRes.data.products || []);
      setSuppliers(suppliersRes.data.suppliers || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setForm({
      supplierId: product.supplierId?._id || "",
      name: product.name || "",
      sku: product.sku || "",
      category: product.category || "",
      description: product.description || "",
      unit: product.unit || "",
      price: product.price ?? "",
      currency: product.currency || "EUR",
    });
    setError("");
    setSuccess("");
  };

  const resetForm = () => {
    setEditingId("");
    setForm(initialForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const token = getToken();

      const payload = {
        ...form,
        price: Number(form.price || 0),
      };

      if (editingId) {
        await api.put(`/owner/catalog/products/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess("Product updated successfully.");
      } else {
        await api.post("/owner/catalog/products", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess("Product created successfully.");
      }

      resetForm();
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <OwnerLayout
      title="Products"
      subtitle="Create and manage supplier-linked products for branch ordering."
    >
      <div className="space-y-6">
        <div className="rounded-[32px] border border-white/40 bg-white/75 p-6 shadow-[0_20px_80px_rgba(49,31,18,0.12)] backdrop-blur-xl sm:p-8">
          <h2 className="text-2xl font-semibold text-[#1f140f]">
            {editingId ? "Edit Product" : "Create Product"}
          </h2>

          <form
            onSubmit={handleSubmit}
            className="mt-6 grid gap-4 md:grid-cols-2"
          >
            <select
              name="supplierId"
              value={form.supplierId}
              onChange={handleChange}
              className="rounded-2xl border border-[#e6d8ca] bg-white px-5 py-4 text-[#1f140f]"
              required
            >
              <option value="">Select supplier</option>
              {suppliers.map((supplier) => (
                <option key={supplier._id} value={supplier._id}>
                  {supplier.name} ({supplier.code})
                </option>
              ))}
            </select>

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Product name"
              className="rounded-2xl border border-[#e6d8ca] bg-white px-5 py-4"
              required
            />
            <input
              type="text"
              name="sku"
              value={form.sku}
              onChange={handleChange}
              placeholder="SKU"
              className="rounded-2xl border border-[#e6d8ca] bg-white px-5 py-4"
              required
            />
            <input
              type="text"
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="Category"
              className="rounded-2xl border border-[#e6d8ca] bg-white px-5 py-4"
              required
            />
            <input
              type="text"
              name="unit"
              value={form.unit}
              onChange={handleChange}
              placeholder="Unit (pcs, pack, kg...)"
              className="rounded-2xl border border-[#e6d8ca] bg-white px-5 py-4"
              required
            />
            <input
              type="number"
              step="0.01"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="Price"
              className="rounded-2xl border border-[#e6d8ca] bg-white px-5 py-4"
              required
            />
            <input
              type="text"
              name="currency"
              value={form.currency}
              onChange={handleChange}
              placeholder="Currency"
              className="rounded-2xl border border-[#e6d8ca] bg-white px-5 py-4"
            />
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Product description"
              rows={4}
              className="rounded-2xl border border-[#e6d8ca] bg-white px-5 py-4 md:col-span-2"
            />

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 md:col-span-2">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 md:col-span-2">
                {success}
              </div>
            ) : null}

            <div className="flex gap-3 md:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-2xl bg-[linear-gradient(135deg,#2d1c13_0%,#4e342e_100%)] px-6 py-4 font-semibold text-white"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Product"
                    : "Create Product"}
              </button>

              {editingId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-2xl border border-[#d8c6b7] bg-white px-6 py-4 font-semibold text-[#2d1c13]"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </div>

        <div className="rounded-[32px] border border-white/40 bg-white/75 p-6 shadow-[0_20px_80px_rgba(49,31,18,0.12)] backdrop-blur-xl sm:p-8">
          <h2 className="text-2xl font-semibold text-[#1f140f]">
            Company Products
          </h2>

          <div className="mt-6 space-y-4">
            {loading ? (
              <div className="rounded-2xl border border-[#eadccf] bg-white/90 p-6 text-[#6b5b52]">
                Loading products...
              </div>
            ) : products.length === 0 ? (
              <div className="rounded-2xl border border-[#eadccf] bg-white/90 p-6 text-[#6b5b52]">
                No products created yet.
              </div>
            ) : (
              products.map((product) => (
                <div
                  key={product._id}
                  className="rounded-[28px] border border-[#eadccf] bg-white/90 p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#9a7b5f]">
                        {product.sku}
                      </p>
                      <h3 className="mt-2 text-2xl font-semibold text-[#1f140f]">
                        {product.name}
                      </h3>
                      <p className="mt-2 text-sm text-[#6b5b52]">
                        {product.category} · {product.unit} · €
                        {Number(product.price || 0).toFixed(2)}
                      </p>
                      <p className="mt-1 text-sm text-[#8b7768]">
                        Supplier: {product.supplierId?.name || "—"}
                      </p>
                    </div>

                    <button
                      onClick={() => handleEdit(product)}
                      className="rounded-xl border border-[#d8c6b7] bg-white px-4 py-2 text-sm font-medium text-[#2d1c13]"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </OwnerLayout>
  );
}
