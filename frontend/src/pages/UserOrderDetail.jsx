import { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../components/Toast";

const Ico = {
  box: (props) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      {...props}
    >
      <path d="M12 2l9 4.5v9L12 20 3 15.5v-9L12 2z" />
      <path d="M3 7.5l9 4.5 9-4.5" />
      <path d="M12 12v8" />
    </svg>
  ),
  pin: (props) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      {...props}
    >
      <path d="M12 21s7-5 7-11a7 7 0 10-14 0c0 6 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  ),
  truck: (props) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      {...props}
    >
      <path d="M5 8h8v8H5z" />
      <path d="M13 11h4l2 3v2h-6" />
      <circle cx="7.5" cy="18.5" r="1.5" />
      <circle cx="17.5" cy="18.5" r="1.5" />
    </svg>
  ),
  share: (props) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      {...props}
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
    </svg>
  ),
  help: (props) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 015 0c0 2-2 2-2 3" />
      <path d="M12 17h.01" />
    </svg>
  ),
};

export default function UserOrderDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const { add: addToCart } = useCart();
  const { success, error: toastError } = useToast();
  const [order, setOrder] = useState(null);
  const [plants, setPlants] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelErr, setCancelErr] = useState("");
  const [showCancel, setShowCancel] = useState(false);
  const [copied, setCopied] = useState(false);
  const [rating, setRating] = useState(0);
  const [rated, setRated] = useState(false);

  useEffect(() => {
    Promise.all([
      api
        .get("/orders/my")
        .then((r) => r.data)
        .catch(() => []),
      api
        .get("/plants?limit=100")
        .then((r) => r.data.plants || [])
        .catch(() => []),
      api
        .get("/users/profile")
        .then((r) => r.data)
        .catch(() => null),
    ]).then(([orders, plantsData, prof]) => {
      const found = orders.find((o) => o.id === id);
      setOrder(found || null);
      setPlants(plantsData);
      setProfile(prof);
      setLoading(false);
    });
  }, [id]);

  const isPaid =
    order &&
    ((order.payment_status || "pending") === "paid" ||
      (order.payment_status || "pending") === "confirmed" ||
      order.status === "delivered");
  const isFailed = order && (order.payment_status || "pending") === "failed";
  const orderSubtotal = order
    ? Number(
        order.subtotal ??
          (order.items || []).reduce(
            (sum, item) =>
              sum + Number(item.price || 0) * Number(item.quantity || 0),
            0,
          ),
      )
    : 0;
  const orderShipping = order
    ? Number(
        order.shipping ??
          Math.max(0, Number(order.total_amount || 0) - orderSubtotal),
      )
    : 0;

  // UX: estimated delivery + progress
  const estimated = useMemo(() => {
    if (!order) return null;
    const base = new Date(order.created_at);
    const addDays =
      order.status === "delivered" ? 0 : order.status === "shipped" ? 1 : 4;
    const d = new Date(base);
    d.setDate(d.getDate() + 5);
    return d;
  }, [order]);
  const daysLeft = useMemo(() => {
    if (!estimated || !order) return 0;
    if (order.status === "delivered" || order.status === "cancelled") return 0;
    const diff = Math.ceil((estimated - new Date()) / 86400000);
    return Math.max(0, diff);
  }, [estimated, order]);
  const stepIdx = useMemo(() => {
    if (!order) return 0;
    if (order.status === "delivered") return 4;
    if (order.status === "shipped") return 3;
    if (["confirmed"].includes(order.status)) return 2;
    return 1;
  }, [order]);
  const progress = useMemo(() => (stepIdx / 4) * 100, [stepIdx]);
  const related = useMemo(() => {
    if (!order || !plants.length) return [];
    const ids = new Set(order.items.map((i) => i.plant_id));
    return plants.filter((p) => !ids.has(p.id)).slice(0, 4);
  }, [order, plants]);

  const reorder = (o) => {
    o.items.forEach((it) => {
      const plant = plants.find((p) => p.id === it.plant_id);
      if (plant) addToCart(plant, it.quantity);
    });
    success("Added to cart");
    setTimeout(() => nav("/cart"), 400);
  };
  const downloadCareGuide = async (plant) => {
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`${plant.name} - Care Guide`, 14, 18);
    doc.setFontSize(10);
    doc.text(`Botanical: ${plant.botanical_name || ""}`, 14, 26);
    doc.text(
      `Sunlight: ${plant.sunlight} • Water: ${plant.watering_frequency}`,
      14,
      32,
    );
    doc.text(`Soil: ${plant.soil_type}`, 14, 38);
    doc.text(
      `Temp: ${plant.temperature_range} • Humidity: ${plant.humidity_preference}`,
      14,
      44,
    );
    doc.setFontSize(9);
    const lines = doc.splitTextToSize(
      plant.care_instructions || plant.long_description || "",
      180,
    );
    doc.text(lines, 14, 52);
    doc.text("Verdant • Follow seasonal reminders for best growth", 14, 280);
    doc.save(`${plant.name}-care-guide.pdf`);
    success(`${plant.name} care guide downloaded`);
  };
  const handleCopy = async (txt, msg = "Copied") => {
    await navigator.clipboard.writeText(txt).catch(() => {});
    setCopied(true);
    success(msg);
    setTimeout(() => setCopied(false), 1500);
  };
  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Order ${order.id.slice(0, 8)}`,
          text: `Verdant order ${order.id}`,
          url,
        });
      } catch {}
    } else {
      handleCopy(url, "Link copied");
    }
  };
  const handleRate = (v) => {
    setRating(v);
    setRated(true);
    success(`Thanks! You rated ${v}★`);
  };
  const downloadInvoice = async (o) => {
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF("p", "mm", "a4");
    const pageW = 210,
      pageH = 297,
      m = 10;
    const green = [12, 46, 31],
      emerald = [16, 185, 129],
      lightBg = [248, 250, 247],
      border = [226, 232, 240];
    doc.setFillColor(...green);
    doc.rect(0, 0, pageW, 28, "F");
    doc.setFillColor(16, 122, 62);
    doc.circle(14, 14, 6, "F");
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text("🌿", 12.5, 15.5);
    doc.setFontSize(14);
    doc.text("Verdant", 24, 13);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(167, 243, 208);
    doc.text(
      "Pezhummoodu, Thiruvananthapuram, Kerala  •  nursery@greenest.com  •  +91 98765 43210",
      24,
      18,
    );
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.text("INVOICE", pageW - m, 14, { align: "right" });
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(`#${o.id.slice(0, 8).toUpperCase()}`, pageW - m, 19, {
      align: "right",
    });
    doc.setFontSize(6.5);
    doc.setTextColor(200, 255, 220);
    doc.text(
      `${new Date(o.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} • ${o.payment_method} • ${o.status.replace("_", " ")}`,
      pageW - m,
      22,
      { align: "right" },
    );
    let y = 36;
    doc.setFillColor(...lightBg);
    doc.setDrawColor(...border);
    doc.rect(m, y, (pageW - m * 2) / 2 - 2, 26, "FD");
    doc.rect(m + (pageW - m * 2) / 2 + 2, y, (pageW - m * 2) / 2 - 2, 26, "FD");
    doc.setFont("helvetica", "bold");
    doc.setTextColor(12, 46, 31);
    doc.setFontSize(7);
    doc.text("BILL TO", m + 4, y + 6);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(8);
    doc.text(`${o.user_name || user?.name || "Customer"}`, m + 4, y + 10);
    doc.setFontSize(7);
    doc.setTextColor(80, 80, 80);
    doc.text(`${o.user_email || user?.email || ""}`, m + 4, y + 14);
    if (o.customer_phone || profile?.phone)
      doc.text(`Ph: ${o.customer_phone || profile.phone}`, m + 4, y + 18);
    doc.text(`Payment: ${o.payment_method} • ${o.status}`, m + 4, y + 22);
    const rx = m + (pageW - m * 2) / 2 + 2;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(12, 46, 31);
    doc.setFontSize(7);
    doc.text("SHIP TO", rx + 4, y + 6);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(7.5);
    const ship = `${o.address?.street || ""}, ${o.address?.city || ""}${o.address?.city && o.address?.state ? ", " : ""}${o.address?.state || ""} ${o.address?.postal_code || ""}${o.address?.country ? ", " + o.address.country : ""}`;
    const shipLines = doc.splitTextToSize(ship, (pageW - m * 2) / 2 - 10);
    doc.text(shipLines, rx + 4, y + 11);
    y += 32;
    const colX = [m, m + 10, m + 92, m + 112, m + 142];
    doc.setFillColor(...green);
    doc.rect(m, y, pageW - m * 2, 9, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    ["#", "ITEM", "QTY", "PRICE", "AMOUNT"].forEach((h, i) =>
      doc.text(h, colX[i] + 2, y + 6),
    );
    y += 9;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 30, 30);
    let subtotal = 0;
    o.items?.forEach((it, idx) => {
      const p = plants.find((x) => x.id === it.plant_id);
      const name = p?.name || it.plant_id;
      const price = Number(it.price ?? p?.price ?? 0);
      const amt = price * it.quantity;
      subtotal += amt;
      if (y > 275) {
        doc.addPage();
        y = 20;
      }
      if (idx % 2 === 0) {
        doc.setFillColor(249, 250, 251);
        doc.rect(m, y, pageW - m * 2, 9, "F");
      }
      doc.setDrawColor(...border);
      doc.rect(m, y, pageW - m * 2, 9, "S");
      for (let i = 1; i < colX.length; i++)
        doc.line(colX[i], y, colX[i], y + 9);
      doc.setFontSize(7);
      doc.text(String(idx + 1), colX[0] + 3, y + 6);
      doc.setFont("helvetica", "bold");
      doc.text(doc.splitTextToSize(name, 78)[0], colX[1] + 2, y + 6);
      doc.setFont("helvetica", "normal");
      doc.text(String(it.quantity), colX[2] + 6, y + 6, { align: "center" });
      doc.text(`Rs.${price}`, colX[3] + 2, y + 6);
      doc.setFont("helvetica", "bold");
      doc.text(`Rs.${amt.toFixed(2)}`, colX[4] + 2, y + 6);
      y += 9;
    });
    const shipping = Number(o.shipping ?? 49);
    const boxX = pageW - m - 60,
      boxY = y + 4,
      boxW = 60;
    doc.setDrawColor(...border);
    doc.setFillColor(255, 255, 255);
    doc.rect(boxX, boxY, boxW, 22, "FD");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(80, 80, 80);
    doc.text("Subtotal", boxX + 4, boxY + 6);
    doc.text(`Rs.${subtotal.toFixed(2)}`, boxX + boxW - 4, boxY + 6, {
      align: "right",
    });
    doc.text("Shipping", boxX + 4, boxY + 11);
    doc.text(
      shipping === 0 ? "FREE" : `Rs.${shipping.toFixed(2)}`,
      boxX + boxW - 4,
      boxY + 11,
      { align: "right" },
    );
    doc.setDrawColor(...border);
    doc.line(boxX, boxY + 14, boxX + boxW, boxY + 14);
    doc.setFillColor(...green);
    doc.rect(boxX, boxY + 14, boxW, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("TOTAL", boxX + 4, boxY + 19);
    doc.text(`Rs.${o.total_amount.toFixed(2)}`, boxX + boxW - 4, boxY + 19, {
      align: "right",
    });
    const fy = pageH - 18;
    doc.setDrawColor(...emerald);
    doc.setLineWidth(0.6);
    doc.line(m, fy - 6, pageW - m, fy - 6);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(6.5);
    doc.text(
      "Thank you for growing with Verdant! • GST bill on request • Questions? hello@greenest.com • +91 98765 43210",
      pageW / 2,
      fy,
      { align: "center" },
    );
    doc.setFontSize(6);
    doc.setTextColor(130, 130, 130);
    doc.text(
      "This is a computer generated invoice • H34Q+9FP, Pezhummoodu, Thiruvananthapuram, Kerala 695575",
      pageW / 2,
      fy + 4,
      { align: "center" },
    );
    doc.setFontSize(6);
    doc.text(
      `Page 1 of 1  •  Generated ${new Date().toLocaleString("en-IN")}`,
      pageW - m,
      fy + 4,
      { align: "right" },
    );
    doc.save(`Verdant-Invoice-${o.id.slice(0, 8).toUpperCase()}.pdf`);
    success("Invoice downloaded");
  };
  const submitCancel = async () => {
    const reason = cancelReason.trim();
    if (reason.length < 10) {
      setCancelErr("Please give reason (min 10 characters)");
      toastError("Cancel reason is mandatory");
      return;
    }
    try {
      const res = await api.put(`/orders/${id}/cancel`, { reason });
      setOrder(res.data);
      success("Order cancelled");
      setShowCancel(false);
    } catch (e) {
      const m = e.response?.data?.error || "Failed to cancel";
      setCancelErr(m);
      toastError(m);
    }
  };

  if (loading)
    return (
      <div className="min-h-[60vh] grid place-items-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  if (!order)
    return (
      <div className="min-h-[60vh] grid place-items-center bg-gray-50 p-6">
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center max-w-md">
          <h3 className="font-semibold text-gray-900">Order not found</h3>
          <p className="text-sm text-gray-500 mt-1">#{id}</p>
          <button
            onClick={() => nav("/dashboard")}
            className="mt-4 bg-black text-white px-6 py-2 rounded-full text-sm"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1120px] mx-auto px-4 md:px-6 py-6">
        <button
          onClick={() => nav("/dashboard")}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 rounded-full"
        >
          <span className="w-8 h-8 rounded-full bg-white border border-gray-200 grid place-items-center">
            ←
          </span>{" "}
          Back to Orders
        </button>

        {/* header */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-5 md:p-6 border-b border-gray-100 flex flex-wrap gap-4 justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-black text-white px-3 py-1.5 rounded-full text-xs font-mono tracking-widest">
                  #{order.id.slice(0, 8).toUpperCase()}
                </span>
                <span
                  className="font-mono text-xs px-2.5 py-1 rounded-full border border-gray-200 bg-gray-50 text-gray-600 truncate max-w-[220px]"
                  title={order.id}
                >
                  {order.id}
                </span>
                <button
                  onClick={() => handleCopy(order.id)}
                  className={`border px-2.5 py-1 rounded-full text-xs transition-all ${copied ? "bg-black text-white border-black" : "bg-white border-gray-200 hover:bg-black hover:text-white"}`}
                >
                  {copied ? "✓ Copied" : "Copy"}
                </button>
                <button
                  onClick={handleShare}
                  className="border border-gray-200 bg-white px-2.5 py-1 rounded-full text-xs hover:bg-black hover:text-white flex items-center gap-1"
                >
                  <Ico.share className="w-3 h-3" /> Share
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(order.created_at).toLocaleString("en-IN")} •{" "}
                {order.items?.length} items • {order.payment_method}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <span
                  className={`px-2.5 py-1 rounded-full border text-xs capitalize font-medium ${order.status === "delivered" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : order.status === "cancelled" ? "bg-red-50 border-red-200 text-red-600" : order.status === "shipped" ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-amber-50 border-amber-200 text-amber-700"}`}
                >
                  {order.status.replace("_", " ")}
                </span>
                <span
                  className={`px-2.5 py-1 rounded-full border text-xs font-medium ${isPaid ? "bg-emerald-50 border-emerald-200 text-emerald-700" : isFailed ? "bg-red-50 border-red-200 text-red-600" : "bg-amber-50 border-amber-200 text-amber-700"}`}
                >
                  {isPaid ? "Paid" : isFailed ? "Failed" : "Unpaid"}
                </span>
                {order.status !== "delivered" &&
                  order.status !== "cancelled" && (
                    <span className="text-xs text-gray-500 hidden md:inline">
                      • Step {stepIdx} of 4
                    </span>
                  )}
              </div>
            </div>
            <div className="text-left md:text-right">
              <div className="text-xs tracking-widest uppercase text-gray-500">
                Total Amount
              </div>
              <div className="text-2xl font-semibold text-gray-900">
                ₹{order.total_amount}
              </div>
              <div className="text-xs text-gray-500">
                {order.payment_method} • {order.items?.length} items
              </div>
              <button
                onClick={() => nav("/shop")}
                className="mt-2 text-xs border border-gray-200 bg-white px-3 py-1.5 rounded-full hover:bg-black hover:text-white"
              >
                Continue shopping →
              </button>
            </div>
          </div>

          {/* UX: delivery estimate + progress */}
          {order.status !== "cancelled" && order.status !== "delivered" && (
            <div className="px-5 md:px-6 py-4 bg-gradient-to-r from-emerald-50/70 to-white border-b border-gray-100">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-black text-white grid place-items-center">
                    <Ico.truck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                      {order.status === "shipped"
                        ? "Out for delivery"
                        : "Preparing your order"}
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    </div>
                    <div className="text-xs text-gray-600">
                      {daysLeft > 0
                        ? `Arriving by ${estimated.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })} • ${daysLeft} day${daysLeft > 1 ? "s" : ""} left`
                        : `Arriving today • by 9 PM`}
                      <span className="mx-1">•</span>
                      <button
                        onClick={() =>
                          document
                            .getElementById("tracking")
                            ?.scrollIntoView({ behavior: "smooth" })
                        }
                        className="underline decoration-dotted"
                      >
                        Track
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex-1 md:max-w-[240px] min-w-[180px]">
                  <div className="flex justify-between text-[10px] font-medium tracking-widest uppercase text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-black rounded-full transition-all duration-700"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          {order.status === "delivered" && (
            <div className="px-5 md:px-6 py-4 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-800">
                ✓ Delivered — enjoy your plants!{" "}
                <span className="font-normal text-emerald-700">
                  Rate your experience
                </span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleRate(s)}
                    className={`w-8 h-8 rounded-full border grid place-items-center text-sm transition ${rating >= s ? "bg-black text-white border-black" : "bg-white border-gray-300 text-gray-400 hover:border-black"}`}
                  >
                    ★
                  </button>
                ))}
                {rated && (
                  <span className="text-xs font-medium text-emerald-700 ml-2">
                    Thanks!
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-[1.7fr_1fr] gap-6 p-4 md:p-6 bg-gray-50/50">
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b bg-white flex justify-between items-center">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <Ico.box className="w-4 h-4" /> Items •{" "}
                    {order.items?.length}
                  </h4>
                  <span className="text-xs text-gray-400">
                    GST bill on request
                  </span>
                </div>
                <div className="divide-y divide-gray-100">
                  {order.items?.map((it) => {
                    const p = plants.find((x) => x.id === it.plant_id);
                    const price = p?.price || it.price || 0;
                    return (
                      <div
                        key={it.plant_id}
                        className="flex items-center gap-3 p-3 group hover:bg-gray-50"
                      >
                        <img
                          src={p?.images?.[0] || "/aloevera plant.png"}
                          alt=""
                          className="w-12 h-12 rounded-lg object-cover border border-gray-200 bg-white group-hover:scale-[1.02] transition"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate text-gray-900">
                            {p?.name || it.plant_id}
                          </div>
                          <div className="text-xs text-gray-500">
                            Qty × {it.quantity} • ₹{price} each{" "}
                            {p?.sunlight && (
                              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-gray-100 border text-[10px]">
                                {p.sunlight}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-sm text-gray-900">
                            ₹{(price * it.quantity).toFixed(2)}
                          </div>
                          <button
                            onClick={() => p && downloadCareGuide(p)}
                            className="text-xs text-gray-500 hover:text-black underline decoration-dotted"
                          >
                            Guide
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="bg-white border-t border-gray-200 px-4 py-3 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span>
                    <span>₹{orderSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Shipping</span>
                    <span
                      className={
                        orderShipping === 0
                          ? "text-emerald-700 font-medium"
                          : ""
                      }
                    >
                      {orderShipping === 0
                        ? "FREE"
                        : `₹${orderShipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="border-t border-gray-900 pt-2 flex justify-between items-center">
                    <span className="font-medium text-xs tracking-widest uppercase text-gray-500">
                      Total
                    </span>
                    <span className="font-semibold text-base text-gray-900">
                      ₹{Number(order.total_amount || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* UX: quick help */}
              <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <Ico.help className="w-4 h-4 text-gray-600" /> Need help with
                  this order?
                </div>
                <div className="flex gap-2">
                  <a
                    href="https://wa.me/919876543210"
                    target="_blank"
                    className="text-xs border border-gray-900 bg-white px-3 py-1.5 rounded-full hover:bg-black hover:text-white"
                  >
                    WhatsApp
                  </a>
                  <a
                    href="tel:+919876543210"
                    className="text-xs bg-black text-white px-3 py-1.5 rounded-full"
                  >
                    Call
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => reorder(order)}
                  className="bg-black text-white py-3 rounded-full text-sm font-medium hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black active:scale-[0.98] transition-all"
                >
                  Reorder
                </button>
                <button
                  onClick={() => downloadInvoice(order)}
                  className="bg-white border border-gray-900 text-gray-900 py-3 rounded-full text-sm font-medium hover:bg-black hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black active:scale-[0.98] transition-all"
                >
                  Invoice
                </button>
              </div>
              {["pending", "pending_owner", "processing"].includes(
                order.status,
              ) && (
                <button
                  onClick={() => setShowCancel(true)}
                  className="w-full text-sm text-gray-700 border border-gray-300 bg-white py-2.5 rounded-full hover:bg-black hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black active:scale-[0.98] transition-all"
                >
                  Cancel order
                </button>
              )}

              {/* UX: related */}
              {related.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <h4 className="font-medium text-sm">You may also like</h4>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {related.map((p) => (
                      <Link
                        key={p.id}
                        to={`/plant/${p.id}`}
                        className="border border-gray-200 rounded-xl p-2 hover:border-black group"
                      >
                        <img
                          src={p.images?.[0]}
                          alt={p.name}
                          className="w-full h-20 object-cover rounded-lg bg-gray-50"
                        />
                        <div className="text-xs font-medium truncate mt-2 group-hover:text-black">
                          {p.name}
                        </div>
                        <div className="text-xs text-gray-500">₹{p.price}</div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="font-medium text-sm flex items-center gap-2">
                  <Ico.pin className="w-4 h-4" /> Shipping Address
                </div>
                <div className="mt-3 border border-gray-200 rounded-lg p-3 text-sm leading-6 bg-white">
                  <div className="font-medium text-gray-900">
                    {order.address?.street || "—"}
                  </div>
                  <div className="text-gray-600">
                    {order.address?.city}
                    {order.address?.city && order.address?.state ? ", " : ""}
                    {order.address?.state} {order.address?.postal_code}
                  </div>
                  <div className="text-gray-500 text-xs">
                    {order.address?.country || "India"}
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-600">
                    Phone: {order.customer_phone || profile?.phone || "—"}
                  </div>
                </div>
                <button
                  onClick={() =>
                    handleCopy(
                      `${order.address?.street || ""}, ${order.address?.city || ""}`,
                      "Address copied",
                    )
                  }
                  className="mt-2 w-full text-xs border border-gray-200 bg-white py-2 rounded-full hover:bg-black hover:text-white"
                >
                  Copy address
                </button>
              </div>

              <div
                id="tracking"
                className="bg-white border border-gray-200 rounded-xl p-4"
              >
                <div className="font-medium text-sm flex items-center gap-2">
                  <Ico.box className="w-4 h-4 text-emerald-600" /> Tracking
                </div>
                <div className="mt-4 relative">
                  <div className="absolute left-[11px] top-2 bottom-2 w-px bg-gray-200"></div>
                  {[
                    {
                      label: "Order placed",
                      done: true,
                      date: order.created_at,
                    },
                    {
                      label: "Confirmed",
                      done: ["confirmed", "shipped", "delivered"].includes(
                        order.status,
                      ),
                      date:
                        order.status !== "pending_owner"
                          ? order.created_at
                          : null,
                    },
                    {
                      label: "Shipped",
                      done: ["shipped", "delivered"].includes(order.status),
                    },
                    {
                      label: "Delivered",
                      done: order.status === "delivered",
                      date: estimated,
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="relative flex gap-3 pb-4 last:pb-0"
                    >
                      <span
                        className={`w-6 h-6 rounded-full border-2 bg-white grid place-items-center shrink-0 z-10 text-xs ${s.done ? "border-emerald-500 bg-emerald-500 text-white" : "border-gray-300 text-gray-300"}`}
                      >
                        {s.done ? "✓" : ""}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div
                          className={`text-sm ${s.done ? "font-medium text-gray-900" : "text-gray-400"}`}
                        >
                          {s.label}
                        </div>
                        <div
                          className={`text-xs ${s.done ? "text-emerald-600" : "text-gray-400"}`}
                        >
                          {s.done && s.date
                            ? new Date(s.date).toLocaleString("en-IN")
                            : s.done
                              ? "Completed"
                              : "Pending"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg p-2">
                  {order.status === "shipped"
                    ? "Your plants are on the way — keep soil moist upon arrival."
                    : order.status === "confirmed"
                      ? "Seller confirmed — packing with care."
                      : "We’ll notify you at each step via WhatsApp."}
                </div>
              </div>

              {order.status === "cancelled" && order.cancel_reason && (
                <div className="bg-white border border-gray-300 rounded-xl p-4">
                  <div className="font-medium text-xs text-gray-900">
                    Cancelled — reason
                  </div>
                  <div className="text-sm text-gray-700 mt-2 leading-5 border border-gray-200 rounded-lg p-3 bg-gray-50">
                    {order.cancel_reason}
                  </div>
                  {order.cancelled_at && (
                    <div className="text-xs text-gray-500 mt-2">
                      {new Date(order.cancelled_at).toLocaleString()}
                    </div>
                  )}
                </div>
              )}

              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="text-xs font-medium tracking-widest uppercase text-gray-500">
                  Payment Info
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div className="border border-gray-200 rounded-lg p-2.5 bg-white">
                    <div className="text-gray-500">Method</div>
                    <div className="font-medium text-gray-900">
                      {order.payment_method}
                    </div>
                    <div className="text-[10px] text-gray-500">
                      COD • 3-5 days
                    </div>
                  </div>
                  <div
                    className={`border rounded-lg p-2.5 ${isPaid ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}
                  >
                    <div className="text-gray-500">Status</div>
                    <div
                      className={`font-medium ${isPaid ? "text-emerald-700" : "text-amber-700"}`}
                    >
                      {isPaid ? "Paid" : isFailed ? "Failed" : "Unpaid"}
                    </div>
                    <div className="text-[10px] text-gray-500">
                      {isPaid ? "Thank you!" : "Pay on delivery"}
                    </div>
                  </div>
                </div>
                <div className="mt-3 font-mono text-xs break-all bg-gray-50 border border-gray-200 rounded-lg p-2 flex items-center justify-between gap-2">
                  <span className="truncate">{order.id}</span>
                  <button
                    onClick={() => handleCopy(order.id)}
                    className="shrink-0 border bg-white px-2 py-1 rounded-full text-[11px] hover:bg-black hover:text-white"
                  >
                    {copied ? "✓" : "Copy"}
                  </button>
                </div>
              </div>

              <div className="bg-black text-white rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">Need help?</div>
                  <div className="text-xs text-white/70">
                    Average reply 2h • 9am-7pm
                  </div>
                </div>
                <a
                  href="https://wa.me/919876543210"
                  target="_blank"
                  className="bg-white text-black px-4 py-2 rounded-full text-xs font-medium hover:bg-gray-100"
                >
                  Chat →
                </a>
              </div>
            </div>
          </div>
        </div>

        {showCancel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowCancel(false)}
            />
            <div className="relative bg-white rounded-xl border shadow-xl w-full max-w-md p-6">
              <h3 className="font-semibold text-gray-900">
                Cancel order <span className="text-red-600">*</span>
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Please give reason (min 10 chars)
              </p>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Reason..."
                className="mt-3 w-full border border-gray-300 rounded-xl px-3 py-2 text-sm min-h-[100px] outline-none focus:border-black"
                autoFocus
              />
              {cancelErr && (
                <div className="mt-2 text-xs bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg">
                  {cancelErr}
                </div>
              )}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setShowCancel(false)}
                  className="flex-1 border border-gray-300 py-2.5 rounded-full text-sm bg-white"
                >
                  Keep order
                </button>
                <button
                  onClick={submitCancel}
                  className="flex-1 bg-black text-white py-2.5 rounded-full text-sm"
                >
                  Confirm cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
