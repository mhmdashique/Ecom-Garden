import { useState } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useToast } from "../components/Toast";

export default function Login() {
  const { t } = useLanguage();
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();
  const { success, error: toastError } = useToast();
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    try {
      const r = await api.post("/auth/login", form);
      login(r.data.token, r.data.user);
      success(`Welcome back, ${r.data.user.name || "Green Friend"}!`);
      nav(r.data.user.role === "admin" ? "/admin" : "/dashboard");
    } catch (e) {
      const message = e.response?.data?.error || "Login failed";
      setErr(message);
      toastError(message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-[85vh] bg-[#f6f7f4] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[920px] bg-white rounded-[28px] border shadow-xl overflow-hidden grid lg:grid-cols-[1.1fr_0.9fr]">
        {/* left form */}
        <div className="p-6 md:p-8 lg:p-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-[#0a2e1f]"
          >
            ← GreenNest
          </Link>
          <div className="mt-6 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-[#0a2e1f] text-white grid place-items-center">
              🌿
            </span>
            <div>
              <h1 className="text-2xl font-black tracking-tight leading-none">
                {t("auth_welcome_back")}
              </h1>
              <p className="text-xs text-gray-500">{t("auth_est")}</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-gray-600">
            {t("auth_signin_desc")}{" "}
            <Link to="/register" className="font-black text-emerald-700">
              {t("auth_create_account")}
            </Link>
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {err && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {err}
              </div>
            )}

            <div>
              <label className="text-xs font-black tracking-widest uppercase text-gray-600">
                {t("auth_email_address")}
              </label>
              <input
                placeholder="you@email.com"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1.5 w-full bg-white border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50"
                required
              />
            </div>
            <div>
              <div className="flex justify-between items-center">
                <label className="text-xs font-black tracking-widest uppercase text-gray-600">
                  {t("auth_password")}
                </label>
                <button
                  type="button"
                  onClick={async () => {
                    const email = window.prompt("Enter email for reset link");
                    if (!email) return;
                    try {
                      await api.post("/auth/forgot-password", { email });
                      success(
                        "If that account exists, reset instructions were sent",
                      );
                    } catch (e) {
                      toastError(
                        e.response?.data?.error ||
                          "Unable to start password reset",
                      );
                    }
                  }}
                  className="text-xs font-bold text-emerald-700"
                >
                  {t("auth_forgot")}
                </button>
              </div>
              <div className="mt-1.5 relative">
                <input
                  placeholder="••••••••"
                  type={show ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="w-full bg-white border-2 border-gray-100 rounded-xl px-4 py-3 pr-12 text-sm outline-none focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-gray-500 bg-gray-50 border px-2 py-1 rounded-full"
                >
                  {show ? t("auth_hide") : t("auth_show")}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" className="rounded border-2" />{" "}
              {t("auth_keep_signed")}
            </label>

            <button
              disabled={loading}
              className="w-full bg-[#0a2e1f] text-white py-3.5 rounded-full font-black text-sm hover:bg-black transition disabled:opacity-60 shadow"
            >
              {loading ? t("auth_signing_in") : t("auth_sign_in_continue")}
            </button>

            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-xs text-gray-400 font-bold tracking-widest uppercase">
                {t("auth_or")}
              </span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            <button
              type="button"
              onClick={() => alert("Google login soon")}
              className="w-full bg-white border-2 border-gray-100 py-3 rounded-full font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-50"
            >
              <span className="w-6 h-6 rounded-full bg-white border grid place-items-center text-xs font-black">
                G
              </span>{" "}
              {t("auth_continue_google")}
            </button>
          </form>
        </div>

        {/* right visual - new 2022 themed */}
        <div className="hidden lg:flex bg-[#0a2e1f] text-white relative overflow-hidden p-8 flex-col">
          <img
            src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800"
            alt="plants"
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a2e1f] via-[#0a2e1f]/40 to-transparent"></div>
          <div className="relative">
            <span className="inline-flex bg-white text-[#0a2e1f] text-xs font-black px-3 py-1.5 rounded-full">
              {t("auth_est_badge")}
            </span>
            <h3 className="mt-4 text-[30px] font-black leading-none">
              {t("auth_plants_thrive")}
              <br />
              <span className="font-serif italic font-normal text-emerald-300">
                {t("auth_actually_thrive")}
              </span>
            </h3>
            <p className="mt-3 text-sm text-white/80 leading-6">
              {t("auth_plants_desc")}
            </p>
          </div>
          <div className="relative mt-auto bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <img
                src="https://i.pravatar.cc/100?img=8"
                alt="user"
                className="w-8 h-8 rounded-full object-cover border-2 border-white/30"
              />
              <div className="text-xs">
                <div className="font-black">{t("auth_quote_name")}</div>
                <div className="text-white/70">{t("auth_quote")}</div>
              </div>
              <span className="ml-auto text-amber-300 text-xs">★★★★★</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
