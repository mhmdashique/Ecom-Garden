import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../components/Toast";
import { useLanguage } from "../context/LanguageContext";

const SHIPPING_THRESHOLD = 399;
const SHIPPING_FEE = 49;

/* floating input — premium apple-like */
function FloatingInput({ label, value, onChange, type = "text", required, placeholder, ...rest }) {
  const hasValue = String(value ?? "").length > 0;
  return (
    <div className="relative group">
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder=" "
        required={required}
        className="peer w-full bg-white/70 backdrop-blur border border-[#0a2e1f]/10 rounded-[16px] px-4 pt-6 pb-2.5 text-[14px] font-medium text-[#0a2e1f] placeholder-transparent focus:bg-white focus:border-emerald-300 focus:shadow-[0_8px_20px_rgba(16,185,129,0.08)] outline-none transition"
        {...rest}
      />
      <label
        className={`absolute left-4 transition-all duration-200 pointer-events-none
        ${hasValue || "peer-focus:top-2 peer-focus:text-[10px] peer-focus:font-black peer-focus:tracking-[0.12em] peer-focus:uppercase peer-focus:text-emerald-700"}
        ${hasValue ? "top-2 text-[10px] font-black tracking-[0.12em] uppercase text-[#0a2e1f]/45" : "top-1/2 -translate-y-1/2 text-[13px] font-medium text-[#0a2e1f]/40 peer-focus:-translate-y-0"}
        `}
      >
        {label}
      </label>
    </div>
  );
}

function FloatingTextarea({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={onChange}
        placeholder=" "
        rows={rows}
        className="peer w-full bg-white/70 backdrop-blur border border-[#0a2e1f]/10 rounded-[16px] px-4 pt-6 pb-3 text-[13px] font-medium text-[#0a2e1f] placeholder-transparent focus:bg-white focus:border-emerald-300 outline-none transition resize-none"
      />
      <label className="absolute left-4 top-2 text-[10px] font-black tracking-[0.12em] uppercase text-[#0a2e1f]/45 pointer-events-none">
        {label}
      </label>
    </div>
  );
}

