import { useEffect, useState } from "react";
import api from "../../lib/api";
import { getToken } from "../../utils/storage";
import { useAuth } from "../../context/AuthContext";
import OwnerLayout from "../../components/layout/OwnerLayout";

const initialForm = {
  name: "",
  code: "",
  email: "",
  orderMethod: "email",
  deliveryDays: "",
  minimumOrderAmount: "",
};

export default function OwnerSuppliersPage() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState(initialForm);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      const { data } = await api.get("/owner/catalog/suppliers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuppliers(data.suppliers || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load suppliers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const resetForm = () => {
    setEditingId("");
    setForm(initialForm);
  };

  const handleEdit = (supplier) => {
    setEditingId(supplier._id);
    setError("");
    setSuccess("");

    setForm({
      name: supplier.name || "",
      code: supplier.code || "",
      email: supplier.email || "",
      orderMethod: supplier.orderMethod || "email",
      deliveryDays: (supplier.deliveryDays || []).join(", "),
      minimumOrderAmount: supplier.minimumOrderAmount ?? "",
    });
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
        minimumOrderAmount: Number(form.minimumOrderAmount || 0),
        deliveryDays: form.deliveryDays
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      };

      if (editingId) {
        await api.put(`/owner/catalog/suppliers/${editingId}`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSuccess("Supplier updated successfully.");
      } else {
        await api.post("/owner/catalog/suppliers", payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSuccess("Supplier created successfully.");
      }

      resetForm();
      await loadSuppliers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save supplier.");
    } finally {
      setSaving(false);
    }
  };

  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter((item) => item.isActive).length;
  const emailSuppliers = suppliers.filter(
    (item) => item.orderMethod === "email",
  ).length;
  const totalMinimumOrderValue = suppliers.reduce(
    (sum, item) => sum + Number(item.minimumOrderAmount || 0),
    0,
  );

  if (loading) {
    return (
      <OwnerLayout
        title="Owner Suppliers"
        subtitle={`Welcome back, ${user?.name || "Owner"}. Create and manage suppliers for your company purchasing workflow.`}
      >
        <div className="rounded-[32px] border border-white/40 bg-white/75 p-8 text-[#6b5b52] shadow-[0_20px_80px_rgba(49,31,18,0.12)] backdrop-blur-xl">
          Loading suppliers...
        </div>
      </OwnerLayout>
    );
  }

  return (
    <OwnerLayout
      title="Owner Suppliers"
      subtitle={`Welcome back, ${user?.name || "Owner"}. Create and manage suppliers for your company purchasing workflow.`}
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[28px] border border-[#eadccf] bg-gradient-to-br from-[#f7eadb] to-[#eddac7] p-5 shadow-sm">
            <p className="text-sm text-[#8b7768]">Total Suppliers</p>
            <p className="mt-3 text-3xl font-semibold text-[#1f140f]">
              {totalSuppliers}
            </p>
          </div>

          <div className="rounded-[28px] border border-[#eadccf] bg-gradient-to-br from-[#f8efe6] to-[#efe1d2] p-5 shadow-sm">
            <p className="text-sm text-[#8b7768]">Active Suppliers</p>
            <p className="mt-3 text-3xl font-semibold text-[#1f140f]">
              {activeSuppliers}
            </p>
          </div>

          <div className="rounded-[28px] border border-[#eadccf] bg-gradient-to-br from-[#f7eadb] to-[#ead7c3] p-5 shadow-sm">
            <p className="text-sm text-[#8b7768]">Email Ordering</p>
            <p className="mt-3 text-3xl font-semibold text-[#1f140f]">
              {emailSuppliers}
            </p>
          </div>

          <div className="rounded-[28px] border border-[#eadccf] bg-gradient-to-br from-[#f4e3d3] to-[#e7cfb9] p-5 shadow-sm">
            <p className="text-sm text-[#8b7768]">Min. Order Total</p>
            <p className="mt-3 text-3xl font-semibold text-[#1f140f]">
              €{Number(totalMinimumOrderValue || 0).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[32px] border border-white/40 bg-white/75 p-6 shadow-[0_20px_80px_rgba(49,31,18,0.12)] backdrop-blur-xl sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#9a7b5f]">
              Supplier Setup
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[#1f140f]">
              {editingId ? "Edit supplier" : "Create supplier"}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#6b5b52]">
              Define supplier identity, contact method, delivery schedule, and
              minimum order amount.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Supplier name"
                className="w-full rounded-2xl border border-[#e6d8ca] bg-white px-5 py-4 text-[#1f140f] outline-none focus:border-[#9a7b5f] focus:ring-4 focus:ring-[#c8a27c]/20"
                required
              />

              <input
                type="text"
                name="code"
                value={form.code}
                onChange={handleChange}
                placeholder="Supplier code"
                className="w-full rounded-2xl border border-[#e6d8ca] bg-white px-5 py-4 text-[#1f140f] outline-none focus:border-[#9a7b5f] focus:ring-4 focus:ring-[#c8a27c]/20"
                required
              />

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Supplier email"
                className="w-full rounded-2xl border border-[#e6d8ca] bg-white px-5 py-4 text-[#1f140f] outline-none focus:border-[#9a7b5f] focus:ring-4 focus:ring-[#c8a27c]/20"
                required
              />

              <select
                name="orderMethod"
                value={form.orderMethod}
                onChange={handleChange}
                className="w-full rounded-2xl border border-[#e6d8ca] bg-white px-5 py-4 text-[#1f140f] outline-none focus:border-[#9a7b5f] focus:ring-4 focus:ring-[#c8a27c]/20"
              >
                <option value="email">email</option>
                <option value="phone">phone</option>
                <option value="portal">portal</option>
              </select>

              <input
                type="text"
                name="deliveryDays"
                value={form.deliveryDays}
                onChange={handleChange}
                placeholder="Delivery days (e.g. Monday, Wednesday, Friday)"
                className="w-full rounded-2xl border border-[#e6d8ca] bg-white px-5 py-4 text-[#1f140f] outline-none focus:border-[#9a7b5f] focus:ring-4 focus:ring-[#c8a27c]/20"
              />

              <input
                type="number"
                step="0.01"
                name="minimumOrderAmount"
                value={form.minimumOrderAmount}
                onChange={handleChange}
                placeholder="Minimum order amount"
                className="w-full rounded-2xl border border-[#e6d8ca] bg-white px-5 py-4 text-[#1f140f] outline-none focus:border-[#9a7b5f] focus:ring-4 focus:ring-[#c8a27c]/20"
              />

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              {success ? (
                <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  {success}
                </div>
              ) : null}

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-2xl bg-[linear-gradient(135deg,#2d1c13_0%,#4e342e_100%)] px-6 py-4 font-semibold text-white shadow-[0_10px_24px_rgba(62,39,35,0.22)] transition hover:scale-[1.01] disabled:opacity-70"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Supplier"
                      : "Create Supplier"}
                </button>

                {editingId ? (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-2xl border border-[#d8c6b7] bg-white px-6 py-4 font-semibold text-[#2d1c13] transition hover:bg-[#f8f2ec]"
                  >
                    Cancel
                  </button>
                ) : null}
              </div>
            </form>
          </div>

          <div className="rounded-[32px] border border-white/40 bg-white/75 p-6 shadow-[0_20px_80px_rgba(49,31,18,0.12)] backdrop-blur-xl sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#9a7b5f]">
              Supplier Directory
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[#1f140f]">
              Company supplier records
            </h2>

            <div className="mt-5 space-y-4">
              {suppliers.length === 0 ? (
                <div className="rounded-2xl border border-[#f0e3d7] bg-[#fffdfa] p-4 text-sm text-[#6b5b52]">
                  No suppliers found.
                </div>
              ) : (
                suppliers.map((supplier) => (
                  <div
                    key={supplier._id}
                    className="rounded-2xl border border-[#f0e3d7] bg-[#fffdfa] p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#9a7b5f]">
                          {supplier.code}
                        </p>
                        <p className="mt-2 text-lg font-semibold text-[#2d1c13]">
                          {supplier.name}
                        </p>
                        <p className="mt-1 text-sm text-[#8b7768]">
                          {supplier.email}
                        </p>
                        <p className="mt-1 text-sm text-[#8b7768]">
                          Method: {supplier.orderMethod}
                        </p>
                        <p className="mt-1 text-sm text-[#8b7768]">
                          Delivery Days:{" "}
                          {supplier.deliveryDays?.length
                            ? supplier.deliveryDays.join(", ")
                            : "Not set"}
                        </p>
                        <p className="mt-1 text-sm text-[#8b7768]">
                          Minimum Order: €
                          {Number(supplier.minimumOrderAmount || 0).toFixed(2)}
                        </p>
                      </div>

                      <div className="flex flex-col items-start gap-3 lg:items-end">
                        <span
                          className={`rounded-full px-3 py-1 text-sm font-medium ${
                            supplier.isActive
                              ? "bg-[#e8f5e9] text-[#2e7d32]"
                              : "bg-[#fff3e0] text-[#ef6c00]"
                          }`}
                        >
                          {supplier.isActive ? "Active" : "Inactive"}
                        </span>

                        <button
                          onClick={() => handleEdit(supplier)}
                          className="rounded-xl border border-[#d8c6b7] bg-white px-4 py-2 text-sm font-medium text-[#2d1c13] transition hover:bg-[#f8f2ec]"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </OwnerLayout>
  );
}
