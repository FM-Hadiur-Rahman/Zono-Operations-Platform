import { useEffect, useState } from "react";
import api from "../../lib/api";
import { getToken } from "../../utils/storage";
import { useAuth } from "../../context/AuthContext";
import MiniBarList from "../../components/charts/MiniBarList";
import OwnerLayout from "../../components/layout/OwnerLayout";

export default function OwnerSuppliersPage() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        setLoading(true);
        setError("");

        const token = getToken();

        const { data } = await api.get("/dashboard/owner/suppliers", {
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

    loadSuppliers();
  }, []);

  const totalSpend = suppliers.reduce(
    (sum, item) => sum + (item.totalAmount || 0),
    0,
  );
  const totalOrders = suppliers.reduce(
    (sum, item) => sum + (item.totalOrders || 0),
    0,
  );
  const activeSuppliers = suppliers.filter(
    (item) => item.totalOrders > 0,
  ).length;

  if (loading) {
    return (
      <OwnerLayout
        title="Owner Suppliers"
        subtitle={`Welcome back, ${user?.name || "Owner"}. Review supplier performance, spend distribution, and purchasing activity.`}
      >
        <div className="rounded-[32px] border border-white/40 bg-white/75 p-8 text-[#6b5b52] shadow-[0_20px_80px_rgba(49,31,18,0.12)] backdrop-blur-xl">
          Loading suppliers...
        </div>
      </OwnerLayout>
    );
  }

  if (error) {
    return (
      <OwnerLayout
        title="Owner Suppliers"
        subtitle={`Welcome back, ${user?.name || "Owner"}. Review supplier performance, spend distribution, and purchasing activity.`}
      >
        <div className="rounded-[32px] border border-red-200 bg-red-50 p-8 text-red-700 shadow-sm">
          {error}
        </div>
      </OwnerLayout>
    );
  }

  return (
    <OwnerLayout
      title="Owner Suppliers"
      subtitle={`Welcome back, ${user?.name || "Owner"}. Review supplier performance, spend distribution, and purchasing activity.`}
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[28px] border border-[#eadccf] bg-gradient-to-br from-[#f7eadb] to-[#eddac7] p-5 shadow-sm">
            <p className="text-sm text-[#8b7768]">Suppliers</p>
            <p className="mt-3 text-3xl font-semibold text-[#1f140f]">
              {suppliers.length}
            </p>
          </div>

          <div className="rounded-[28px] border border-[#eadccf] bg-gradient-to-br from-[#f8efe6] to-[#efe1d2] p-5 shadow-sm">
            <p className="text-sm text-[#8b7768]">Active Suppliers</p>
            <p className="mt-3 text-3xl font-semibold text-[#1f140f]">
              {activeSuppliers}
            </p>
          </div>

          <div className="rounded-[28px] border border-[#eadccf] bg-gradient-to-br from-[#f7eadb] to-[#ead7c3] p-5 shadow-sm">
            <p className="text-sm text-[#8b7768]">Total Supplier Orders</p>
            <p className="mt-3 text-3xl font-semibold text-[#1f140f]">
              {totalOrders}
            </p>
          </div>

          <div className="rounded-[28px] border border-[#eadccf] bg-gradient-to-br from-[#f4e3d3] to-[#e7cfb9] p-5 shadow-sm">
            <p className="text-sm text-[#8b7768]">Total Spend</p>
            <p className="mt-3 text-3xl font-semibold text-[#1f140f]">
              €{Number(totalSpend || 0).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[32px] border border-white/40 bg-white/75 p-6 shadow-[0_20px_80px_rgba(49,31,18,0.12)] backdrop-blur-xl sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#9a7b5f]">
              Supplier Directory
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[#1f140f]">
              Purchasing partner overview
            </h2>

            <div className="mt-5 space-y-4">
              {suppliers.length === 0 ? (
                <div className="rounded-2xl border border-[#f0e3d7] bg-[#fffdfa] p-4 text-sm text-[#6b5b52]">
                  No suppliers found.
                </div>
              ) : (
                suppliers.map((supplier) => (
                  <div
                    key={supplier.id}
                    className="rounded-2xl border border-[#f0e3d7] bg-[#fffdfa] p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-lg font-semibold text-[#2d1c13]">
                          {supplier.name}
                        </p>
                        <p className="mt-1 text-sm text-[#8b7768]">
                          {supplier.code} · {supplier.email || "No email"}
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
                      </div>

                      <div className="flex flex-wrap gap-6">
                        <div>
                          <p className="text-xs uppercase tracking-[0.14em] text-[#a08d81]">
                            Orders
                          </p>
                          <p className="mt-1 text-lg font-semibold text-[#1f140f]">
                            {supplier.totalOrders}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs uppercase tracking-[0.14em] text-[#a08d81]">
                            Quantity
                          </p>
                          <p className="mt-1 text-lg font-semibold text-[#1f140f]">
                            {supplier.totalQuantity}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs uppercase tracking-[0.14em] text-[#a08d81]">
                            Spend
                          </p>
                          <p className="mt-1 text-lg font-semibold text-[#1f140f]">
                            €{Number(supplier.totalAmount || 0).toFixed(2)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs uppercase tracking-[0.14em] text-[#a08d81]">
                            Status
                          </p>
                          <p className="mt-1 inline-flex rounded-full bg-[#f3e8dc] px-3 py-1 text-sm font-medium text-[#7a5a43]">
                            {supplier.status}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 text-sm text-[#8b7768]">
                      Minimum Order: €
                      {Number(supplier.minimumOrderAmount || 0).toFixed(2)}
                      {" · "}
                      Last order:{" "}
                      {supplier.lastOrderAt
                        ? new Date(supplier.lastOrderAt).toLocaleString()
                        : "No activity yet"}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <MiniBarList
            title="Supplier Spend Distribution"
            subtitle="Compare real spend across all purchasing partners."
            items={suppliers.map((supplier) => ({
              id: supplier.id,
              label: supplier.name,
              subtext: `${supplier.totalOrders} orders · ${supplier.orderMethod}`,
              value: supplier.totalAmount,
            }))}
            valueKey="value"
            labelKey="label"
            formatter={(value) => `€${Number(value || 0).toFixed(2)}`}
          />
        </div>
      </div>
    </OwnerLayout>
  );
}
