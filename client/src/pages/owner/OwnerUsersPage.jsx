import { useEffect, useState } from "react";
import api from "../../lib/api";
import { getToken } from "../../utils/storage";
import OwnerLayout from "../../components/layout/OwnerLayout";

const initialForm = {
  name: "",
  email: "",
  password: "",
  locationId: "",
};

export default function OwnerUsersPage() {
  const [users, setUsers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      const [usersRes, locationsRes] = await Promise.all([
        api.get("/owner/users", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get("/owner/locations", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setUsers(usersRes.data.users || []);
      setLocations(locationsRes.data.locations || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users.");
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const token = getToken();

      await api.post("/owner/users", form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess("Manager created successfully.");
      setForm(initialForm);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create manager.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <OwnerLayout
      title="Users"
      subtitle="Create branch managers and assign them to company locations."
    >
      <div className="space-y-6">
        <div className="rounded-[32px] border border-white/40 bg-white/75 p-6 shadow-[0_20px_80px_rgba(49,31,18,0.12)] backdrop-blur-xl sm:p-8">
          <h2 className="text-2xl font-semibold text-[#1f140f]">
            Create Manager
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
              placeholder="Manager full name"
              className="rounded-2xl border border-[#e6d8ca] bg-white px-5 py-4"
              required
            />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Manager email"
              className="rounded-2xl border border-[#e6d8ca] bg-white px-5 py-4"
              required
            />
            <input
              type="text"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Temporary password"
              className="rounded-2xl border border-[#e6d8ca] bg-white px-5 py-4"
              required
            />

            <select
              name="locationId"
              value={form.locationId}
              onChange={handleChange}
              className="rounded-2xl border border-[#e6d8ca] bg-white px-5 py-4 text-[#1f140f]"
              required
            >
              <option value="">Select location</option>
              {locations.map((location) => (
                <option key={location._id} value={location._id}>
                  {location.name} ({location.code})
                </option>
              ))}
            </select>

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

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-2xl bg-[linear-gradient(135deg,#2d1c13_0%,#4e342e_100%)] px-6 py-4 font-semibold text-white"
              >
                {saving ? "Creating..." : "Create Manager"}
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-[32px] border border-white/40 bg-white/75 p-6 shadow-[0_20px_80px_rgba(49,31,18,0.12)] backdrop-blur-xl sm:p-8">
          <h2 className="text-2xl font-semibold text-[#1f140f]">
            Company Users
          </h2>

          <div className="mt-6 space-y-4">
            {loading ? (
              <div className="rounded-2xl border border-[#eadccf] bg-white/90 p-6 text-[#6b5b52]">
                Loading users...
              </div>
            ) : users.length === 0 ? (
              <div className="rounded-2xl border border-[#eadccf] bg-white/90 p-6 text-[#6b5b52]">
                No users found yet.
              </div>
            ) : (
              users.map((user) => (
                <div
                  key={user._id}
                  className="rounded-[28px] border border-[#eadccf] bg-white/90 p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h3 className="text-2xl font-semibold text-[#1f140f]">
                        {user.name}
                      </h3>
                      <p className="mt-2 text-sm text-[#6b5b52]">
                        {user.email}
                      </p>
                      <p className="mt-1 text-sm text-[#8b7768]">
                        Role: {user.role} · Location:{" "}
                        {user.locationId?.name || "—"}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        user.isActive
                          ? "bg-[#e8f5e9] text-[#2e7d32]"
                          : "bg-[#fff3e0] text-[#ef6c00]"
                      }`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
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
