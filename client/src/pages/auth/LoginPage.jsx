import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

const demoAccounts = [
  {
    company: "Kaffee Krümel",
    logo: "☕",
    users: [
      { label: "Owner", email: "owner@kaffeekruemel.de" },
      {
        label: "Düsseldorf Manager",
        email: "manager.duesseldorf@kaffeekruemel.de",
      },
      { label: "Berlin Manager", email: "manager.berlin@kaffeekruemel.de" },
      { label: "Cologne Manager", email: "manager.cologne@kaffeekruemel.de" },
    ],
  },
  {
    company: "BackWerk",
    logo: "🥨",
    users: [
      { label: "Owner", email: "owner@backwerk.de" },
      { label: "Essen Manager", email: "manager.essen@backwerk.de" },
      { label: "Dortmund Manager", email: "manager.dortmund@backwerk.de" },
      { label: "Bochum Manager", email: "manager.bochum@backwerk.de" },
    ],
  },
  {
    company: "Mr. Baker",
    logo: "🍞",
    users: [
      { label: "Owner", email: "owner@mrbaker.de" },
      { label: "Mülheim Manager", email: "manager.muelheim@mrbaker.de" },
      { label: "Duisburg Manager", email: "manager.duisburg@mrbaker.de" },
      { label: "Oberhausen Manager", email: "manager.oberhausen@mrbaker.de" },
    ],
  },
  {
    company: "Kamps",
    logo: "🧁",
    users: [
      { label: "Owner", email: "owner@kamps.de" },
      { label: "Düsseldorf Manager", email: "manager.duesseldorf@kamps.de" },
      { label: "Essen Manager", email: "manager.essen@kamps.de" },
      { label: "Cologne Manager", email: "manager.cologne@kamps.de" },
    ],
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      delay: i * 0.08,
      ease: "easeOut",
    },
  }),
};