export default function Checkout() {
  const { cart, total, clear } = useCart();
  const { user } = useAuth();
  const nav = useNavigate();
  const { success, error: toastError } = useToast();
  const { t } = useLanguage();
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
  });
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [payment, setPayment] = useState("COD");
  const [placing, setPlacing] = useState(false);
  const [done, setDone] = useState(null);
  const [ownerReplied, setOwnerReplied] = useState(false);
  const [savedAddrs, setSavedAddrs] = useState([]);
  const [selectedAddrId, setSelectedAddrId] = useState(null);

  useEffect(() => {
    if (user) {
      api
        .get("/users/profile")
        .then((r) => {
          const data = r.data;
          if (data.phone) setPhone(data.phone);
          if (data.addresses?.length) {
            setSavedAddrs(data.addresses);
            const def =
              data.addresses.find((a) => a.is_default) || data.addresses[0];
            if (def) {
              setAddress({
                street: def.street || "",
                city: def.city || "",
                state: def.state || "",
                postal_code: def.postal_code || "",
                country: def.country || "India",
              });
              setSelectedAddrId(def.id);
            }
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const getWholesaleUnit = (base, qty, isWholesale) => {
    if (!isWholesale && qty < 10) return base;
    let d = 0;
    if (qty >= 100) d = 0.2;
    else if (qty >= 50) d = 0.15;
    else if (qty >= 25) d = 0.1;
    else if (qty >= 10) d = 0.05;
    return Math.round(base * (1 - d));
  };
  const calcItem = (c) => {
    const base = c.basePrice || c.price;
    const unit = getWholesaleUnit(base, c.quantity, c.isWholesale);
    return {
      base,
      unit,
      subtotal: unit * c.quantity,
      saving: (base - unit) * c.quantity,
    };
  };
  const wholesaleTotal = cart.reduce((s, c) => s + calcItem(c).subtotal, 0);
  const wholesaleSaving = cart.reduce((s, c) => s + calcItem(c).saving, 0);
  const shipping = wholesaleTotal >= SHIPPING_THRESHOLD || cart.length === 0 ? 0 : SHIPPING_FEE;
  const grand = wholesaleTotal + shipping;
  const isFreeShipping = shipping === 0 && cart.length > 0;

  const selectSaved = (a) => {
    setSelectedAddrId(a.id);
    setAddress({
      street: a.street || "",
      city: a.city || "",
      state: a.state || "",
      postal_code: a.postal_code || "",
      country: a.country || "India",
    });
    success(`Address selected: ${a.label || a.street}`);
  };

  const getLocation = () => {
    if (!navigator.geolocation) return toastError("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      try {
        const r = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
        );
        const d = await r.json();
        const a = d.address || {};
        setAddress({
          street: a.road || "",
          city: a.city || a.town || a.village || "",
          state: a.state || "",
          postal_code: a.postcode || "",
          country: a.country || "India",
        });
        success("Location filled");
      } catch {
        toastError("Fill manually — reverse geocode failed");
      }
    });
  };

  const placeOrder = async () => {
    if (!address.street || !address.city || !address.postal_code)
      return toastError("Fill address — street, city & postal code required");
    if (!phone) return toastError("Enter phone for owner contact");
    if (cart.length === 0) return toastError(t("checkout_cart_empty_title"));
    setPlacing(true);
    try {
      const payload = {
        address,
        items: cart.map((c) => {
          const { unit } = calcItem(c);
          return {
            plant_id: c.id,
            quantity: c.quantity,
            price: unit,
            name: c.name,
            isWholesale: c.isWholesale,
            basePrice: c.basePrice || c.price,
          };
        }),
        total: grand,
        payment_method: payment,
        note,
        customer_phone: phone,
      };
      const res = await api.post("/orders", payload);
      clear();
      setDone(res.data);
      success("Order placed — owner notified on WhatsApp");
      try{ window.dispatchEvent(new CustomEvent('show-ai-feature',{detail:{source:'order_complete'}})); }catch{}
      setTimeout(() => setOwnerReplied(false), 800);
    } catch (e) {
      toastError(e.response?.data?.error || "Failed - login required");
      nav("/login");
    } finally {
      setPlacing(false);
    }
  };

  const simulateOwnerReply = async () => {
    if (!done) return;
    setOwnerReplied(true);
  };

  if (cart.length === 0 && !done)
    return (
      <div className="min-h-[60vh] bg-[#fdfbf7] relative overflow-hidden grid place-items-center px-4 py-10">
        <div className="pointer-events-none absolute -top-24 -right-24 w-[520px] h-[520px] bg-[#e8f0e3] rounded-full blur-[80px] opacity-60" />
        <div className="relative bg-white/70 backdrop-blur-2xl border border-white/60 rounded-[24px] p-8 text-center max-w-md shadow-[0_20px_60px_rgba(10,46,31,0.08)]">
          <div className="w-14 h-14 rounded-full bg-amber-100 border border-amber-200 grid place-items-center text-xl mx-auto">🛒</div>
          <h3 className="font-[Outfit] font-black mt-3 text-[#0a2e1f] text-lg">{t("checkout_cart_empty_title")}</h3>
          <p className="text-sm text-[#0a2e1f]/60">{t("checkout_cart_empty_desc")}</p>
          <Link
            to="/shop"
            className="inline-block mt-4 bg-[#0a2e1f] text-white px-6 py-2.5 rounded-full text-sm font-black shadow-md"
          >
            {t("checkout_go_shopping")}
          </Link>
        </div>
      </div>
    );

  if (done) {
    return (
      <div className="bg-[#fdfbf7] min-h-[85vh] px-4 py-8 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-x-0 top-0 h-[360px] bg-gradient-to-b from-[#e8f0e3]/50 to-transparent" />
          <div className="absolute -top-20 right-0 w-[600px] h-[600px] bg-emerald-100/30 rounded-full blur-[70px]" />
        </div>
        <div className="relative max-w-[760px] mx-auto">
          <div className="bg-white/75 backdrop-blur-2xl rounded-[28px] border border-white/60 p-6 md:p-8 shadow-[0_24px_64px_rgba(10,46,31,0.10)]">
            {/* steps */}
            <div className="flex items-center gap-2 text-[11px] font-black tracking-[0.12em] uppercase">
              <span className={`w-7 h-7 rounded-full grid place-items-center shrink-0 border shadow-sm ${ownerReplied ? "bg-emerald-600 text-white border-emerald-600" : "bg-[#0a2e1f] text-white border-[#0a2e1f]"}`}>
                {ownerReplied ? "✓" : "1"}
              </span>
              <span className={ownerReplied ? "text-emerald-700" : "text-[#0a2e1f]"}>{t("checkout_order_placed")}</span>
              <span className={`flex-1 h-px ${ownerReplied ? "bg-emerald-200" : "bg-[#0a2e1f]/10"}`}></span>
              <span className={`w-7 h-7 rounded-full grid place-items-center shrink-0 border shadow-sm ${ownerReplied ? "bg-emerald-600 text-white border-emerald-600" : "bg-amber-500 text-white border-amber-500 animate-pulse"}`}>2</span>
              <span className={ownerReplied ? "text-emerald-700" : "text-amber-700"}>{t("checkout_owner_notified")}</span>
              <span className="flex-1 h-px bg-[#0a2e1f]/10"></span>
              <span className={`w-7 h-7 rounded-full grid place-items-center shrink-0 border ${ownerReplied ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-[#0a2e1f]/30 border-[#0a2e1f]/10"}`}>3</span>
              <span className={ownerReplied ? "text-emerald-700" : "text-[#0a2e1f]/30"}>{t("checkout_confirmed")}</span>
            </div>

            {!ownerReplied ? (
              <div className="mt-8 text-center">
                <div className="w-16 h-16 rounded-[18px] bg-gradient-to-br from-amber-100 to-white border border-amber-200 grid place-items-center text-2xl mx-auto shadow-sm">
                  📲
                </div>
                <h2 className="mt-4 font-[Outfit] text-[22px] md:text-[24px] font-black leading-tight tracking-[-0.02em] text-[#0a2e1f]">
                  {t("checkout_order_sent")}
                </h2>
                <p className="mt-2 text-sm text-[#0a2e1f]/60 leading-6">
                  {t("checkout_order_id")} <span className="font-mono font-black text-[#0a2e1f]">#{done.id}</span> • ₹{done.total_amount} • {done.payment_method} • {done.items?.length} items
                  <br />
                  <span className="text-xs bg-white border border-[#0a2e1f]/10 rounded-full px-3 py-1 inline-flex items-center gap-1 mt-2">
                    Subtotal ₹{Number(done.subtotal || 0).toFixed(2)} • Shipping{" "}
                    {Number(done.shipping || 0) === 0 ? <span className="text-emerald-700 font-black">FREE</span> : `₹${Number(done.shipping).toFixed(2)}`}
                  </span>
                  <br />
                  <span className="text-xs">{t("checkout_notification_sent")}</span>
                </p>
                <div className="mt-4 bg-amber-50/70 border border-amber-200 rounded-2xl p-4 text-left text-sm backdrop-blur">
                  <div className="font-black text-amber-900">{t("checkout_what_next")}</div>
                  <ol className="list-decimal ml-5 mt-1 space-y-1 text-[#0a2e1f]/70 font-medium">
                    <li>{t("checkout_step1")}</li>
                    <li>{t("checkout_step2")}</li>
                    <li>{t("checkout_step3")}</li>
                  </ol>
                </div>
                <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href={`https://wa.me/919876543210?text=Hi Shaji’s Nursery and Gardens, order #${done.id} - please confirm`}
                    target="_blank"
                    className="bg-[#25D366] text-white px-6 py-3 rounded-full font-black text-sm shadow-[0_8px_20px_rgba(37,211,102,0.30)] hover:brightness-110 transition inline-flex items-center justify-center gap-2"
                  >
                    <span className="w-6 h-6 rounded-full bg-white/15 grid place-items-center text-xs">💬</span> {t("checkout_message_owner")}
                  </a>
                  <button
                    onClick={simulateOwnerReply}
                    className="bg-[#0a2e1f] text-white px-6 py-3 rounded-full font-black text-sm shadow-[0_8px_20px_rgba(10,46,31,0.18)] hover:bg-black transition"
                  >
                    {t("checkout_simulate")}
                  </button>
                </div>
                <p className="text-xs text-[#0a2e1f]/40 mt-3">
                  {t("checkout_copy_email")} {user?.email} • {t("checkout_cod_pay")}
                </p>
                <button
                  onClick={() => nav("/dashboard")}
                  className="mt-4 text-sm font-black text-emerald-700 hover:underline"
                >
                  {t("checkout_track_dashboard")}
                </button>
              </div>
            ) : (
              <div className="mt-8 text-center">
                <div className="w-16 h-16 rounded-[18px] bg-gradient-to-br from-emerald-100 to-white border border-emerald-200 grid place-items-center text-2xl mx-auto shadow-sm">✅</div>
                <h2 className="mt-4 font-[Outfit] text-[24px] font-black leading-tight tracking-[-0.02em] text-emerald-700">
                  {t("checkout_thank_you")}
                </h2>
                <p className="mt-2 text-sm text-[#0a2e1f]/60">{t("checkout_owner_replied")}</p>
                <div className="mt-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 text-sm text-left backdrop-blur">
                  <div className="font-black text-emerald-900">
                    {t("checkout_order_id")} #{done.id} • {t("checkout_confirmed")}
                  </div>
                  <div className="text-[#0a2e1f]/70 mt-1 font-medium">
                    {t("checkout_call_soon")} <span className="font-black text-[#0a2e1f]">{phone}</span> {t("checkout_within_2h")}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <span className="bg-white border border-emerald-200 px-3 py-1 rounded-full text-xs font-black text-emerald-800">{t("checkout_cod_badge")}</span>
                    <span className="bg-white border border-[#0a2e1f]/10 px-3 py-1 rounded-full text-xs font-bold">{t("checkout_total")} ₹{done.total_amount}</span>
                  </div>
                </div>
                <div className="mt-6 flex gap-3 justify-center">
                  <Link to="/shop" className="bg-[#0a2e1f] text-white px-7 py-3 rounded-full font-black text-sm shadow-md hover:bg-black transition">
                    {t("continue_shopping")}
                  </Link>
                  <Link to="/dashboard" className="bg-white border border-[#0a2e1f]/10 px-7 py-3 rounded-full font-bold text-sm hover:bg-[#f6f7f4] transition">
                    {t("checkout_view_order")}
                  </Link>
                </div>
              </div>
            )}
          </div>
          <p className="text-center text-xs text-[#0a2e1f]/35 mt-4 font-medium">{t("checkout_plant_note")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fdfbf7] min-h-[85vh] relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 inset-x-0 h-[380px] bg-gradient-to-b from-[#e8f0e3]/55 to-transparent" />
        <div className="absolute -top-16 right-[-60px] w-[600px] h-[600px] bg-emerald-100/35 rounded-full blur-[70px]" />
      </div>

      <div className="relative max-w-[1240px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-[Outfit] text-[28px] md:text-[32px] font-black tracking-[-0.03em] text-[#0a2e1f]">{t("checkout_title")}</h1>
            <p className="text-sm text-[#0a2e1f]/55 font-medium mt-1">{t("checkout_subtitle")}</p>
          </div>
          <Link to="/cart" className="hidden md:inline-flex items-center gap-1.5 text-sm font-bold bg-white border border-[#0a2e1f]/10 rounded-full px-5 py-2.5 hover:bg-white shadow-sm text-[#0a2e1f]">
            ← Back to Cart
          </Link>
        </div>

        <div className="mt-6 grid lg:grid-cols-[1.45fr_0.68fr] gap-6 items-start">
          <div className="space-y-4">
            {/* address */}
            <div className="bg-white/70 backdrop-blur-2xl rounded-[24px] border border-white/60 p-5 md:p-6 shadow-[0_12px_40px_rgba(10,46,31,0.06)] relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-[Outfit] font-black text-[16px] tracking-[-0.02em] text-[#0a2e1f] flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-[#0a2e1f] text-white grid place-items-center text-sm">⦿</span>
                  {t("delivery_address")}{" "}
                  <span className="text-xs font-medium text-[#0a2e1f]/40 normal-case tracking-normal">— {t("fetched_from_profile")}</span>
                </h3>
                <button
                  onClick={getLocation}
                  className="text-xs font-black tracking-widest uppercase bg-emerald-600 text-white px-4 py-2.5 rounded-full shadow-[0_6px_16px_rgba(16,185,129,0.24)] hover:bg-emerald-700 border border-emerald-600 flex items-center gap-1.5 shrink-0 transition"
                >
                  <span className="text-sm leading-none">📍</span> {t("use_current_location")}
                </button>
              </div>

              {savedAddrs.length > 0 && (
                <div className="mt-5">
                  <div className="text-[11px] font-black tracking-[0.14em] uppercase text-[#0a2e1f]/40 mb-2.5">{t("saved_addresses")}</div>
                  <div className="grid gap-2.5">
                    {savedAddrs.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => selectSaved(a)}
                        className={`text-left rounded-[16px] p-3.5 flex justify-between items-start gap-3 border-2 transition relative overflow-hidden ${selectedAddrId === a.id ? "border-emerald-500 bg-emerald-50/80 shadow-sm" : "border-[#0a2e1f]/5 bg-white/70 hover:bg-white hover:border-[#0a2e1f]/10"}`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-black tracking-widest uppercase bg-white border border-[#0a2e1f]/10 px-2.5 py-1 rounded-full text-[#0a2e1f] shadow-sm">
                              {a.label || "Home"}
                            </span>
                            {a.is_default && (
                              <span className="text-[10px] bg-[#0a2e1f] text-white px-2 py-1 rounded-full font-black tracking-wide">DEFAULT</span>
                            )}
                          </div>
                          <div className="text-sm font-bold mt-1.5 truncate text-[#0a2e1f]">{a.street}</div>
                          <div className="text-xs text-[#0a2e1f]/60 font-medium">
                            {a.city}, {a.state} {a.postal_code} • {a.country}
                          </div>
                        </div>
                        <span
                          className={`w-6 h-6 rounded-full border-2 grid place-items-center shrink-0 mt-1 transition ${selectedAddrId === a.id ? "bg-emerald-600 border-emerald-600 text-white shadow-sm" : "bg-white border-[#0a2e1f]/15 text-transparent"}`}
                        >
                          <span className="text-xs leading-none">✓</span>
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="text-xs text-[#0a2e1f]/40 mt-2 font-medium">{t("checkout_edit_below")}</div>
                </div>
              )}

              <div className="mt-5 grid md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <FloatingInput
                    label={`${t("street_house")} *`}
                    value={address.street}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    required
                  />
                </div>
                <FloatingInput label={`${t("city")} *`} value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} required />
                <FloatingInput label={t("state")} value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} />
                <FloatingInput label={`${t("postal_code")} *`} value={address.postal_code} onChange={(e) => setAddress({ ...address, postal_code: e.target.value })} required />
                <FloatingInput label={t("country")} value={address.country} onChange={(e) => setAddress({ ...address, country: e.target.value })} />
                <FloatingInput
                  label={`${t("phone_owner")} *`}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  type="tel"
                  required
                />
              </div>

              <div className="mt-3">
                <FloatingTextarea label={t("delivery_note")} value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
                <p className="text-[11px] text-[#0a2e1f]/40 mt-1.5 font-medium">Landmark, flat no., delivery time — e.g. “2nd floor, near Pezhummoodu junction”</p>
              </div>

              {!user && (
                <p className="text-xs font-medium text-amber-900 mt-3 bg-amber-50 border border-amber-200 rounded-2xl p-3">
                  Please{" "}
                  <Link to="/login" className="font-black underline decoration-amber-700">
                    {t("checkout_login_link")}
                  </Link>{" "}
                  {t("checkout_please_login")}
                </p>
              )}
            </div>

            {/* payment */}
            <div className="bg-white/70 backdrop-blur-2xl rounded-[24px] border border-white/60 p-5 md:p-6 shadow-[0_12px_40px_rgba(10,46,31,0.06)] relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
              <h3 className="font-[Outfit] font-black text-[16px] tracking-[-0.02em] text-[#0a2e1f] flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-[#0a2e1f] text-white grid place-items-center text-sm">₹</span>
                {t("checkout_payment_title")}
              </h3>
              <p className="text-xs text-[#0a2e1f]/55 mt-1 font-medium leading-5">{t("checkout_payment_desc")}</p>
              <div className="mt-4">
                <label className="flex gap-3 p-4 rounded-[20px] border-2 border-emerald-600 bg-emerald-50/80 backdrop-blur cursor-pointer shadow-sm relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
                  <input type="radio" checked={payment === "COD"} onChange={() => setPayment("COD")} className="mt-1 accent-emerald-600 w-4 h-4" />
                  <div className="flex-1 relative">
                    <div className="font-black text-sm flex items-center gap-2 text-[#0a2e1f]">
                      <span className="w-7 h-7 rounded-full bg-emerald-600 text-white grid place-items-center text-xs">✓</span>
                      💵 {t("cash_on_delivery")}{" "}
                      <span className="bg-emerald-600 text-white text-[10px] px-2.5 py-1 rounded-full tracking-widest font-black"> {t("recommended")}</span>
                    </div>
                    <div className="text-xs text-[#0a2e1f]/60 mt-1.5 leading-5 font-medium">{t("checkout_cod_desc")}</div>
                    <div className="mt-2.5 flex flex-wrap gap-2 text-xs">
                      <span className="bg-white border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-full font-bold flex items-center gap-1">🔒 {t("checkout_no_online")}</span>
                      <span className="bg-white border border-[#0a2e1f]/10 px-3 py-1.5 rounded-full font-medium text-[#0a2e1f]/60">{t("checkout_gst")}</span>
                    </div>
                  </div>
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white grid place-items-center text-xs shrink-0 mt-1 shadow-sm">✓</span>
                </label>
                <div className="mt-3 bg-[#f6f7f4]/80 backdrop-blur border border-[#0a2e1f]/5 rounded-2xl p-3 flex gap-2.5 text-xs leading-5">
                  <span className="w-7 h-7 rounded-full bg-white border border-[#0a2e1f]/10 grid place-items-center shrink-0 text-emerald-600">🔒</span>
                  <span className="text-[#0a2e1f]/60 font-medium">
                    <span className="font-black text-[#0a2e1f]">{t("how_it_works")}</span> {t("checkout_how_it_works_text")}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-amber-50/70 backdrop-blur border border-amber-200 rounded-[20px] p-4 flex gap-3 shadow-sm">
              <span className="w-9 h-9 rounded-full bg-white border border-amber-200 grid place-items-center shrink-0">🌿</span>
              <p className="text-xs leading-5 text-amber-900/80 font-medium">
                <span className="font-black text-amber-900">Note:</span> {t("checkout_note_cuttings")}
              </p>
            </div>
          </div>

          <div className="h-fit lg:sticky lg:top-[78px] space-y-4">
            <div className="bg-white/75 backdrop-blur-2xl rounded-[24px] border border-white/60 shadow-[0_20px_64px_rgba(10,46,31,0.10)] p-5 md:p-6 relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
              <h3 className="font-[Outfit] font-black text-[18px] tracking-[-0.02em] text-[#0a2e1f] flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-[#0a2e1f] text-white grid place-items-center text-sm">◈</span>
                {t("order_summary")}
              </h3>

              <div className="mt-4 max-h-[280px] overflow-auto pr-1 space-y-2.5 custom-scroll">
                {cart.map((c) => {
                  const { base, unit, subtotal } = calcItem(c);
                  const tier = c.isWholesale
                    ? c.quantity >= 100
                      ? "20%"
                      : c.quantity >= 50
                        ? "15%"
                        : c.quantity >= 25
                          ? "10%"
                          : c.quantity >= 10
                            ? "5%"
                            : ""
                    : "";
                  return (
                    <div key={`${c.id}-${c.variantId || ""}`} className="flex gap-3 border border-[#0a2e1f]/5 rounded-2xl p-2.5 bg-white/60 backdrop-blur">
                      <img src={encodeURI(c.images?.[0] || "")} alt={c.name} className="w-12 h-12 rounded-xl object-cover border border-white bg-[#f6f7f4] shrink-0 shadow-sm" />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm truncate flex items-center gap-1.5 text-[#0a2e1f]">
                          <span className="truncate">{c.name}</span>
                          {c.isWholesale && (
                            <span className="bg-[#0a2e1f] text-white text-[10px] px-2 py-0.5 rounded-full font-black shrink-0">
                              🏢 {t("pd_wholesale")} {tier && `• ${tier}`}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[#0a2e1f]/55 flex flex-wrap gap-1 items-center font-medium">
                          <span>{c.selectedVariant || "potted"} • ×{c.quantity}</span>
                          {c.isWholesale ? (
                            <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">• ₹{unit} {t("cart_each")} (was ₹{base})</span>
                          ) : (
                            <span>• ₹{unit} {t("cart_each")}</span>
                          )}
                        </div>
                      </div>
                      <div className="font-black text-sm text-right shrink-0 text-[#0a2e1f]">
                        <div>₹{subtotal.toFixed(2)}</div>
                        {c.isWholesale && base !== unit && <div className="text-xs text-emerald-700 font-bold">save ₹{(base - unit) * c.quantity}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 space-y-2.5 text-sm">
                <div className="flex justify-between py-1">
                  <span className="text-[#0a2e1f]/55 font-medium">
                    {t("subtotal")} ({cart.length} {t("cart_items")})
                  </span>
                  <span className="font-black text-[#0a2e1f]">₹{wholesaleTotal.toFixed(2)}</span>
                </div>
                {wholesaleSaving > 0 && (
                  <div className="flex justify-between items-center text-emerald-800 bg-emerald-50/80 border border-emerald-200 rounded-2xl px-3.5 py-2.5">
                    <span className="font-bold text-xs flex items-center gap-1">🏢 {t("cart_wholesale_saving")}</span>
                    <span className="font-black">-₹{wholesaleSaving.toFixed(2)}</span>
                  </div>
                )}
                {cart.some((c) => c.isWholesale) && (
                  <div className="bg-amber-50/80 border border-amber-200 rounded-2xl px-3 py-2 text-xs flex gap-2">
                    <span className="text-amber-600">💡</span>
                    <span className="text-amber-900/80 font-medium">
                      <span className="font-black">Note:</span> {t("cart_note_wholesale")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center py-1">
                  <span className="text-[#0a2e1f]/55 font-medium flex items-center gap-1.5">
                    {t("shipping")}
                    {isFreeShipping && <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">FREE</span>}
                  </span>
                  <span className={`font-black ${isFreeShipping ? "text-emerald-700" : "text-[#0a2e1f]"}`}>
                    {isFreeShipping ? (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="line-through text-[#0a2e1f]/25 text-xs">₹{SHIPPING_FEE}</span> FREE
                      </span>
                    ) : (
                      `₹${SHIPPING_FEE}`
                    )}
                  </span>
                </div>
                {!isFreeShipping && (
                  <div className="text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                    Add ₹{(SHIPPING_THRESHOLD - wholesaleTotal).toFixed(0)} more for <span className="font-black">FREE</span> delivery
                  </div>
                )}
                <div className="flex justify-between text-emerald-700 bg-emerald-50/60 border border-emerald-100 rounded-xl px-3 py-2">
                  <span className="font-bold text-xs">{t("checkout_cod_label")}</span>
                  <span className="font-black text-xs">{t("checkout_pay_on_delivery")}</span>
                </div>
                <div className="border-t border-[#0a2e1f]/10 pt-3 flex justify-between text-[18px] font-black tracking-tight">
                  <span className="font-[Outfit] text-[#0a2e1f]">{t("total")}</span>
                  <span className="font-[Outfit] text-[#0a2e1f]">₹{grand.toFixed(2)}</span>
                </div>
                <p className="text-[11px] leading-4 text-[#0a2e1f]/40 font-medium">
                  {t("checkout_inclusive")} {wholesaleSaving > 0 && t("checkout_wholesale_discount")}
                </p>
              </div>

              <button
                onClick={placeOrder}
                disabled={placing}
                className="w-full mt-5 bg-[#0a2e1f] text-white py-[15px] rounded-full font-black text-[13.5px] tracking-wide shadow-[0_12px_28px_rgba(10,46,31,0.22)] hover:bg-black hover:shadow-[0_16px_36px_rgba(10,46,31,0.28)] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {placing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> {t("checkout_placing")}
                  </>
                ) : (
                  <>
                    {t("place_order")}
                    <span className="w-7 h-7 rounded-full bg-white text-[#0a2e1f] grid place-items-center text-sm">→</span>
                  </>
                )}
              </button>
              <p className="text-center text-xs text-[#0a2e1f]/40 mt-2 font-medium">{t("checkout_by_placing")}</p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px] font-bold leading-tight">
                <span className="bg-[#f6f7f4]/80 border border-[#0a2e1f]/5 rounded-2xl py-2.5 flex flex-col items-center gap-1">
                  <span>🔒</span> {t("checkout_safe")}
                </span>
                <span className="bg-[#f6f7f4]/80 border border-[#0a2e1f]/5 rounded-2xl py-2.5 flex flex-col items-center gap-1">
                  <span>↩️</span> {t("checkout_replace")}
                </span>
                <span className="bg-[#f6f7f4]/80 border border-[#0a2e1f]/5 rounded-2xl py-2.5 flex flex-col items-center gap-1">
                  <span>💬</span> {t("checkout_owner_call")}
                </span>
              </div>
            </div>

            <div className="bg-[#0a2e1f] text-white rounded-[20px] p-4 flex gap-3 shadow-[0_12px_32px_rgba(10,46,31,0.18)] border border-white/5 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
              <span className="relative w-10 h-10 rounded-full bg-white/10 border border-white/10 grid place-items-center shrink-0 backdrop-blur">📲</span>
              <div className="relative">
                <div className="font-black text-sm tracking-wide">{t("checkout_owner_mobile_title")}</div>
                <div className="text-xs text-white/70 font-medium leading-5">{t("checkout_owner_mobile_desc")}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
