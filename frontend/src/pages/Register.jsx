import { useState } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useToast } from "../components/Toast";

export default function Register() {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
    street: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
    terms: false,
  });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const { login } = useAuth();
  const nav = useNavigate();
  const { success, error: toastError } = useToast();

  const getLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
          );
          const d = await r.json();
          const addr = d.address || {};
          setForm((f) => ({
            ...f,
            street: addr.road || addr.suburb || "",
            city: addr.city || addr.town || addr.village || "",
            state: addr.state || "",
            postal_code: addr.postcode || "",
            country: addr.country || "India",
          }));
        } catch {
          alert(`Lat ${latitude}, Lon ${longitude} - fill manually`);
        }
      },
      () => alert("Enable location permission"),
    );
  };

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setErr("Passwords mismatch");
      toastError("Passwords do not match");
      return;
    }
    if (!form.terms) {
      setErr("Accept Terms");
      toastError("Please accept the terms");
      return;
    }
    setLoading(true);
    setErr("");
    try {
      const r = await api.post("/auth/register", {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        address: {
          street: form.street,
          city: form.city,
          state: form.state,
          postal_code: form.postal_code,
          country: form.country,
        },
      });
      login(r.data.token, r.data.user);
      success("Account created successfully");
      nav("/dashboard");
    } catch (e) {
      const message = e.response?.data?.error || "Registration failed";
      setErr(message);
      toastError(message);
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full bg-white border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50";

  return (
    <div className="min-h-[90vh] bg-[#f6f7f4] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[1080px] bg-white rounded-[28px] border shadow-xl overflow-hidden grid lg:grid-cols-[1.15fr_0.85fr]">
        {/* form */}
        <div className="p-6 md:p-8">
          <Link
            to="/"
            className="text-sm font-bold text-gray-600 hover:text-[#0a2e1f]"
          >
            ← Verdant
          </Link>
          <h1 className="mt-3 text-[28px] font-black tracking-tight leading-none">
            {t("auth_join_us")}{" "}
            <span className="text-emerald-700">{t("auth_join_year")}</span>
          </h1>
          <p className="mt-1 text-sm text-gray-500">{t("auth_get_off")}</p>

          <div className="mt-5 flex gap-2">
            {[
              { n: 1, label: t("auth_account") },
              { n: 2, label: t("auth_address") },
            ].map((s) => (
              <div
                key={s.n}
                className={`flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 ${step === s.n ? "bg-[#0a2e1f] text-white border-[#0a2e1f]" : "bg-white border-gray-100 text-gray-500"}`}
              >
                <span
                  className={`w-7 h-7 rounded-full grid place-items-center text-xs font-black ${step === s.n ? "bg-white text-[#0a2e1f]" : "bg-gray-100"}`}
                >
                  {s.n}
                </span>
                <span className="text-xs font-black tracking-widest uppercase">
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {err && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {err}
              </div>
            )}

            {step === 1 ? (
              <>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black tracking-widest uppercase text-gray-600">
                      {t("auth_full_name")}
                    </label>
                    <input
                      placeholder="Priya Sharma"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      className={inputCls + " mt-1.5"}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black tracking-widest uppercase text-gray-600">
                      {t("auth_phone")}
                    </label>
                    <input
                      placeholder="+91 98765 43210"
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      className={inputCls + " mt-1.5"}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-black tracking-widest uppercase text-gray-600">
                    {t("auth_email")}
                  </label>
                  <input
                    placeholder="you@email.com"
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    className={inputCls + " mt-1.5"}
                    required
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black tracking-widest uppercase text-gray-600">
                      {t("auth_password")}
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                      className={inputCls + " mt-1.5"}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black tracking-widest uppercase text-gray-600">
                      {t("auth_confirm")}
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={form.confirm}
                      onChange={(e) =>
                        setForm({ ...form, confirm: e.target.value })
                      }
                      className={inputCls + " mt-1.5"}
                      required
                    />
                  </div>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 flex items-center gap-2 text-xs">
                  <div className="flex-1 h-2 bg-white rounded-full overflow-hidden border">
                    <div
                      className="h-full bg-emerald-600 transition-all"
                      style={{
                        width: `${Math.min(100, form.password.length * 13)}%`,
                      }}
                    ></div>
                  </div>
                  <span className="font-bold text-emerald-700">
                    {t("auth_strength")}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (
                      !form.name ||
                      !form.email ||
                      !form.phone ||
                      !form.password
                    )
                      return setErr("Fill all fields");
                    if (form.password !== form.confirm)
                      return setErr("Passwords mismatch");
                    setErr("");
                    setStep(2);
                  }}
                  className="w-full bg-[#0a2e1f] text-white py-3.5 rounded-full font-black text-sm hover:bg-black"
                >
                  {t("auth_continue_address")}
                </button>
                <p className="text-center text-sm text-gray-600">
                  {t("auth_have_account")}{" "}
                  <Link to="/login" className="font-black text-emerald-700">
                    {t("auth_sign_in")}
                  </Link>
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-sm">
                    {t("auth_where_deliver")}
                  </h4>
                  <button
                    type="button"
                    onClick={getLocation}
                    className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-full font-black"
                  >
                    📍 {t("auth_use_location")}
                  </button>
                </div>
                <input
                  placeholder={t("auth_street_house")}
                  value={form.street}
                  onChange={(e) => setForm({ ...form, street: e.target.value })}
                  className={inputCls}
                />
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    placeholder={t("auth_city")}
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className={inputCls}
                  />
                  <input
                    placeholder={t("auth_state")}
                    value={form.state}
                    onChange={(e) =>
                      setForm({ ...form, state: e.target.value })
                    }
                    className={inputCls}
                  />
                  <input
                    placeholder={t("auth_postal")}
                    value={form.postal_code}
                    onChange={(e) =>
                      setForm({ ...form, postal_code: e.target.value })
                    }
                    className={inputCls}
                  />
                  <input
                    placeholder={t("auth_country")}
                    value={form.country}
                    onChange={(e) =>
                      setForm({ ...form, country: e.target.value })
                    }
                    className={inputCls}
                  />
                </div>
                <label className="flex gap-2 text-xs leading-4 bg-[#f6f7f4] border rounded-xl p-3">
                  <input
                    type="checkbox"
                    checked={form.terms}
                    onChange={(e) =>
                      setForm({ ...form, terms: e.target.checked })
                    }
                    className="mt-0.5"
                  />{" "}
                  <span>{t("auth_terms")}</span>
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-white border-2 border-gray-100 py-3 rounded-full font-black text-sm"
                  >
                    {t("auth_back")}
                  </button>
                  <button
                    disabled={loading}
                    className="flex-[2] bg-emerald-600 text-white py-3.5 rounded-full font-black text-sm hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {loading
                      ? t("auth_creating")
                      : t("auth_create_account_btn")}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>

        {/* visual */}
        <div className="hidden lg:flex bg-[#0a2e1f] text-white relative overflow-hidden flex-col p-8">
          <img
            src="https://images.unsplash.com/photo-1446071103084-c257b5f70672?w=800"
            alt="nursery"
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a2e1f] via-transparent to-transparent"></div>
          <div className="relative">
            <span className="bg-white text-[#0a2e1f] text-xs font-black px-3 py-1.5 rounded-full">
              4 YEARS • 50K PLANTS
            </span>
            <h3 className="mt-4 text-[28px] font-black leading-none">
              {t("auth_your_journey")}
              <br />
              <span className="font-serif italic font-normal text-emerald-300">
                {t("auth_journey_span")}
              </span>
            </h3>
            <p className="mt-3 text-sm text-white/80 leading-6">
              {t("auth_since_desc")}
            </p>
          </div>
          <div className="relative mt-auto space-y-3">
            <div className="bg-white rounded-2xl p-4 text-gray-900 border shadow-xl">
              <div className="text-xs font-black tracking-widest uppercase text-emerald-700">
                {t("auth_perks")}
              </div>
              <ul className="mt-2 space-y-2 text-sm">
                <li className="flex gap-2">
                  <span className="text-emerald-600">✓</span>{" "}
                  {t("auth_off_first")}
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-600">✓</span>{" "}
                  {t("auth_track_orders")}
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-600">✓</span>{" "}
                  {t("auth_whatsapp_care")}
                </li>
              </ul>
            </div>
            <div className="flex gap-2 text-center">
              <div className="flex-1 bg-white/10 backdrop-blur border border-white/20 rounded-xl p-3">
                <div className="font-black">50k+</div>
                <div className="text-[11px] text-white/70">Plants</div>
              </div>
              <div className="flex-1 bg-white/10 backdrop-blur border border-white/20 rounded-xl p-3">
                <div className="font-black">4.9★</div>
                <div className="text-[11px] text-white/70">Rating</div>
              </div>
              <div className="flex-1 bg-white/10 backdrop-blur border border-white/20 rounded-xl p-3">
                <div className="font-black">2022</div>
                <div className="text-[11px] text-white/70">Est.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
