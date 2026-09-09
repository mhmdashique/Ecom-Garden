import { useEffect, useState, useMemo } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import { useToast } from "../components/Toast";
import { useLanguage } from "../context/LanguageContext";

/* ---------- inline icons (no deps) ---------- */
const Ico = {
  grid: (props) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      {...props}
    >
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
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
  heart: (props) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      {...props}
    >
      <path d="M12 21s-6.5-4.2-8.8-8.3A5.2 5.2 0 0112 4.8a5.2 5.2 0 018.8 7.9C18.5 16.8 12 21 12 21z" />
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
  user: (props) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      {...props}
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M5 20a7 7 0 0114 0" />
    </svg>
  ),
  leaf: (props) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      {...props}
    >
      <path d="M12 2a10 10 0 00-2 19.7c.2.1.5 0 .6-.3A8 8 0 0112 2z" />
      <path d="M12 2c3 3 5 6 5 9a5 5 0 01-5 5" />
    </svg>
  ),
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { add: addToCart } = useCart();
  const { success, error: toastError } = useToast();
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [profile, setProfile] = useState(null);
  const [plants, setPlants] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [tab, setTab] = useState("overview");
  const [edit, setEdit] = useState({ name: "", phone: "", email: "" });
  const [emailChanged, setEmailChanged] = useState(false);
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [saveMsg, setSaveMsg] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [notifPrefs, setNotifPrefs] = useState({
    order: true,
    promo: false,
    care: true,
  });
  const [showDanger, setShowDanger] = useState(false);
  const [orderFilter, setOrderFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelId, setCancelId] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelErr, setCancelErr] = useState("");
  const [notifyWishlist, setNotifyWishlist] = useState({});
  const [addressTab, setAddressTab] = useState(false);
  const [addrForm, setAddrForm] = useState({
    label: "Home",
    street: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
    is_default: false,
  });
  const [editingAddr, setEditingAddr] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [journal, setJournal] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("careJournal") || "{}");
    } catch {
      return {};
    }
  });
  const [journalNote, setJournalNote] = useState({});
  const [journalPhoto, setJournalPhoto] = useState({});
  const [referralCopied, setReferralCopied] = useState(false);
  const [supportTickets, setSupportTickets] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("supportTickets") ||
          '[{"id":"1","subject":"Delivery query","status":"Resolved","date":"2026-08-20","msg":"Where is my Aloe order?"}]',
      );
    } catch {
      return [];
    }
  });
  const [newTicket, setNewTicket] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    api
      .get("/orders/my")
      .then((r) => setOrders(r.data))
      .catch(() => {});
    api
      .get("/users/profile")
      .then((r) => {
        setProfile(r.data);
        setEdit({
          name: r.data.name,
          phone: r.data.phone || "",
          email: r.data.email,
        });
      })
      .catch(() => {});
    api
      .get("/plants?limit=100")
      .then((r) => setPlants(r.data.plants || []))
      .catch(() => {});
    api
      .get("/wishlist")
      .then((r) => setWishlist(r.data || []))
      .catch(() => {});
  }, []);
  useEffect(() => {
    localStorage.setItem("careJournal", JSON.stringify(journal));
  }, [journal]);
  useEffect(() => {
    localStorage.setItem("supportTickets", JSON.stringify(supportTickets));
  }, [supportTickets]);

  const totalSpent = useMemo(
    () => orders.reduce((s, o) => s + (o.total_amount || 0), 0),
    [orders],
  );
  const loyaltyPoints = Math.floor(totalSpent / 10);
  const pendingCount = orders.filter((o) =>
    ["pending", "pending_owner", "processing"].includes(o.status),
  ).length;
  const deliveredCount = orders.filter((o) => o.status === "delivered").length;
  const wishlistCount = wishlist.length;
  const completion = useMemo(() => {
    let c = 0;
    if (edit.name) c += 30;
    if (edit.email) c += 30;
    if (edit.phone) c += 20;
    if (profile?.addresses?.length) c += 20;
    return Math.min(100, c);
  }, [edit, profile]);
  const completionLabel = !edit.phone
    ? "add phone number"
    : !profile?.addresses?.length
      ? "add address"
      : "profile complete!";
  const referralCode = `GREEN-${(user?.email || "user").slice(0, 3).toUpperCase()}${(user?.id || "").slice(0, 4).toUpperCase() || "1234"}`;
  const referralLink = `https://greennest.com/r/${referralCode}`;
  const nextReward = 100 - (loyaltyPoints % 100);
  const activeOrder = orders.find((o) =>
    ["pending", "pending_owner", "processing", "confirmed", "shipped"].includes(
      o.status,
    ),
  );
  const activeOrderPlant = activeOrder
    ? plants.find((p) => p.id === activeOrder.items?.[0]?.plant_id)
    : null;

  const saveProfile = async () => {
    if (!edit.name.trim() || !edit.email.trim()) {
      setSaveMsg("Name and email required");
      toastError("Name and email required");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(edit.email)) {
      setSaveMsg("Invalid email");
      toastError("Invalid email");
      return;
    }
    try {
      await api.put("/users/profile", {
        name: edit.name,
        phone: edit.phone,
        email: edit.email,
      });
      setProfile((p) => ({
        ...p,
        name: edit.name,
        phone: edit.phone,
        email: edit.email,
      }));
      setSaveMsg("✓ Saved successfully");
      success("Profile updated");
      setEmailChanged(false);
      setTimeout(() => setSaveMsg(""), 2200);
    } catch (e) {
      const m = e.response?.data?.error || "Failed to save";
      setSaveMsg(m);
      toastError(m);
    }
  };
  const handleEmailChange = (v) => {
    setEdit({ ...edit, email: v });
    setEmailChanged(v !== profile?.email);
  };
  const changePassword = async () => {
    if (!pw.next || pw.next !== pw.confirm) {
      setPwMsg("Passwords do not match");
      toastError("Passwords do not match");
      return;
    }
    if (pw.next.length < 6) {
      setPwMsg("Min 6 characters");
      toastError("Password must be 6+ characters");
      return;
    }
    try {
      await api.put("/users/password", {
        currentPassword: pw.current,
        newPassword: pw.next,
      });
      setPwMsg("✓ Password updated");
      success("Password updated");
      setPw({ current: "", next: "", confirm: "" });
      setTimeout(() => setPwMsg(""), 2200);
    } catch (e) {
      const message = e.response?.data?.error || "Failed to update password";
      setPwMsg(message);
      toastError(message);
    }
  };

  const addresses = profile?.addresses || [];
  const useCurrentLocation = () => {
    setGeoLoading(true);
    if (!navigator.geolocation) {
      setGeoLoading(false);
      toastError("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
          );
          const data = await res.json();
          const addr = data.address || {};
          setAddrForm((f) => ({
            ...f,
            street: data.display_name?.split(",")[0] || f.street,
            city: addr.city || addr.town || addr.village || f.city,
            state: addr.state || f.state,
            postal_code: addr.postcode || f.postal_code,
            country: addr.country || f.country,
          }));
          success("Location filled — please verify and save");
        } catch {
          toastError("Failed to reverse geocode");
        }
        setGeoLoading(false);
      },
      () => {
        setGeoLoading(false);
        toastError("Location permission denied");
      },
    );
  };
  const saveAddress = async (e) => {
    e.preventDefault();
    if (!addrForm.street || !addrForm.city) {
      toastError("Street & City required");
      return;
    }
    if (editingAddr) {
      const updated = addresses.map((a) =>
        a.id === editingAddr ? { ...a, ...addrForm } : a,
      );
      if (addrForm.is_default)
        updated.forEach((a) => {
          if (a.id !== editingAddr) a.is_default = false;
        });
      setProfile((p) => ({ ...p, addresses: updated }));
      setEditingAddr(null);
    } else {
      try {
        const r = await api.post("/users/addresses", addrForm);
        const newAddr = r.data || {
          ...addrForm,
          id: Math.random().toString(36).slice(2, 9),
        };
        let updated = [
          ...addresses,
          { ...newAddr, ...addrForm, id: newAddr.id },
        ];
        if (addrForm.is_default)
          updated = updated.map((a) => ({
            ...a,
            is_default: a.id === newAddr.id,
          }));
        setProfile((p) => ({ ...p, addresses: updated }));
      } catch {
        const newAddr = {
          ...addrForm,
          id: Math.random().toString(36).slice(2, 9),
        };
        let updated = [...addresses, newAddr];
        if (addrForm.is_default)
          updated = updated.map((a) => ({
            ...a,
            is_default: a.id === newAddr.id,
          }));
        setProfile((p) => ({ ...p, addresses: updated }));
      }
    }
    setAddrForm({
      label: "Home",
      street: "",
      city: "",
      state: "",
      postal_code: "",
      country: "India",
      is_default: false,
    });
    setAddressTab(false);
    success(editingAddr ? "Address updated" : "Address added");
  };
  const deleteAddress = (id) => {
    setProfile((p) => ({
      ...p,
      addresses: p.addresses.filter((a) => a.id !== id),
    }));
    success("Address deleted");
  };
  const setDefaultAddress = (id) => {
    setProfile((p) => ({
      ...p,
      addresses: p.addresses.map((a) => ({ ...a, is_default: a.id === id })),
    }));
    success("Default address updated");
  };
  const startEditAddr = (a) => {
    setAddrForm({
      label: a.label || "Home",
      street: a.street,
      city: a.city,
      state: a.state,
      postal_code: a.postal_code,
      country: a.country || "India",
      is_default: !!a.is_default,
    });
    setEditingAddr(a.id);
    setAddressTab(true);
  };

  const wishlistPlants = wishlist
    .map((w) => plants.find((p) => p.id === w.plant_id))
    .filter(Boolean);
  const removeWishlist = async (w) => {
    const entry = wishlist.find((x) => x.plant_id === w.id);
    if (entry) await api.delete(`/wishlist/${entry.id}`).catch(() => {});
    setWishlist((prev) => prev.filter((x) => x.plant_id !== w.id));
    success(`${w.name} removed from wishlist`);
  };
  const moveToCart = (p) => {
    addToCart(p, 1);
    success(`${p.name} moved to cart`);
  };

  const filteredOrders =
    orderFilter === "All"
      ? orders
      : orders.filter((o) => {
          if (orderFilter === "Pending")
            return ["pending", "pending_owner", "processing"].includes(o.status);
          if (orderFilter === "Shipped") return o.status === "shipped";
          if (orderFilter === "Delivered") return o.status === "delivered";
          if (orderFilter === "Cancelled") return o.status === "cancelled";
          return o.status === orderFilter.toLowerCase();
        });
  const openCancel = (id) => {
    setCancelId(id);
    setCancelReason("");
    setCancelErr("");
  };
  const submitCancel = async () => {
    const reason = cancelReason.trim();
    if (reason.length < 10) {
      setCancelErr("Please give reason (min 10 characters) — mandatory");
      toastError("Cancel reason is mandatory");
      return;
    }
    try {
      const res = await api.put(`/orders/${cancelId}/cancel`, { reason });
      setOrders((prev) => prev.map((o) => (o.id === cancelId ? res.data : o)));
      if (selectedOrder?.id === cancelId) setSelectedOrder(res.data);
      success("Order cancelled — reason recorded");
      setCancelId(null);
      setCancelReason("");
    } catch (e) {
      const m = e.response?.data?.error || "Failed to cancel";
      setCancelErr(m);
      toastError(m);
    }
  };
  const reorder = (order) => {
    order.items.forEach((it) => {
      const plant = plants.find((p) => p.id === it.plant_id);
      if (plant) addToCart(plant, it.quantity);
    });
    success("Items added to cart — Buy again!");
  };
  const downloadInvoice = (order) => {
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
    doc.text("GreenNest", 24, 13);
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
    doc.text(`#${order.id.slice(0, 8).toUpperCase()}`, pageW - m, 19, {
      align: "right",
    });
    doc.setFontSize(6.5);
    doc.setTextColor(200, 255, 220);
    doc.text(
      `${new Date(order.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} • ${order.payment_method} • ${order.status.replace("_", " ")}`,
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
    doc.text(`${order.user_name || user?.name || "Customer"}`, m + 4, y + 10);
    doc.setFontSize(7);
    doc.setTextColor(80, 80, 80);
    doc.text(`${order.user_email || user?.email || ""}`, m + 4, y + 14);
    if (order.customer_phone || profile?.phone)
      doc.text(`Ph: ${order.customer_phone || profile.phone}`, m + 4, y + 18);
    doc.text(
      `Payment: ${order.payment_method} • ${order.status}`,
      m + 4,
      y + 22,
    );
    const rx = m + (pageW - m * 2) / 2 + 2;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(12, 46, 31);
    doc.setFontSize(7);
    doc.text("SHIP TO", rx + 4, y + 6);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(7.5);
    const ship = `${order.address?.street || ""}, ${order.address?.city || ""}${order.address?.city && order.address?.state ? ", " : ""}${order.address?.state || ""} ${order.address?.postal_code || ""}${order.address?.country ? ", " + order.address.country : ""}`;
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
    order.items?.forEach((it, idx) => {
      const p = plants.find((x) => x.id === it.plant_id);
      const name = p?.name || it.plant_id;
      const price = p?.price || it.price || 0;
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
    const shipping = Number(order.shipping ?? 49);
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
    doc.text(
      `Rs.${order.total_amount.toFixed(2)}`,
      boxX + boxW - 4,
      boxY + 19,
      { align: "right" },
    );
    const fy = pageH - 18;
    doc.setDrawColor(...emerald);
    doc.setLineWidth(0.6);
    doc.line(m, fy - 6, pageW - m, fy - 6);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(6.5);
    doc.text(
      "Thank you for growing with GreenNest! • GST bill on request • Questions? hello@greenest.com • +91 98765 43210",
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
    doc.save(`GreenNest-Invoice-${order.id.slice(0, 8).toUpperCase()}.pdf`);
    success("Invoice downloaded — new design");
  };
  const downloadCareGuide = (plant) => {
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
    doc.text("GreenNest • Follow seasonal reminders for best growth", 14, 280);
    doc.save(`${plant.name}-care-guide.pdf`);
    success(`${plant.name} care guide downloaded`);
  };
  const downloadAllGuides = () => {
    ownedPlants.forEach((p) => setTimeout(() => downloadCareGuide(p), 300));
  };

  const ownedPlants = useMemo(() => {
    const ids = new Set();
    orders.forEach((o) => o.items?.forEach((it) => ids.add(it.plant_id)));
    return Array.from(ids)
      .map((id) => plants.find((p) => p.id === id))
      .filter(Boolean);
  }, [orders, plants]);
  const seasonalTip = useMemo(() => {
    const m = new Date().getMonth();
    if (m === 11 || m === 0 || m === 1)
      return "Winter: Reduce watering, avoid fertilizing.";
    if (m >= 2 && m <= 4)
      return "Spring: Repot & start fertilizing every 2 weeks.";
    if (m >= 5 && m <= 7) return "Summer: Water frequently, provide shade.";
    return "Autumn: Trim & prepare for dormancy.";
  }, []);
  const frequentlyBought = useMemo(() => {
    const map = {};
    orders.forEach((o) =>
      o.items?.forEach((it) => {
        map[it.plant_id] = (map[it.plant_id] || 0) + it.quantity;
      }),
    );
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([id]) => plants.find((p) => p.id === id))
      .filter(Boolean);
  }, [orders, plants]);

  const menu = [
    { id: "overview", label: t("dash_sidebar_overview"), icon: Ico.grid },
    { id: "orders", label: t("dash_sidebar_orders"), icon: Ico.box },
    { id: "wishlist", label: t("dash_sidebar_wishlist"), icon: Ico.heart },
    { id: "addresses", label: t("dash_sidebar_addresses"), icon: Ico.pin },
    { id: "profile", label: t("dash_sidebar_profile_link"), icon: Ico.user },
  ];

  const selectTab = (id) => {
    setTab(id);
    setMobileNav(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="bg-zinc-50 min-h-screen font-sans pb-20 lg:pb-0">
      {/* mobile top bar */}
      <div className="lg:hidden sticky top-[62px] z-30 bg-white border-b border-zinc-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileNav(true)} className="w-9 h-9 rounded-lg border border-zinc-200 bg-white grid place-items-center hover:bg-zinc-50">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
          </button>
          <span className="text-sm font-semibold text-zinc-800 capitalize">{tab}</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-zinc-900 text-white grid place-items-center text-xs font-bold">
          {(user?.name || "G").slice(0, 1).toUpperCase()}
        </div>
      </div>

      <div className="w-full flex flex-col lg:flex-row items-stretch min-h-[calc(100vh-62px)]">
        {mobileNav && (
          <div onClick={() => setMobileNav(false)} className="fixed inset-0 bg-black/30 z-40 lg:hidden" />
        )}
        {/* SIDEBAR */}
        <aside className={`bg-white border-r border-zinc-200 flex flex-col lg:sticky lg:top-[62px] lg:h-[calc(100vh-62px)] lg:w-[240px] lg:shrink-0 lg:overflow-y-auto fixed inset-y-0 left-0 z-50 w-[260px] transition-transform duration-200 lg:translate-x-0 ${mobileNav ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
          <div className="p-5 flex-1 flex flex-col">
            {/* brand */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-zinc-900 text-white grid place-items-center">
                  <Ico.leaf className="w-4 h-4" />
                </div>
                <span className="font-semibold text-sm text-zinc-900">GreenNest</span>
              </div>
              <button onClick={() => setMobileNav(false)} className="lg:hidden w-7 h-7 rounded-md border border-zinc-200 grid place-items-center text-zinc-500 hover:bg-zinc-50">✕</button>
            </div>
            {/* user */}
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-zinc-50 border border-zinc-200 mb-6">
              <div className="w-8 h-8 rounded-full bg-zinc-900 text-white grid place-items-center text-xs font-bold shrink-0">
                {(user?.name || "G").slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-zinc-900 truncate leading-none">{user?.name || "User"}</div>
                <div className="text-xs text-zinc-400 truncate mt-0.5">{user?.email}</div>
              </div>
            </div>
            {/* nav */}
            <nav className="space-y-0.5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 px-3 mb-2">Navigation</p>
              {menu.map((m) => {
                const active = tab === m.id;
                const Icon = m.icon;
                return (
                  <button key={m.id} onClick={() => selectTab(m.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ${
                      active ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                    }`}>
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="flex-1 text-left font-medium">{m.label}</span>
                    {m.id === "orders" && orders.length > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${active ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-500"}`}>{orders.length}</span>
                    )}
                    {m.id === "wishlist" && wishlistCount > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${active ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-500"}`}>{wishlistCount}</span>
                    )}
                  </button>
                );
              })}
            </nav>
            <div className="mt-4 pt-4 border-t border-zinc-100 space-y-0.5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 px-3 mb-2">Account</p>
              <Link to="/shop" onClick={() => setMobileNav(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition font-medium">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                Shop
              </Link>
              <button onClick={logout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition font-medium">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Sign out
              </button>
            </div>
            <div className="mt-auto pt-6">
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                <p className="text-xs font-semibold text-zinc-700">Need help?</p>
                <p className="text-xs text-zinc-400 mt-0.5">Mon–Sat 9am–7pm IST</p>
                <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer"
                  className="mt-2 flex items-center justify-center gap-1.5 bg-zinc-900 text-white text-xs font-semibold py-2 rounded-md hover:bg-zinc-700 transition">
                  WhatsApp Support
                </a>
              </div>
            </div>
          </div>
        </aside>


        {/* MAIN */}
        <div className="flex-1 min-w-0 bg-zinc-50 p-4 sm:p-6 lg:p-8 space-y-5">
          {tab === "overview" && (
            <>
              {/* ── Header ── */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700 mb-1">
                    {new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
                  </p>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {new Date().getHours()<12?"Good morning":new Date().getHours()<17?"Good afternoon":"Good evening"}, {user?.name?.split(" ")[0]||"there"} 👋
                  </h1>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link to="/shop" className="inline-flex items-center gap-1.5 bg-[#0c2e1f] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-black transition">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                    Browse Shop
                  </Link>
                </div>
              </div>

              {/* ── Stats ── */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  {label:"Total Orders",value:orders.length,sub:`${pendingCount} pending`,color:"text-emerald-700 bg-emerald-50 border-emerald-100",icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M12 2l9 4.5v9L12 20 3 15.5v-9L12 2z"/><path d="M3 7.5l9 4.5 9-4.5"/><path d="M12 12v8"/></svg>},
                  {label:"Delivered",value:deliveredCount,sub:"completed",color:"text-blue-700 bg-blue-50 border-blue-100",icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><polyline points="20 6 9 17 4 12"/></svg>},
                  {label:"Wishlist",value:wishlistCount,sub:"saved items",color:"text-pink-700 bg-pink-50 border-pink-100",icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M12 21s-6.5-4.2-8.8-8.3A5.2 5.2 0 0112 4.8a5.2 5.2 0 018.8 7.9C18.5 16.8 12 21 12 21z"/></svg>},
                  {label:"Total Spent",value:`₹${totalSpent.toLocaleString()}`,sub:`${loyaltyPoints} loyalty pts`,color:"text-amber-700 bg-amber-50 border-amber-100",icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>},
                ].map((s)=>(
                  <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">{s.label}</span>
                      <span className={`w-8 h-8 rounded-lg border grid place-items-center ${s.color}`}>{s.icon}</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 leading-none">{s.value}</div>
                    <div className="text-xs text-gray-400 mt-1.5">{s.sub}</div>
                  </div>
                ))}
              </div>

              {/* ── Profile completion banner ── */}
              {completion < 100 && (
                <div className="bg-white border border-amber-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 grid place-items-center text-amber-600">✨</div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Complete your profile — {completion}%</p>
                      <p className="text-xs text-gray-500">{completionLabel} · Unlock faster checkout</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-28 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full transition-all" style={{width:`${completion}%`}}/>
                    </div>
                    <button onClick={()=>selectTab("profile")} className="text-xs font-semibold bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-black">Complete →</button>
                  </div>
                </div>
              )}

              {/* ── Active order + Care Guide ── */}
              <div className="grid lg:grid-cols-[1.4fr_0.6fr] gap-3">
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700 mb-1">Your next move</p>
                  <h2 className="text-lg font-bold text-gray-900">
                    {activeOrder ? "Your plants are on the way" : orders.length ? "Keep your collection thriving" : "Start your green journey"}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {activeOrder
                      ? `Order #${activeOrder.id.slice(0,8).toUpperCase()} is ${activeOrder.status.replace("_"," ")}.`
                      : orders.length
                        ? `${ownedPlants.length} plants in your collection. Fresh picks waiting in the shop.`
                        : "Choose a low-maintenance favourite and make your first space feel alive."}
                  </p>
                  {activeOrder && activeOrderPlant && (
                    <div className="mt-4 flex items-center gap-3 border border-gray-100 rounded-lg p-3 bg-gray-50">
                      <img src={activeOrderPlant.images?.[0]} alt="" className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0"/>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate">{activeOrderPlant.name}</div>
                        <div className="text-xs text-gray-500">{activeOrder.items?.length||0} items · ₹{activeOrder.total_amount}</div>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-100 px-2 py-1 rounded-full">In progress</span>
                    </div>
                  )}
                  <div className="flex gap-2 mt-4">
                    {activeOrder
                      ? <button onClick={()=>nav(`/orders/${activeOrder.id}`)} className="bg-[#0c2e1f] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-black transition">Track order →</button>
                      : <Link to="/shop" className="bg-[#0c2e1f] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-black transition">Find a plant →</Link>
                    }
                    <button onClick={()=>selectTab("orders")} className="border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-xs font-semibold hover:bg-gray-50 transition">View orders</button>
                  </div>
                </div>
                {/* Plant Care Guide PDF card */}
                <div className="bg-[#f6faf7] border border-emerald-100 rounded-xl p-4 flex flex-col">
                  <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white grid place-items-center mb-3">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                  </div>
                  <p className="text-xs font-semibold text-emerald-700 uppercase tracking-widest">Plant Care Guide</p>
                  <p className="text-[11px] text-gray-500 mt-1 leading-4 flex-1">Watering, sunlight, soil & seasonal tips for all your plants.</p>
                  <a href="/Plant_Care_Guide.pdf" target="_blank" rel="noreferrer" download
                    className="mt-3 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2 rounded-lg transition"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Download PDF
                  </a>
                </div>
              </div>

              {/* ── Bottom: Recent Orders (left) + Plant Picks (right) ── */}
              <div className="grid lg:grid-cols-[1fr_1fr] gap-4">

                {/* Recent Orders */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col">
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-[#0c2e1f] text-white grid place-items-center"><Ico.box className="w-3.5 h-3.5"/></span>
                      Recent Orders
                    </h2>
                    <button onClick={()=>selectTab("orders")} className="text-xs font-semibold text-[#0c2e1f] border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition">View all →</button>
                  </div>
                  {orders.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-12 px-6 text-center">
                      <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-200 grid place-items-center mx-auto mb-3">
                        <Ico.box className="w-5 h-5 text-gray-300"/>
                      </div>
                      <p className="text-sm font-medium text-gray-500">No orders yet</p>
                      <p className="text-xs text-gray-400 mt-1">Your green journey starts with one plant</p>
                      <Link to="/shop" className="mt-4 inline-flex items-center gap-1.5 bg-[#0c2e1f] text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-black transition">Browse plants →</Link>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100 flex-1">
                      {orders.slice(0,4).map((o)=>{
                        const img = plants.find(p=>p.id===o.items?.[0]?.plant_id)?.images?.[0];
                        return (
                          <button key={o.id} onClick={()=>nav(`/orders/${o.id}`)} className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition text-left group">
                            <img src={img||"/aloevera plant.png"} alt="" className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0 bg-gray-50"/>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900">#{o.id.slice(0,8).toUpperCase()}</p>
                              <p className="text-xs text-gray-400 mt-0.5">₹{o.total_amount} · {o.items?.length} item{o.items?.length!==1?"s":""} · {new Date(o.created_at).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}</p>
                            </div>
                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize border shrink-0 ${
                              o.status==="delivered"?"bg-emerald-50 text-emerald-700 border-emerald-200":
                              o.status==="cancelled"?"bg-red-50 text-red-600 border-red-200":
                              o.status==="shipped"?"bg-blue-50 text-blue-700 border-blue-200":
                              "bg-amber-50 text-amber-700 border-amber-200"
                            }`}>{o.status.replace("_"," ")}</span>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-300 group-hover:text-gray-500 shrink-0"><polyline points="9 18 15 12 9 6"/></svg>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Plant Recommendations — 2 cards */}
                {plants.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col">
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                      <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-emerald-50 border border-emerald-100 grid place-items-center text-emerald-700">🌱</span>
                        Recommended for You
                      </h2>
                      <Link to="/shop" className="text-xs font-semibold text-[#0c2e1f] border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition">View all →</Link>
                    </div>
                    <div className="grid grid-cols-2 divide-x divide-gray-100 flex-1">
                      {plants.slice(0,2).map((p)=>(
                        <div key={p.id} className="group relative flex flex-col bg-white hover:bg-gray-50/50 transition-colors">
                          <Link to={`/plant/${p.id}`} className="flex flex-col flex-1">
                            <div className="relative overflow-hidden bg-gray-50">
                              <img src={p.images?.[0]} alt={p.name} className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"/>
                              {p.discount_price && p.discount_price < p.price && (
                                <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  {Math.round((1-p.discount_price/p.price)*100)}% OFF
                                </span>
                              )}
                              <span className={`absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                                p.stock_qty>0?"bg-white text-emerald-700 border-emerald-200":"bg-white text-red-500 border-red-200"
                              }`}>{p.stock_qty>0?"In stock":"Out"}</span>
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                              <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-[#0c2e1f] transition-colors">{p.name}</p>
                              <p className="text-xs text-gray-400 truncate mt-0.5 italic">{p.botanical_name||""}</p>
                              <div className="flex items-center justify-between mt-auto pt-3">
                                <div>
                                  <span className="text-base font-bold text-[#0c2e1f]">₹{p.discount_price&&p.discount_price<p.price?p.discount_price:p.price}</span>
                                  {p.discount_price&&p.discount_price<p.price&&(
                                    <span className="text-xs text-gray-400 line-through ml-1.5">₹{p.price}</span>
                                  )}
                                </div>
                                <span className="text-[10px] text-gray-400">{p.sunlight||""}</span>
                              </div>
                            </div>
                          </Link>
                          <div className="px-4 pb-4">
                            <button
                              onClick={(e)=>{e.preventDefault();addToCart(p,1);success(`${p.name} added to cart`);}}
                              className="w-full flex items-center justify-center gap-1.5 bg-[#0c2e1f] hover:bg-black text-white text-xs font-semibold py-2.5 rounded-lg transition"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                              Add to cart
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {tab === "orders" && (
            <div className="space-y-6">
              {/* header — minimalist */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg border border-gray-200 bg-white grid place-items-center">
                    <Ico.box className="w-4 h-4 text-gray-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[16px] tracking-tight leading-none text-gray-900">
                      {t("dash_my_orders")}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {t("dash_track_reorder")} • {orders.length} orders
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-full border border-gray-200 overflow-x-auto">
                  {[
                    { id: "All", label: "All", count: orders.length },
                    {
                      id: "Pending",
                      label: "Pending",
                      count: orders.filter((o) =>
                        ["pending", "pending_owner", "processing"].includes(
                          o.status,
                        ),
                      ).length,
                    },
                    {
                      id: "Shipped",
                      label: "Shipped",
                      count: orders.filter((o) => o.status === "shipped")
                        .length,
                    },
                    {
                      id: "Delivered",
                      label: "Delivered",
                      count: orders.filter((o) => o.status === "delivered")
                        .length,
                    },
                    {
                      id: "Cancelled",
                      label: "Cancelled",
                      count: orders.filter((o) => o.status === "cancelled")
                        .length,
                    },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setOrderFilter(f.id)}
                      className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${orderFilter === f.id ? "bg-black text-white" : "text-gray-600 hover:bg-white"}`}
                    >
                      {f.label}{" "}
                      <span className="text-[11px] opacity-60 ml-1">
                        {f.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {filteredOrders.length === 0 ? (
                  <div className="bg-white rounded-[20px] border border-[#e7ece0] p-12 text-center shadow-sm">
                    <div className="w-14 h-14 bg-[#f6f7f4] rounded-2xl grid place-items-center mx-auto text-xl">
                      📦
                    </div>
                    <p className="text-sm font-bold text-gray-700 mt-3">
                      No orders in "{orderFilter}"
                    </p>
                    <p className="text-xs text-gray-500">
                      Try another filter or shop now
                    </p>
                  </div>
                ) : (
                  filteredOrders.map((o) => {
                    const isOpen = selectedOrder?.id === o.id;
                    const isPaid =
                      (o.payment_status || "pending") === "paid" ||
                      (o.payment_status || "pending") === "confirmed" ||
                      o.status === "delivered";
                    const isFailed =
                      (o.payment_status || "pending") === "failed";
                    return (
                      <div
                        key={o.id}
                        className={`bg-white rounded-2xl border transition-all duration-200 ${isOpen ? "border-gray-900 shadow-lg" : "border-gray-200 hover:border-gray-300 hover:shadow-md"}`}
                      >
                        {/* card header — clean modern */}
                        <div className="p-4 md:p-5 flex flex-wrap gap-3 items-center justify-between">
                          <div className="min-w-0 flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="bg-[#0c2e1f] text-white px-3 py-1.5 rounded-lg text-xs font-mono tracking-widest shadow-sm">
                                #{o.id.slice(0, 8).toUpperCase()}
                              </span>
                              <button
                                onClick={async () => {
                                  await navigator.clipboard
                                    .writeText(o.id)
                                    .catch(() => {});
                                  success("Copied");
                                }}
                                className="border border-gray-200 bg-white hover:bg-[#0c2e1f] hover:text-white hover:border-[#0c2e1f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0c2e1f] focus-visible:ring-offset-1 active:scale-[0.97] transition-all px-2.5 py-1 rounded-lg text-xs"
                              >
                                Copy
                              </button>
                              <span className="text-xs text-gray-400 font-medium">
                                {new Date(o.created_at).toLocaleString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`px-2.5 py-1 rounded-lg border text-xs capitalize font-bold ${o.status === "delivered" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : o.status === "cancelled" ? "bg-red-50 border-red-200 text-red-600" : o.status === "shipped" ? "bg-blue-50 border-blue-200 text-blue-700" : o.status === "confirmed" ? "bg-purple-50 border-purple-200 text-purple-700" : "bg-amber-50 border-amber-200 text-amber-700"}`}
                              >
                                {o.status?.replace("_", " ")}
                              </span>
                              <span className="bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-lg text-xs font-medium text-gray-600">
                                ₹{o.total_amount} • {o.payment_method} •{" "}
                                {o.items?.length} items
                              </span>
                              <span
                                className={`px-2.5 py-1 rounded-lg border text-xs font-bold ${isPaid ? "bg-emerald-50 border-emerald-200 text-emerald-700" : isFailed ? "bg-red-50 border-red-200 text-red-600" : "bg-amber-50 border-amber-200 text-amber-700"}`}
                              >
                                {isPaid
                                  ? "✓ Paid"
                                  : isFailed
                                    ? "✕ Failed"
                                    : "⏳ Unpaid"}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => nav(`/orders/${o.id}`)}
                            className="text-xs font-bold px-5 py-2.5 rounded-lg border-2 border-[#0c2e1f] bg-white text-[#0c2e1f] hover:bg-[#0c2e1f] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0c2e1f] focus-visible:ring-offset-2 active:scale-[0.98] transition-all shrink-0"
                          >
                            View details →
                          </button>
                        </div>
                        {/* items strip — modern */}
                        <div className="px-4 flex gap-2.5 overflow-auto py-3 bg-gradient-to-r from-gray-50/50 to-white">
                          {o.items?.map((it) => {
                            const p = plants.find((x) => x.id === it.plant_id);
                            return (
                              <div
                                key={it.plant_id}
                                className="flex items-center gap-3 border border-gray-200 rounded-xl p-2.5 bg-white shrink-0 min-w-[180px] hover:border-emerald-200 hover:bg-emerald-50/20 transition shadow-sm"
                              >
                                <img
                                  src={p?.images?.[0] || "/aloevera plant.png"}
                                  alt=""
                                  className="w-11 h-11 rounded-lg object-cover bg-white border border-gray-100"
                                />
                                <div className="text-xs min-w-0">
                                  <div className="font-bold truncate max-w-[120px] text-gray-900">
                                    {p?.name || it.plant_id}
                                  </div>
                                  <div className="text-gray-500 font-medium">
                                    ×{it.quantity} • ₹{p?.price || ""}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {isOpen && (
                          <div className="border-t bg-gray-50 p-4 md:p-5">
                            {/* meta cards — minimalist */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                              <div className="bg-white border border-gray-200 rounded-xl p-3">
                                <div className="text-[10px] font-medium tracking-widest uppercase text-gray-400 flex items-center gap-1.5">
                                  <Ico.box className="w-3 h-3" /> Order No.
                                </div>
                                <div className="font-mono text-xs break-all mt-1.5 text-gray-900">
                                  {o.id}
                                </div>
                                <div className="text-[10px] text-gray-500 mt-1">
                                  {o.items?.length} items
                                </div>
                              </div>
                              <div className="bg-white border border-gray-200 rounded-xl p-3">
                                <div className="text-[10px] font-medium tracking-widest uppercase text-gray-400">
                                  Payment
                                </div>
                                <div className="font-medium text-sm mt-1 flex items-center gap-2">
                                  <span className="w-6 h-6 rounded-md bg-emerald-50 border border-emerald-200 grid place-items-center text-emerald-600">
                                    <Ico.box className="w-3 h-3" />
                                  </span>
                                  {o.payment_method}
                                </div>
                                <span
                                  className={`inline-block mt-2 px-2.5 py-1 rounded-full text-xs font-medium border ${isPaid ? "bg-emerald-50 border-emerald-200 text-emerald-700" : isFailed ? "bg-red-50 border-red-200 text-red-600" : "bg-amber-50 border-amber-200 text-amber-700"}`}
                                >
                                  {isPaid
                                    ? "Paid"
                                    : isFailed
                                      ? "Failed"
                                      : "Unpaid"}
                                </span>
                              </div>
                              <div className="bg-white border border-gray-200 rounded-xl p-3">
                                <div className="text-[10px] font-medium tracking-widest uppercase text-gray-400">
                                  Status
                                </div>
                                <div
                                  className={`font-medium text-sm mt-1 capitalize flex items-center gap-2 ${o.status === "delivered" ? "text-emerald-700" : o.status === "cancelled" ? "text-red-600" : o.status === "shipped" ? "text-blue-700" : "text-amber-700"}`}
                                >
                                  <span
                                    className={`w-2 h-2 rounded-full ${o.status === "delivered" ? "bg-emerald-500" : o.status === "cancelled" ? "bg-red-500" : o.status === "shipped" ? "bg-blue-500" : "bg-amber-500"}`}
                                  />
                                  {o.status.replace("_", " ")}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {new Date(o.created_at).toLocaleDateString(
                                    "en-IN",
                                  )}
                                </div>
                              </div>
                              <div className="bg-white border border-gray-900 rounded-xl p-3">
                                <div className="text-[10px] font-medium tracking-widest uppercase text-gray-500">
                                  Amount
                                </div>
                                <div className="font-semibold text-lg mt-1 text-gray-900">
                                  ₹{o.total_amount}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {o.payment_method} • {o.items?.length} items
                                </div>
                              </div>
                            </div>

                            <div className="grid lg:grid-cols-[1.25fr_0.75fr] gap-4">
                              {/* left — items — minimalist */}
                              <div className="space-y-3">
                                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                  <div className="px-4 py-3 border-b bg-white flex justify-between items-center">
                                    <h4 className="font-medium text-sm flex items-center gap-2">
                                      <span className="w-5 h-5 rounded-md border border-gray-200 grid place-items-center">
                                        <Ico.box className="w-3 h-3" />
                                      </span>{" "}
                                      Items • {o.items?.length}
                                    </h4>
                                    <span className="text-xs text-gray-400 hidden md:inline">
                                      GST bill on request
                                    </span>
                                  </div>
                                  <div className="divide-y divide-gray-100">
                                    {o.items?.map((it) => {
                                      const p = plants.find(
                                        (x) => x.id === it.plant_id,
                                      );
                                      const price = p?.price || it.price || 0;
                                      return (
                                        <div
                                          key={it.plant_id}
                                          className="flex items-center gap-3 p-3 hover:bg-gray-50 transition"
                                        >
                                          <img
                                            src={
                                              p?.images?.[0] ||
                                              "/aloevera plant.png"
                                            }
                                            alt=""
                                            className="w-10 h-10 rounded-lg object-cover border border-gray-200 bg-white"
                                          />
                                          <div className="flex-1 min-w-0">
                                            <div className="font-medium text-sm truncate text-gray-900">
                                              {p?.name || it.plant_id}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                              Qty × {it.quantity} • ₹{price}{" "}
                                              each
                                            </div>
                                          </div>
                                          <div className="text-right">
                                            <div className="font-semibold text-sm text-gray-900">
                                              ₹
                                              {(price * it.quantity).toFixed(2)}
                                            </div>
                                            <button
                                              onClick={() =>
                                                p && downloadCareGuide(p)
                                              }
                                              className="text-[11px] text-gray-600 hover:text-black underline"
                                            >
                                              Guide
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                  <div className="bg-white border-t border-gray-900 px-4 py-3 flex justify-between items-center">
                                    <span className="font-medium tracking-widest uppercase text-xs text-gray-500">
                                      Total
                                    </span>
                                    <span className="font-semibold text-base text-gray-900">
                                      ₹{o.total_amount}
                                    </span>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <button
                                    onClick={() => reorder(o)}
                                    className="bg-black text-white py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 flex items-center justify-center gap-2"
                                  >
                                    Reorder
                                  </button>
                                  <button
                                    onClick={() => downloadInvoice(o)}
                                    className="bg-white border border-gray-300 text-gray-900 py-2.5 rounded-full text-sm font-medium hover:bg-gray-50"
                                  >
                                    Invoice
                                  </button>
                                </div>
                                {[
                                  "pending",
                                  "pending_owner",
                                  "processing",
                                ].includes(o.status) && (
                                  <button
                                    onClick={() => openCancel(o.id)}
                                    className="w-full text-xs font-medium text-gray-700 border border-gray-300 bg-white py-2.5 rounded-full hover:bg-gray-50"
                                  >
                                    Cancel order
                                  </button>
                                )}
                              </div>
                              {/* right — address + timeline — minimalist */}
                              <div className="space-y-3">
                                <div className="bg-white border border-gray-200 rounded-xl p-4">
                                  <div className="flex justify-between items-center">
                                    <div className="font-medium text-sm flex items-center gap-2">
                                      <Ico.pin className="w-4 h-4" /> Shipping
                                      Address
                                    </div>
                                    <span className="text-[10px] px-2 py-1 rounded-full border border-gray-300 text-gray-600 bg-white">
                                      {isPaid ? "Paid" : "COD"}
                                    </span>
                                  </div>
                                  <div className="mt-3 border border-gray-200 rounded-lg p-3 text-sm leading-6 bg-white">
                                    <div className="font-medium text-gray-900">
                                      {o.address?.street || "—"}
                                    </div>
                                    <div className="text-gray-600">
                                      {o.address?.city}
                                      {o.address?.city && o.address?.state
                                        ? ", "
                                        : ""}
                                      {o.address?.state}{" "}
                                      {o.address?.postal_code}
                                    </div>
                                    <div className="text-gray-500 text-xs">
                                      {o.address?.country || "India"}
                                    </div>
                                    <div className="mt-2 pt-2 border-t border-gray-100 text-xs flex items-center gap-1.5 text-gray-600">
                                      <span className="w-4 h-4 rounded-full border border-gray-200 grid place-items-center text-[10px]">
                                        —
                                      </span>{" "}
                                      {o.customer_phone ||
                                        profile?.phone ||
                                        "—"}
                                    </div>
                                  </div>
                                </div>
                                <div className="bg-white border border-gray-200 rounded-xl p-4">
                                  <div className="font-medium text-sm flex items-center gap-2">
                                    <Ico.box className="w-4 h-4 text-emerald-600" />{" "}
                                    Tracking
                                  </div>
                                  <div className="mt-4 relative">
                                    <div className="absolute left-[11px] top-2 bottom-2 w-px bg-gray-200"></div>
                                    {[
                                      {
                                        label: "Order placed",
                                        done: true,
                                        date: o.created_at,
                                      },
                                      {
                                        label: "Confirmed",
                                        done: [
                                          "confirmed",
                                          "shipped",
                                          "delivered",
                                        ].includes(o.status),
                                      },
                                      {
                                        label: "Shipped",
                                        done: ["shipped", "delivered"].includes(
                                          o.status,
                                        ),
                                      },
                                      {
                                        label: "Delivered",
                                        done: o.status === "delivered",
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
                                              ? new Date(s.date).toLocaleString(
                                                  "en-IN",
                                                )
                                              : s.done
                                                ? "Completed"
                                                : "Pending"}
                                          </div>
                                        </div>
                                        {s.done && (
                                          <span className="w-2 h-2 bg-emerald-500 rounded-full shrink-0 mt-2" />
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                {o.status === "cancelled" &&
                                  o.cancel_reason && (
                                    <div className="bg-white border border-gray-300 rounded-xl p-4">
                                      <div className="font-medium text-xs text-gray-900">
                                        Cancelled — reason
                                      </div>
                                      <div className="text-sm text-gray-700 mt-2 leading-5 border border-gray-200 rounded-lg p-3 bg-gray-50">
                                        {o.cancel_reason}
                                      </div>
                                      {o.cancelled_at && (
                                        <div className="text-xs text-gray-500 mt-2">
                                          {new Date(
                                            o.cancelled_at,
                                          ).toLocaleString()}
                                        </div>
                                      )}
                                    </div>
                                  )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
              {cancelId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    onClick={() => setCancelId(null)}
                  />
                  <div className="relative bg-white rounded-[20px] border shadow-2xl w-full max-w-md p-6">
                    <h3 className="font-black text-lg">
                      {t("cancel_reason_required")}{" "}
                      <span className="text-red-600">*</span>
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Please tell us why you want to cancel. This helps us
                      improve and is mandatory.
                    </p>
                    <textarea
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder={t("cancel_reason_placeholder")}
                      className="mt-4 w-full border-2 rounded-2xl px-4 py-3 text-sm min-h-[110px] outline-none focus:border-red-300 focus:ring-2 focus:ring-red-50"
                      autoFocus
                    />
                    <div className="text-xs text-gray-400 mt-1">
                      {cancelReason.length}/200 • min 10 chars
                    </div>
                    {cancelErr && (
                      <div className="mt-2 text-xs bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl">
                        {cancelErr}
                      </div>
                    )}
                    <div className="flex gap-2 mt-5">
                      <button
                        onClick={() => setCancelId(null)}
                        className="flex-1 border-2 py-3 rounded-full font-black text-sm bg-white hover:bg-gray-50"
                      >
                        {t("keep_order")}
                      </button>
                      <button
                        onClick={submitCancel}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-full font-black text-sm"
                      >
                        {t("confirm_cancel")}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "wishlist" && (
            <div className="bg-white rounded-[22px] border border-[#e7ece0] p-6 md:p-7 shadow-sm">
              <div className="flex flex-wrap justify-between items-center gap-3">
                <div>
                  <h3 className="font-black text-xl tracking-tight">
                    My Wishlist{" "}
                    <span className="text-gray-400 font-bold text-sm">
                      • {wishlistCount} saved
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500">
                    Save now, buy when ready — get notified when back in stock
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={downloadAllGuides}
                    className="border-2 border-emerald-600 bg-emerald-50 text-emerald-700 px-4 py-2.5 rounded-full text-xs font-black hover:bg-emerald-600 hover:text-white"
                  >
                    📄 Guides
                  </button>
                  <Link
                    to="/shop"
                    className="bg-[#0c2e1f] text-white px-4 py-2.5 rounded-full text-xs font-black"
                  >
                    Browse →
                  </Link>
                </div>
              </div>
              {wishlistPlants.length === 0 ? (
                <div className="text-center py-14 border-2 border-dashed border-gray-200 rounded-[22px] mt-6 bg-[#fcfcfa]">
                  <div className="w-16 h-16 bg-white border rounded-2xl grid place-items-center mx-auto text-2xl shadow-sm">
                    ♡
                  </div>
                  <p className="font-black mt-4">Your wishlist is empty</p>
                  <p className="text-sm text-gray-500">
                    Save your favourites to buy later
                  </p>
                  <Link
                    to="/shop"
                    className="inline-block mt-4 bg-[#0c2e1f] text-white px-6 py-2.5 rounded-full text-sm font-black"
                  >
                    Browse plants
                  </Link>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
                  {wishlistPlants.map((p) => (
                    <div
                      key={p.id}
                      className="border border-[#e7ece0] rounded-[22px] overflow-hidden bg-white hover:shadow-lg transition flex flex-col group"
                    >
                      <div className="relative overflow-hidden">
                        <img
                          src={p.images?.[0]}
                          alt={p.name}
                          className="w-full h-48 object-cover bg-[#f6f7f4] group-hover:scale-[1.03] transition duration-500"
                        />
                        <span
                          className={`absolute top-3 left-3 text-xs font-black px-3 py-1 rounded-full shadow border ${p.stock_qty > 0 ? "bg-emerald-600 text-white border-emerald-600" : "bg-red-500 text-white border-red-500"}`}
                        >
                          {p.stock_qty > 0 ? "In stock" : "Out of stock"}
                        </span>
                        <button
                          onClick={() => removeWishlist(p)}
                          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur border shadow grid place-items-center hover:bg-red-50 text-gray-600"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <div className="font-black text-sm truncate">
                          {p.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {p.botanical_name}
                        </div>
                        <div className="text-sm font-black mt-1">
                          ₹{p.price}{" "}
                          {p.discount_price && (
                            <span className="text-xs text-gray-400 line-through ml-1">
                              ₹{p.market_price}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => moveToCart(p)}
                            className="flex-1 bg-[#0c2e1f] text-white py-2.5 rounded-full text-xs font-black hover:bg-black"
                          >
                            Move to cart
                          </button>
                          <button
                            onClick={() => removeWishlist(p)}
                            className="flex-1 border-2 py-2.5 rounded-full text-xs font-black bg-white hover:bg-gray-50"
                          >
                            Remove
                          </button>
                        </div>
                        {p.stock_qty === 0 && (
                          <label className="flex items-center gap-2 mt-3 text-xs bg-amber-50 border border-amber-100 rounded-full px-3 py-2.5">
                            <input
                              type="checkbox"
                              checked={!!notifyWishlist[p.id]}
                              onChange={(e) =>
                                setNotifyWishlist((n) => ({
                                  ...n,
                                  [p.id]: e.target.checked,
                                }))
                              }
                              className="accent-emerald-600"
                            />{" "}
                            Notify me when back in stock
                          </label>
                        )}
                        <button
                          onClick={() => downloadCareGuide(p)}
                          className="w-full mt-3 bg-white border-2 border-emerald-600 text-emerald-700 py-2.5 rounded-full text-xs font-black hover:bg-emerald-600 hover:text-white"
                        >
                          📄 Care guide PDF
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "addresses" && (
            <div className="space-y-4">
              <div className="bg-white rounded-[22px] border border-[#e7ece0] p-6 md:p-7 shadow-sm">
                <div className="flex flex-wrap justify-between items-center gap-3">
                  <div>
                    <h3 className="font-black text-xl tracking-tight">
                      Saved Addresses
                    </h3>
                    <p className="text-xs text-gray-500">
                      Manage delivery locations • Default used at checkout
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setAddressTab(!addressTab);
                      setEditingAddr(null);
                      setAddrForm({
                        label: "Home",
                        street: "",
                        city: "",
                        state: "",
                        postal_code: "",
                        country: "India",
                        is_default: false,
                      });
                    }}
                    className={`px-5 py-2.5 rounded-full text-xs font-black shadow border-2 ${addressTab ? "bg-white border-gray-900 text-gray-900" : "bg-[#0c2e1f] text-white border-[#0c2e1f] hover:bg-black"}`}
                  >
                    {addressTab ? "Close" : "＋ Add new address"}
                  </button>
                </div>

                {addressTab && (
                  <form
                    onSubmit={saveAddress}
                    className="mt-6 border-2 border-emerald-100 rounded-[22px] p-5 bg-[#fcfcfa] grid md:grid-cols-2 gap-3"
                  >
                    <div className="md:col-span-2 flex flex-wrap gap-2">
                      {["Home", "Work", "Other"].map((l) => (
                        <button
                          type="button"
                          key={l}
                          onClick={() => setAddrForm({ ...addrForm, label: l })}
                          className={`px-4 py-2 rounded-full text-xs font-black border-2 ${addrForm.label === l ? "bg-[#0c2e1f] text-white border-[#0c2e1f]" : "bg-white hover:bg-gray-50 border-gray-200"}`}
                        >
                          {l}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={useCurrentLocation}
                        disabled={geoLoading}
                        className="ml-auto text-xs bg-emerald-600 text-white px-4 py-2 rounded-full font-black disabled:opacity-60 shadow"
                      >
                        {geoLoading ? "Locating..." : "📍 Use current location"}
                      </button>
                    </div>
                    <input
                      placeholder="Street *"
                      value={addrForm.street}
                      onChange={(e) =>
                        setAddrForm({ ...addrForm, street: e.target.value })
                      }
                      className="border-2 rounded-xl px-4 py-3 text-sm bg-white outline-none focus:border-emerald-300"
                      required
                    />
                    <input
                      placeholder="City *"
                      value={addrForm.city}
                      onChange={(e) =>
                        setAddrForm({ ...addrForm, city: e.target.value })
                      }
                      className="border-2 rounded-xl px-4 py-3 text-sm bg-white outline-none focus:border-emerald-300"
                      required
                    />
                    <input
                      placeholder="State"
                      value={addrForm.state}
                      onChange={(e) =>
                        setAddrForm({ ...addrForm, state: e.target.value })
                      }
                      className="border-2 rounded-xl px-4 py-3 text-sm bg-white outline-none"
                    />
                    <input
                      placeholder="Postal Code"
                      value={addrForm.postal_code}
                      onChange={(e) =>
                        setAddrForm({
                          ...addrForm,
                          postal_code: e.target.value,
                        })
                      }
                      className="border-2 rounded-xl px-4 py-3 text-sm bg-white outline-none"
                    />
                    <input
                      placeholder="Country"
                      value={addrForm.country}
                      onChange={(e) =>
                        setAddrForm({ ...addrForm, country: e.target.value })
                      }
                      className="border-2 rounded-xl px-4 py-3 text-sm bg-white outline-none md:col-span-2"
                    />
                    <label className="flex items-center gap-2 text-sm md:col-span-2 bg-white border-2 rounded-xl px-3 py-3">
                      <input
                        type="checkbox"
                        checked={addrForm.is_default}
                        onChange={(e) =>
                          setAddrForm({
                            ...addrForm,
                            is_default: e.target.checked,
                          })
                        }
                        className="accent-emerald-600 w-4 h-4"
                      />{" "}
                      Set as default address
                    </label>
                    <div className="md:col-span-2 h-36 rounded-2xl border-2 border-dashed bg-white overflow-hidden relative grid place-items-center">
                      {addrForm.city ? (
                        <iframe
                          title="map"
                          className="w-full h-full border-0"
                          loading="lazy"
                          src={`https://maps.google.com/maps?q=${encodeURIComponent(addrForm.street + ", " + addrForm.city)}&z=14&output=embed`}
                        />
                      ) : (
                        <span className="text-xs text-gray-400">
                          📍 Pin will appear after you fill city • Map preview
                        </span>
                      )}
                      {addrForm.city && (
                        <span className="absolute bottom-2 left-2 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-black border shadow">
                          📍 {addrForm.city}
                        </span>
                      )}
                    </div>
                    <div className="md:col-span-2 flex gap-2 pt-1">
                      <button className="flex-1 bg-[#0c2e1f] text-white py-3 rounded-full font-black text-sm shadow">
                        {editingAddr ? "Update address" : "Save address"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAddressTab(false);
                          setEditingAddr(null);
                        }}
                        className="px-8 border-2 rounded-full font-black text-sm bg-white hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                <div className="mt-6 grid md:grid-cols-2 gap-4">
                  {addresses.length === 0 ? (
                    <div className="col-span-2 text-center py-10 border-2 border-dashed rounded-[22px] text-sm text-gray-500 bg-[#fcfcfa]">
                      No addresses saved. Added on checkout — or add one above.
                    </div>
                  ) : (
                    addresses.map((a) => (
                      <div
                        key={a.id}
                        className={`border-2 rounded-[22px] p-5 pt-7 relative transition ${a.is_default ? "border-emerald-300 bg-emerald-50/40 shadow-sm" : "bg-[#f6f7f4] border-transparent hover:border-gray-200 hover:bg-white"}`}
                      >
                        {a.is_default && (
                          <span className="absolute -top-3 left-5 bg-emerald-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow">
                            DEFAULT • PRIMARY
                          </span>
                        )}
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-black tracking-widest uppercase bg-white border shadow-sm px-3 py-1.5 rounded-full">
                            {a.label || "Home"}
                          </span>
                          <span className="text-xs text-gray-400 font-mono bg-white border px-2 py-1 rounded-full">
                            {a.postal_code}
                          </span>
                        </div>
                        <div className="font-black text-sm mt-4 leading-5">
                          {a.street}
                        </div>
                        <div className="text-sm text-gray-600">
                          {a.city}, {a.state} {a.postal_code}
                        </div>
                        <div className="text-xs text-gray-500">{a.country}</div>
                        <div className="flex gap-2 mt-5">
                          <button
                            onClick={() => startEditAddr(a)}
                            className="flex-1 border-2 bg-white py-2.5 rounded-full text-xs font-black hover:bg-gray-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteAddress(a.id)}
                            className="flex-1 border-2 border-red-100 text-red-600 bg-white py-2.5 rounded-full text-xs font-black hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                        {!a.is_default && (
                          <button
                            onClick={() => setDefaultAddress(a.id)}
                            className="w-full mt-3 text-xs font-black bg-[#0c2e1f] text-white py-2 rounded-full hover:bg-black"
                          >
                            Set as default
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {tab === "profile" && profile && (
            <div className="space-y-5">
              <div className="bg-white rounded-[22px] border border-[#e7ece0] p-6 md:p-7 shadow-sm">
                <div className="flex flex-wrap justify-between gap-3 items-start">
                  <div>
                    <h3 className="font-black text-xl tracking-tight">
                      Profile Settings
                    </h3>
                    <p className="text-xs text-gray-500">
                      Manage personal info, security & preferences
                    </p>
                  </div>
                  <span className="text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full">
                    Last updated {new Date().toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-5 mt-6 p-4 rounded-2xl bg-[#f6f7f0] border border-[#e9ece3]">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-[20px] bg-[#0c2e1f] text-white grid place-items-center text-3xl font-black border-4 border-white shadow-lg shrink-0">
                    {(profile.name || "G").slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="font-black text-gray-900 text-lg leading-none truncate">
                      {profile.name}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {profile.email} • Joined{" "}
                      {new Date(
                        profile.created_at || Date.now(),
                      ).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-emerald-700 font-bold mt-1">
                      Profile details are editable below.
                    </div>
                  </div>
                  <div className="ml-auto hidden md:flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />{" "}
                    <span className="text-xs font-black text-emerald-700">
                      Verified
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid md:grid-cols-2 gap-4 max-w-3xl">
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-gray-600">
                      Full Name
                    </label>
                    <input
                      value={edit.name}
                      onChange={(e) =>
                        setEdit({ ...edit, name: e.target.value })
                      }
                      className="mt-1.5 w-full border-2 rounded-xl px-4 py-3 text-sm bg-[#f6f7f4] focus:bg-white outline-none focus:border-emerald-300"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-gray-600">
                      Phone number
                    </label>
                    <input
                      value={edit.phone}
                      onChange={(e) =>
                        setEdit({ ...edit, phone: e.target.value })
                      }
                      placeholder="+91 ..."
                      className="mt-1.5 w-full border-2 rounded-xl px-4 py-3 text-sm bg-[#f6f7f4] focus:bg-white outline-none focus:border-emerald-300"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-600">
                      Email{" "}
                      <span className="text-gray-400 normal-case tracking-normal font-medium">
                        (re-verify if changed)
                      </span>
                    </label>
                    <input
                      value={edit.email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      className="mt-1.5 w-full border-2 rounded-xl px-4 py-3 text-sm bg-[#f6f7f4] focus:bg-white outline-none focus:border-emerald-300"
                    />
                    {emailChanged && (
                      <p className="text-xs text-amber-700 mt-2 bg-amber-50 border-2 border-amber-200 rounded-full px-3 py-1.5 inline-block">
                        ⚠ Email changed — you’ll need to re-verify after saving.
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6 max-w-3xl border-2 rounded-[20px] p-5 bg-[#fcfcfa]">
                  <h4 className="font-black text-sm flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-white border grid place-items-center text-sm">
                      🔔
                    </span>
                    Notification preferences
                  </h4>
                  <div className="mt-3 space-y-1 divide-y">
                    {[
                      {
                        k: "order",
                        label: "Order updates (SMS/Email)",
                        desc: "Shipping, delivery, cancellations",
                      },
                      {
                        k: "promo",
                        label: "Promotions & offers",
                        desc: "Seasonal discounts, new arrivals",
                      },
                      {
                        k: "care",
                        label: "Care-tip emails",
                        desc: "Weekly watering & fertilizing tips",
                      },
                    ].map((p) => (
                      <label
                        key={p.k}
                        className="flex justify-between items-center py-3.5 cursor-pointer"
                      >
                        <div>
                          <div className="font-black text-sm text-gray-900">
                            {p.label}
                          </div>
                          <div className="text-xs text-gray-500">{p.desc}</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifPrefs[p.k]}
                          onChange={(e) =>
                            setNotifPrefs({
                              ...notifPrefs,
                              [p.k]: e.target.checked,
                            })
                          }
                          className="w-5 h-5 accent-emerald-600"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-6">
                  <button
                    onClick={saveProfile}
                    className="bg-[#0c2e1f] text-white px-8 py-3 rounded-full font-black text-sm shadow hover:bg-black"
                  >
                    Save changes
                  </button>
                  {saveMsg && (
                    <span
                      className={`text-sm font-black px-4 py-2 rounded-full border-2 ${saveMsg.includes("✓") ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-600"}`}
                    >
                      {saveMsg}
                    </span>
                  )}
                </div>

                <div className="mt-8 pt-6 border-t-2 max-w-3xl">
                  <h4 className="font-black text-sm flex items-center gap-2">
                    🔒 Change password
                  </h4>
                  <div className="mt-3 grid md:grid-cols-3 gap-3">
                    <input
                      type="password"
                      placeholder="Current password"
                      value={pw.current}
                      onChange={(e) =>
                        setPw({ ...pw, current: e.target.value })
                      }
                      className="border-2 rounded-xl px-4 py-3 text-sm bg-[#f6f7f4] focus:bg-white outline-none"
                    />
                    <input
                      type="password"
                      placeholder="New password"
                      value={pw.next}
                      onChange={(e) => setPw({ ...pw, next: e.target.value })}
                      className="border-2 rounded-xl px-4 py-3 text-sm bg-[#f6f7f4] focus:bg-white outline-none"
                    />
                    <input
                      type="password"
                      placeholder="Confirm new"
                      value={pw.confirm}
                      onChange={(e) =>
                        setPw({ ...pw, confirm: e.target.value })
                      }
                      className="border-2 rounded-xl px-4 py-3 text-sm bg-[#f6f7f4] focus:bg-white outline-none"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <button
                      onClick={changePassword}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-full font-black text-sm shadow"
                    >
                      Update password
                    </button>
                    {pwMsg && (
                      <span
                        className={`text-sm font-black px-4 py-1.5 rounded-full border-2 ${pwMsg.includes("✓") ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-600"}`}
                      >
                        {pwMsg}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-8 border-2 border-red-100 rounded-[20px] overflow-hidden max-w-3xl">
                  <button
                    onClick={() => setShowDanger(!showDanger)}
                    className="w-full text-left px-5 py-4 bg-red-50 flex justify-between items-center hover:bg-red-100/60"
                  >
                    <span className="font-black text-sm text-red-700 flex items-center gap-2">
                      ⚠️ Danger zone — Delete account
                    </span>
                    <span className="w-7 h-7 rounded-full bg-white border grid place-items-center text-red-700 text-xs">
                      {showDanger ? "▲" : "▼"}
                    </span>
                  </button>
                  {showDanger && (
                    <div className="p-5 bg-white">
                      <p className="text-sm text-gray-600">
                        Delete your account and all data. This cannot be undone.
                        Orders will be anonymized.
                      </p>
                      <button
                        onClick={() => {
                          if (confirm("Delete account? This will logout.")) {
                            success(
                              "Account deletion requested — contact support",
                            );
                            logout();
                          }
                        }}
                        className="mt-4 border-2 border-red-200 text-red-600 px-5 py-2.5 rounded-full text-sm font-black bg-white hover:bg-red-50"
                      >
                        Delete account permanently
                      </button>
                    </div>
                  )}
                </div>

                <div
                  id="support-history"
                  className="mt-8 max-w-3xl bg-[#f6f7f0] border-2 border-dashed rounded-[20px] p-5"
                >
                  <h4 className="font-black text-sm flex items-center gap-2">
                    Support ticket history{" "}
                    <span className="bg-[#0c2e1f] text-white text-xs px-2.5 py-1 rounded-full">
                      {supportTickets.length}
                    </span>
                  </h4>
                  <div className="mt-3 space-y-2 max-h-56 overflow-auto pr-1">
                    {supportTickets.map((t) => (
                      <div
                        key={t.id}
                        className="bg-white border rounded-xl p-3 flex justify-between gap-3 text-sm shadow-sm"
                      >
                        <div className="min-w-0">
                          <div className="font-black truncate">{t.subject}</div>
                          <div className="text-xs text-gray-500 truncate">
                            {t.msg} • {t.date}
                          </div>
                        </div>
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full border font-black h-fit shrink-0 ${t.status === "Resolved" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-amber-50 border-amber-200 text-amber-700"}`}
                        >
                          {t.status}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <input
                      value={newTicket}
                      onChange={(e) => setNewTicket(e.target.value)}
                      placeholder="New query — e.g., delivery issue..."
                      className="flex-1 border-2 rounded-full px-4 py-2.5 text-sm bg-white outline-none focus:border-emerald-300"
                    />
                    <button
                      onClick={() => {
                        if (!newTicket) return;
                        setSupportTickets([
                          ...supportTickets,
                          {
                            id: Date.now().toString(),
                            subject: newTicket.slice(0, 22),
                            status: "Open",
                            date: new Date().toISOString().slice(0, 10),
                            msg: newTicket,
                          },
                        ]);
                        setNewTicket("");
                      }}
                      className="bg-[#0c2e1f] text-white px-6 py-2.5 rounded-full text-xs font-black shadow"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes wiggle{0%,100%{transform:rotate(0)}25%{transform:rotate(-10deg)}75%{transform:rotate(10deg)}}`}</style>

      {/* mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 z-30 flex items-center justify-around px-2 py-1.5">
        {menu.map((m) => {
          const active = tab === m.id;
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              onClick={() => selectTab(m.id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition min-w-[64px] ${active ? "text-[#0c2e1f]" : "text-gray-400 hover:text-gray-600"}`}
            >
              <div className={`w-9 h-9 rounded-xl grid place-items-center transition ${active ? "bg-[#0c2e1f] text-white shadow-md" : "bg-transparent"}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-semibold truncate">{m.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
