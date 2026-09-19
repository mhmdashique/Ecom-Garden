import { useState, useMemo } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useToast } from "../components/Toast";

function EyeBtn({ show, onToggle }){
  return (
    <button type="button" onClick={onToggle} aria-label={show?'Hide password':'Show password'} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-[#f6f7f4] border border-[#e7e5e4] grid place-items-center text-[#57534e] hover:bg-white transition">
      {show ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/><path d="M3 3l18 18"/></svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
      )}
    </button>
  );
}

function FloatingField({ id, label, type='text', value, onChange, error, required, autoComplete, placeholder, rightSlot, ...rest }){
  const [focused,setFocused]=useState(false);
  const active = !!value || focused;
  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={()=>setFocused(true)}
        onBlur={()=>setFocused(false)}
        placeholder=" "
        required={required}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={error?`${id}-error`:undefined}
        className={`peer w-full bg-white border rounded-2xl px-4 pt-6 pb-2.5 text-sm outline-none transition shadow-sm placeholder-transparent ${rightSlot?'pr-12':''}
          ${error?'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-50':'border-[#e7e5e4] focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50 focus:bg-white'} ${focused?'ring-4 ring-emerald-50 border-emerald-300 bg-white':''}`}
        {...rest}
      />
      <label htmlFor={id} className={`absolute left-4 transition-all duration-150 pointer-events-none ${active ? 'top-[7px] text-[11px] font-black tracking-widest uppercase text-emerald-700' : 'top-[14px] text-sm text-[#8a857e]'} peer-focus:top-[7px] peer-focus:text-[11px] peer-focus:font-black peer-focus:tracking-widest peer-focus:uppercase peer-focus:text-emerald-700`}>
        {label}
      </label>
      {rightSlot}
      {error && <p id={`${id}-error`} className="mt-1.5 text-xs font-semibold text-red-600">{error}</p>}
    </div>
  );
}

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
  const [fieldErr, setFieldErr] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showAddress, setShowAddress] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();
  const { success, error: toastError } = useToast();

  const strength = useMemo(()=>{
    const p=form.password;
    if(!p) return 0;
    let s=0;
    if(p.length>=6) s+=25;
    if(p.length>=8) s+=25;
    if(/[A-Z]/.test(p) && /[0-9]/.test(p)) s+=25;
    if(/[^A-Za-z0-9]/.test(p)) s+=25;
    return Math.min(100,s);
  },[form.password]);
  const strengthLabel = strength<30?'Weak':strength<60?'Fair':strength<85?'Good':'Strong';
  const strengthColor = strength<30?'bg-red-500':strength<60?'bg-amber-500':strength<85?'bg-emerald-500':'bg-[#0a2e1f]';

  const getLocation = () => {
    if (!navigator.geolocation) return toastError("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
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
          setShowAddress(true);
          success('Address filled from location');
        } catch {
          toastError(`Lat ${latitude}, Lon ${longitude} — please fill manually`);
        }
      },
      () => toastError("Enable location permission"),
    );
  };

  const validate=()=>{
    const e={};
    if(!form.name.trim()) e.name='Name is required';
    else if(form.name.trim().length<2) e.name='At least 2 characters';
    if(!form.email.trim()) e.email='Email is required';
    else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email='Enter a valid email';
    if(!form.phone.trim()) e.phone='Phone is required';
    else if(!/^[\d+\-\s]{8,15}$/.test(form.phone)) e.phone='Enter a valid phone';
    if(!form.password) e.password='Password is required';
    else if(form.password.length<6) e.password='Minimum 6 characters';
    if(form.confirm!==form.password) e.confirm='Passwords do not match';
    if(!form.terms) e.terms='Please accept the terms';
    return e;
  };

  const submit = async (e) => {
    e.preventDefault();
    const v=validate();
    setFieldErr(v);
    if(Object.keys(v).length){
      const first = Object.values(v)[0];
      setErr(first);
      toastError(first);
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
      success("Account created successfully — welcome to GreenNest!");
      try{ window.dispatchEvent(new CustomEvent('show-ai-feature',{detail:{source:'signup'}})); }catch{}
      nav("/dashboard");
    } catch (e) {
      const message = e.response?.data?.error || "Registration failed";
      setErr(message);
      toastError(message);
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full bg-white border border-[#e7e5e4] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50";

  return (
    <div className="min-h-[90vh] bg-[#fdfbf7] relative overflow-hidden flex items-center justify-center px-4 py-10">
      <div className="pointer-events-none absolute -top-24 -left-24 w-[520px] h-[520px] bg-[#e8f0e3] rounded-full blur-[90px] opacity-70" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-[520px] h-[520px] bg-emerald-100/50 rounded-full blur-[90px] opacity-60" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{backgroundImage:`radial-gradient(#0a2e1f 1px, transparent 1px)`, backgroundSize:'22px 22px'}} />

      <div className="relative w-full max-w-[520px]">
        <Link to="/" className="mx-auto mb-5 flex items-center justify-center gap-2 text-xs font-black tracking-widest uppercase text-[#a8a29e]">
          <span className="w-6 h-6 rounded-full bg-[#0a2e1f] text-white grid place-items-center text-[11px]">🌿</span> GreenNest • Est. 2022
        </Link>

        <div className="bg-white/85 backdrop-blur-2xl border border-white/60 rounded-[28px] shadow-card overflow-hidden">
          <div className="px-7 md:px-8 pt-8 pb-2 text-center">
            <div className="mx-auto w-11 h-11 rounded-2xl bg-[#0a2e1f] text-white grid place-items-center shadow-lg shadow-emerald-900/20">🌿</div>
            <h1 className="mt-4 text-[26px] font-black tracking-tight leading-none" style={{fontFamily:'Outfit, sans-serif'}}>
              {t("auth_join_us") || 'Join GreenNest'} <span className="text-emerald-700">{t("auth_join_year") || '— grow with us'}</span>
            </h1>
            <p className="mt-1.5 text-sm text-[#57534e]">{t("auth_get_off") || 'Create your account • 50,000+ plant parents • Care support on WhatsApp'}</p>
          </div>

          {/* role hint */}
          <div className="mx-7 md:mx-8 mt-5 bg-[#f6f7f4] border border-[#e7e5e4] rounded-2xl px-3.5 py-3 flex gap-3 items-center">
            <span className="w-9 h-9 rounded-xl bg-white border border-[#e7e5e4] grid place-items-center shrink-0">🌱</span>
            <div className="text-xs leading-5">
              <div className="font-black tracking-widest uppercase text-[#0a2e1f] text-[11px]">You join as Plant Lover</div>
              <div className="text-[#57534e] font-medium">Shop, track orders & get WhatsApp care. Admin is verified manually — no self-elevate.</div>
            </div>
          </div>

          <form onSubmit={submit} noValidate className="px-7 md:px-8 py-6 space-y-4">
            {err && (
              <div role="alert" className="bg-red-50 border border-red-200 text-red-800 px-3.5 py-3 rounded-2xl text-sm flex gap-2.5 items-start">
                <span className="w-7 h-7 rounded-full bg-red-600 text-white grid place-items-center shrink-0 text-xs font-black">!</span>
                <span className="leading-5 font-medium">{err}</span>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <FloatingField id="reg-name" label={t("auth_full_name")||'Full name'} value={form.name} onChange={(e)=>setForm({ ...form, name: e.target.value })} error={fieldErr.name} required autoComplete="name" placeholder="Priya Sharma" />
              <FloatingField id="reg-phone" label={t("auth_phone")||'Phone'} value={form.phone} onChange={(e)=>setForm({ ...form, phone: e.target.value })} error={fieldErr.phone} required autoComplete="tel" placeholder="+91 98765 43210" />
            </div>

            <FloatingField id="reg-email" label={t("auth_email")||'Email address'} type="email" value={form.email} onChange={(e)=>setForm({ ...form, email: e.target.value })} error={fieldErr.email} required autoComplete="email" placeholder="you@email.com" />

            <div className="grid md:grid-cols-2 gap-4">
              <FloatingField id="reg-password" label={t("auth_password")||'Password'} type={showPw?'text':'password'} value={form.password} onChange={(e)=>setForm({ ...form, password: e.target.value })} error={fieldErr.password} required autoComplete="new-password" placeholder="••••••••" rightSlot={<EyeBtn show={showPw} onToggle={()=>setShowPw(!showPw)} />} />
              <FloatingField id="reg-confirm" label={t("auth_confirm")||'Confirm password'} type={showConfirm?'text':'password'} value={form.confirm} onChange={(e)=>setForm({ ...form, confirm: e.target.value })} error={fieldErr.confirm} required autoComplete="new-password" placeholder="••••••••" rightSlot={<EyeBtn show={showConfirm} onToggle={()=>setShowConfirm(!showConfirm)} />} />
            </div>

            {/* strength */}
            <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl px-3.5 py-3 flex items-center gap-3">
              <div className="flex-1 h-2 bg-white rounded-full overflow-hidden border border-[#e7e5e4]">
                <div className={`h-full ${strengthColor} transition-all duration-300`} style={{ width: `${strength}%` }} />
              </div>
              <span className={`text-xs font-black px-2.5 py-1 rounded-full border ${strength<30?'bg-red-50 text-red-700 border-red-200':strength<60?'bg-amber-50 text-amber-800 border-amber-200':strength<85?'bg-emerald-50 text-emerald-700 border-emerald-200':'bg-[#0a2e1f] text-white border-[#0a2e1f]'}`}>{t("auth_strength")||strengthLabel} • {strength}%</span>
            </div>

            {/* address collapsible - preserve logic */}
            <div className="rounded-2xl border border-[#e7e5e4] overflow-hidden bg-[#fdfbf7]">
              <button type="button" onClick={()=>setShowAddress(!showAddress)} className="w-full flex items-center justify-between px-4 py-3 text-sm font-black hover:bg-white transition">
                <span className="flex items-center gap-2"><span className="w-7 h-7 rounded-full bg-white border grid place-items-center text-xs">📍</span> {t("auth_where_deliver")||'Delivery address'} <span className="text-xs font-bold text-[#a8a29e] hidden sm:inline">(optional — add later in checkout)</span></span>
                <span className={`w-7 h-7 rounded-full grid place-items-center border text-xs transition ${showAddress?'bg-[#0a2e1f] text-white border-[#0a2e1f] rotate-180':'bg-white text-[#57534e]'}`}>⌄</span>
              </button>
              {showAddress && (
                <div className="px-4 pb-4 space-y-3 border-t border-[#e7e5e4] bg-white">
                  <div className="flex justify-end pt-3">
                    <button type="button" onClick={getLocation} className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-full font-black hover:bg-emerald-700 transition">📍 {t("auth_use_location")||'Use my location'}</button>
                  </div>
                  <input placeholder={t("auth_street_house")||'Street / House no.'} value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} className={inputCls} />
                  <div className="grid md:grid-cols-2 gap-3">
                    <input placeholder={t("auth_city")||'City'} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputCls} />
                    <input placeholder={t("auth_state")||'State'} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className={inputCls} />
                    <input placeholder={t("auth_postal")||'Postal code'} value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} className={inputCls} />
                    <input placeholder={t("auth_country")||'Country'} value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className={inputCls} />
                  </div>
                </div>
              )}
            </div>

            <label className={`flex gap-2.5 text-xs leading-4 rounded-2xl p-3 border cursor-pointer select-none ${fieldErr.terms?'bg-red-50 border-red-200':'bg-[#f6f7f4] border-[#e7e5e4]'}`}>
              <input type="checkbox" checked={form.terms} onChange={(e)=>setForm({ ...form, terms: e.target.checked })} className="mt-0.5 w-4 h-4 rounded border-2 accent-emerald-600" />
              <span className="text-[#57534e]"><span className="font-bold text-[#1c1917]">I agree to the <Link to="/terms" className="underline decoration-emerald-300">Terms</Link> & <Link to="/privacy" className="underline decoration-emerald-300">Privacy</Link></span> — we’ll care for your data like our seedlings. No spam, WhatsApp only for order & care updates.</span>
            </label>
            {fieldErr.terms && <p className="text-xs font-semibold text-red-600 -mt-2">{fieldErr.terms}</p>}

            <button disabled={loading} className="w-full bg-[#0a2e1f] text-white py-3.5 rounded-full font-black text-sm hover:bg-black transition disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-emerald-900/10 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200">
              {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" /> {t("auth_creating")||'Creating account…'} </> : <>{t("auth_create_account_btn")||'Create account'} <span aria-hidden="true">→</span></>}
            </button>

            <p className="text-center text-sm text-[#57534e]">
              {t("auth_have_account")||'Already have an account?'} <Link to="/login" className="font-black text-emerald-700 hover:text-emerald-800 underline decoration-emerald-200 underline-offset-4">{t("auth_sign_in")||'Sign in'}</Link>
            </p>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[#e7e5e4]" />
              <span className="text-[11px] font-black tracking-widest uppercase text-[#a8a29e]">Secure</span>
              <div className="flex-1 h-px bg-[#e7e5e4]" />
            </div>
            <div className="flex gap-2 text-center text-xs">
              <span className="flex-1 bg-[#f6f7f4] border border-[#e7e5e4] rounded-xl py-2 font-bold text-[#57534e]">🔒 Encrypted</span>
              <span className="flex-1 bg-[#f6f7f4] border border-[#e7e5e4] rounded-xl py-2 font-bold text-[#57534e]">🌿 No spam</span>
              <span className="flex-1 bg-amber-50 border border-amber-200 rounded-xl py-2 font-bold text-amber-900">2hr support</span>
            </div>
          </form>
        </div>

        <p className="mt-4 text-center text-[11px] leading-4 text-[#a8a29e]">By creating an account you agree to GreenNest care updates via email/WhatsApp. You can mute anytime in Dashboard.</p>
      </div>
    </div>
  );
}
