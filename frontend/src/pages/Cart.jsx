import { useCart } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

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

  if (cart.length === 0)
    return (
      <div className="min-h-[65vh] grid place-items-center bg-[#fcfcfa] px-4 py-10">
        <div className="w-full max-w-[560px] bg-white rounded-[28px] border shadow-sm p-8 md:p-10 text-center">
          <div className="w-24 h-24 rounded-full bg-[#f6f7f4] border grid place-items-center text-4xl mx-auto">
            🪴
          </div>
          <h2 className="mt-5 text-[26px] font-black tracking-tight">
            {t("cart_empty_title")}
          </h2>
          <p className="mt-2 text-sm text-gray-500 leading-6">
            {t("cart_empty_desc")}
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-2 bg-[#0a2e1f] text-white px-8 py-3.5 rounded-full font-black text-sm hover:bg-black transition shadow"
            >
              🌱 {t("cart_go_shopping")}
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center bg-white border px-8 py-3.5 rounded-full font-bold text-sm hover:bg-gray-50"
            >
              {t("cart_back_home")}
            </Link>
          </div>
        </div>
      </div>
    );

  return (
    <div className="bg-[#fcfcfa] min-h-[85vh]">
      <div className="max-w-[1180px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-[26px] md:text-[30px] font-black tracking-tight">
              {t("cart_title")}{" "}
              <span className="font-normal text-gray-500 text-[16px]">
                ({itemCount}{" "}
                {itemCount === 1 ? t("cart_item") : t("cart_items")})
              </span>
            </h1>
            <p className="text-sm text-gray-500">
              {savings > 0 ? (
                <span className="text-emerald-700 font-bold">
                  {t("cart_save_msg")} ₹{savings.toFixed(2)}{" "}
                  {t("cart_on_order")}
                </span>
              ) : (
                "Fixed shipping ₹49 on every order."
              )}
            </p>
          </div>
          <Link
            to="/shop"
            className="hidden md:inline-flex text-sm font-bold border bg-white px-5 py-2.5 rounded-full hover:bg-gray-50"
          >
            {t("cart_continue")}
          </Link>
        </div>

        <div className="mt-6 grid lg:grid-cols-[1.35fr_0.65fr] gap-6">
          {/* items */}
          <div className="space-y-3">
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
                  className="bg-white rounded-[20px] border p-3 md:p-4 flex gap-3 md:gap-4 hover:shadow-sm transition"
                >
                  <Link to={`/plant/${item.id}`} className="shrink-0">
                    <img
                      src={encodeURI(item.images?.[0] || "")}
                      alt={item.name}
                      className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-2xl border bg-[#f6f7f4]"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex gap-2 items-start justify-between">
                      <div className="min-w-0">
                        <Link
                          to={`/plant/${item.id}`}
                          className="font-black text-sm md:text-[15px] leading-tight hover:underline line-clamp-1"
                        >
                          {item.name}
                        </Link>
                        <div className="text-xs text-gray-500 mt-0.5 flex flex-wrap gap-1.5 items-center">
                          <span>
                            {item.selectedVariant || item.sunlight} •{" "}
                            {t("pd_in_stock")}
                          </span>
                          {item.isWholesale && (
                            <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black">
                              {t("cart_wholesale_badge")}{" "}
                              {tier && `• ${tier} ${t("cart_off")}`}
                            </span>
                          )}
                          {item.variantId && (
                            <span className="bg-gray-100 border px-2 py-0.5 rounded-full text-[11px] font-bold">
                              {item.variantId}
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-baseline gap-2 flex-wrap">
                          <span className="font-black text-emerald-700">
                            ₹{unit.toFixed(2)}
                          </span>
                          {item.isWholesale && base !== unit && (
                            <span className="text-xs line-through text-gray-400">
                              ₹{base.toFixed(2)}
                            </span>
                          )}
                          {!item.isWholesale && item.discount_price && (
                            <span className="text-xs line-through text-gray-400">
                              ₹{item.price.toFixed(2)}
                            </span>
                          )}
                          {saving > 0 && (
                            <span className="text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                              {t("cart_save_badge")} ₹{saving.toFixed(2)}
                            </span>
                          )}
                        </div>
                        {item.isWholesale && (
                          <div className="text-[11px] text-emerald-700 mt-1">
                            {t("cart_business_pricing")} {item.quantity}{" "}
                            {t("cart_pcs")} ₹{unit} {t("cart_each")}{" "}
                            {tier &&
                              `(${tier} ${t("cart_off")}, ${t("cart_more_qty")})`}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => remove(item.id)}
                        className="w-8 h-8 rounded-full border grid place-items-center hover:bg-red-50 hover:border-red-200 text-gray-500 hover:text-red-600 shrink-0"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="flex items-center bg-[#f6f7f4] border rounded-full p-1">
                        <button
                          onClick={() => update(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full bg-white border grid place-items-center text-sm hover:bg-gray-50 disabled:opacity-40"
                          disabled={item.quantity <= 1}
                        >
                          −
                        </button>
                        <span className="w-10 text-center font-black text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => update(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full bg-white border grid place-items-center text-sm hover:bg-gray-50"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                          {t("cart_subtotal_label")}
                        </div>
                        <div className="font-black text-sm">
                          ₹{subtotal.toFixed(2)}
                        </div>
                        {item.isWholesale && (
                          <div className="text-xs text-emerald-600 font-bold">
                            {item.quantity}×₹{unit}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="bg-white rounded-2xl border p-4 flex flex-wrap gap-3 items-center justify-between">
              <span className="text-sm text-gray-600">
                {t("cart_secure_checkout")}
              </span>
              <Link
                to="/shop"
                className="text-sm font-bold text-emerald-700 hover:underline"
              >
                {t("cart_add_more_plants")}
              </Link>
            </div>
          </div>

          {/* summary */}
          <div className="h-fit lg:sticky lg:top-[78px] space-y-4">
            <div className="bg-white rounded-[24px] border shadow-sm p-5 md:p-6">
              <h3 className="font-black text-[18px]">
                {t("cart_order_summary_title")}
              </h3>
              <div className="mt-4 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">
                    {t("cart_subtotal_items")} ({itemCount} {t("cart_items")})
                  </span>
                  <span className="font-bold">₹{total.toFixed(2)}</span>
                </div>
                {wholesaleSaving > 0 && (
                  <div className="flex justify-between text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1.5">
                    <span>{t("cart_wholesale_saving")}</span>
                    <span className="font-black">
                      -₹{wholesaleSaving.toFixed(2)}
                    </span>
                  </div>
                )}
                {cart.some((c) => c.isWholesale) && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs flex gap-2">
                    <span className="text-amber-600">💡</span>
                    <span>
                      <span className="font-black">Note:</span>{" "}
                      {t("cart_note_wholesale")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">{t("cart_delivery")}</span>
                  <span className="font-bold text-gray-900">₹49</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>{t("cart_savings")}</span>
                    <span className="font-black">-₹{savings.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <input
                    placeholder={t("cart_coupon")}
                    className="flex-1 border rounded-full px-4 py-2.5 text-sm bg-[#f6f7f4] focus:bg-white outline-none"
                  />
                  <button className="bg-white border px-5 rounded-full text-sm font-black hover:bg-gray-50">
                    {t("cart_apply")}
                  </button>
                </div>
                <div className="border-t pt-3 flex justify-between text-[16px] font-black">
                  <span>{t("cart_total_label")}</span>
                  <span>₹{(total + 49).toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-400">{t("cart_inclusive")}</p>
              </div>

              <button
                onClick={() => nav("/checkout")}
                className="w-full mt-5 bg-[#0a2e1f] text-white py-4 rounded-full font-black text-sm hover:bg-black transition shadow flex items-center justify-center gap-2"
              >
                {t("cart_proceed")}
              </button>
              <div className="mt-3 grid grid-cols-2 gap-2 text-center text-[11px] leading-tight">
                <span className="bg-[#f6f7f4] border rounded-xl py-2">
                  {t("cart_secure_badge")}
                </span>
                <span className="bg-[#f6f7f4] border rounded-xl py-2">
                  {t("cart_support_badge")}
                </span>
              </div>

              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-2xl p-3 flex gap-2">
                <span className="text-amber-600">🎉</span>
                <p className="text-xs leading-5">
                  <span className="font-black">
                    Wholesale prices reduce automatically as your quantity
                    increases.
                  </span>
                </p>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex gap-3">
              <span className="w-9 h-9 rounded-full bg-white border grid place-items-center shrink-0">
                💚
              </span>
              <div>
                <div className="font-black text-sm text-emerald-800">
                  {t("cart_loved")}
                </div>
                <div className="text-xs text-gray-600 leading-5">
                  {t("cart_rating")}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h4 className="font-black">{t("cart_you_may_like")}</h4>
          <p className="text-sm text-gray-500">{t("cart_complete_corner")}</p>
          <div className="mt-3 flex gap-3 overflow-auto pb-2">
            {["Snake Plant", "Monstera", "Aloe Vera"].map((n) => (
              <Link
                key={n}
                to={`/shop?search=${encodeURIComponent(n)}`}
                className="shrink-0 bg-white border rounded-2xl px-4 py-3 text-sm font-bold hover:border-emerald-300"
              >
                + {n}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* mobile sticky checkout */}
      <div className="lg:hidden fixed bottom-[68px] inset-x-0 z-30 bg-white border-t shadow-[0_-8px_24px_rgba(0,0,0,0.08)] px-4 py-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-xs text-gray-500 font-bold uppercase tracking-widest">
            {t("cart_total_label")} • {itemCount} {t("cart_items")}
          </div>
          <div className="font-black text-lg leading-none">
            ₹{(total + 49).toFixed(2)}
          </div>
        </div>
        <button
          onClick={() => nav("/checkout")}
          className="bg-[#0a2e1f] text-white px-6 py-3 rounded-full font-black text-sm"
        >
          {t("cart_proceed")}
        </button>
      </div>
    </div>
  );
}
