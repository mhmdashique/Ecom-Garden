import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../components/Toast";
import { useLanguage } from "../context/LanguageContext";

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
  const shipping = 49;
  const grand = wholesaleTotal + shipping;

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
      <div className="min-h-[50vh] grid place-items-center px-4 py-10">
        <div className="bg-white border rounded-2xl p-8 text-center max-w-md">
          <div className="w-14 h-14 rounded-full bg-amber-100 grid place-items-center text-xl mx-auto">
            🛒
          </div>
          <h3 className="font-black mt-3">{t("checkout_cart_empty_title")}</h3>
          <p className="text-sm text-gray-500">
            {t("checkout_cart_empty_desc")}
          </p>
          <Link
            to="/shop"
            className="inline-block mt-4 bg-[#0a2e1f] text-white px-6 py-2.5 rounded-full text-sm font-black"
          >
            {t("checkout_go_shopping")}
          </Link>
        </div>
      </div>
    );

  if (done) {
    return (
      <div className="bg-[#fcfcfa] min-h-[85vh] px-4 py-8">
        <div className="max-w-[760px] mx-auto">
          <div className="bg-white rounded-[24px] border p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-black tracking-widest uppercase">
              <span
                className={`w-7 h-7 rounded-full grid place-items-center ${ownerReplied ? "bg-emerald-600 text-white" : "bg-[#0a2e1f] text-white"}`}
              >
                {ownerReplied ? "✓" : "1"}
              </span>
              <span
                className={ownerReplied ? "text-emerald-700" : "text-gray-900"}
              >
                {t("checkout_order_placed")}
              </span>
              <span className="flex-1 h-px bg-gray-200"></span>
              <span
                className={`w-7 h-7 rounded-full grid place-items-center ${ownerReplied ? "bg-emerald-600 text-white" : "bg-amber-500 text-white animate-pulse"}`}
              >
                2
              </span>
              <span
                className={ownerReplied ? "text-emerald-700" : "text-amber-600"}
              >
                {t("checkout_owner_notified")}
              </span>
              <span className="flex-1 h-px bg-gray-200"></span>
              <span
                className={`w-7 h-7 rounded-full grid place-items-center ${ownerReplied ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-500"}`}
              >
                3
              </span>
              <span
                className={ownerReplied ? "text-emerald-700" : "text-gray-400"}
              >
                {t("checkout_confirmed")}
              </span>
            </div>

            {!ownerReplied ? (
              <div className="mt-8 text-center">
                <div className="w-16 h-16 rounded-full bg-amber-100 border-2 border-amber-300 grid place-items-center text-2xl mx-auto animate-pulse">
                  📲
                </div>
                <h2 className="mt-4 text-[22px] font-black leading-tight">
                  {t("checkout_order_sent")}
                </h2>
                <p className="mt-2 text-sm text-gray-600 leading-6">
                  {t("checkout_order_id")}{" "}
                  <span className="font-mono font-black">#{done.id}</span> • ₹
                  {done.total_amount} • {done.payment_method} •{" "}
                  {done.items?.length} items
                  <br />
                  <span className="text-xs">
                    Subtotal ₹{Number(done.subtotal || 0).toFixed(2)} • Shipping{" "}
                    {Number(done.shipping || 0) === 0
                      ? "FREE"
                      : `₹${Number(done.shipping).toFixed(2)}`}
                  </span>
                  <br />
                  {t("checkout_notification_sent")}
                </p>
                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left text-sm">
                  <div className="font-black">{t("checkout_what_next")}</div>
                  <ol className="list-decimal ml-5 mt-1 space-y-1 text-gray-700">
                    <li>{t("checkout_step1")}</li>
                    <li>{t("checkout_step2")}</li>
                    <li>{t("checkout_step3")}</li>
                  </ol>
                </div>
                <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href={`https://wa.me/919876543210?text=Hi GreenNest, order #${done.id} - please confirm`}
                    target="_blank"
                    className="bg-[#25D366] text-white px-6 py-3 rounded-full font-black text-sm"
                  >
                    {t("checkout_message_owner")}
                  </a>
                  <button
                    onClick={simulateOwnerReply}
                    className="bg-[#0a2e1f] text-white px-6 py-3 rounded-full font-black text-sm"
                  >
                    {t("checkout_simulate")}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-3">
                  {t("checkout_copy_email")} {user?.email} •{" "}
                  {t("checkout_cod_pay")}
                </p>
                <button
                  onClick={() => nav("/dashboard")}
                  className="mt-4 text-sm font-bold text-emerald-700 hover:underline"
                >
                  {t("checkout_track_dashboard")}
                </button>
              </div>
            ) : (
              <div className="mt-8 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-300 grid place-items-center text-2xl mx-auto">
                  ✅
                </div>
                <h2 className="mt-4 text-[24px] font-black leading-tight text-emerald-700">
                  {t("checkout_thank_you")}
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  {t("checkout_owner_replied")}
                </p>
                <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-sm text-left">
                  <div className="font-black text-emerald-800">
                    {t("checkout_order_id")} #{done.id} •{" "}
                    {t("checkout_confirmed")}
                  </div>
                  <div className="text-gray-700 mt-1">
                    {t("checkout_call_soon")}{" "}
                    <span className="font-black">{phone}</span>{" "}
                    {t("checkout_within_2h")}
                  </div>
                  <div className="mt-2 flex gap-2">
                    <span className="bg-white border px-3 py-1 rounded-full text-xs font-bold">
                      {t("checkout_cod_badge")}
                    </span>
                    <span className="bg-white border px-3 py-1 rounded-full text-xs">
                      {t("checkout_total")} ₹{done.total_amount}
                    </span>
                  </div>
                </div>
                <div className="mt-6 flex gap-3 justify-center">
                  <Link
                    to="/shop"
                    className="bg-[#0a2e1f] text-white px-7 py-3 rounded-full font-black text-sm"
                  >
                    {t("continue_shopping")}
                  </Link>
                  <Link
                    to="/dashboard"
                    className="bg-white border px-7 py-3 rounded-full font-bold text-sm"
                  >
                    {t("checkout_view_order")}
                  </Link>
                </div>
              </div>
            )}
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            {t("checkout_plant_note")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fcfcfa] min-h-[85vh]">
      <div className="max-w-[1180px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
        <h1 className="text-[26px] font-black tracking-tight">
          {t("checkout_title")}
        </h1>
        <p className="text-sm text-gray-500">{t("checkout_subtitle")}</p>

        <div className="mt-6 grid lg:grid-cols-[1.35fr_0.65fr] gap-6">
          <div className="space-y-4">
            <div className="bg-white rounded-[24px] border p-5 md:p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-black">
                  {t("delivery_address")}{" "}
                  <span className="text-xs font-normal text-gray-500">
                    — {t("fetched_from_profile")}
                  </span>
                </h3>
                <button
                  onClick={getLocation}
                  className="text-xs font-black bg-emerald-600 text-white px-4 py-2 rounded-full shadow-sm hover:bg-emerald-700 border border-emerald-600 flex items-center gap-1.5 shrink-0"
                >
                  📍 {t("use_current_location")}
                </button>
              </div>
              {savedAddrs.length > 0 && (
                <div className="mt-4">
                  <div className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-2">
                    {t("saved_addresses")}
                  </div>
                  <div className="grid gap-2">
                    {savedAddrs.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => selectSaved(a)}
                        className={`text-left border-2 rounded-xl p-3 flex justify-between items-start gap-2 ${selectedAddrId === a.id ? "border-emerald-500 bg-emerald-50" : "border-gray-100 bg-[#f6f7f4] hover:bg-white"}`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black tracking-widest uppercase bg-white border px-2 py-0.5 rounded-full">
                              {a.label || "Home"}
                            </span>
                            {a.is_default && (
                              <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">
                                DEFAULT
                              </span>
                            )}
                          </div>
                          <div className="text-sm font-bold mt-1 truncate">
                            {a.street}
                          </div>
                          <div className="text-xs text-gray-600">
                            {a.city}, {a.state} {a.postal_code} • {a.country}
                          </div>
                        </div>
                        <span
                          className={`w-5 h-5 rounded-full border-2 grid place-items-center shrink-0 mt-1 ${selectedAddrId === a.id ? "bg-emerald-600 border-emerald-600 text-white" : "bg-white border-gray-300"}`}
                        >
                          {selectedAddrId === a.id ? "✓" : ""}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    {t("checkout_edit_below")}
                  </div>
                </div>
              )}
              <div className="mt-4 grid md:grid-cols-2 gap-3">
                <input
                  placeholder={t("street_house")}
                  value={address.street}
                  onChange={(e) =>
                    setAddress({ ...address, street: e.target.value })
                  }
                  className="border rounded-xl px-4 py-3 text-sm bg-[#f6f7f4] focus:bg-white outline-none focus:border-emerald-300 md:col-span-2"
                />
                <input
                  placeholder={t("city")}
                  value={address.city}
                  onChange={(e) =>
                    setAddress({ ...address, city: e.target.value })
                  }
                  className="border rounded-xl px-4 py-3 text-sm bg-[#f6f7f4] focus:bg-white outline-none"
                />
                <input
                  placeholder={t("state")}
                  value={address.state}
                  onChange={(e) =>
                    setAddress({ ...address, state: e.target.value })
                  }
                  className="border rounded-xl px-4 py-3 text-sm bg-[#f6f7f4] focus:bg-white outline-none"
                />
                <input
                  placeholder={t("postal_code")}
                  value={address.postal_code}
                  onChange={(e) =>
                    setAddress({ ...address, postal_code: e.target.value })
                  }
                  className="border rounded-xl px-4 py-3 text-sm bg-[#f6f7f4] focus:bg-white outline-none"
                />
                <input
                  placeholder={t("country")}
                  value={address.country}
                  onChange={(e) =>
                    setAddress({ ...address, country: e.target.value })
                  }
                  className="border rounded-xl px-4 py-3 text-sm bg-[#f6f7f4] focus:bg-white outline-none"
                />
                <input
                  placeholder={t("phone_owner")}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="border rounded-xl px-4 py-3 text-sm bg-[#f6f7f4] focus:bg-white outline-none font-bold"
                  required
                />
              </div>
              <div className="mt-3">
                <label className="text-xs font-bold tracking-widest uppercase text-gray-600">
                  {t("delivery_note")}
                </label>
                <textarea
                  placeholder="Landmark, flat no., delivery time preference, cuttings vs potted..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="mt-1 w-full border rounded-xl px-4 py-3 text-sm bg-[#f6f7f4] focus:bg-white outline-none min-h-[70px]"
                />
              </div>
              {!user && (
                <p className="text-xs text-amber-700 mt-3 bg-amber-50 border border-amber-200 rounded-xl p-2.5">
                  Please{" "}
                  <Link to="/login" className="font-black underline">
                    {t("checkout_login_link")}
                  </Link>{" "}
                  {t("checkout_please_login")}
                </p>
              )}
            </div>

            <div className="bg-white rounded-[24px] border p-5 md:p-6 shadow-sm">
              <h3 className="font-black">{t("checkout_payment_title")}</h3>
              <p className="text-xs text-gray-500 mt-1">
                {t("checkout_payment_desc")}
              </p>
              <div className="mt-4">
                <label className="flex gap-3 p-4 rounded-2xl border-2 border-emerald-600 bg-emerald-50 cursor-pointer">
                  <input
                    type="radio"
                    checked={payment === "COD"}
                    onChange={() => setPayment("COD")}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-black text-sm flex items-center gap-2">
                      💵 {t("cash_on_delivery")}{" "}
                      <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full">
                        {t("recommended")}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1 leading-5">
                      {t("checkout_cod_desc")}
                    </div>
                    <div className="mt-2 flex gap-2 text-xs">
                      <span className="bg-white border px-2.5 py-1 rounded-full font-bold">
                        {t("checkout_no_online")}
                      </span>
                      <span className="bg-white border px-2.5 py-1 rounded-full">
                        {t("checkout_gst")}
                      </span>
                    </div>
                  </div>
                </label>
                <div className="mt-3 bg-gray-50 border rounded-xl p-3 flex gap-2 text-xs leading-5">
                  <span className="text-emerald-600">🔒</span>
                  <span>
                    <span className="font-black">{t("how_it_works")}</span>{" "}
                    {t("checkout_how_it_works_text")}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
              <span className="w-8 h-8 rounded-full bg-white border grid place-items-center shrink-0">
                🌿
              </span>
              <p className="text-xs leading-5">
                <span className="font-black">Note:</span>{" "}
                {t("checkout_note_cuttings")}
              </p>
            </div>
          </div>

          <div className="h-fit lg:sticky lg:top-[78px] space-y-4">
            <div className="bg-white rounded-[24px] border shadow-sm p-5 md:p-6">
              <h3 className="font-black text-[18px]">{t("order_summary")}</h3>
              <div className="mt-3 max-h-[220px] overflow-auto pr-1 space-y-2">
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
                    <div
                      key={`${c.id}-${c.variantId || ""}`}
                      className="flex gap-3 border-b pb-2 last:border-0"
                    >
                      <img
                        src={encodeURI(c.images?.[0] || "")}
                        alt={c.name}
                        className="w-12 h-12 rounded-xl object-cover border bg-[#f6f7f4] shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm truncate flex items-center gap-1.5">
                          {c.name}{" "}
                          {c.isWholesale && (
                            <span className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black">
                              🏢 {t("pd_wholesale")}{" "}
                              {tier && `• ${tier} ${t("cart_off")}`}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 flex flex-wrap gap-1 items-center">
                          {c.selectedVariant || "potted"} • ×{c.quantity}{" "}
                          {c.isWholesale ? (
                            <span className="text-emerald-700 font-bold">
                              • ₹{unit} {t("cart_each")} (was ₹{base})
                            </span>
                          ) : (
                            <span>
                              • ₹{unit} {t("cart_each")}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="font-black text-sm text-right">
                        <div>₹{subtotal.toFixed(2)}</div>
                        {c.isWholesale && base !== unit && (
                          <div className="text-xs text-emerald-600 font-bold">
                            save ₹{(base - unit) * c.quantity}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">
                    {t("subtotal")} ({cart.length} {t("cart_items")})
                  </span>
                  <span className="font-bold">
                    ₹{wholesaleTotal.toFixed(2)}
                  </span>
                </div>
                {wholesaleSaving > 0 && (
                  <div className="flex justify-between text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1.5">
                    <span>🏢 {t("cart_wholesale_saving")}</span>
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
                  <span className="text-gray-500">{t("shipping")}</span>
                  <span
                    className={`font-black ${shipping === 0 ? "text-emerald-700" : "text-gray-900"}`}
                  >
                    {shipping === 0 ? t("cart_free") : `₹${shipping}`}
                  </span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>{t("checkout_cod_label")}</span>
                  <span className="font-bold">
                    {t("checkout_pay_on_delivery")}
                  </span>
                </div>
                <div className="border-t pt-3 flex justify-between text-[18px] font-black">
                  <span>{t("total")}</span>
                  <span>₹{grand.toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-400">
                  {t("checkout_inclusive")}{" "}
                  {wholesaleSaving > 0 && t("checkout_wholesale_discount")}
                </p>
              </div>

              <button
                onClick={placeOrder}
                disabled={placing}
                className="w-full mt-5 bg-[#0a2e1f] text-white py-4 rounded-full font-black text-sm hover:bg-black transition shadow flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {placing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>{" "}
                    {t("checkout_placing")}
                  </>
                ) : (
                  <>{t("place_order")}</>
                )}
              </button>
              <p className="text-center text-xs text-gray-500 mt-2">
                {t("checkout_by_placing")}
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px]">
                <span className="bg-[#f6f7f4] border rounded-xl py-2">
                  {t("checkout_safe")}
                </span>
                <span className="bg-[#f6f7f4] border rounded-xl py-2">
                  {t("checkout_replace")}
                </span>
                <span className="bg-[#f6f7f4] border rounded-xl py-2">
                  {t("checkout_owner_call")}
                </span>
              </div>
            </div>

            <div className="bg-[#0a2e1f] text-white rounded-2xl p-4 flex gap-3">
              <span className="w-8 h-8 rounded-full bg-white/10 grid place-items-center shrink-0">
                📲
              </span>
              <div>
                <div className="font-black text-sm">
                  {t("checkout_owner_mobile_title")}
                </div>
                <div className="text-xs text-white/70">
                  {t("checkout_owner_mobile_desc")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
