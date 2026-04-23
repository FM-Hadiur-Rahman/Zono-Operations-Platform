import { useEffect, useState } from "react";
import api from "../../lib/api";
import { getToken } from "../../utils/storage";
import PlatformLayout from "../../components/layout/PlatformLayout";

export default function PlatformCompaniesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [companies, setCompanies] = useState([]);
  const [togglingId, setTogglingId] = useState("");

  const loadCompanies = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      const { data } = await api.get("/platform/companies", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCompanies(data.companies || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load companies.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const handleToggleStatus = async (companyId) => {
    try {
      setTogglingId(companyId);

      const token = getToken();

      await api.patch(
        `/platform/companies/${companyId}/toggle-status`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      await loadCompanies();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update company status.",
      );
    } finally {
      setTogglingId("");
    }
  };

  if (loading) {
    return (
      <PlatformLayout
        title="Companies"
        subtitle="Review all client companies and manage their platform access."
      >
        <div className="rounded-[32px] border border-white/40 bg-white/75 p-8 text-[#6b5b52] shadow-[0_20px_80px_rgba(49,31,18,0.12)] backdrop-blur-xl">
          Loading companies...
        </div>
      </PlatformLayout>
    );
  }

  return (
    <PlatformLayout
      title="Companies"
      subtitle="Review all client companies and manage their platform access."
    >
      <div className="rounded-[32px] border border-white/40 bg-white/75 p-6 shadow-[0_20px_80px_rgba(49,31,18,0.12)] backdrop-blur-xl sm:p-8">
        {error ? (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="space-y-5">
          {companies.length === 0 ? (
            <div className="rounded-2xl border border-[#eadccf] bg-white/90 p-6 text-[#6b5b52] shadow-sm">
              No companies found yet.
            </div>
          ) : (
            companies.map((company) => (
              <div
                key={company._id}
                className="rounded-[28px] border border-[#eadccf] bg-white/90 p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#9a7b5f]">
                      {company.slug}
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-[#1f140f]">
                      {company.name}
                    </h2>
                    <p className="mt-2 text-sm text-[#6b5b52]">
                      {company.contactEmail} · {company.country}
                    </p>
                    <p className="mt-1 text-sm text-[#8b7768]">
                      Created: {new Date(company.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        company.isActive
                          ? "bg-[#e8f5e9] text-[#2e7d32]"
                          : "bg-[#fff3e0] text-[#ef6c00]"
                      }`}
                    >
                      {company.isActive ? "Active" : "Inactive"}
                    </span>

                    <button
                      onClick={() => handleToggleStatus(company._id)}
                      disabled={togglingId === company._id}
                      className="rounded-xl border border-[#d8c6b7] bg-white px-4 py-2 text-sm font-medium text-[#2d1c13] transition hover:bg-[#f8f2ec] disabled:opacity-60"
                    >
                      {togglingId === company._id
                        ? "Updating..."
                        : company.isActive
                          ? "Deactivate"
                          : "Activate"}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </PlatformLayout>
  );
}
