import { useState } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useToast } from "../components/Toast";

function EyeIcon({ open }){
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3.2"/><path d="M3 3l18 18"/></svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3.2"/></svg>
  );
}

export default function Login() {
  const { t } = useLanguage();
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(null);
  const { login } = useAuth();
  const nav = useNavigate();
  const { success, error: toastError } = useToast();

  const submit = async (e) => {
    e.preventDefault();
    if(!form.email.trim() || !form.password){ setErr('Please fill all fields'); return; }
    setLoading(true);
    setErr("");
    try {
      const r = await api.post("/auth/login", form);
      login(r.data.token, r.data.user);
      success(`Welcome back, ${r.data.user.name || "Green Friend"}!`);
      try{ window.dispatchEvent(new CustomEvent('show-ai-feature',{detail:{source:'login'}})); }catch{}
      nav(r.data.user.role === "admin" ? "/admin" : "/dashboard");
    } catch (e) {
      const message = e.response?.data?.error || "Login failed — check your email & password";
      setErr(message);
      toastError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[86vh] bg-[#fdfbf7] relative overflow-hidden flex items-center justify-center px-4 py-10">
      {/* earthy blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-[520px] h-[520px] bg-[#e8f0e3] rounded-full blur-[90px] opacity-70" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-[520px] h-[520px] bg-emerald-100/60 rounded-full blur-[90px] opacity-60" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{backgroundImage:`radial-gradient(#0a2e1f 1px, transparent 1px)`, backgroundSize:'22px 22px'}} />

      <div className="relative w-full max-w-[420px]">
        {/* brand echo */}
        <Link to="/" className="mx-auto mb-5 flex items-center justify-center gap-2 text-xs font-black tracking-widest uppercase text-[#a8a29e]">
          <span className="w-6 h-6 rounded-full bg-[#0a2e1f] text-white grid place-items-center text-[11px]">🌿</span> GreenNest • Est. 2022
        </Link>

        {/* glass card */}
        <div className="bg-white/85 backdrop-blur-2xl border border-white/60 rounded-[28px] shadow-card overflow-hidden">
          {/* leaf header */}
          <div className="px-7 md:px-8 pt-8 pb-2 text-center">
            <div className="mx-auto w-11 h-11 rounded-2xl bg-[#0a2e1f] text-white grid place-items-center shadow-lg shadow-emerald-900/20">
              <span className="text-[18px]">🌿</span>
            </div>
            <h1 className="mt-4 text-[26px] font-black tracking-tight leading-none" style={{fontFamily:'Outfit, sans-serif'}}>
              {t("auth_welcome_back") || 'Welcome back'}
            </h1>
            <p className="mt-1.5 text-sm leading-5 text-[#57534e]">{t("auth_signin_desc") || 'Sign in to track orders & get care support.'} <Link to="/register" className="font-black text-emerald-700 hover:text-emerald-800 underline decoration-emerald-200 underline-offset-4">{t("auth_create_account") || 'Create account'}</Link></p>
          </div>

          <form onSubmit={submit} noValidate className="px-7 md:px-8 py-6 space-y-4">
            {err && (
              <div role="alert" className="bg-red-50 border border-red-200 text-red-800 px-3.5 py-3 rounded-2xl text-sm flex gap-2.5 items-start">
                <span className="w-7 h-7 rounded-full bg-red-600 text-white grid place-items-center shrink-0 text-xs font-black">!</span>
                <span className="leading-5 font-medium">{err}</span>
              </div>
            )}

            {/* email floating */}
            <div className="relative">
              <input
                id="login-email"
                type="email"
                placeholder=" "
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                onFocus={()=>setFocused('email')}
                onBlur={()=>setFocused(null)}
                autoComplete="email"
                required
                className={`peer w-full bg-white border rounded-2xl px-4 pt-6 pb-2.5 text-[14px] outline-none transition shadow-sm placeholder-transparent
                  ${err && !form.email ? 'border-red-300' : focused==='email' ? 'border-emerald-300 ring-4 ring-emerald-50 bg-white' : 'border-[#e7e5e4] focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50'}`}
              />
              <label htmlFor="login-email" className={`absolute left-4 transition-all duration-150 pointer-events-none
                ${form.email || focused==='email' ? 'top-[7px] text-[11px] font-black tracking-widest uppercase text-emerald-700' : 'top-[14px] text-sm text-[#8a857e]'}
                peer-focus:top-[7px] peer-focus:text-[11px] peer-focus:font-black peer-focus:tracking-widest peer-focus:uppercase peer-focus:text-emerald-700`}>
                {t("auth_email_address") || 'Email address'}
              </label>
            </div>

            {/* password floating */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="login-password" className="text-[11px] font-black tracking-widest uppercase text-transparent select-none">Password</label>
                <button
                  type="button"
                  onClick={async () => {
                    const email = window.prompt("Enter email for reset link");
                    if (!email) return;
                    try {
                      await api.post("/auth/forgot-password", { email });
                      success("If that account exists, reset instructions were sent");
                    } catch (e) {
                      toastError(e.response?.data?.error || "Unable to start password reset");
                    }
                  }}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
                >
                  {t("auth_forgot") || 'Forgot?'}
                </button>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  placeholder=" "
                  type={show ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  onFocus={()=>setFocused('password')}
                  onBlur={()=>setFocused(null)}
                  autoComplete="current-password"
                  required
                  className={`peer w-full bg-white border rounded-2xl px-4 pt-6 pb-2.5 pr-12 text-[14px] outline-none transition shadow-sm placeholder-transparent
                    ${focused==='password' ? 'border-emerald-300 ring-4 ring-emerald-50' : 'border-[#e7e5e4] focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50'}`}
                />
                <label htmlFor="login-password" className={`absolute left-4 transition-all pointer-events-none
                  ${form.password || focused==='password' ? 'top-[7px] text-[11px] font-black tracking-widest uppercase text-emerald-700' : 'top-[14px] text-sm text-[#8a857e]'}
                  peer-focus:top-[7px] peer-focus:text-[11px] peer-focus:font-black peer-focus:tracking-widest peer-focus:uppercase peer-focus:text-emerald-700`}>
                  {t("auth_password") || 'Password'}
                </label>
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  aria-label={show ? 'Hide password' : 'Show password'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-[#f6f7f4] border border-[#e7e5e4] grid place-items-center text-[#57534e] hover:bg-white transition"
                >
                  <EyeIcon open={show} />
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2.5 text-sm text-[#57534e] select-none cursor-pointer">
              <input type="checkbox" className="w-[18px] h-[18px] rounded-md border-2 border-[#e7e5e4] text-emerald-600 focus:ring-emerald-200" /> {t("auth_keep_signed") || 'Keep me signed in'}
            </label>

            <button
              disabled={loading}
              className="w-full bg-[#0a2e1f] text-white py-3.5 rounded-full font-black text-sm hover:bg-black transition disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-emerald-900/10 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200"
            >
              {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" /> {t("auth_signing_in") || 'Signing in…'} </> : <>{t("auth_sign_in_continue") || 'Sign in →'}</>}
            </button>
          </form>

          <div className="px-7 md:px-8 pb-7 pt-1 text-center text-sm text-[#57534e]">
            No account? <Link to="/register" className="font-black text-[#0a2e1f] hover:text-emerald-800 underline underline-offset-4">Create one</Link>
            <span className="mx-2 text-[#e7e5e4]">•</span>
            <Link to="/" className="font-bold text-[#57534e] hover:text-[#0a2e1f]">Back to store</Link>
          </div>
        </div>

        <p className="mt-4 text-center text-[11px] leading-4 text-[#a8a29e]">Protected by grower care • <Link to="/privacy" className="underline decoration-dotted underline-offset-4">Privacy</Link> • <Link to="/terms" className="underline decoration-dotted underline-offset-4">Terms</Link> • <Link to="/faq" className="underline decoration-dotted underline-offset-4">FAQs</Link></p>
      </div>
    </div>
  );
}
