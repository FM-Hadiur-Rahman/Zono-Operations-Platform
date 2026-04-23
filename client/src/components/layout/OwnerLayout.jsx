import { useAuth } from "../../context/AuthContext";
import OwnerSidebar from "./OwnerSidebar";

export default function OwnerLayout({ title, subtitle, children }) {
  const { user } = useAuth();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f6f1ea]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(120,72,36,0.18),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(191,140,92,0.14),_transparent_36%)]" />
      <div className="absolute -left-16 top-12 h-72 w-72 rounded-full bg-[#c8a27c]/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[#8b5e3c]/10 blur-3xl" />

      <div className="relative z-10 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row">
          <OwnerSidebar />

          <main className="min-w-0 flex-1">
            <div className="mb-6 rounded-[28px] border border-white/40 bg-white/75 p-5 shadow-[0_12px_40px_rgba(49,31,18,0.08)] backdrop-blur-xl">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9a7b5f]">
                    Zono Operations Platform
                  </p>
                  <h1 className="mt-2 text-3xl font-semibold text-[#1f140f]">
                    {title}
                  </h1>
                  {subtitle ? (
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-[#6b5b52]">
                      {subtitle}
                    </p>
                  ) : null}
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <div className="rounded-2xl border border-[#e7d7c8] bg-[#fcf8f4] px-4 py-3 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.14em] text-[#9a7b5f]">
                      Company
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#2d1c13]">
                      {user?.company?.name || "Company"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#e7d7c8] bg-[#fcf8f4] px-4 py-3 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.14em] text-[#9a7b5f]">
                      User
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#2d1c13]">
                      {user?.name || "Owner"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#e7d7c8] bg-[#fcf8f4] px-4 py-3 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.14em] text-[#9a7b5f]">
                      Role
                    </p>
                    <p className="mt-1 text-sm font-semibold capitalize text-[#2d1c13]">
                      {user?.role || "owner"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
