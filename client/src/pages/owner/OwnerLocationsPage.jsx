import { useEffect, useState } from "react";
import api from "../../lib/api";
import { getToken } from "../../utils/storage";
import OwnerLayout from "../../components/layout/OwnerLayout";

const initialForm = {
  name: "",
  code: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  postalCode: "",
  country: "Germany",
  deliveryNotes: "",
};

export default function OwnerLocationsPage() {
  const [locations, setLocations] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadLocations = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();
      const { data } = await api.get("/owner/locations", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setLocations(data.locations || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load locations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLocations();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleEdit = (location) => {
    setEditingId(location._id);
    setForm({
      name: location.name || "",
      code: location.code || "",
      addressLine1: location.addressLine1 || "",
      addressLine2: location.addressLine2 || "",
      city: location.city || "",
      postalCode: location.postalCode || "",
      country: location.country || "Germany",
      deliveryNotes: location.deliveryNotes || "",
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

      if (editingId) {
        await api.put(`/owner/locations/${editingId}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess("Location updated successfully.");
      } else {
        await api.post("/owner/locations", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess("Location created successfully.");
      }

      resetForm();
      await loadLocations();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save location.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <OwnerLayout
      title="Locations"
      subtitle="Create and manage company branch locations for ordering, managers, and reporting."
    >
      <div className="space-y-6">
        <div className="rounded-[32px] border border-white/40 bg-white/75 p-6 shadow-[0_20px_80px_rgba(49,31,18,0.12)] backdrop-blur-xl sm:p-8">
          <h2 className="text-2xl font-semibold text-[#1f140f]">
            {editingId ? "Edit Location" : "Create Location"}
          </h2>

          <form
            onSubmit={handleSubmit}
            className="mt-6 grid gap-4 md:grid-cols-2"
          >
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Location name"
              className="rounded-2xl border border-[#e6d8ca] bg-white px-5 py-4"
              required
            />
            <input
              type="text"
              name="code"
              value={form.code}
              onChange={handleChange}
              placeholder="Location code"
              className="rounded-2xl border border-[#e6d8ca] bg-white px-5 py-4"
              required
            />
            <input
              type="text"
              name="addressLine1"
              value={form.addressLine1}
              onChange={handleChange}
              placeholder="Address line 1"
              className="rounded-2xl border border-[#e6d8ca] bg-white px-5 py-4 md:col-span-2"
            />
            <input
              type="text"
              name="addressLine2"
              value={form.addressLine2}
              onChange={handleChange}
              placeholder="Address line 2"
              className="rounded-2xl border border-[#e6d8ca] bg-white px-5 py-4 md:col-span-2"
            />
            <input
              type="text"
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="City"
              className="rounded-2xl border border-[#e6d8ca] bg-white px-5 py-4"
            />
            <input
              type="text"
              name="postalCode"
              value={form.postalCode}
              onChange={handleChange}
              placeholder="Postal code"
              className="rounded-2xl border border-[#e6d8ca] bg-white px-5 py-4"
            />
            <input
              type="text"
              name="country"
              value={form.country}
              onChange={handleChange}
              placeholder="Country"
              className="rounded-2xl border border-[#e6d8ca] bg-white px-5 py-4"
            />
            <input
              type="text"
              name="deliveryNotes"
              value={form.deliveryNotes}
              onChange={handleChange}
              placeholder="Delivery notes"
              className="rounded-2xl border border-[#e6d8ca] bg-white px-5 py-4"
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
                    ? "Update Location"
                    : "Create Location"}
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
            Company Locations
          </h2>

          <div className="mt-6 space-y-4">
            {loading ? (
              <div className="rounded-2xl border border-[#eadccf] bg-white/90 p-6 text-[#6b5b52]">
                Loading locations...
              </div>
            ) : locations.length === 0 ? (
              <div className="rounded-2xl border border-[#eadccf] bg-white/90 p-6 text-[#6b5b52]">
                No locations created yet.
              </div>
            ) : (
              locations.map((location) => (
                <div
                  key={location._id}
                  className="rounded-[28px] border border-[#eadccf] bg-white/90 p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#9a7b5f]">
                        {location.code}
                      </p>
                      <h3 className="mt-2 text-2xl font-semibold text-[#1f140f]">
                        {location.name}
                      </h3>
                      <p className="mt-2 text-sm text-[#6b5b52]">
                        {location.addressLine1 || "No address"} ·{" "}
                        {location.city || "No city"}
                      </p>
                      <p className="mt-1 text-sm text-[#8b7768]">
                        Manager:{" "}
                        {location.managerUserId?.name || "Not assigned yet"}
                      </p>
                    </div>

                    <button
                      onClick={() => handleEdit(location)}
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
