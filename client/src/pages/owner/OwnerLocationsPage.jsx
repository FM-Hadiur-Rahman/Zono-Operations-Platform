import { useEffect, useState } from "react";
import api from "../../lib/api";
import { getToken } from "../../utils/storage";
import { useAuth } from "../../context/AuthContext";
import MiniBarList from "../../components/charts/MiniBarList";
import OwnerLayout from "../../components/layout/OwnerLayout";

export default function OwnerLocationsPage() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const loadLocations = async () => {
      try {
        setLoading(true);
        setError("");

        const token = getToken();

        const { data } = await api.get("/dashboard/owner/locations", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setLocations(data.locations || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load locations.");
      } finally {
        setLoading(false);
      }
    };

    loadLocations();
  }, []);

  const totalSpend = locations.reduce(
    (sum, item) => sum + (item.totalSpend || 0),
    0,
  );
  const totalOrders = locations.reduce(
    (sum, item) => sum + (item.totalOrders || 0),
    0,
  );
  const activeLocations = locations.filter(
    (item) => item.totalOrders > 0,
  ).length;

  if (loading) {
    return (
      <OwnerLayout
        title="Owner Locations"
        subtitle={`Welcome back, ${user?.name || "Owner"}. Review all branch performance, activity, and spend from one place.`}
      >
        <div className="rounded-[32px] border border-white/40 bg-white/75 p-8 text-[#6b5b52] shadow-[0_20px_80px_rgba(49,31,18,0.12)] backdrop-blur-xl">
          Loading locations...
        </div>
      </OwnerLayout>
    );
  }

  if (error) {
    return (
      <OwnerLayout
        title="Owner Locations"
        subtitle={`Welcome back, ${user?.name || "Owner"}. Review all branch performance, activity, and spend from one place.`}
      >
        <div className="rounded-[32px] border border-red-200 bg-red-50 p-8 text-red-700 shadow-sm">
          {error}
        </div>
      </OwnerLayout>
    );
  }

  return (
    <OwnerLayout
      title="Owner Locations"
      subtitle={`Welcome back, ${user?.name || "Owner"}. Review all branch performance, activity, and spend from one place.`}
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[28px] border border-[#eadccf] bg-gradient-to-br from-[#f7eadb] to-[#eddac7] p-5 shadow-sm">
            <p className="text-sm text-[#8b7768]">Locations</p>
            <p className="mt-3 text-3xl font-semibold text-[#1f140f]">
              {locations.length}
            </p>
          </div>

          <div className="rounded-[28px] border border-[#eadccf] bg-gradient-to-br from-[#f8efe6] to-[#efe1d2] p-5 shadow-sm">
            <p className="text-sm text-[#8b7768]">Active Locations</p>
            <p className="mt-3 text-3xl font-semibold text-[#1f140f]">
              {activeLocations}
            </p>
          </div>

          <div className="rounded-[28px] border border-[#eadccf] bg-gradient-to-br from-[#f7eadb] to-[#ead7c3] p-5 shadow-sm">
            <p className="text-sm text-[#8b7768]">Total Orders</p>
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
              Branch Directory
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[#1f140f]">
              Multi-location overview
            </h2>

            <div className="mt-5 space-y-4">
              {locations.length === 0 ? (
                <div className="rounded-2xl border border-[#f0e3d7] bg-[#fffdfa] p-4 text-sm text-[#6b5b52]">
                  No locations found.
                </div>
              ) : (
                locations.map((location) => (
                  <div
                    key={location.id}
                    className="rounded-2xl border border-[#f0e3d7] bg-[#fffdfa] p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="text-lg font-semibold text-[#2d1c13]">
                          {location.name}
                        </p>
                        <p className="mt-1 text-sm text-[#8b7768]">
                          {location.city || "Germany"} · {location.code}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-6">
                        <div>
                          <p className="text-xs uppercase tracking-[0.14em] text-[#a08d81]">
                            Orders
                          </p>
                          <p className="mt-1 text-lg font-semibold text-[#1f140f]">
                            {location.totalOrders}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs uppercase tracking-[0.14em] text-[#a08d81]">
                            Quantity
                          </p>
                          <p className="mt-1 text-lg font-semibold text-[#1f140f]">
                            {location.totalQuantity}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs uppercase tracking-[0.14em] text-[#a08d81]">
                            Spend
                          </p>
                          <p className="mt-1 text-lg font-semibold text-[#1f140f]">
                            €{Number(location.totalSpend || 0).toFixed(2)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs uppercase tracking-[0.14em] text-[#a08d81]">
                            Status
                          </p>
                          <p className="mt-1 inline-flex rounded-full bg-[#f3e8dc] px-3 py-1 text-sm font-medium text-[#7a5a43]">
                            {location.status}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 text-sm text-[#8b7768]">
                      Last order:{" "}
                      {location.lastOrderAt
                        ? new Date(location.lastOrderAt).toLocaleString()
                        : "No activity yet"}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <MiniBarList
            title="Location Spend Distribution"
            subtitle="Compare real spending across all active branches."
            items={locations.map((location) => ({
              id: location.id,
              label: location.name,
              subtext: `${location.city || "Germany"} · ${location.totalOrders} orders`,
              value: location.totalSpend,
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
