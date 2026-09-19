import { useState } from "react";
import { useCart } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

const SHIPPING_THRESHOLD = 399;
const SHIPPING_FEE = 49;

const getWholesaleUnit = (base, qty, isWholesale) => {
  if (!isWholesale && qty < 10) return base;
  let d = 0;
  if (qty >= 100) d = 0.2;
  else if (qty >= 50) d = 0.15;
  else if (qty >= 25) d = 0.1;
  else if (qty >= 10) d = 0.05;
  return Math.round(base * (1 - d));
};

export default function Cart() {
  const { cart, update, remove } = useCart();
  const { t } = useLanguage();
  const nav = useNavigate();
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);

  const itemCount = cart.reduce((s, c) => s + c.quantity, 0);
  const calcItem = (c) => {
    const base = c.basePrice || c.price;
    const unit = getWholesaleUnit(base, c.quantity, c.isWholesale);
    const saving = (base - unit) * c.quantity;
    return { base, unit, subtotal: unit * c.quantity, saving };
  };
  const total = cart.reduce((s, c) => s + calcItem(c).subtotal, 0);
  const savings = cart.reduce((s, c) => s + calcItem(c).saving, 0);
  const wholesaleSaving = cart
    .filter((c) => c.isWholesale || c.quantity >= 10)
    .reduce((s, c) => s + calcItem(c).saving, 0);

  const shipping = total >= SHIPPING_THRESHOLD || cart.length === 0 ? 0 : SHIPPING_FEE;
  const grand = total + shipping;
  const remaining = Math.max(0, SHIPPING_THRESHOLD - total);
  const progress = Math.min(100, (total / SHIPPING_THRESHOLD) * 100);
  const isFreeShipping = shipping === 0 && cart.length > 0;

  const handleCoupon = () => {
    if (!coupon.trim()) return;
    setCouponApplied(true);
  };

  if (cart.length === 0)
    return (
      <div className="min-h-[72vh] bg-[#fdfbf7] relative overflow-hidden flex items-center justify-center px-4 py-12">
        {/* soft blobs */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-[520px] h-[520px] bg-[#e8f0e3] rounded-full blur-[90px] opacity-60" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 w-[560px] h-[560px] bg-emerald-50 rounded-full blur-[80px] opacity-70" />
        <div className="relative w-full max-w-[560px]">
          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-[32px] shadow-[0_24px_64px_rgba(10,46,31,0.10)] p-8 md:p-10 text-center">
            <div className="mx-auto w-[112px] h-[112px] rounded-[28px] bg-gradient-to-br from-[#e8f0e3] to-white border border-white shadow-[0_12px_32px_rgba(10,46,31,0.08)] grid place-items-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent" />
              <span className="text-[48px] leading-none drop-shadow-sm">🪴</span>
              <span className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#0a2e1f] text-white grid place-items-center text-sm shadow-md border-2 border-white">✦</span>
            </div>
            <h2 className="mt-6 font-[Outfit] text-[26px] md:text-[28px] font-black tracking-[-0.03em] text-[#0a2e1f]">
              {t("cart_empty_title")}
            </h2>
            <p className="mt-2 text-[13.5px] leading-6 text-[#0a2e1f]/60 max-w-[36ch] mx-auto">
              {t("cart_empty_desc")}
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/shop"
                className="inline-flex items-center justify-center gap-2 bg-[#0a2e1f] text-white px-8 py-3.5 rounded-full font-black text-sm tracking-wide shadow-[0_12px_28px_rgba(10,46,31,0.22)] hover:bg-black hover:shadow-[0_16px_36px_rgba(10,46,31,0.26)] transition-all"
              >
                <span className="text-emerald-300">🌱</span> {t("cart_go_shopping")}
              </Link>
              <Link
                to="/"
                className="inline-flex items-center justify-center bg-white/80 backdrop-blur border border-[#0a2e1f]/10 px-8 py-3.5 rounded-full font-bold text-sm text-[#0a2e1f] hover:bg-white hover:border-[#0a2e1f]/15 shadow-sm transition"
              >
                {t("cart_back_home")}
              </Link>
            </div>
            <div className="mt-6 inline-flex items-center gap-2 text-[11px] font-medium text-[#0a2e1f]/45 bg-[#f6f7f4] border border-[#0a2e1f]/5 rounded-full px-3 py-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Free WhatsApp care • COD available
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <div className="bg-[#fdfbf7] min-h-[85vh] relative overflow-hidden">
      {/* bg washes */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 inset-x-0 h-[420px] bg-gradient-to-b from-[#e8f0e3]/55 via-[#fdfbf7]/60 to-transparent" />
        <div className="absolute -top-28 right-[-80px] w-[680px] h-[680px] bg-emerald-100/40 rounded-full blur-[80px]" />
        <div className="absolute top-[360px] left-[-120px] w-[520px] h-[520px] bg-[#e8f0e3]/50 rounded-full blur-[70px]" />
      </div>

      <div className="relative max-w-[1240px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 pb-28 lg:pb-8">
        {/* header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-[Outfit] text-[28px] md:text-[34px] font-black tracking-[-0.03em] text-[#0a2e1f] flex flex-wrap items-baseline gap-3">
              {t("cart_title")}
              <span className="font-medium text-[#0a2e1f]/45 text-[15px] tracking-normal">
                ({itemCount} {itemCount === 1 ? t("cart_item") : t("cart_items")})
              </span>
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2.5">
              {savings > 0 ? (
                <span className="inline-flex items-center gap-1.5 bg-emerald-600 text-white text-xs font-black tracking-wide px-3.5 py-1.5 rounded-full shadow-[0_6px_16px_rgba(16,185,129,0.25)]">
                  <span className="w-5 h-5 rounded-full bg-white/15 grid place-items-center text-[11px]">✦</span>
                  {t("cart_save_msg")} ₹{savings.toFixed(0)} {t("cart_on_order")}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 bg-white/70 backdrop-blur border border-[#0a2e1f]/10 text-[#0a2e1f]/60 text-xs font-bold px-3.5 py-1.5 rounded-full">
                  🌿 {t("cart_secure_checkout")}
                </span>
              )}
              {isFreeShipping ? (
                <span className="inline-flex items-center gap-1.5 bg-[#0a2e1f] text-white text-xs font-black px-3 py-1.5 rounded-full shadow-sm">
                  ✓ Free delivery unlocked
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold px-3 py-1.5 rounded-full">
                  Add ₹{remaining.toFixed(0)} more for <span className="font-black">FREE</span> delivery
                </span>
              )}
            </div>
          </div>
          <Link
            to="/shop"
            className="hidden md:inline-flex items-center gap-1.5 text-sm font-bold border border-[#0a2e1f]/10 bg-white/70 backdrop-blur px-5 py-2.5 rounded-full hover:bg-white hover:border-[#0a2e1f]/15 hover:shadow-sm text-[#0a2e1f] transition"
          >
            <span className="text-base leading-none">←</span> {t("cart_continue")}
          </Link>
        </div>

        {/* free shipping progress */}
        <div className="mt-5 bg-white/60 backdrop-blur-xl border border-white/60 rounded-[20px] p-3.5 md:p-4 shadow-[0_8px_30px_rgba(10,46,31,0.06)]">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="font-bold tracking-wide text-[#0a2e1f]/70 flex items-center gap-2">
              <span className={`w-7 h-7 rounded-full grid place-items-center text-sm border ${isFreeShipping ? "bg-emerald-600 text-white border-emerald-600" : "bg-white border-[#0a2e1f]/10 text-[#0a2e1f]/60"}`}>{isFreeShipping ? "✓" : "🚚"}</span>
              {isFreeShipping ? "You’ve unlocked FREE delivery" : `₹${total.toFixed(0)} of ₹${SHIPPING_THRESHOLD} — add ₹${remaining.toFixed(0)} more`}
            </span>
            <span className="hidden sm:inline text-[11px] font-bold tracking-widest uppercase text-[#0a2e1f]/40">Free over ₹{SHIPPING_THRESHOLD}</span>
          </div>
          <div className="mt-3 h-2 bg-[#0a2e1f]/5 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-700 ${isFreeShipping ? "bg-emerald-600" : "bg-[#0a2e1f]"}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-6 grid lg:grid-cols-[1.35fr_0.62fr] gap-6 items-start">
          {/* items */}
          <div className="space-y-3.5">
            {cart.map((item) => {
              const { base, unit, subtotal, saving } = calcItem(item);
              const tier = item.isWholesale
                ? item.quantity >= 100
                  ? "20%"
                  : item.quantity >= 50
                    ? "15%"
                    : item.quantity >= 25
                      ? "10%"
                      : item.quantity >= 10
                        ? "5%"
                        : ""
                : "";
              return (
                <div
                  key={`${item.id}-${item.variantId || ""}`}
                  className="group relative bg-white/65 backdrop-blur-xl border border-white/60 rounded-[22px] p-3.5 md:p-4 flex gap-3.5 md:gap-4 shadow-[0_8px_30px_rgba(10,46,31,0.06)] hover:shadow-[0_16px_40px_rgba(10,46,31,0.10)] hover:border-white hover:bg-white/80 transition-all"
                >
                  <Link to={`/plant/${item.id}`} className="shrink-0 relative">
                    <img
                      src={encodeURI(item.images?.[0] || "")}
                      alt={item.name}
                      className="w-[84px] h-[84px] md:w-[96px] md:h-[96px] object-cover rounded-[18px] border border-white shadow-sm bg-[#f6f7f4]"
                    />
                    {saving > 0 && (
                      <span className="absolute -top-1.5 -left-1.5 bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md border border-white">
                        Save ₹{saving.toFixed(0)}
                      </span>
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex gap-2 items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <Link
                          to={`/plant/${item.id}`}
                          className="font-[Outfit] font-extrabold text-[14.5px] md:text-[15.5px] leading-tight tracking-[-0.02em] text-[#0a2e1f] hover:underline line-clamp-1"
                        >
                          {item.name}
                        </Link>
                        <div className="mt-1 flex flex-wrap gap-1.5 items-center">
                          <span className="inline-flex items-center gap-1 bg-[#f6f7f4] border border-[#0a2e1f]/5 rounded-full px-2.5 py-1 text-[11px] font-medium text-[#0a2e1f]/60">
                            {(item.selectedVariant || item.sunlight || "Potted")} • {t("pd_in_stock")}
                          </span>
                          {item.isWholesale && (
                            <span className="bg-[#0a2e1f] text-white text-[10px] px-2.5 py-1 rounded-full font-black tracking-wide inline-flex items-center gap-1">
                              🏢 {t("cart_wholesale_badge")} {tier && `• ${tier} ${t("cart_off")}`}
                            </span>
                          )}
                        </div>
                        <div className="mt-2 flex items-baseline gap-2 flex-wrap">
                          <span className="font-black text-[16px] tracking-tight text-[#0a2e1f]">₹{unit.toFixed(2)}</span>
                          {item.isWholesale && base !== unit && (
                            <span className="text-xs line-through text-[#0a2e1f]/35 font-medium">₹{base.toFixed(2)}</span>
                          )}
                          {!item.isWholesale && item.discount_price && (
                            <span className="text-xs line-through text-[#0a2e1f]/35">₹{item.price.toFixed(2)}</span>
                          )}
                          <span className="text-[11px] font-bold tracking-wide text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            {item.quantity} × ₹{unit} {t("cart_each")}
                          </span>
                        </div>
                        {item.isWholesale && tier && (
                          <div className="text-[11px] font-medium text-[#0a2e1f]/55 mt-1">
                            {t("cart_business_pricing")} <span className="font-black text-emerald-700">{tier} {t("cart_off")}</span> • {t("cart_more_qty")}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => remove(item.id)}
                        aria-label="Remove"
                        className="w-8 h-8 rounded-full bg-white border border-[#0a2e1f]/10 grid place-items-center text-[#0a2e1f]/40 hover:bg-red-50 hover:border-red-200 hover:text-red-600 shrink-0 transition"
                      >
                        <span className="text-sm leading-none">✕</span>
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="flex items-center bg-[#0a2e1f]/5 border border-[#0a2e1f]/5 rounded-full p-1 backdrop-blur">
                        <button
                          onClick={() => update(item.id, item.quantity - 1)}
                          className="w-[32px] h-[32px] rounded-full bg-white border border-[#0a2e1f]/10 grid place-items-center text-sm font-bold text-[#0a2e1f] shadow-sm hover:bg-[#0a2e1f] hover:text-white hover:border-[#0a2e1f] disabled:opacity-30 disabled:cursor-not-allowed transition"
                          disabled={item.quantity <= 1}
                        >
                          −
                        </button>
                        <span className="w-10 text-center font-black text-[13px] text-[#0a2e1f]">{item.quantity}</span>
                        <button
                          onClick={() => update(item.id, item.quantity + 1)}
                          className="w-[32px] h-[32px] rounded-full bg-[#0a2e1f] text-white border border-[#0a2e1f] grid place-items-center text-sm font-bold shadow-sm hover:bg-black transition"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-black tracking-[0.12em] uppercase text-[#0a2e1f]/35">Subtotal</div>
                        <div className="font-black text-[15px] tracking-tight text-[#0a2e1f]">₹{subtotal.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="bg-white/60 backdrop-blur-xl rounded-[20px] border border-white/60 p-4 flex flex-wrap gap-3 items-center justify-between shadow-sm">
              <span className="text-[13px] font-medium text-[#0a2e1f]/60 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-100 grid place-items-center text-emerald-700 text-xs">🔒</span>
                {t("cart_secure_checkout")}
              </span>
              <Link to="/shop" className="text-sm font-black text-emerald-700 hover:text-[#0a2e1f] hover:underline">
                {t("cart_add_more_plants")} →
              </Link>
            </div>
          </div>

          {/* summary */}
          <div className="h-fit lg:sticky lg:top-[78px] space-y-4">
            <div className="bg-white/75 backdrop-blur-2xl rounded-[28px] border border-white/60 shadow-[0_20px_64px_rgba(10,46,31,0.10)] p-5 md:p-6 relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent" />
              <h3 className="font-[Outfit] font-black text-[18px] tracking-[-0.02em] text-[#0a2e1f] flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-[#0a2e1f] text-white grid place-items-center text-sm">◈</span>
                {t("cart_order_summary_title")}
              </h3>

              <div className="mt-4 space-y-2.5 text-sm">
                <div className="flex justify-between items-center py-2">
                  <span className="text-[#0a2e1f]/55 font-medium">
                    {t("cart_subtotal_items")} ({itemCount} {t("cart_items")})
                  </span>
                  <span className="font-black text-[#0a2e1f]">₹{total.toFixed(2)}</span>
                </div>

                {wholesaleSaving > 0 && (
                  <div className="flex justify-between items-center text-emerald-800 bg-emerald-50/80 backdrop-blur border border-emerald-200 rounded-2xl px-3.5 py-2.5 shadow-sm">
                    <span className="font-bold text-xs flex items-center gap-1.5">🏢 {t("cart_wholesale_saving")}</span>
                    <span className="font-black">-₹{wholesaleSaving.toFixed(2)}</span>
                  </div>
                )}

                {cart.some((c) => c.isWholesale) && (
                  <div className="bg-amber-50/80 border border-amber-200 rounded-2xl px-3 py-2.5 text-xs flex gap-2 leading-5">
                    <span className="text-amber-600 text-sm leading-none">💡</span>
                    <span className="text-amber-900/80">
                      <span className="font-black">Note:</span> {t("cart_note_wholesale")}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[#0a2e1f]/55 font-medium flex items-center gap-1.5">
                    {t("cart_delivery")}
                    {isFreeShipping && <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">FREE</span>}
                  </span>
                  <span className={`font-black ${isFreeShipping ? "text-emerald-700 line-through decoration-emerald-300" : "text-[#0a2e1f]"}`}>
                    {isFreeShipping ? (
                      <span className="inline-flex items-center gap-1">
                        <span className="line-through text-[#0a2e1f]/30">₹{SHIPPING_FEE}</span>
                        <span className="text-emerald-700 no-underline">FREE</span>
                      </span>
                    ) : (
                      `₹${SHIPPING_FEE}`
                    )}
                  </span>
                </div>

                {savings > 0 && !wholesaleSaving && (
                  <div className="flex justify-between text-emerald-700 font-bold text-xs bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
                    <span>{t("cart_savings")}</span>
                    <span className="font-black">-₹{savings.toFixed(2)}</span>
                  </div>
                )}

                {/* coupon */}
                <div className="pt-3">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0a2e1f]/30 text-sm">🏷</span>
                      <input
                        value={coupon}
                        onChange={(e) => {
                          setCoupon(e.target.value.toUpperCase());
                          setCouponApplied(false);
                        }}
                        placeholder={t("cart_coupon")}
                        className="w-full border border-[#0a2e1f]/10 rounded-full pl-9 pr-4 py-2.5 text-sm bg-[#f6f7f4]/70 focus:bg-white outline-none focus:border-emerald-300 focus:shadow-sm font-medium placeholder:text-[#0a2e1f]/35 transition"
                      />
                    </div>
                    <button
                      onClick={handleCoupon}
                      className={`px-5 rounded-full text-xs font-black tracking-widest uppercase border shadow-sm transition whitespace-nowrap ${couponApplied ? "bg-emerald-600 text-white border-emerald-600" : "bg-white border-[#0a2e1f]/10 text-[#0a2e1f] hover:bg-[#0a2e1f] hover:text-white"}`}
                    >
                      {couponApplied ? "✓ Applied" : t("cart_apply")}
                    </button>
                  </div>
                  {couponApplied && (
                    <div className="mt-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5 inline-flex items-center gap-1">
                      ✓ Coupon <span className="font-mono">{coupon}</span> applied — extra savings at checkout
                    </div>
                  )}
                </div>

                <div className="border-t border-[#0a2e1f]/10 pt-4 mt-3 flex justify-between items-baseline">
                  <span className="font-[Outfit] font-black text-[16px] tracking-tight text-[#0a2e1f]">{t("cart_total_label")}</span>
                  <span className="font-[Outfit] font-black text-[22px] tracking-tight text-[#0a2e1f]">₹{grand.toFixed(2)}</span>
                </div>
                <p className="text-[11px] leading-4 text-[#0a2e1f]/40 font-medium">
                  {t("cart_inclusive")} • {isFreeShipping ? "Free delivery over ₹399" : `₹${SHIPPING_FEE} shipping • Free over ₹${SHIPPING_THRESHOLD}`}
                </p>
              </div>

              <button
                onClick={() => nav("/checkout")}
                className="w-full mt-5 bg-[#0a2e1f] text-white py-[15px] rounded-full font-black text-[13.5px] tracking-wide shadow-[0_12px_28px_rgba(10,46,31,0.22)] hover:bg-black hover:shadow-[0_16px_36px_rgba(10,46,31,0.28)] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                {t("cart_proceed")}
                <span className="w-7 h-7 rounded-full bg-white text-[#0a2e1f] grid place-items-center text-sm">→</span>
              </button>

              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px] leading-tight font-bold">
                <span className="bg-[#f6f7f4]/80 backdrop-blur border border-[#0a2e1f]/5 rounded-2xl py-2.5 flex flex-col items-center gap-1">
                  <span className="text-sm">🔒</span> Secure<br />Payment
                </span>
                <span className="bg-[#f6f7f4]/80 backdrop-blur border border-[#0a2e1f]/5 rounded-2xl py-2.5 flex flex-col items-center gap-1">
                  <span className="text-sm">↩️</span> 14-day<br />Replace
                </span>
                <span className="bg-[#f6f7f4]/80 backdrop-blur border border-[#0a2e1f]/5 rounded-2xl py-2.5 flex flex-col items-center gap-1">
                  <span className="text-sm">💬</span> Owner<br />Call
                </span>
              </div>

              <div className="mt-4 bg-gradient-to-br from-amber-50 to-[#fdfbf7] border border-amber-200 rounded-2xl p-3 flex gap-2.5">
                <span className="w-8 h-8 rounded-full bg-white border border-amber-200 grid place-items-center shrink-0 text-sm">🎉</span>
                <p className="text-xs leading-5 text-amber-900/80">
                  <span className="font-black text-amber-900">Wholesale prices reduce automatically</span> — 5% at 10 pcs → 20% at 100 pcs. More qty = lower unit.
                </p>
              </div>
            </div>

            <div className="bg-emerald-600 text-white rounded-[20px] p-4 flex gap-3 shadow-[0_12px_32px_rgba(16,185,129,0.22)] border border-emerald-500/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
              <span className="relative w-10 h-10 rounded-full bg-white/15 border border-white/15 grid place-items-center shrink-0 backdrop-blur">💚</span>
              <div className="relative">
                <div className="font-black text-sm tracking-wide">{t("cart_loved")}</div>
                <div className="text-xs text-white/80 leading-5 font-medium">{t("cart_rating")} • Pan-Kerala • 2-acre nursery</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <h4 className="font-[Outfit] font-black tracking-[-0.02em] text-[#0a2e1f] text-[17px]">{t("cart_you_may_like")}</h4>
          <p className="text-sm text-[#0a2e1f]/50 font-medium">{t("cart_complete_corner")}</p>
          <div className="mt-3 flex gap-3 overflow-auto pb-2 scrollbar-none">
            {[
              { n: "Snake Plant", e: "🐍" },
              { n: "Monstera", e: "🌿" },
              { n: "Aloe Vera", e: "🌵" },
              { n: "Areca Palm", e: "🌴" },
              { n: "Money Plant", e: "🍃" },
            ].map((p) => (
              <Link
                key={p.n}
                to={`/shop?search=${encodeURIComponent(p.n)}`}
                className="shrink-0 bg-white/70 backdrop-blur border border-white/60 rounded-full px-4 py-2.5 text-sm font-bold text-[#0a2e1f] hover:bg-white hover:border-emerald-200 hover:shadow-sm flex items-center gap-2 transition"
              >
                <span className="w-7 h-7 rounded-full bg-[#e8f0e3] grid place-items-center text-sm border border-[#0a2e1f]/5">{p.e}</span>
                + {p.n}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* mobile sticky checkout */}
      <div className="lg:hidden fixed bottom-[78px] inset-x-0 z-30 px-3 pointer-events-none">
        <div className="pointer-events-auto max-w-[560px] mx-auto bg-white/85 backdrop-blur-2xl border border-white/60 shadow-[0_16px_48px_rgba(10,46,31,0.18)] rounded-[22px] px-4 py-3 flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-black tracking-[0.12em] uppercase text-[#0a2e1f]/40">
              {itemCount} {t("cart_items")} • {isFreeShipping ? <span className="text-emerald-700">Free Delivery</span> : `+ ₹${SHIPPING_FEE} shipping`}
            </div>
            <div className="font-[Outfit] font-black text-[18px] leading-none tracking-tight text-[#0a2e1f]">₹{grand.toFixed(2)}</div>
          </div>
          <button
            onClick={() => nav("/checkout")}
            className="bg-[#0a2e1f] text-white px-6 py-3 rounded-full font-black text-sm shadow-[0_8px_20px_rgba(10,46,31,0.22)] hover:bg-black transition flex items-center gap-1.5"
          >
            {t("cart_proceed")}
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
