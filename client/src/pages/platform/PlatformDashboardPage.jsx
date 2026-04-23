import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/api";
import { getToken } from "../../utils/storage";
import PlatformLayout from "../../components/layout/PlatformLayout";

export default function PlatformDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
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
        setError(
          err.response?.data?.message ||
            "Failed to load platform dashboard data.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadCompanies();
  }, []);

  const activeCompanies = companies.filter(
    (company) => company.isActive,
  ).length;
  const inactiveCompanies = companies.filter(
    (company) => !company.isActive,
  ).length;

  if (loading) {
    return (
      <PlatformLayout
        title="Platform Dashboard"
        subtitle="Manage companies, create new client workspaces, and monitor the Zono multi-tenant environment."
      >
        <div className="rounded-[32px] border border-white/40 bg-white/75 p-8 text-[#6b5b52] shadow-[0_20px_80px_rgba(49,31,18,0.12)] backdrop-blur-xl">
          Loading platform dashboard...
        </div>
      </PlatformLayout>
    );
  }

  if (error) {
    return (
      <PlatformLayout
        title="Platform Dashboard"
        subtitle="Manage companies, create new client workspaces, and monitor the Zono multi-tenant environment."
      >
        <div className="rounded-[32px] border border-red-200 bg-red-50 p-8 text-red-700 shadow-sm">
          {error}
        </div>
      </PlatformLayout>
    );
  }

  return (
    <PlatformLayout
      title="Platform Dashboard"
      subtitle="Manage companies, create new client workspaces, and monitor the Zono multi-tenant environment."
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-[28px] border border-[#eadccf] bg-gradient-to-br from-[#f7eadb] to-[#eddac7] p-5 shadow-sm">
            <p className="text-sm text-[#8b7768]">Total Companies</p>
            <p className="mt-3 text-3xl font-semibold text-[#1f140f]">
              {companies.length}
            </p>
          </div>

          <div className="rounded-[28px] border border-[#eadccf] bg-gradient-to-br from-[#f8efe6] to-[#efe1d2] p-5 shadow-sm">
            <p className="text-sm text-[#8b7768]">Active Companies</p>
            <p className="mt-3 text-3xl font-semibold text-[#1f140f]">
              {activeCompanies}
            </p>
          </div>

          <div className="rounded-[28px] border border-[#eadccf] bg-gradient-to-br from-[#f4e3d3] to-[#e7cfb9] p-5 shadow-sm">
            <p className="text-sm text-[#8b7768]">Inactive Companies</p>
            <p className="mt-3 text-3xl font-semibold text-[#1f140f]">
              {inactiveCompanies}
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          <Link
            to="/platform/companies/new"
            className="rounded-[28px] border border-[#4e342e] bg-[linear-gradient(135deg,#2d1c13_0%,#4e342e_100%)] p-6 text-white shadow-[0_15px_40px_rgba(62,39,35,0.25)] transition hover:scale-[1.01]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">Create New Company</h2>
                <p className="mt-3 max-w-xl text-sm leading-7 text-white/80">
                  Create a new client company, assign its first owner, and
                  optionally create its first branch location.
                </p>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-lg font-semibold">
                +
              </div>
            </div>
          </Link>

          <Link
            to="/platform/companies"
            className="rounded-[28px] border border-[#eadccf] bg-white/90 p-6 text-[#2d1c13] shadow-sm transition hover:bg-[#fbf6f1]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">View All Companies</h2>
                <p className="mt-3 max-w-xl text-sm leading-7 text-[#6b5b52]">
                  Review all client companies, view onboarding status, and
                  manage company activation centrally.
                </p>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f3e8dc] text-lg font-semibold text-[#4e342e]">
                →
              </div>
            </div>
          </Link>
        </div>

        <div className="rounded-[30px] border border-[#eadccf] bg-white/90 p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#9a7b5f]">
            Recent Company Records
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[#1f140f]">
            Latest onboarded companies
          </h2>

          <div className="mt-5 space-y-4">
            {companies.length === 0 ? (
              <div className="rounded-2xl border border-[#f0e3d7] bg-[#fffdfa] p-4 text-sm text-[#6b5b52]">
                No companies found yet.
              </div>
            ) : (
              companies.slice(0, 5).map((company) => (
                <div
                  key={company._id}
                  className="rounded-2xl border border-[#f0e3d7] bg-[#fffdfa] p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-[#2d1c13]">
                        {company.name}
                      </p>
                      <p className="mt-1 text-sm text-[#8b7768]">
                        {company.contactEmail} · {company.country}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        company.isActive
                          ? "bg-[#e8f5e9] text-[#2e7d32]"
                          : "bg-[#fff3e0] text-[#ef6c00]"
                      }`}
                    >
                      {company.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </PlatformLayout>
  );
}
