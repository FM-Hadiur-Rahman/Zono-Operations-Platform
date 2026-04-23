import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import { getToken } from "../../utils/storage";
import PlatformLayout from "../../components/layout/PlatformLayout";

const initialForm = {
  companyName: "",
  slug: "",
  contactEmail: "",
  country: "Germany",
  ownerName: "",
  ownerEmail: "",
  ownerPassword: "",
  locationName: "",
  locationCode: "",
  addressLine1: "",
  city: "",
  postalCode: "",
};

export default function CreateCompanyPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const token = getToken();

      const payload = {
        companyName: form.companyName,
        slug: form.slug,
        contactEmail: form.contactEmail,
        country: form.country,
        ownerName: form.ownerName,
        ownerEmail: form.ownerEmail,
        ownerPassword: form.ownerPassword,
        firstLocation: {
          name: form.locationName,
          code: form.locationCode,
          addressLine1: form.addressLine1,
          city: form.city,
          postalCode: form.postalCode,
          country: form.country,
        },
      };

      const { data } = await api.post("/platform/companies", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccessMessage(
        `Company "${data.data.company.name}" created successfully.`,
      );

      setForm(initialForm);

      setTimeout(() => {
        navigate("/platform/companies", { replace: true });
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create company.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PlatformLayout
      title="Create Company"
      subtitle="Create a new client company, assign its first owner, and optionally define the first branch location."
    >
      <div className="rounded-[32px] border border-white/40 bg-white/75 p-6 shadow-[0_20px_80px_rgba(49,31,18,0.12)] backdrop-blur-xl sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold text-[#1f140f]">
              Company Information
            </h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <input
                type="text"
                name="companyName"
                value={form.companyName}
                onChange={handleChange}
                placeholder="Company name"
                className="rounded-2xl border border-[#e6d8ca] bg-white px-5 py-4 text-[#1f140f] outline-none focus:border-[#9a7b5f] focus:ring-4 focus:ring-[#c8a27c]/20"
                required
              />
              <input
                type="text"
                name="slug"
                value={form.slug}
                onChange={handleChange}
                placeholder="Slug (e.g. backwerk)"
                className="rounded-2xl border border-[#e6d8ca] bg-white px-5 py-4 text-[#1f140f] outline-none focus:border-[#9a7b5f] focus:ring-4 focus:ring-[#c8a27c]/20"
              />
              <input
                type="email"
                name="contactEmail"
                value={form.contactEmail}
                onChange={handleChange}
                placeholder="Company contact email"
                className="rounded-2xl border border-[#e6d8ca] bg-white px-5 py-4 text-[#1f140f] outline-none focus:border-[#9a7b5f] focus:ring-4 focus:ring-[#c8a27c]/20"
                required
              />
              <input
                type="text"
                name="country"
                value={form.country}
                onChange={handleChange}
                placeholder="Country"
                className="rounded-2xl border border-[#e6d8ca] bg-white px-5 py-4 text-[#1f140f] outline-none focus:border-[#9a7b5f] focus:ring-4 focus:ring-[#c8a27c]/20"
              />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-[#1f140f]">
              Owner Account
            </h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <input
                type="text"
                name="ownerName"
                value={form.ownerName}
                onChange={handleChange}
                placeholder="Owner full name"
                className="rounded-2xl border border-[#e6d8ca] bg-white px-5 py-4 text-[#1f140f] outline-none focus:border-[#9a7b5f] focus:ring-4 focus:ring-[#c8a27c]/20"
                required
              />
              <input
                type="email"
                name="ownerEmail"
                value={form.ownerEmail}
                onChange={handleChange}
                placeholder="Owner email"
                className="rounded-2xl border border-[#e6d8ca] bg-white px-5 py-4 text-[#1f140f] outline-none focus:border-[#9a7b5f] focus:ring-4 focus:ring-[#c8a27c]/20"
                required
              />
              <input
                type="text"
                name="ownerPassword"
                value={form.ownerPassword}
                onChange={handleChange}
                placeholder="Temporary password"
                className="rounded-2xl border border-[#e6d8ca] bg-white px-5 py-4 text-[#1f140f] outline-none focus:border-[#9a7b5f] focus:ring-4 focus:ring-[#c8a27c]/20 md:col-span-2"
                required
              />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-[#1f140f]">
              First Location
            </h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <input
                type="text"
                name="locationName"
                value={form.locationName}
                onChange={handleChange}
                placeholder="Location name"
                className="rounded-2xl border border-[#e6d8ca] bg-white px-5 py-4 text-[#1f140f] outline-none focus:border-[#9a7b5f] focus:ring-4 focus:ring-[#c8a27c]/20"
              />
              <input
                type="text"
                name="locationCode"
                value={form.locationCode}
                onChange={handleChange}
                placeholder="Location code"
                className="rounded-2xl border border-[#e6d8ca] bg-white px-5 py-4 text-[#1f140f] outline-none focus:border-[#9a7b5f] focus:ring-4 focus:ring-[#c8a27c]/20"
              />
              <input
                type="text"
                name="addressLine1"
                value={form.addressLine1}
                onChange={handleChange}
                placeholder="Address"
                className="rounded-2xl border border-[#e6d8ca] bg-white px-5 py-4 text-[#1f140f] outline-none focus:border-[#9a7b5f] focus:ring-4 focus:ring-[#c8a27c]/20 md:col-span-2"
              />
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="City"
                className="rounded-2xl border border-[#e6d8ca] bg-white px-5 py-4 text-[#1f140f] outline-none focus:border-[#9a7b5f] focus:ring-4 focus:ring-[#c8a27c]/20"
              />
              <input
                type="text"
                name="postalCode"
                value={form.postalCode}
                onChange={handleChange}
                placeholder="Postal code"
                className="rounded-2xl border border-[#e6d8ca] bg-white px-5 py-4 text-[#1f140f] outline-none focus:border-[#9a7b5f] focus:ring-4 focus:ring-[#c8a27c]/20"
              />
            </div>
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {successMessage ? (
            <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {successMessage}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-[linear-gradient(135deg,#2d1c13_0%,#4e342e_100%)] px-5 py-4 text-center text-base font-semibold text-white shadow-[0_10px_30px_rgba(62,39,35,0.28)] transition hover:scale-[1.01] disabled:opacity-70"
          >
            {loading ? "Creating Company..." : "Create Company"}
          </button>
        </form>
      </div>
    </PlatformLayout>
  );
}