function StatCounter({ target, label, delay = 0 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const startTimer = setTimeout(() => {
      let current = 0;
      const duration = 900;
      const steps = 30;
      const increment = target / steps;

      const timer = setInterval(() => {
        current += increment;

        if (current >= target) {
          setCount(target);
          clearInterval(timer);
        } else {
          setCount(Math.round(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }, delay);

    return () => clearTimeout(startTimer);
  }, [target, delay]);

  return (
    <div className="rounded-2xl border border-white/10 bg-black/15 p-5 backdrop-blur-md">
      <p className="text-sm text-white/65">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-white">{count}+</p>
    </div>
  );
}

function DemoCompanyCard({ group, onPick }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className="rounded-2xl border border-white/10 bg-[#17110d]/55 p-4 text-white backdrop-blur-xl"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-lg">
          {group.logo}
        </div>

        <div>
          <p className="font-semibold text-white">{group.company}</p>
          <p className="text-xs text-white/60">Multi-location demo workspace</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {group.users.map((demoUser) => (
          <button
            key={demoUser.email}
            type="button"
            onClick={() => onPick(demoUser.email)}
            className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/20"
          >
            {demoUser.label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-1 text-xs text-white/65">
        {group.users.map((demoUser) => (
          <p key={demoUser.email}>
            {demoUser.label}: {demoUser.email}
          </p>
        ))}
      </div>
    </motion.div>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, user, authReady } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totalCompanies = demoAccounts.length;
  const totalUsers = useMemo(
    () => demoAccounts.reduce((sum, group) => sum + group.users.length, 0),
    [],
  );
  const totalBranches = 12;

  useEffect(() => {
    if (!authReady) return;

    if (isAuthenticated) {
      if (user?.role === "platform_admin") {
        navigate("/platform/dashboard", { replace: true });
      } else if (user?.role === "owner") {
        navigate("/owner/dashboard", { replace: true });
      } else {
        navigate("/manager", { replace: true });
      }
    }
  }, [authReady, isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const fillDemoUser = (email) => {
    setForm({
      email,
      password: "password123",
    });
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", form);

      login({
        token: data.token,
        user: data.user,
      });

      if (data.user.role === "platform_admin") {
        navigate("/platform/dashboard", { replace: true });
      } else if (data.user.role === "owner") {
        navigate("/owner/dashboard", { replace: true });
      } else {
        navigate("/manager", { replace: true });
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f6f1ea]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(120,72,36,0.18),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(191,140,92,0.18),_transparent_35%)]" />
      <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-[#c8a27c]/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[#8b5e3c]/15 blur-3xl" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="grid w-full max-w-7xl overflow-hidden rounded-[32px] border border-white/40 bg-white/70 shadow-[0_20px_80px_rgba(49,31,18,0.15)] backdrop-blur-xl lg:grid-cols-2">
          <div
            className="relative hidden overflow-hidden lg:flex flex-col justify-between p-10 text-white"
            style={{
              backgroundImage:
                "linear-gradient(135deg, rgba(27,18,13,0.90) 0%, rgba(52,33,27,0.84) 42%, rgba(102,67,49,0.76) 100%), url('/coffee-bg.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.08),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(255,255,255,0.06),_transparent_30%)]" />

            <motion.div
              className="relative z-10"
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0}
            >
              <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-black/15 px-4 py-2 text-sm tracking-wide text-white/90 backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-emerald-300" />
                Zono Operations Platform
              </div>

              <h1 className="mt-8 text-4xl font-semibold leading-tight">
                Run all your café branches
                <br />
                from one system.
              </h1>

              <p className="mt-4 max-w-md text-base leading-7 text-white/80">
                Manage suppliers, streamline branch ordering, and control every
                location in real-time — built for modern cafés and bakery
                chains.
              </p>
            </motion.div>

            <motion.div
              className="relative z-10 mt-10 grid grid-cols-3 gap-4"
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={1}
            >
              <StatCounter
                target={totalCompanies}
                label="Companies"
                delay={120}
              />
              <StatCounter
                target={totalBranches}
                label="Branches"
                delay={180}
              />
              <StatCounter target={totalUsers} label="Demo Users" delay={240} />
            </motion.div>

            <motion.div
              className="relative z-10 mt-8 grid gap-4"
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={2}
            >
              <div className="rounded-2xl border border-white/10 bg-black/15 p-5 backdrop-blur-md">
                <p className="text-sm text-white/65">Smart Ordering</p>
                <p className="mt-2 text-lg font-medium">
                  One basket, automatically split by supplier.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/15 p-5 backdrop-blur-md">
                <p className="text-sm text-white/65">Multi-Location Control</p>
                <p className="mt-2 text-lg font-medium">
                  Manage Düsseldorf, Berlin, Cologne, Duisburg and more from one
                  system.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/15 p-5 backdrop-blur-md">
                <p className="text-sm text-white/65">Owners & Managers</p>
                <p className="mt-2 text-lg font-medium">
                  Full control for owners, simple workflows for branch managers.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="relative z-10 mt-8 rounded-3xl border border-white/10 bg-black/15 p-6 backdrop-blur-md"
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={3}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/65">Live Activity Preview</p>
                  <p className="mt-2 text-xl font-semibold">
                    Today’s Operational Snapshot
                  </p>
                </div>
                <span className="rounded-full border border-emerald-300/20 bg-emerald-400/15 px-3 py-1 text-sm text-emerald-200">
                  Live
                </span>
              </div>

              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Düsseldorf Central</p>
                      <p className="mt-1 text-sm text-white/65">
                        3 orders submitted today
                      </p>
                    </div>
                    <p className="text-lg font-semibold">€420</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Supplier Split Engine</p>
                      <p className="mt-1 text-sm text-white/65">
                        12 supplier-ready orders generated this week
                      </p>
                    </div>
                    <p className="text-lg font-semibold">12</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <p className="text-sm text-white/65">Weekly Order Volume</p>
                  <div className="mt-3 flex items-end gap-2">
                    {[40, 62, 48, 74, 56, 88, 67].map((height, index) => (
                      <motion.div
                        key={index}
                        className="flex-1 rounded-t-xl bg-white/70"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: `${height}px`, opacity: 1 }}
                        transition={{
                          duration: 0.5,
                          delay: 0.45 + index * 0.05,
                          ease: "easeOut",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="relative z-10 mt-8 text-sm text-white/75"
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={4}
            >
              <p>✔ Built for multi-branch cafés</p>
              <p>✔ Real-time supplier coordination</p>
              <p>✔ Germany-ready operations</p>
            </motion.div>
          </div>

          <div className="flex items-center justify-center p-6 sm:p-10 lg:p-12">
            <motion.div
              className="w-full max-w-xl"
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0}
            >
              <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#9a7b5f]">
                  Demo Login
                </p>
                <h2 className="mt-3 text-4xl font-semibold tracking-tight text-[#1f140f]">
                  Welcome back
                </h2>
                <p className="mt-3 text-base leading-7 text-[#6b5b52]">
                  Sign in to access company operations, supplier orders, and
                  purchasing dashboards.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#4e3d33]">
                    Email address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="owner@backwerk.de or manager.berlin@kaffeekruemel.de"
                    className="w-full rounded-2xl border border-[#e6d8ca] bg-white/90 px-5 py-4 text-[#1f140f] outline-none transition focus:border-[#9a7b5f] focus:ring-4 focus:ring-[#c8a27c]/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#4e3d33]">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full rounded-2xl border border-[#e6d8ca] bg-white/90 px-5 py-4 text-[#1f140f] outline-none transition focus:border-[#9a7b5f] focus:ring-4 focus:ring-[#c8a27c]/20"
                  />
                </div>

                {error ? (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  >
                    {error}
                  </motion.div>
                ) : null}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-[linear-gradient(135deg,#2d1c13_0%,#4e342e_100%)] px-5 py-4 text-center text-base font-semibold text-white shadow-[0_10px_30px_rgba(62,39,35,0.28)] transition hover:scale-[1.01] disabled:opacity-70"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </form>

              <div className="mt-8 rounded-2xl border border-[#eadccf] bg-[#fcf8f4] p-4 text-sm text-[#6b5b52]">
                <p className="font-semibold text-[#2d1c13]">Quick Demo Login</p>

                <div className="mt-4 space-y-4">
                  {demoAccounts.map((group, index) => (
                    <motion.div
                      key={group.company}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.35,
                        delay: 0.12 + index * 0.07,
                      }}
                    >
                      <div className="rounded-2xl border border-[#eadccf] bg-[#fffdfa] p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#e7d7c8] bg-[#f7efe7] text-lg">
                            {group.logo}
                          </div>

                          <div>
                            <p className="font-semibold text-[#2d1c13]">
                              {group.company}
                            </p>
                            <p className="text-xs text-[#8b7768]">
                              Demo workspace
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {group.users.map((demoUser) => (
                            <button
                              key={demoUser.email}
                              type="button"
                              onClick={() => fillDemoUser(demoUser.email)}
                              className="rounded-xl border border-[#d8c6b7] bg-[#fcf8f4] px-3 py-2 text-xs font-medium text-[#2d1c13] transition hover:bg-[#f3e8dc]"
                            >
                              {demoUser.label}
                            </button>
                          ))}
                        </div>

                        <div className="mt-3 space-y-1 text-xs text-[#6b5b52]">
                          {group.users.map((demoUser) => (
                            <p key={demoUser.email}>
                              {demoUser.label}: {demoUser.email}
                            </p>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-4 rounded-xl border border-[#e7d7c8] bg-[#f7efe7] px-4 py-3">
                  <p className="font-medium text-[#2d1c13]">
                    Password for all demo accounts
                  </p>
                  <p className="mt-1">password123</p>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between text-sm text-[#7d6b60]">
                <span>Multi-company demo mode</span>
                <span>Germany</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
