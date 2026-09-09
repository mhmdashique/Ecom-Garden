import { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import jsPDF from "jspdf";
import { useToast } from "../components/Toast";
import PlantEditDrawer from "../components/PlantEditDrawer";

export function AdminLogin() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { success, error: toastError } = useToast();
  const nav = useNavigate();
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    try {
      const r = await api.post("/admin/auth/login", form);
      login(r.data.token, r.data.user);
      nav("/admin");
    } catch (e) {
      const message = e.response?.data?.error || "Authentication failed";
      setErr(message);
      toastError(message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-[80vh] grid place-items-center bg-[#f6f7f4] px-4 py-10">
      <div className="w-full max-w-[420px] bg-white rounded-[24px] border shadow-xl p-6 md:p-8">
        <div className="w-12 h-12 rounded-xl bg-[#0a2e1f] text-white grid place-items-center mx-auto">
          ♛
        </div>
        <h1 className="mt-3 text-2xl font-black text-center tracking-tight">
          Admin Login
        </h1>
        <p className="text-center text-sm text-gray-500">
          Secure access for GreenNest team only
        </p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          {err && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {err}
            </div>
          )}
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-gray-600">
              Admin Email
            </label>
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 w-full bg-[#f6f7f4] border rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-emerald-300"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-gray-600">
              Password
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="mt-1 w-full bg-[#f6f7f4] border rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-emerald-300"
            />
          </div>
          <button
            disabled={loading}
            className="w-full bg-[#0a2e1f] text-white py-3.5 rounded-full font-bold text-sm hover:bg-black disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Enter Dashboard →"}
          </button>
        </form>
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const { success, error: toastError } = useToast();
  const [stats, setStats] = useState(null);
  const [plants, setPlants] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState("overview");
  const [showAdd, setShowAdd] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [editingPlant, setEditingPlant] = useState(null);
  const [plantDrawerOpen, setPlantDrawerOpen] = useState(false);
  const [dark, setDark] = useState(
    () => localStorage.getItem("admin-dark") === "true",
  );
  const [globalSearch, setGlobalSearch] = useState("");
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [plantView, setPlantView] = useState("table");
  const [selectedIds, setSelectedIds] = useState([]);
  const [editingStock, setEditingStock] = useState(null);
  const [stockVal, setStockVal] = useState("");
  const [plantCategory, setPlantCategory] = useState("All");
  const [orderFilter, setOrderFilter] = useState("All");
  const [ordersView, setOrdersView] = useState("list");
  const [mgmtOpen, setMgmtOpen] = useState(true);
  const [orgOpen, setOrgOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [bulkStatus, setBulkStatus] = useState("confirmed");
  const [userSearch, setUserSearch] = useState("");
  const [expandedUser, setExpandedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editUserForm, setEditUserForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "user",
  });
  const [msgs, setMsgs] = useState([]);
  const [msgFilter, setMsgFilter] = useState("All");
  const [reviews, setReviews] = useState([]);
  const [reviewFilter, setReviewFilter] = useState("All");
  const [dragOver, setDragOver] = useState(false);
  const [previewImg, setPreviewImg] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null); // {id, name, type: 'single'|'bulk'}

  useEffect(() => {
    localStorage.setItem("admin-dark", dark);
  }, [dark]);
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [statsRes, plantsRes, ordersRes, usersRes, msgsRes, reviewsRes] =
          await Promise.all([
            api.get("/admin/stats"),
            api.get("/plants?limit=100"),
            api.get("/orders"),
            api.get("/users"),
            api.get("/contact"),
            api.get("/reviews"),
          ]);
        if (!active) return;
        setStats(statsRes.data);
        setPlants(plantsRes.data.plants || []);
        setOrders(ordersRes.data || []);
        setUsers(usersRes.data || []);
        setMsgs(msgsRes.data || []);
        setReviews(reviewsRes.data || []);
      } catch (error) {
        if (!active) return;
        if (error.response?.status === 401 || error.response?.status === 403) {
          logout();
          toastError("Your admin session expired. Please sign in again.");
          nav("/admin/login");
          return;
        }
        toastError("Could not load admin dashboard data. Please try again.");
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [logout, nav, toastError]);

  const openAddDrawer = () => {
    setEditingPlant(null);
    setPlantDrawerOpen(true);
  };
  const openEditDrawer = (plant) => {
    setEditingPlant(plant);
    setPlantDrawerOpen(true);
  };
  const handlePlantSave = async (payload) => {
    try {
      if (editingPlant) {
        const res = await api.put(`/plants/${editingPlant.id}`, payload);
        const updated = res.data;
        setPlants((prev) =>
          prev.map((p) => (p.id === editingPlant.id ? updated : p)),
        );
        if (selectedPlant?.id === editingPlant.id) setSelectedPlant(updated);
        success("Plant updated successfully");
      } else {
        const res = await api.post("/plants", payload);
        const newPlant = res.data;
        setPlants((prev) => [newPlant, ...prev]);
        success("Plant added successfully");
        api
          .get("/admin/stats")
          .then((r) => setStats(r.data))
          .catch(() => {});
      }
      setPlantDrawerOpen(false);
      setEditingPlant(null);
    } catch (err) {
      toastError(err.response?.data?.error || "Failed to save plant");
      throw err;
    }
  };
  const delPlant = (id) => {
    const plant = plants.find((p) => p.id === id);
    setDeleteTarget({ id, name: plant?.name || id, type: "single" });
  };
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === "single") {
        await api.delete(`/plants/${deleteTarget.id}`);
        setPlants((p) => p.filter((x) => x.id !== deleteTarget.id));
        if (selectedPlant?.id === deleteTarget.id) setSelectedPlant(null);
        success(`Deleted ${deleteTarget.name}`);
      } else if (deleteTarget.type === "bulk") {
        for (let id of selectedIds) await api.delete(`/plants/${id}`);
        setPlants((p) => p.filter((x) => !selectedIds.includes(x.id)));
        success(`Deleted ${selectedIds.length} plants`);
        setSelectedIds([]);
      }
    } catch (e) {
      toastError(e.response?.data?.error || "Delete failed");
    } finally {
      setDeleteTarget(null);
    }
  };
  const bulkDelete = () => {
    if (selectedIds.length === 0) return;
    setDeleteTarget({
      id: "bulk",
      name: `${selectedIds.length} plants`,
      type: "bulk",
    });
  };
  const bulkOutOfStock = async () => {
    for (let id of selectedIds) {
      await api.put(`/plants/${id}`, { stock_qty: 0 });
    }
    setPlants((p) =>
      p.map((x) => (selectedIds.includes(x.id) ? { ...x, stock_qty: 0 } : x)),
    );
    setSelectedIds([]);
    success("Marked out of stock");
  };
  const saveStock = async (id) => {
    await api.put(`/plants/${id}`, { stock_qty: +stockVal });
    setPlants((p) =>
      p.map((x) => (x.id === id ? { ...x, stock_qty: +stockVal } : x)),
    );
    setEditingStock(null);
  };
  const startEditUser = (u) => {
    setEditingUser(u.id);
    setEditUserForm({
      name: u.name || "",
      email: u.email || "",
      phone: u.phone || "",
      role: u.role || "user",
    });
  };
  const saveUserEdit = async () => {
    if (!editingUser) return;
    try {
      const res = await api.put(`/users/${editingUser}`, editUserForm);
      setUsers((prev) =>
        prev.map((x) => (x.id === editingUser ? { ...x, ...res.data } : x)),
      );
      if (expandedUser === editingUser) setExpandedUser(null);
      success("User updated");
      setEditingUser(null);
    } catch (e) {
      toastError(e.response?.data?.error || "Failed to update user");
    }
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      const r = new FileReader();
      r.onload = () => setPreviewImg(r.result);
      r.readAsDataURL(file);
    }
  };
  const downloadPDF = (title, headers, rows, filename) => {
    const doc = new jsPDF();
    const pageW = 210,
      pageH = 297,
      margin = 14;
    const colW = (pageW - margin * 2) / headers.length;
    const headerH = 10,
      rowH = 8;
    const drawHeader = (pageNum) => {
      // top bar
      doc.setFillColor(10, 46, 31);
      doc.rect(0, 0, pageW, 16, "F");
      doc.setFillColor(16, 122, 62);
      doc.circle(10, 8, 4, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.text("G", 8.5, 10);
      doc.setFontSize(10);
      doc.text("GreenNest", 16, 10);
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.text(
        "Admin Report • Pezhummoodu, Thiruvananthapuram, Kerala",
        16,
        13,
      );
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.text(`Page ${pageNum}`, pageW - margin, 10, { align: "right" });
      // title block
      doc.setTextColor(10, 46, 31);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(title, margin, 24);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Generated: ${new Date().toLocaleString()} • ${rows.length} records`,
        margin,
        28,
      );
      // header row
      doc.setFillColor(10, 46, 31);
      doc.rect(margin, 32, pageW - margin * 2, headerH, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      headers.forEach((h, i) => {
        doc.text(String(h).toUpperCase(), margin + i * colW + 2, 38);
      });
      doc.setDrawColor(220, 220, 220);
      // footer line placeholder
      doc.setTextColor(120, 120, 120);
      doc.setFontSize(6);
      doc.text(
        "© GreenNest • H34Q+9FP, Pezhummoodu, Thiruvananthapuram, Kerala 695575 • GST Invoice on request",
        margin,
        pageH - 8,
      );
    };
    let page = 1;
    drawHeader(page);
    let y = 42;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(17, 24, 39);
    rows.forEach((row, idx) => {
      if (y + rowH > pageH - 14) {
        doc.addPage();
        page++;
        drawHeader(page);
        y = 42;
      }
      // alternating row bg
      if (idx % 2 === 0) {
        doc.setFillColor(246, 247, 244);
        doc.rect(margin, y, pageW - margin * 2, rowH, "F");
      }
      // cell borders
      doc.setDrawColor(229, 231, 235);
      doc.rect(margin, y, pageW - margin * 2, rowH, "S");
      headers.forEach((_, i) => {
        if (i > 0) doc.line(margin + i * colW, y, margin + i * colW, y + rowH);
      });
      row.forEach((cell, i) => {
        const txt = String(cell).substring(0, 28 + Math.floor(colW / 4));
        // truncate to fit
        doc.setFontSize(7);
        doc.text(txt, margin + i * colW + 2, y + 5);
      });
      y += rowH;
    });
    // bottom summary
    doc.setFontSize(7);
    doc.setTextColor(80, 80, 80);
    doc.text(
      `Total records: ${rows.length} • Printed from GreenNest Admin`,
      margin,
      y + 6,
    );
    doc.save(filename);
    success(`${title} downloaded — ${rows.length} rows`);
  };

  const printInvoice = (order) => {
    const customer = users.find((u) => u.id === order.user_id) || {};
    const cName =
      (customer.name && customer.name.trim()) ||
      order.user_name ||
      order.customer_name ||
      "Customer";
    const cEmail = customer.email || order.user_email || "";
    const cPhone = customer.phone || order.customer_phone || order.phone || "";
    const addr = order.address || {};
    const items = order.items || [];
    const subtotal = items.reduce((s, it) => {
      const p = plants.find((x) => x.id === it.plant_id);
      const price = it.price || p?.price || 0;
      return s + price * it.quantity;
    }, 0);
    const shipping = Number(order.shipping ?? 49);
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>Invoice #${order.id.slice(0, 8).toUpperCase()}</title>
      <style>
        body{font-family:Inter,system-ui,Arial,sans-serif;color:#111827;margin:0;padding:24px;background:#fff}
        .header{background:#0a2e1f;color:#fff;padding:16px 20px;display:flex;justify-content:space-between;align-items:center}
        .badge{background:#10b981;color:#fff;font-size:10px;font-weight:800;padding:4px 8px;border-radius:999px}
        .card{border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin-top:16px}
        .grid2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
        table{width:100%;border-collapse:collapse;margin-top:12px}
        th{background:#0a2e1f;color:#fff;text-align:left;font-size:11px;padding:8px}
        td{border:1px solid #e5e7eb;padding:8px;font-size:12px}
        tr:nth-child(even) td{background:#f9fafb}
        .totals{margin-left:auto;width:260px;margin-top:12px;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden}
        .totals div{display:flex;justify-content:space-between;padding:8px 12px;font-size:12px}
        .totals .grand{background:#0a2e1f;color:#fff;font-weight:800}
        .footer{margin-top:20px;text-align:center;font-size:11px;color:#6b7280;border-top:1px solid #e5e7eb;padding-top:12px}
        @media print{body{padding:0} .no-print{display:none}}
      </style></head><body>
      <div class="header">
        <div style="display:flex;gap:10px;align-items:center"><div style="width:32px;height:32px;background:#10b981;border-radius:8px;display:grid;place-items:center;font-weight:900">🌿</div><div><div style="font-weight:900">GreenNest</div><div style="font-size:11px;color:#a7f3d0">Pezhummoodu, Thiruvananthapuram, Kerala • H34Q+9FP</div></div></div>
        <div style="text-align:right"><div style="font-weight:900;letter-spacing:0.08em">INVOICE</div><div style="font-size:12px;margin-top:4px">#${order.id.slice(0, 8).toUpperCase()} • ${new Date(order.created_at).toLocaleDateString()}</div><div style="margin-top:6px"><span class="badge">${order.status.toUpperCase()}</span> <span class="badge" style="background:#fff;color:#0a2e1f;border:1px solid #e5e7eb">${order.payment_method}</span></div></div>
      </div>
      <div class="grid2">
        <div class="card"><div style="font-size:11px;font-weight:800;letter-spacing:0.1em;color:#065f46">BILL TO</div><div style="font-weight:800;margin-top:6px">${cName}</div><div style="font-size:12px;color:#4b5563">${cEmail}<br/>${cPhone ? `Ph: ${cPhone}` : ""}</div><div style="font-size:11px;color:#6b7280;margin-top:6px">Customer ID: ${order.user_id || ""}</div></div>
        <div class="card"><div style="font-size:11px;font-weight:800;letter-spacing:0.1em;color:#065f46">SHIP TO</div><div style="font-size:12px;margin-top:6px;line-height:1.5">${addr.street || ""}<br/>${addr.city || ""} ${addr.state || ""} ${addr.postal_code || ""}<br/>${addr.country || "India"}</div></div>
      </div>
      <table><thead><tr><th>#</th><th>Item</th><th>Qty</th><th>Price</th><th>Amount</th></tr></thead><tbody>
        ${items
          .map((it, i) => {
            const p = plants.find((x) => x.id === it.plant_id);
            const name = it.name || p?.name || it.plant_id;
            const price = it.price || p?.price || 0;
            const amt = price * it.quantity;
            return `<tr><td>${i + 1}</td><td><b>${name}</b><div style="font-size:11px;color:#6b7280">${it.variantId || it.selectedVariant || ""} ${p?.sku || ""}</div></td><td>${it.quantity}</td><td>₹${price}</td><td><b>₹${amt.toFixed(2)}</b></td></tr>`;
          })
          .join("")}
      </tbody></table>
      <div class="totals"><div><span>Subtotal</span><span>₹${subtotal.toFixed(2)}</span></div><div><span>Shipping</span><span>${shipping === 0 ? "FREE" : `₹${shipping.toFixed(2)}`}</span></div><div class="grand"><span>TOTAL</span><span>₹${(order.total_amount || 0).toFixed(2)}</span></div></div>
      <div class="footer">Thank you for growing with GreenNest! • GST bill on request • hello@greenest.com • +91 98765 43210<br/>H34Q+9FP, Pezhummoodu, Thiruvananthapuram, Kerala 695575 • This is a computer generated invoice</div>
      <div class="no-print" style="text-align:center;margin-top:16px"><button onclick="window.print()" style="background:#0a2e1f;color:#fff;padding:10px 18px;border-radius:999px;border:none;font-weight:800;cursor:pointer">Print</button> <button onclick="window.close()" style="background:#fff;border:1px solid #e5e7eb;padding:10px 18px;border-radius:999px;font-weight:700;cursor:pointer;margin-left:8px">Close</button></div>
      </body></html>
    `);
    win.document.close();
    setTimeout(() => win.print(), 300);
  };

  const menu = [
    { id: "overview", label: "Overview", icon: "▦" },
    { id: "orders", label: "Orders", icon: "📦" },
    { id: "users", label: "Customers", icon: "👥" },
    { id: "plants", label: "Products", icon: "🌿" },
    { id: "reviews", label: "Reviews", icon: "⭐" },
    { id: "messages", label: "Messages", icon: "✉" },
  ];

  const notifCount =
    orders.filter((o) => o.status === "pending_owner").length +
    (stats?.lowStock?.length || 0) +
    msgs.filter((m) => !m.reply).length;
  const categories = [
    "All",
    "Indoor Plants",
    "Outdoor Plants",
    "Succulents",
    "Flowering Plants",
    "Seeds & Tools",
  ];
  const filteredPlants = plants.filter((p) => {
    const matchesSearch =
      !globalSearch ||
      p.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
      p.sku?.toLowerCase().includes(globalSearch.toLowerCase());
    const catName =
      {
        1: "Indoor Plants",
        2: "Outdoor Plants",
        3: "Succulents",
        4: "Flowering Plants",
        5: "Seeds & Tools",
      }[p.category_id] || "";
    const matchesCat = plantCategory === "All" || catName === plantCategory;
    return matchesSearch && matchesCat;
  });
  const filteredOrders = orders.filter((o) => {
    const q = globalSearch.trim().toLowerCase();
    const matchesSearch =
      !q ||
      o.id.toLowerCase().includes(q) ||
      (o.user_name || "").toLowerCase().includes(q) ||
      (o.user_email || "").toLowerCase().includes(q);
    if (orderFilter === "All") return matchesSearch;
    // map UI tabs to internal statuses
    const map = {
      Pending: "pending_owner",
      pending_owner: "pending_owner",
      Confirmed: "confirmed",
      confirmed: "confirmed",
      "Out for Delivery": "shipped",
      shipped: "shipped",
      Delivered: "delivered",
      delivered: "delivered",
      Cancelled: "cancelled",
      cancelled: "cancelled",
      "Ready For Pickup": "ready_for_pickup",
      "Ready for Pickup": "ready_for_pickup",
      Draft: "draft",
      Processing: "processing",
      Allocated: "allocated",
    };
    const target =
      map[orderFilter] || orderFilter.toLowerCase().replace(/ /g, "_");
    return o.status === target && matchesSearch;
  });
  const filteredUsers = users.filter(
    (u) =>
      !userSearch ||
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()),
  );
  const filteredMsgs = msgs.filter(
    (m) =>
      msgFilter === "All" ||
      (msgFilter === "Unread" && !m.reply) ||
      (msgFilter === "Resolved" && m.reply),
  );
  const filteredReviews = reviews.filter((r) => {
    if (reviewFilter === "All")
      return (
        !globalSearch ||
        (r.comment || "").toLowerCase().includes(globalSearch.toLowerCase()) ||
        (r.user_name || "").toLowerCase().includes(globalSearch.toLowerCase())
      );
    if (reviewFilter === "5★") return r.rating === 5;
    if (reviewFilter === "4★") return r.rating === 4;
    if (reviewFilter === "3★") return r.rating <= 3;
    return true;
  });

  const updateOrderInlineStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) =>
        prev.map((x) => (x.id === orderId ? { ...x, status: newStatus } : x)),
      );
      success(`Status → ${newStatus}`);
    } catch (e) {
      toastError(e.response?.data?.error || "Failed");
    }
  };
  const updateOrderInlinePayment = async (orderId, newVal) => {
    const v = newVal === "paid" ? "paid" : "pending";
    try {
      await api.put(`/orders/${orderId}`, { payment_status: v });
      setOrders((prev) =>
        prev.map((x) => (x.id === orderId ? { ...x, payment_status: v } : x)),
      );
      success(`Payment → ${v}`);
    } catch (e) {
      toastError(e.response?.data?.error || "Failed");
    }
  };
  const card = dark
    ? "bg-[#1e1e1e] border-[#333] text-white"
    : "bg-white border-gray-100 text-gray-900";
  const cardMuted = dark
    ? "bg-white/5 border-white/10 text-white"
    : "bg-[#f6f7f4] border-gray-200 text-gray-900";
  const inputCls = dark
    ? "bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20 focus:border-emerald-500"
    : "bg-[#f6f7f4] border-gray-200 text-gray-900 focus:bg-white focus:border-emerald-300";

  return (
    <div
      className={
        dark ? "bg-[#0f1110] min-h-screen flex" : "bg-white min-h-screen flex"
      }
    >
      <aside
        className={`hidden lg:flex w-[280px] shrink-0 flex-col sticky top-0 h-screen overflow-hidden border-r ${dark ? "border-white/5 bg-[#080a0f] text-white" : "border-gray-200 bg-white text-gray-900"}`}
      >
        {/* Brand */}
        <div
          className={`px-4 pt-5 pb-4 border-b ${dark ? "border-white/5" : "border-gray-100"}`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0a2e1f] text-white grid place-items-center">
              🌿
            </div>
            <div>
              <div
                className={`font-black text-sm leading-none ${dark ? "text-white" : "text-gray-900"}`}
              >
                GreenNest
              </div>
              <div
                className={`text-[11px] font-medium ${dark ? "text-white/50" : "text-gray-500"}`}
              >
                2-acre • Pezhummoodu
              </div>
            </div>
          </div>
          <div
            className={`mt-3 text-[11px] font-medium border rounded-full px-3 py-1 inline-flex items-center gap-2 ${dark ? "text-white/40 bg-white/5 border-white/5" : "text-gray-600 bg-gray-50 border-gray-200"}`}
          >
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>{" "}
            Admin • {user?.name || "Admin"}
          </div>
        </div>

        {/* Nav - only 5 items */}
        <div className="flex-1 overflow-auto px-3 py-4">
          <div
            className={`text-[11px] font-black tracking-widest uppercase px-2 mb-2 ${dark ? "text-white/30" : "text-gray-400"}`}
          >
            Menu
          </div>
          <nav className="space-y-1">
            <button
              onClick={() => setTab("overview")}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm flex items-center gap-3 transition ${tab === "overview" ? (dark ? "bg-white text-[#080a0f]" : "bg-gray-900 text-white") : dark ? "text-white/60 hover:text-white hover:bg-white/5" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`}
            >
              <span
                className={`w-7 h-7 rounded-lg grid place-items-center ${tab === "overview" ? (dark ? "bg-[#080a0f] text-white" : "bg-white/15 text-white") : dark ? "bg-white/10 text-white/60" : "bg-gray-100 text-gray-600"}`}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <rect x="3" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="3" width="7" height="7" rx="1.5" />
                  <rect x="3" y="14" width="7" height="7" rx="1.5" />
                  <rect x="14" y="14" width="7" height="7" rx="1.5" />
                </svg>
              </span>{" "}
              Dashboard
            </button>
            <button
              onClick={() => setTab("orders")}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm flex items-center gap-3 transition ${tab === "orders" ? (dark ? "bg-white text-[#080a0f]" : "bg-gray-900 text-white") : dark ? "text-white/60 hover:text-white hover:bg-white/5" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`}
            >
              <span
                className={`w-7 h-7 rounded-lg grid place-items-center ${tab === "orders" ? (dark ? "bg-[#080a0f] text-white" : "bg-white/15 text-white") : dark ? "bg-white/10 text-white/60" : "bg-gray-100 text-gray-600"}`}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M6 7h12l-1 9a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 7Z" />
                  <path d="M9 7V5a3 3 0 0 1 6 0v2" />
                </svg>
              </span>{" "}
              Orders
              {orders.filter((o) => o.status === "pending_owner").length >
                0 && (
                <span className="ml-auto bg-[#2a5bd7] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {orders.filter((o) => o.status === "pending_owner").length}
                </span>
              )}
            </button>
            <button
              onClick={() => setTab("users")}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm flex items-center gap-3 transition ${tab === "users" ? (dark ? "bg-white text-[#080a0f]" : "bg-gray-900 text-white") : dark ? "text-white/60 hover:text-white hover:bg-white/5" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`}
            >
              <span
                className={`w-7 h-7 rounded-lg grid place-items-center ${tab === "users" ? (dark ? "bg-[#080a0f] text-white" : "bg-white/15 text-white") : dark ? "bg-white/10 text-white/60" : "bg-gray-100 text-gray-600"}`}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M16 19a4 4 0 0 0-8 0" />
                  <circle cx="12" cy="7" r="3" />
                  <path d="M6 19a4 4 0 0 1 4-4h0" />
                </svg>
              </span>{" "}
              Customers
              <span
                className={`ml-auto text-[11px] px-2 py-0.5 rounded-full ${dark ? "bg-white/10 text-white/60" : "bg-gray-100 text-gray-600"}`}
              >
                {users.length}
              </span>
            </button>
            <button
              onClick={() => setTab("plants")}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm flex items-center gap-3 transition ${tab === "plants" ? (dark ? "bg-white text-[#080a0f]" : "bg-gray-900 text-white") : dark ? "text-white/60 hover:text-white hover:bg-white/5" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`}
            >
              <span
                className={`w-7 h-7 rounded-lg grid place-items-center ${tab === "plants" ? (dark ? "bg-[#080a0f] text-white" : "bg-white/15 text-white") : dark ? "bg-white/10 text-white/60" : "bg-gray-100 text-gray-600"}`}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M12 2C7 2 5 6.5 5 10c0 3.5 2 6 7 10 5-4 7-6.5 7-10 0-3.5-2-8-7-8Z" />
                  <path d="M12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
                </svg>
              </span>{" "}
              Products
              <span
                className={`ml-auto text-[11px] px-2 py-0.5 rounded-full ${dark ? "bg-white/10 text-white/60" : "bg-gray-100 text-gray-600"}`}
              >
                {plants.length}
              </span>
            </button>
            <button
              onClick={() => setTab("reviews")}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm flex items-center gap-3 transition ${tab === "reviews" ? (dark ? "bg-white text-[#080a0f]" : "bg-gray-900 text-white") : dark ? "text-white/60 hover:text-white hover:bg-white/5" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`}
            >
              <span
                className={`w-7 h-7 rounded-lg grid place-items-center ${tab === "reviews" ? (dark ? "bg-[#080a0f] text-white" : "bg-white/15 text-white") : dark ? "bg-white/10 text-white/60" : "bg-gray-100 text-gray-600"}`}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M12 3l2.3 4.7 5.2.8-3.8 3.7.9 5.2L12 15.9l-4.6 2.4.9-5.2L4.5 8.5l5.2-.8L12 3Z" />
                </svg>
              </span>{" "}
              Reviews
              {reviews.length > 0 && (
                <span className="ml-auto bg-amber-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {reviews.length}
                </span>
              )}
            </button>

          </nav>
          <div
            className={`mt-6 mx-2 rounded-2xl p-4 border ${dark ? "bg-gradient-to-br from-[#0a2e1f] to-[#1a5a3a] border-white/10 text-white" : "bg-[#f6f7f4] border-gray-200 text-gray-900"}`}
          >
            <div
              className={`text-xs font-black ${dark ? "text-white" : "text-gray-900"}`}
            >
              Need help?
            </div>
            <div
              className={`text-xs mt-1 leading-4 ${dark ? "text-white/60" : "text-gray-500"}`}
            >
              Manage orders, customers and products from here.
            </div>
            <a
              href="/"
              className={`mt-3 inline-flex px-3 py-1.5 rounded-full text-xs font-black ${dark ? "bg-white text-[#0a2e1f]" : "bg-gray-900 text-white"}`}
            >
              Go to Store →
            </a>
          </div>
        </div>

        {/* User */}
        <div
          className={`p-3 border-t flex items-center gap-3 ${dark ? "border-white/5" : "border-gray-100"}`}
        >
          <img
            src={`https://i.pravatar.cc/100?u=${user?.email}`}
            alt=""
            className={`w-8 h-8 rounded-full object-cover border ${dark ? "border-white/10" : "border-gray-200"}`}
          />
          <div className="flex-1 min-w-0">
            <div
              className={`text-sm font-bold leading-none truncate ${dark ? "text-white" : "text-gray-900"}`}
            >
              {user?.name || "Admin"}
            </div>
            <div
              className={`text-xs truncate ${dark ? "text-white/50" : "text-gray-500"}`}
            >
              {user?.email}
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              nav("/");
            }}
            className={`w-8 h-8 rounded-full grid place-items-center text-xs font-black ${dark ? "bg-white text-[#080a0f] hover:bg-white/90" : "bg-gray-900 text-white hover:bg-black"}`}
          >
            →
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        {/* TOP BAR */}
        <div
          className={`sticky top-0 z-20 border-b flex items-center gap-3 px-4 md:px-6 py-3 ${dark ? "bg-[#1a1f1b] border-white/10 text-white" : "bg-white border-gray-100 text-gray-900"}`}
        >
          <div className="hidden md:flex items-center gap-2 text-xs font-bold">
            <span className={dark ? "text-white/60" : "text-gray-400"}>
              Admin
            </span>
            <span className="text-gray-300">/</span>
            <span className="capitalize text-emerald-600">{tab}</span>
          </div>
          <div className="flex-1 max-w-[420px] relative hidden md:block">
            <span
              className={`absolute left-3 top-1/2 -translate-y-1/2 ${dark ? "text-white/40" : "text-gray-400"}`}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="11" cy="11" r="6" />
                <path d="M15 15l4 4" />
              </svg>
            </span>
            <input
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Search plants, orders, users..."
              className={`w-full rounded-full pl-9 pr-4 py-2 text-sm outline-none border ${dark ? "bg-white/10 border-white/20 text-white placeholder:text-white/50" : "bg-[#f6f7f4] border-gray-200 focus:bg-white focus:border-emerald-300"}`}
            />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setDark(!dark)}
              className={`w-9 h-9 rounded-full border grid place-items-center ${dark ? "bg-white text-[#0a2e1f] border-white" : "bg-[#f6f7f4] border-gray-200 text-gray-700"}`}
            >
              {dark ? (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                </svg>
              ) : (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M12 3a6 6 0 0 0 9 9c0 4.5-4 8-9 8s-9-3.5-9-8a6 6 0 0 0 9-9Z" />
                </svg>
              )}
            </button>
            <div className="relative">
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className={`relative w-9 h-9 rounded-full border grid place-items-center ${dark ? "bg-white/10 border-white/20 text-white" : "bg-[#f6f7f4] border-gray-200"}`}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M6 13a6 6 0 0 0 12 0c0-3-2-5-2-7H8c0 2-2 4-2 7Z" />
                  <path d="M9 16a3 3 0 0 0 6 0" />
                </svg>
                {notifCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black min-w-[16px] h-[16px] grid place-items-center rounded-full">
                    {notifCount}
                  </span>
                )}
              </button>
              {showNotifs && (
                <div
                  className={`absolute right-0 mt-2 w-80 border rounded-2xl shadow-xl overflow-hidden z-50 ${dark ? "bg-[#1e1e1e] border-gray-700 text-white" : "bg-white border-gray-100 text-gray-900"}`}
                >
                  <div
                    className={`p-3 font-black border-b ${dark ? "border-gray-700" : "border-gray-100"}`}
                  >
                    Notifications • {notifCount}
                  </div>
                  <div className="max-h-80 overflow-auto divide-y">
                    {orders
                      .filter((o) => o.status === "pending_owner")
                      .slice(0, 3)
                      .map((o) => (
                        <div
                          key={o.id}
                          className={`p-3 ${dark ? "hover:bg-white/5" : "hover:bg-gray-50"}`}
                        >
                          <div className="font-bold">
                            New COD order #{o.id.slice(0, 6)}
                          </div>
                          <div className="text-xs text-gray-500">
                            ₹{o.total_amount} • {o.user_name}
                          </div>
                        </div>
                      ))}
                    {(stats?.lowStock || []).slice(0, 3).map((p) => (
                      <div
                        key={p.id}
                        className={`p-3 ${dark ? "hover:bg-white/5" : "hover:bg-gray-50"}`}
                      >
                        <div className="font-bold">Low stock: {p.name}</div>
                        <div className="text-xs text-amber-700">
                          {p.stock_qty} left
                        </div>
                      </div>
                    ))}
                    {msgs.slice(0, 3).map((m) => (
                      <div
                        key={m.id}
                        className={`p-3 ${dark ? "hover:bg-white/5" : "hover:bg-gray-50"}`}
                      >
                        <div className="font-bold">
                          New message: {m.subject}
                        </div>
                        <div className="text-xs text-gray-500">{m.name}</div>
                      </div>
                    ))}
                    {notifCount === 0 && (
                      <div className="p-6 text-center text-gray-500">
                        No new notifications
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center gap-2 pl-2"
              >
                <img
                  src={`https://i.pravatar.cc/100?u=${user?.email}`}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover border-2 border-emerald-200"
                />
                <span
                  className={`hidden md:block text-sm font-black ${dark ? "text-white" : "text-gray-900"}`}
                >
                  {user?.name || "Admin"}
                </span>
                <span className="text-xs">▼</span>
              </button>
              {showProfile && (
                <div
                  className={`absolute right-0 mt-2 w-56 border rounded-2xl shadow-xl overflow-hidden z-50 ${dark ? "bg-[#1e1e1e] border-gray-700 text-white" : "bg-white border-gray-100 text-gray-900"}`}
                >
                  <div
                    className={`p-3 border-b ${dark ? "bg-white/5 border-gray-700" : "bg-[#f6f7f4] border-gray-100"}`}
                  >
                    <div className="font-black">{user?.name}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {user?.email}
                    </div>
                  </div>
                  <button
                    onClick={() => setDark(!dark)}
                    className={`w-full text-left px-4 py-2 ${dark ? "hover:bg-white/5" : "hover:bg-gray-50"} ${dark ? "text-white" : "text-gray-900"}`}
                  >
                    {dark ? "Light mode" : "Dark mode"}
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      nav("/");
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 font-bold"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* mobile top header minimal */}
        <div
          className={`lg:hidden border-b flex items-center justify-between px-4 py-3 sticky top-0 z-30 ${dark ? "bg-[#1e1e1e] border-gray-700 text-white" : "bg-white border-gray-200"}`}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0a2e1f] text-white grid place-items-center">
              🌿
            </div>
            <span
              className={`font-black text-sm ${dark ? "text-white" : "text-gray-900"}`}
            >
              GreenNest Admin
            </span>
          </div>
          <span
            className={`text-xs font-bold border px-2 py-1 rounded-full ${dark ? "text-emerald-300 bg-emerald-900/30 border-emerald-700" : "text-emerald-700 bg-emerald-50 border-emerald-100"}`}
          >
            {tab}
          </span>
        </div>

        {/* mobile bottom grid nav */}
        <div
          className={`lg:hidden fixed bottom-0 inset-x-0 z-40 border-t ${dark ? "bg-[#1e1e1e] border-gray-700" : "bg-white border-gray-200"}`}
        >
          <div className="grid grid-cols-5">
            {menu.map((m) => {
              const active = tab === m.id;
              const badge =
                m.id === "orders"
                  ? orders.filter((o) => o.status === "pending_owner").length
                  : m.id === "reviews"
                    ? reviews.length
                    : 0;
              return (
                <button
                  key={m.id}
                  onClick={() => setTab(m.id)}
                  className={`relative flex flex-col items-center justify-center py-2.5 gap-1 ${active ? (dark ? "text-white bg-white/10" : "text-gray-900 bg-gray-50") : dark ? "text-gray-400" : "text-gray-400"}`}
                >
                  <span className="text-[16px] leading-none relative">
                    {m.icon}
                    {badge > 0 && (
                      <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] font-bold min-w-[14px] h-[14px] grid place-items-center rounded-full px-1">
                        {badge}
                      </span>
                    )}
                  </span>
                  <span className="text-[9px] font-bold tracking-widest uppercase">
                    {m.label}
                  </span>
                  {active && (
                    <span
                      className={`absolute top-0 inset-x-3 h-0.5 rounded-full ${dark ? "bg-white" : "bg-gray-900"}`}
                    />
                  )}
                </button>
              );
            })}
          </div>
          <div className="h-[env(safe-area-inset-bottom)]" />
        </div>

        <div className="flex-1 p-4 md:p-6 lg:p-6 pb-20 lg:pb-6 w-full max-w-none">
          {!stats && tab === "overview" ? (
            <div className="grid place-items-center h-64">
              <div
                className={`w-8 h-8 border-2 rounded-full animate-spin ${dark ? "border-white/20 border-t-emerald-500" : "border-gray-200 border-t-emerald-600"}`}
              ></div>
            </div>
          ) : (
            tab === "overview" &&
            stats && (
              <div
                className={`${dark ? "bg-[#0a0a0f] text-white" : "bg-white text-gray-900"} -m-4 md:-m-6 lg:-m-6 p-4 md:p-6 min-h-[calc(100vh-80px)] relative overflow-hidden`}
              >
                <div
                  className={`absolute -top-32 -right-32 w-[700px] h-[400px] rounded-full blur-[100px] pointer-events-none ${dark ? "bg-[#1e3a8a]/12" : "bg-blue-100/40"}`}
                ></div>
                <div className="flex flex-wrap justify-between gap-4 mb-6 relative">
                  <div>
                    <h2
                      className={`text-[28px] font-black tracking-tight leading-none ${dark ? "text-white" : "text-gray-900"}`}
                    >
                      Dashboard
                    </h2>
                    <p
                      className={`text-sm mt-1 ${dark ? "text-white/60" : "text-gray-500"}`}
                    >
                      Welcome back, {user?.name || "Admin"} •{" "}
                      {new Date().toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        downloadPDF(
                          "Revenue Report",
                          ["Week", "Sales"],
                          [
                            ["W1", "₹" + (stats.totalSales * 0.2).toFixed(0)],
                            ["W2", "₹" + (stats.totalSales * 0.3).toFixed(0)],
                          ],
                          "revenue.pdf",
                        )
                      }
                      className={`${dark ? "bg-[#1a1a20] border-white/10 text-white" : "bg-white border-gray-200 text-gray-700"} border px-4 py-2 rounded-full text-xs font-bold`}
                    >
                      📄 Export PDF
                    </button>
                    <span className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-500 px-3 py-1.5 rounded-full text-xs font-bold">
                      ● Live
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div
                    className={`${dark ? "bg-[#111116] border-white/10" : "bg-white border-gray-200"} border rounded-2xl p-5 relative overflow-hidden`}
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-[#2a5bd7]/10 rounded-full blur-2xl"></div>
                    <div className="flex justify-between items-start relative">
                      <span
                        className={`text-xs font-bold uppercase tracking-widest ${dark ? "text-white/40" : "text-gray-500"}`}
                      >
                        Orders
                      </span>
                      <span
                        className={`w-8 h-8 rounded-xl border grid place-items-center ${dark ? "bg-[#1e1e24] border-white/10 text-white/60" : "bg-gray-100 border-gray-200 text-gray-600"}`}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <path d="M6 7h12l-1 9a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 7Z" />
                          <path d="M9 7V5a3 3 0 0 1 6 0v2" />
                        </svg>
                      </span>
                    </div>
                    <div
                      className={`text-3xl font-black mt-3 ${dark ? "text-white" : "text-gray-900"}`}
                    >
                      {stats.totalOrders}
                    </div>
                    <div className="text-xs mt-1 text-emerald-500">
                      ↗{" "}
                      {
                        orders.filter((o) => o.status === "pending_owner")
                          .length
                      }{" "}
                      pending • +12%
                    </div>
                  </div>
                  <div
                    className={`${dark ? "bg-[#111116] border-white/10" : "bg-white border-gray-200"} border rounded-2xl p-5`}
                  >
                    <div className="flex justify-between items-start">
                      <span
                        className={`text-xs font-bold uppercase tracking-widest ${dark ? "text-white/40" : "text-gray-500"}`}
                      >
                        Customers
                      </span>
                      <span
                        className={`w-8 h-8 rounded-xl border grid place-items-center ${dark ? "bg-[#1e1e24] border-white/10 text-white/60" : "bg-gray-100 border-gray-200 text-gray-600"}`}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <path d="M16 19a4 4 0 0 0-8 0" />
                          <circle cx="12" cy="7" r="3" />
                        </svg>
                      </span>
                    </div>
                    <div
                      className={`text-3xl font-black mt-3 ${dark ? "text-white" : "text-gray-900"}`}
                    >
                      {stats.totalUsers}
                    </div>
                    <div className="text-xs mt-1 text-emerald-500">
                      ↗ +5 today • {users.length} total
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-[#0a2e1f] to-[#143d2e] rounded-2xl p-5 text-white border border-white/10">
                    <div className="text-xs tracking-widest uppercase font-bold text-emerald-300">
                      Revenue (COD)
                    </div>
                    <div className="text-2xl font-black mt-3">
                      ₹{stats.totalSales.toFixed(0)}
                    </div>
                    <div className="text-xs text-white/60">
                      Avg ₹
                      {(stats.totalOrders
                        ? stats.totalSales / stats.totalOrders
                        : 0
                      ).toFixed(0)}
                      /order • {stats.totalOrders} orders
                    </div>
                  </div>
                  <div
                    className={`${dark ? "bg-[#111116] border-white/10" : "bg-white border-gray-200"} border rounded-2xl p-5`}
                  >
                    <div
                      className={`text-xs font-bold uppercase tracking-widest ${dark ? "text-white/40" : "text-gray-500"}`}
                    >
                      Low Stock
                    </div>
                    <div
                      className={`text-3xl font-black mt-3 ${dark ? "text-white" : "text-gray-900"}`}
                    >
                      {stats.lowStock.length}
                    </div>
                    <div
                      className={`text-xs mt-1 ${stats.lowStock.length ? "text-amber-500" : dark ? "text-white/40" : "text-gray-500"}`}
                    >
                      {plants.filter((p) => p.stock_qty < 5).length} critical •{" "}
                      {plants.filter((p) => p.stock_qty === 0).length} out
                    </div>
                  </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-4 mt-4">
                  {/* Sales Trend Chart — real data */}
                  {(() => {
                    const days = 30;
                    const now = new Date();
                    const buckets = Array.from({ length: days }, (_, i) => {
                      const d = new Date(now);
                      d.setDate(d.getDate() - (days - 1 - i));
                      return { label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), total: 0, count: 0 };
                    });
                    orders.forEach((o) => {
                      const od = new Date(o.created_at);
                      const diffDays = Math.floor((now - od) / 86400000);
                      if (diffDays >= 0 && diffDays < days) {
                        const idx = days - 1 - diffDays;
                        buckets[idx].total += Number(o.total_amount) || 0;
                        buckets[idx].count += 1;
                      }
                    });
                    const maxVal = Math.max(...buckets.map(b => b.total), 1);
                    const totalRevenue = buckets.reduce((s, b) => s + b.total, 0);
                    const totalOrdersInRange = buckets.reduce((s, b) => s + b.count, 0);
                    const activeDays = buckets.filter(b => b.total > 0).length;
                    return (
                      <div className={`lg:col-span-2 ${dark ? "bg-[#111116] border-white/10" : "bg-white border-gray-200"} border rounded-2xl p-5`}>
                        <div className="flex flex-wrap justify-between items-start gap-3">
                          <div>
                            <h3 className={`font-black ${dark ? "text-white" : "text-gray-900"}`}>Sales Trend</h3>
                            <p className={`text-xs mt-0.5 ${dark ? "text-white/40" : "text-gray-400"}`}>Last 30 days • {totalOrdersInRange} orders • {activeDays} active days</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className={`text-lg font-black ${dark ? "text-white" : "text-gray-900"}`}>₹{totalRevenue.toLocaleString("en-IN")}</div>
                              <div className={`text-[10px] ${dark ? "text-white/40" : "text-gray-400"}`}>total revenue</div>
                            </div>
                            <span className={`text-xs border px-2 py-1 rounded-full ${dark ? "bg-white/5 border-white/10 text-white/60" : "bg-gray-50 border-gray-200 text-gray-600"}`}>30d</span>
                          </div>
                        </div>
                        {/* Y-axis labels + bars */}
                        <div className="mt-5 flex gap-3">
                          {/* Y labels */}
                          <div className={`flex flex-col justify-between text-[10px] text-right shrink-0 h-32 pb-0 ${dark ? "text-white/30" : "text-gray-400"}`}>
                            <span>₹{Math.round(maxVal).toLocaleString("en-IN")}</span>
                            <span>₹{Math.round(maxVal * 0.5).toLocaleString("en-IN")}</span>
                            <span>₹0</span>
                          </div>
                          {/* Chart area */}
                          <div className="flex-1 relative">
                            {/* Grid lines */}
                            <div className={`absolute inset-0 flex flex-col justify-between pointer-events-none`}>
                              {[0, 1, 2].map(i => (
                                <div key={i} className={`w-full border-t ${dark ? "border-white/5" : "border-gray-100"}`} />
                              ))}
                            </div>
                            {/* Bars */}
                            <div className="relative flex items-end gap-[3px] h-32">
                              {buckets.map((b, i) => {
                                const pct = maxVal > 0 ? (b.total / maxVal) * 100 : 0;
                                const isToday = i === days - 1;
                                return (
                                  <div key={i} className="group flex-1 flex flex-col justify-end h-full relative">
                                    <div
                                      className={`w-full rounded-t transition-all duration-300 ${
                                        pct === 0
                                          ? dark ? "bg-white/5" : "bg-gray-100"
                                          : isToday
                                            ? "bg-emerald-500"
                                            : dark ? "bg-[#2a5bd7] hover:bg-[#3a6be7]" : "bg-[#2a5bd7]/80 hover:bg-[#2a5bd7]"
                                      }`}
                                      style={{ height: pct === 0 ? "4px" : `${Math.max(pct, 4)}%` }}
                                    />
                                    {/* Tooltip */}
                                    {b.total > 0 && (
                                      <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-10 hidden group-hover:flex flex-col items-center pointer-events-none`}>
                                        <div className={`text-[10px] font-bold whitespace-nowrap px-2 py-1 rounded-lg shadow-lg ${
                                          dark ? "bg-white text-gray-900" : "bg-gray-900 text-white"
                                        }`}>
                                          {b.label}<br/>₹{b.total.toLocaleString("en-IN")} • {b.count} order{b.count !== 1 ? "s" : ""}
                                        </div>
                                        <div className={`w-1.5 h-1.5 rotate-45 -mt-1 ${dark ? "bg-white" : "bg-gray-900"}`} />
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                        {/* X-axis labels */}
                        <div className={`flex justify-between text-[10px] mt-2 pl-10 ${dark ? "text-white/30" : "text-gray-400"}`}>
                          <span>{buckets[0]?.label}</span>
                          <span>{buckets[9]?.label}</span>
                          <span>{buckets[19]?.label}</span>
                          <span className={`font-bold ${dark ? "text-emerald-400" : "text-emerald-600"}`}>Today</span>
                        </div>
                        {/* Legend */}
                        <div className={`flex items-center gap-4 mt-3 pt-3 border-t text-[11px] ${dark ? "border-white/5 text-white/40" : "border-gray-100 text-gray-400"}`}>
                          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#2a5bd7]/80"/> Past days</span>
                          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"/> Today</span>
                          <span className="flex items-center gap-1.5"><span className={`w-2.5 h-2.5 rounded-sm ${dark ? "bg-white/5" : "bg-gray-100"}`}/> No orders</span>
                        </div>
                      </div>
                    );
                  })()}
                  <div
                    className={`${dark ? "bg-[#111116] border-white/10" : "bg-white border-gray-200"} border rounded-2xl p-5`}
                  >
                    <h3
                      className={`font-black ${dark ? "text-white" : "text-gray-900"}`}
                    >
                      Order Status
                    </h3>
                    <div className="mt-5 space-y-3">
                      {[
                        {
                          label: "Pending",
                          count: orders.filter(
                            (o) => o.status === "pending_owner",
                          ).length,
                          color: "bg-amber-500",
                        },
                        {
                          label: "Confirmed",
                          count: orders.filter((o) => o.status === "confirmed")
                            .length,
                          color: "bg-[#2a5bd7]",
                        },
                        {
                          label: "Shipped",
                          count: orders.filter((o) => o.status === "shipped")
                            .length,
                          color: "bg-sky-500",
                        },
                        {
                          label: "Delivered",
                          count: orders.filter((o) => o.status === "delivered")
                            .length,
                          color: "bg-emerald-500",
                        },
                      ].map((s) => {
                        const pct = stats.totalOrders
                          ? Math.round((s.count / stats.totalOrders) * 100)
                          : 0;
                        return (
                          <div
                            key={s.label}
                            className="flex items-center gap-3"
                          >
                            <span
                              className={`text-xs w-20 font-bold ${dark ? "text-white/70" : "text-gray-600"}`}
                            >
                              {s.label}
                            </span>
                            <div
                              className={`flex-1 h-2 rounded-full overflow-hidden ${dark ? "bg-white/5" : "bg-gray-100"}`}
                            >
                              <div
                                className={`h-full ${s.color} rounded-full`}
                                style={{ width: `${pct}%` }}
                              ></div>
                            </div>
                            <span
                              className={`text-xs font-black w-8 text-right ${dark ? "text-white" : "text-gray-900"}`}
                            >
                              {s.count}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => setTab("orders")}
                      className={`mt-5 w-full py-2 rounded-full text-xs font-black ${dark ? "bg-white text-[#0a0a0f]" : "bg-gray-900 text-white"}`}
                    >
                      View Orders →
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  {/* Recent Orders — improved */}
                  <div className={`${dark ? "bg-[#111116] border-white/10" : "bg-white border-gray-200"} border rounded-2xl overflow-hidden`}>
                    <div className={`flex justify-between items-center px-5 py-4 border-b ${dark ? "border-white/5 bg-white/[0.02]" : "border-gray-100 bg-gray-50/60"}`}>
                      <div>
                        <h4 className={`font-bold text-sm ${dark ? "text-white" : "text-gray-900"}`}>Recent Orders</h4>
                        <p className={`text-xs mt-0.5 ${dark ? "text-white/40" : "text-gray-400"}`}>{orders.length} total orders</p>
                      </div>
                      <button onClick={() => setTab("orders")} className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${dark ? "border-white/10 text-white/70 hover:bg-white/5" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>View all →</button>
                    </div>
                    <div className="divide-y">
                      {orders.slice(0, 6).map((o) => {
                        const cust = users.find(u => u.id === o.user_id);
                        const statusColor = o.status === "delivered" ? "text-emerald-500" : o.status === "cancelled" ? "text-red-400" : o.status === "shipped" ? "text-blue-400" : "text-amber-400";
                        const dotColor = o.status === "delivered" ? "bg-emerald-500" : o.status === "cancelled" ? "bg-red-400" : o.status === "shipped" ? "bg-blue-400" : "bg-amber-400";
                        return (
                          <button key={o.id} onClick={() => nav(`/admin/orders/${o.id}`)} className={`w-full flex items-center gap-3 px-5 py-3.5 text-left transition group ${dark ? "hover:bg-white/[0.03] divide-white/5" : "hover:bg-gray-50/80 divide-gray-100"}`}>
                            <div className={`w-9 h-9 rounded-xl shrink-0 grid place-items-center text-xs font-bold border ${dark ? "bg-white/5 border-white/10 text-white/60" : "bg-gray-100 border-gray-200 text-gray-500"}`}>
                              {(cust?.name || o.user_name || "?").slice(0,1).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className={`text-xs font-semibold truncate ${dark ? "text-white" : "text-gray-900"}`}>
                                {cust?.name || o.user_name || "Customer"}
                              </div>
                              <div className={`text-[11px] font-mono truncate ${dark ? "text-white/40" : "text-gray-400"}`}>#{o.id.slice(0,8).toUpperCase()}</div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className={`text-sm font-bold ${dark ? "text-white" : "text-gray-900"}`}>₹{o.total_amount}</div>
                              <div className={`flex items-center justify-end gap-1 mt-0.5`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}/>
                                <span className={`text-[10px] font-medium capitalize ${statusColor}`}>{o.status.replace("_"," ")}</span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                      {orders.length === 0 && (
                        <div className={`px-5 py-10 text-center text-sm ${dark ? "text-white/30" : "text-gray-400"}`}>No orders yet</div>
                      )}
                    </div>
                  </div>

                  {/* Low Stock — improved */}
                  <div className={`${dark ? "bg-[#111116] border-white/10" : "bg-white border-gray-200"} border rounded-2xl overflow-hidden`}>
                    <div className={`flex justify-between items-center px-5 py-4 border-b ${dark ? "border-white/5 bg-white/[0.02]" : "border-gray-100 bg-gray-50/60"}`}>
                      <div>
                        <h4 className={`font-bold text-sm ${dark ? "text-white" : "text-gray-900"}`}>Low Stock Alert</h4>
                        <p className={`text-xs mt-0.5 ${dark ? "text-white/40" : "text-gray-400"}`}>{stats.lowStock.length} items need restocking</p>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${stats.lowStock.length > 0 ? "bg-red-500/10 border-red-500/20 text-red-400" : dark ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-600"}`}>
                        {stats.lowStock.length > 0 ? `${stats.lowStock.length} critical` : "All good ✓"}
                      </span>
                    </div>
                    <div className="divide-y">
                      {stats.lowStock.slice(0, 6).map((p) => {
                        const pct = Math.min(100, Math.round((p.stock_qty / 20) * 100));
                        return (
                          <div key={p.id} className={`flex items-center gap-3 px-5 py-3.5 ${dark ? "divide-white/5" : "divide-gray-100"}`}>
                            <img src={encodeURI(p.images?.[0] || "")} alt={p.name} className={`w-9 h-9 rounded-xl object-cover shrink-0 border ${dark ? "border-white/10 bg-white/5" : "border-gray-200 bg-gray-50"}`}/>
                            <div className="flex-1 min-w-0">
                              <div className={`text-xs font-semibold truncate ${dark ? "text-white" : "text-gray-900"}`}>{p.name}</div>
                              <div className={`mt-1 h-1.5 rounded-full overflow-hidden ${dark ? "bg-white/10" : "bg-gray-100"}`}>
                                <div className={`h-full rounded-full ${pct < 25 ? "bg-red-500" : pct < 50 ? "bg-amber-400" : "bg-emerald-500"}`} style={{width:`${pct}%`}}/>
                              </div>
                            </div>
                            <span className={`text-xs font-bold shrink-0 ${p.stock_qty === 0 ? "text-red-400" : "text-amber-400"}`}>{p.stock_qty} left</span>
                          </div>
                        );
                      })}
                      {stats.lowStock.length === 0 && (
                        <div className={`px-5 py-10 text-center text-sm ${dark ? "text-white/30" : "text-gray-400"}`}>All products well stocked ✓</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Recent Customers */}
                <div className={`${dark ? "bg-[#111116] border-white/10" : "bg-white border-gray-200"} rounded-2xl border overflow-hidden mt-4`}>
                  <div className={`flex justify-between items-center px-5 py-4 border-b ${dark ? "border-white/5 bg-white/[0.02]" : "border-gray-100 bg-gray-50/60"}`}>
                    <div>
                      <h4 className={`font-bold text-sm ${dark ? "text-white" : "text-gray-900"}`}>Recent Customers</h4>
                      <p className={`text-xs mt-0.5 ${dark ? "text-white/40" : "text-gray-400"}`}>{users.filter(u => u.role !== "admin").length} registered customers</p>
                    </div>
                    <button onClick={() => setTab("users")} className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${dark ? "border-white/10 text-white/70 hover:bg-white/5" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>View all →</button>
                  </div>
                  <div className="divide-y">
                    {users.filter(u => u.role !== "admin").slice(0, 6).map((u) => {
                      const orderCount = orders.filter(o => o.user_id === u.id).length;
                      const totalSpent = orders.filter(o => o.user_id === u.id).reduce((s, o) => s + Number(o.total_amount || 0), 0);
                      return (
                        <button key={u.id} onClick={() => setTab("users")} className={`w-full flex items-center gap-3 px-5 py-3.5 text-left transition group ${dark ? "hover:bg-white/[0.03]" : "hover:bg-gray-50/80"}`}>
                          <div className={`w-9 h-9 rounded-full shrink-0 grid place-items-center text-xs font-black border ${dark ? "bg-white/5 border-white/10 text-white/70" : "bg-emerald-50 border-emerald-100 text-emerald-700"}`}>
                            {(u.name || "?").slice(0, 1).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`text-xs font-semibold truncate ${dark ? "text-white" : "text-gray-900"}`}>{u.name}</div>
                            <div className={`text-[11px] truncate ${dark ? "text-white/40" : "text-gray-400"}`}>{u.email} • {u.phone || "No phone"}</div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className={`text-xs font-bold ${dark ? "text-white" : "text-gray-900"}`}>{orderCount} order{orderCount !== 1 ? "s" : ""}</div>
                            <div className={`text-[11px] ${dark ? "text-white/40" : "text-gray-400"}`}>₹{totalSpent.toLocaleString("en-IN")}</div>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold shrink-0 ${u.blocked ? "bg-red-500/10 border-red-500/20 text-red-400" : dark ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-600"}`}>
                            {u.blocked ? "Blocked" : "Active"}
                          </span>
                        </button>
                      );
                    })}
                    {users.filter(u => u.role !== "admin").length === 0 && (
                      <div className={`px-5 py-10 text-center text-sm ${dark ? "text-white/30" : "text-gray-400"}`}>No customers yet</div>
                    )}
                  </div>
                </div>

                {/* Top Products — improved */}
                <div className={`${dark ? "bg-[#111116] border-white/10" : "bg-white border-gray-200"} rounded-2xl border overflow-hidden mt-4`}>
                  <div className={`flex justify-between items-center px-5 py-4 border-b ${dark ? "border-white/5 bg-white/[0.02]" : "border-gray-100 bg-gray-50/60"}`}>
                    <div>
                      <h4 className={`font-bold text-sm ${dark ? "text-white" : "text-gray-900"}`}>Top Products</h4>
                      <p className={`text-xs mt-0.5 ${dark ? "text-white/40" : "text-gray-400"}`}>Sorted by rating • {plants.length} total</p>
                    </div>
                    <button onClick={() => setTab("plants")} className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${dark ? "border-white/10 text-white/70 hover:bg-white/5" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>Manage →</button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 divide-x divide-y">
                    {[...plants].sort((a,b) => (b.rating||0)-(a.rating||0)).slice(0,5).map((p) => (
                      <button key={p.id} onClick={() => { setTab("plants"); }} className={`group flex flex-col text-left transition ${dark ? "hover:bg-white/[0.03] divide-white/5" : "hover:bg-gray-50/80 divide-gray-100"}`}>
                        <div className="relative overflow-hidden">
                          <img src={encodeURI(p.images?.[0] || "")} alt={p.name} className={`w-full h-32 object-cover transition-transform duration-500 group-hover:scale-105 ${dark ? "bg-white/5" : "bg-gray-50"}`}/>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"/>
                          <div className="absolute bottom-2 left-2 flex items-center gap-1">
                            <span className="text-[10px] font-bold text-amber-300">★ {p.rating || "4.5"}</span>
                          </div>
                          <div className={`absolute top-2 right-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${p.stock_qty > 10 ? "bg-emerald-500/90 text-white" : p.stock_qty > 0 ? "bg-amber-400/90 text-black" : "bg-red-500/90 text-white"}`}>
                            {p.stock_qty > 10 ? "In Stock" : p.stock_qty > 0 ? "Low" : "Out"}
                          </div>
                        </div>
                        <div className="p-3 flex-1">
                          <p className={`text-xs font-semibold truncate leading-tight ${dark ? "text-white" : "text-gray-900"}`}>{p.name}</p>
                          <p className={`text-[10px] italic truncate mt-0.5 ${dark ? "text-white/40" : "text-gray-400"}`}>{p.botanical_name || p.short_description || ""}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className={`text-sm font-bold ${dark ? "text-white" : "text-gray-900"}`}>₹{p.price}</span>
                            <span className={`text-[10px] font-medium ${dark ? "text-white/40" : "text-gray-400"}`}>{p.stock_qty} pcs</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )
          )}

          {tab === "plants" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setPlantCategory(c)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border ${plantCategory === c ? "bg-[#0a2e1f] text-white border-[#0a2e1f]" : dark ? "bg-white/10 border-white/20 text-white" : "bg-white border-gray-200 text-gray-700"}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3
                  className={`text-lg font-black ${dark ? "text-white" : "text-gray-900"}`}
                >
                  Plants — {filteredPlants.length}/{plants.length}{" "}
                  {plantCategory !== "All" && `• ${plantCategory}`}
                </h3>
                <div className="flex items-center gap-2">
                  <div
                    className={`hidden md:flex items-center gap-1 border rounded-full p-1 ${dark ? "bg-white/10 border-white/20" : "bg-white border-gray-200"}`}
                  >
                    <button
                      onClick={() => setPlantView("table")}
                      className={`px-3 py-1.5 rounded-full text-xs font-black ${plantView === "table" ? (dark ? "bg-white text-[#0a2e1f]" : "bg-[#0a2e1f] text-white") : "text-gray-500"}`}
                    >
                      Table
                    </button>
                    <button
                      onClick={() => setPlantView("grid")}
                      className={`px-3 py-1.5 rounded-full text-xs font-black ${plantView === "grid" ? (dark ? "bg-white text-[#0a2e1f]" : "bg-[#0a2e1f] text-white") : "text-gray-500"}`}
                    >
                      Grid
                    </button>
                  </div>
                  <button
                    onClick={() =>
                      downloadPDF(
                        "Plants Report",
                        ["Name", "Price", "Stock"],
                        plants.map((p) => [p.name, "₹" + p.price, p.stock_qty]),
                        "plants.pdf",
                      )
                    }
                    className="bg-white border border-gray-200 text-gray-700 px-3.5 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 hover:bg-gray-50 shadow-sm"
                  >
                    📄 Download PDF
                  </button>
                  <button
                    onClick={openAddDrawer}
                    className="bg-emerald-600 text-white px-5 py-2.5 rounded-full font-black text-sm"
                  >
                    + Add Plant
                  </button>
                </div>
              </div>

              {selectedIds.length > 0 && (
                <div
                  className={`${dark ? "bg-amber-900/20 border-amber-700 text-white" : "bg-amber-50 border-amber-200"} border rounded-xl p-3 flex items-center gap-3 text-sm`}
                >
                  <span className="font-black">
                    {selectedIds.length} selected
                  </span>
                  <button
                    onClick={bulkDelete}
                    className="bg-red-600 text-white px-3 py-1.5 rounded-full text-xs font-bold"
                  >
                    Bulk Delete
                  </button>
                  <button
                    onClick={bulkOutOfStock}
                    className="bg-gray-800 text-white px-3 py-1.5 rounded-full text-xs font-bold"
                  >
                    Mark Out of Stock
                  </button>
                  <button
                    onClick={() => setSelectedIds([])}
                    className="ml-auto text-xs underline"
                  >
                    Clear
                  </button>
                </div>
              )}

              {plantView === "grid" ? (
                <div className="grid md:grid-cols-3 gap-3">
                  {filteredPlants.map((p) => {
                    const pot = p.variants?.find((v) => v.id === "plastic-pot");
                    const displayPrice = pot
                      ? `₹${pot.priceMin} Fixed`
                      : `₹${p.price}`;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedPlant(p)}
                        className={`${card} rounded-2xl border p-3 hover:shadow-md cursor-pointer`}
                      >
                        <img
                          src={encodeURI(p.images?.[0] || "")}
                          alt={p.name}
                          className="w-full h-32 object-cover rounded-xl border bg-[#f6f7f4]"
                        />
                        <div className="font-bold text-sm mt-2 truncate">
                          {p.name}
                        </div>
                        <div
                          className={`text-xs ${dark ? "text-white/60" : "text-gray-500"}`}
                        >
                          {displayPrice} • {p.stock_qty} pcs{" "}
                          {p.variants && (
                            <span className="text-emerald-600 font-bold">
                              • {p.variants.filter((v) => !v.disabled).length}{" "}
                              variants
                            </span>
                          )}
                        </div>
                        <div className="mt-2 flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditDrawer(p);
                            }}
                            className="flex-1 bg-[#0a2e1f] text-white py-1.5 rounded-full text-xs font-bold"
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              delPlant(p.id);
                            }}
                            className="flex-1 border border-red-200 text-red-600 py-1.5 rounded-full text-xs font-bold"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div
                  className={`${card} rounded-[24px] border overflow-hidden shadow-sm`}
                >
                  <div
                    className={`px-5 py-4 border-b flex justify-between items-center ${dark ? "bg-white/5 border-white/10" : "bg-[#fcfcfa]"}`}
                  >
                    <h4 className="font-black">
                      All Plants ({filteredPlants.length})
                    </h4>
                    <label className="text-xs flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={
                          selectedIds.length === filteredPlants.length &&
                          filteredPlants.length > 0
                        }
                        onChange={(e) =>
                          setSelectedIds(
                            e.target.checked
                              ? filteredPlants.map((p) => p.id)
                              : [],
                          )
                        }
                      />{" "}
                      Select all
                    </label>
                  </div>
                  <div className="divide-y max-h-[520px] overflow-auto">
                    {filteredPlants.map((p) => (
                      <div
                        key={p.id}
                        className={`flex items-center gap-3 px-5 py-3 ${dark ? "hover:bg-white/5" : "hover:bg-emerald-50"} cursor-pointer`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(p.id)}
                          onChange={(e) =>
                            setSelectedIds(
                              e.target.checked
                                ? [...selectedIds, p.id]
                                : selectedIds.filter((id) => id !== p.id),
                            )
                          }
                        />
                        <img
                          src={encodeURI(p.images?.[0] || "")}
                          alt={p.name}
                          className="w-12 h-12 rounded-xl object-cover border bg-[#f6f7f4] shrink-0"
                          onClick={() => setSelectedPlant(p)}
                        />
                        <div
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => setSelectedPlant(p)}
                        >
                          <div className="font-bold text-sm truncate">
                            {p.name}
                          </div>
                          <div
                            className={`text-xs truncate ${dark ? "text-white/60" : "text-gray-500"}`}
                          >
                            {p.variants
                              ? `₹${(p.variants.find((v) => v.id === "plastic-pot") || p.variants[0]).priceMin} Fixed`
                              : `₹${p.price}`}{" "}
                            • {p.stock_qty} in stock • {p.sunlight} •{" "}
                            {p.sku || p.id}
                          </div>
                        </div>
                        {editingStock === p.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              value={stockVal}
                              onChange={(e) => setStockVal(e.target.value)}
                              className={`w-16 border rounded-full px-2 py-1 text-xs ${inputCls}`}
                              autoFocus
                            />
                            <button
                              onClick={() => saveStock(p.id)}
                              className="bg-emerald-600 text-white px-2 py-1 rounded-full text-xs"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => setEditingStock(null)}
                              className="border px-2 py-1 rounded-full text-xs"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <span
                            onClick={() => {
                              setEditingStock(p.id);
                              setStockVal(p.stock_qty);
                            }}
                            className={`hidden md:inline text-xs font-bold px-2.5 py-1 rounded-full border shrink-0 cursor-pointer ${p.stock_qty < 10 ? "bg-red-50 text-red-700 border-red-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}
                          >
                            {p.stock_qty} • Edit
                          </span>
                        )}
                        <button
                          onClick={() => openEditDrawer(p)}
                          className={`text-xs border px-3 py-1.5 rounded-full font-bold ${dark ? "bg-white/10 border-white/20 text-white" : "bg-white border-gray-200 text-gray-900"}`}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => delPlant(p.id)}
                          className="text-xs font-bold text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-full border border-red-200 bg-white"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedPlant && (
                <div className="fixed inset-0 z-50 flex">
                  <div
                    className="flex-1 bg-black/40 backdrop-blur-sm"
                    onClick={() => setSelectedPlant(null)}
                  ></div>
                  <div
                    className={`w-full max-w-[560px] h-full overflow-auto shadow-2xl ${dark ? "bg-[#1e1e1e] text-white" : "bg-white text-gray-900"}`}
                  >
                    <div
                      className={`sticky top-0 border-b p-5 flex justify-between items-start ${dark ? "bg-[#1e1e1e] border-gray-700" : "bg-white"}`}
                    >
                      <div>
                        <h3 className="text-lg font-black">
                          {selectedPlant.name}
                        </h3>
                        <p
                          className={`text-xs font-mono ${dark ? "text-white/60" : "text-gray-500"}`}
                        >
                          {selectedPlant.sku} • {selectedPlant.id}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedPlant(null)}
                        className="w-9 h-9 rounded-full border grid place-items-center"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="p-5 space-y-4">
                      <img
                        src={encodeURI(selectedPlant.images?.[0] || "")}
                        alt={selectedPlant.name}
                        className="w-full h-64 object-cover rounded-2xl border bg-[#f6f7f4]"
                      />
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className={`${cardMuted} rounded-xl p-3 border`}>
                          <div className="text-xs opacity-60 font-bold uppercase">
                            Price
                          </div>
                          {selectedPlant.variants ? (
                            <div className="font-black text-xs leading-5">
                              {selectedPlant.variants
                                .filter((v) => !v.disabled)
                                .map((v) => `${v.label}: ₹${v.priceMin}`)
                                .join(" • ")}
                            </div>
                          ) : (
                            <div className="font-black">
                              Retail ₹{selectedPlant.price}{" "}
                              {selectedPlant.discount_price &&
                                `→ ₹${selectedPlant.discount_price}`}
                            </div>
                          )}
                        </div>
                        <div className={`${cardMuted} rounded-xl p-3 border`}>
                          <div className="text-xs opacity-60 font-bold uppercase">
                            Stock
                          </div>
                          <div className="font-black">
                            {selectedPlant.stock_qty} •{" "}
                            {selectedPlant.stock_status}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const p = selectedPlant;
                          setSelectedPlant(null);
                          openEditDrawer(p);
                        }}
                        className="w-full bg-[#0a2e1f] text-white py-3 rounded-full font-black text-sm"
                      >
                        Edit this Plant →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Full plant edit drawer — covers all Postgres columns */}
              <PlantEditDrawer
                open={plantDrawerOpen}
                initial={editingPlant}
                dark={dark}
                onClose={() => {
                  setPlantDrawerOpen(false);
                  setEditingPlant(null);
                }}
                onSave={handlePlantSave}
              />
            </div>
          )}

          {tab === "orders" && (
            <div
              className={`${dark ? "bg-[#0a0a0f] text-white" : "bg-white text-gray-900"} -m-4 md:-m-6 lg:-m-8 p-4 md:p-6 min-h-[calc(100vh-80px)] relative overflow-hidden`}
            >
              <div
                className={`absolute -top-32 -right-32 w-[700px] h-[400px] rounded-full blur-[100px] pointer-events-none ${dark ? "bg-[#1e3a8a]/15" : "bg-blue-100/40"}`}
              ></div>
              <div
                className={`absolute -top-10 -left-10 w-[400px] h-[400px] rounded-full blur-[80px] pointer-events-none ${dark ? "bg-[#0a2e1f]/10" : "bg-emerald-100/30"}`}
              ></div>
              {/* Header like screenshot */}
              <div className="flex flex-wrap items-start justify-between gap-4 mb-5 relative">
                <div>
                  <h2
                    className={`text-[28px] font-black tracking-tight leading-none ${dark ? "text-white" : "text-gray-900"}`}
                  >
                    Orders
                  </h2>
                  <p
                    className={`text-sm mt-1 ${dark ? "text-white/60" : "text-gray-500"}`}
                  >
                    Manage and track customer orders
                  </p>
                </div>
                <button
                  onClick={() =>
                    success(
                      "Create Order: place orders from Shop as customer, or use API POST /orders",
                    )
                  }
                  className="bg-[#2a5bd7] hover:bg-[#1e4bc0] text-white px-5 py-2.5 rounded-full font-black text-sm inline-flex items-center gap-2 shadow-lg"
                >
                  <span className="w-5 h-5 rounded-full bg-white/20 grid place-items-center text-sm">
                    +
                  </span>{" "}
                  Create Order
                </button>
              </div>

              {/* Status tabs */}
              <div
                className={`${dark ? "bg-[#1e1e24]/90 border-white/5" : "bg-white border-gray-200"} backdrop-blur rounded-full p-1.5 flex gap-1 overflow-auto scrollbar-none border`}
              >
                {[
                  { id: "All", label: "All Orders", icon: "▦" },
                  { id: "pending_owner", label: "Pending", icon: "🕓" },
                  { id: "confirmed", label: "Confirmed", icon: "✓" },
                  { id: "shipped", label: "Shipped", icon: "🚚" },
                  { id: "delivered", label: "Delivered", icon: "🚚" },
                  { id: "cancelled", label: "Cancelled", icon: "✕" },
                ].map((t) => {
                  const active =
                    (orderFilter === "All" && t.id === "All") ||
                    orderFilter === t.id ||
                    (orderFilter === "pending_owner" &&
                      t.id === "pending_owner");
                  const count =
                    t.id === "All"
                      ? orders.length
                      : t.id === "pending_owner"
                        ? orders.filter((o) => o.status === "pending_owner")
                            .length
                        : t.id === "confirmed"
                          ? orders.filter((o) => o.status === "confirmed")
                              .length
                          : t.id === "shipped"
                            ? orders.filter((o) => o.status === "shipped")
                                .length
                            : t.id === "delivered"
                              ? orders.filter((o) => o.status === "delivered")
                                  .length
                              : t.id === "cancelled"
                                ? orders.filter((o) => o.status === "cancelled")
                                    .length
                                : 0;
                  return (
                    <button
                      key={t.id}
                      onClick={() =>
                        setOrderFilter(t.id === "All" ? "All" : t.id)
                      }
                      className={`whitespace-nowrap px-3.5 py-2 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${active ? (dark ? "bg-[#1a3a5a] text-white border border-white/10" : "bg-[#0a2e1f] text-white border border-gray-900") : dark ? "text-white/60 hover:text-white hover:bg-white/5" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}
                    >
                      <span className="text-[11px]">{t.icon}</span> {t.label}
                    </button>
                  );
                })}
              </div>

              {/* Search + Columns */}
              <div className="mt-4 flex flex-wrap gap-3 items-center justify-between">
                <div className="relative flex-1 max-w-[560px]">
                  <span
                    className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-sm ${dark ? "text-white/40" : "text-gray-400"}`}
                  >
                    ⌕
                  </span>
                  <input
                    value={globalSearch}
                    onChange={(e) => setGlobalSearch(e.target.value)}
                    placeholder="Search orders..."
                    className={`w-full rounded-full pl-10 pr-4 py-2.5 text-sm outline-none border ${dark ? "bg-[#1a1a20] border-white/10 text-white placeholder:text-white/40 focus:border-white/20 focus:bg-[#1f1f27]" : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-gray-300"}`}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      downloadPDF(
                        "Orders Report",
                        ["ID", "Total", "Status"],
                        orders.map((o) => [
                          o.id.slice(0, 8),
                          "₹" + o.total_amount,
                          o.status,
                        ]),
                        "orders.pdf",
                      )
                    }
                    className={`hidden md:inline-flex px-4 py-2 rounded-full text-xs font-bold border ${dark ? "bg-[#1a1a20] border-white/10 text-white/70 hover:bg-white/5" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"}`}
                  >
                    📄 PDF
                  </button>
                  <button
                    className={`px-4 py-2 rounded-full text-xs font-bold inline-flex items-center gap-2 border ${dark ? "bg-[#1a1a20] border-white/10 text-white" : "bg-white border-gray-200 text-gray-700"}`}
                  >
                    Columns{" "}
                    <span
                      className={`${dark ? "text-white/40" : "text-gray-400"}`}
                    >
                      ▼
                    </span>
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div
                className={`mt-3 flex flex-wrap items-center gap-2 text-xs ${dark ? "text-white/50" : "text-gray-500"}`}
              >
                <span className="font-bold inline-flex items-center gap-1">
                  ⚙ Filters:
                </span>
                {[
                  { k: "Payment", v: "All" },
                  { k: "Delivery", v: "All" },
                ].map((f) => (
                  <button
                    key={f.k}
                    className={`${dark ? "bg-[#1e1e24] border-white/10 text-white hover:bg-white/5" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"} border px-3 py-1.5 rounded-full inline-flex items-center gap-1.5`}
                  >
                    <span
                      className={`${dark ? "text-white/50" : "text-gray-500"}`}
                    >
                      {f.k}:
                    </span>{" "}
                    <span className="font-bold">{f.v}</span>{" "}
                    <span
                      className={`${dark ? "text-white/30" : "text-gray-400"} text-[10px]`}
                    >
                      ◆
                    </span>
                  </button>
                ))}
                {orderFilter !== "All" && (
                  <button
                    onClick={() => setOrderFilter("All")}
                    className={`${dark ? "text-white/60 hover:text-white" : "text-gray-600 hover:text-gray-900"} underline`}
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Table */}
              <div
                className={`mt-5 rounded-[20px] border overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04)] ${dark ? "bg-[#111116] border-white/10" : "bg-white border-[#e7ece0]"}`}
              >
                <div className="overflow-auto">
                  <table className="w-full text-sm min-w-[980px]">
                    <thead
                      className={`${dark ? "bg-[#18181f] border-white/10 text-white/50" : "bg-[#fcfcfa] border-[#eef1eb] text-gray-500"} border-b text-[11px] tracking-widest uppercase`}
                    >
                      <tr>
                        <th className="text-left px-4 py-3.5 font-black">
                          <input
                            type="checkbox"
                            className={`rounded ${dark ? "bg-white/10 border-white/20" : "bg-white border-gray-300"}`}
                          />
                        </th>
                        <th
                          className={`text-left px-4 py-3.5 font-black whitespace-nowrap ${dark ? "text-white/50" : "text-gray-500"}`}
                        >
                          Order
                        </th>
                        <th
                          className={`text-left px-4 py-3.5 font-black whitespace-nowrap ${dark ? "text-white/50" : "text-gray-500"}`}
                        >
                          Customer
                        </th>
                        <th
                          className={`text-left px-4 py-3.5 font-black whitespace-nowrap ${dark ? "text-white/50" : "text-gray-500"}`}
                        >
                          Status
                        </th>
                        <th
                          className={`text-left px-4 py-3.5 font-black whitespace-nowrap ${dark ? "text-white/50" : "text-gray-500"}`}
                        >
                          Payment
                        </th>
                        <th
                          className={`text-left px-4 py-3.5 font-black whitespace-nowrap ${dark ? "text-white/50" : "text-gray-500"}`}
                        >
                          Delivery
                        </th>
                        <th
                          className={`text-right px-4 py-3.5 font-black whitespace-nowrap ${dark ? "text-white/50" : "text-gray-500"}`}
                        >
                          Total
                        </th>
                        <th
                          className={`text-right px-4 py-3.5 font-black ${dark ? "text-white/50" : "text-gray-500"}`}
                        >
                          Actions
                        </th>
                        <th className="px-2"></th>
                      </tr>
                    </thead>
                    <tbody
                      className={`divide-y ${dark ? "divide-white/5" : "divide-gray-100"}`}
                    >
                      {filteredOrders.map((o) => {
                        const cust = users.find((u) => u.id === o.user_id);
                        const cName = cust?.name || o.user_name || "Customer";
                        const orderDate = new Date(o.created_at);
                        const mode = "Normal";
                        const statusLabel =
                          o.status === "pending_owner"
                            ? "Pending"
                            : o.status === "confirmed"
                              ? "Confirmed"
                              : o.status === "shipped"
                                ? "Out for Delivery"
                                : o.status === "delivered"
                                  ? "Delivered"
                                  : o.status === "cancelled"
                                    ? "Cancelled"
                                    : o.status;
                        const statusStyle =
                          o.status === "pending_owner"
                            ? dark
                              ? "bg-[#2a2a30] text-white/80 border-white/10"
                              : "bg-amber-100 text-amber-800 border-amber-200"
                            : o.status === "confirmed"
                              ? "bg-[#1e3a5a] text-white border-transparent"
                              : o.status === "shipped"
                                ? "bg-[#1e3a5a] text-white border-transparent"
                                : o.status === "delivered"
                                  ? dark
                                    ? "bg-[#1a3a2e] text-white border-transparent"
                                    : "bg-emerald-100 text-emerald-800 border-emerald-200"
                                  : o.status === "cancelled"
                                    ? "bg-red-900/30 text-red-300 border-red-800"
                                    : dark
                                      ? "bg-[#2a2a30] text-white/60"
                                      : "bg-gray-100 text-gray-600";
                        const isReadyPickup =
                          o.status === "confirmed" &&
                          o.payment_method === "Pickup";
                        const displayStatus = isReadyPickup
                          ? "Ready For Pickup"
                          : statusLabel;
                        const displayStatusStyle = isReadyPickup
                          ? "bg-[#2a5bd7] text-white border-transparent"
                          : statusStyle;
                        const payment =
                          o.status === "delivered" ||
                          o.payment_status === "paid"
                            ? "Paid"
                            : "Pending";
                        const paymentStyle =
                          payment === "Paid"
                            ? "bg-[#2a5bd7] text-white"
                            : dark
                              ? "bg-[#2a2a30] text-white/60"
                              : "bg-gray-100 text-gray-600 border border-gray-200";
                        const delivery = o.address?.street
                          ?.toLowerCase()
                          .includes("pickup")
                          ? "Pickup"
                          : "Delivery";
                        return (
                          <tr
                            key={o.id}
                            onClick={() => nav(`/admin/orders/${o.id}`)}
                            className={`${dark ? "hover:bg-white/[0.03]" : "hover:bg-gray-50"} cursor-pointer group`}
                          >
                            <td className="px-3 py-3">
                              <input
                                type="checkbox"
                                onClick={(e) => e.stopPropagation()}
                                className={`rounded ${dark ? "bg-white/10 border-white/20" : "bg-white border-gray-300"}`}
                              />
                            </td>
                            <td className="px-3 py-3">
                              <div
                                className={`font-mono text-xs font-black leading-tight ${dark ? "text-white" : "text-gray-900"}`}
                              >
                                {o.id}
                              </div>
                              <div
                                className={`text-[11px] ${dark ? "text-white/40" : "text-gray-500"}`}
                              >
                                {orderDate.toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={`https://i.pravatar.cc/100?u=${cName}`}
                                  alt=""
                                  className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                                />
                                <div className="min-w-0">
                                  <div
                                    className={`font-black text-xs leading-none truncate max-w-[140px] ${dark ? "text-white" : "text-gray-900"}`}
                                  >
                                    {cName}
                                  </div>
                                  <div className="text-[11px] text-gray-500 truncate max-w-[140px]">
                                    {cust?.email?.slice(0, 22) || ""}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td
                              className="px-4 py-3"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <select
                                value={o.status}
                                onChange={(e) =>
                                  updateOrderInlineStatus(o.id, e.target.value)
                                }
                                className={`px-3 py-1.5 rounded-full text-xs font-black border whitespace-nowrap outline-none cursor-pointer shadow-sm ${o.status === "delivered" ? "bg-emerald-600 text-white border-emerald-600" : o.status === "cancelled" ? "bg-red-600 text-white border-red-600" : o.status === "shipped" ? "bg-blue-600 text-white border-blue-600" : o.status === "confirmed" ? "bg-[#0a2e1f] text-white border-[#0a2e1f]" : "bg-amber-100 text-amber-800 border-amber-200"}`}
                              >
                                <option value="pending_owner">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td
                              className="px-4 py-3"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <select
                                value={payment === "Paid" ? "paid" : "pending"}
                                onChange={(e) =>
                                  updateOrderInlinePayment(o.id, e.target.value)
                                }
                                className={`px-3 py-1.5 rounded-full text-xs font-black outline-none cursor-pointer border shadow-sm ${payment === "Paid" ? "bg-emerald-600 text-white border-emerald-600" : "bg-amber-100 text-amber-800 border-amber-200"}`}
                              >
                                <option value="pending">Unpaid</option>
                                <option value="paid">Paid</option>
                              </select>
                            </td>
                            <td
                              className={`px-3 py-3 text-xs whitespace-nowrap ${dark ? "text-white/80" : "text-gray-700"}`}
                            >
                              {delivery}
                            </td>
                            <td
                              className={`px-3 py-3 text-right font-black text-xs ${dark ? "text-white" : "text-gray-900"}`}
                            >
                              ₹{Number(o.total_amount).toFixed(2)}
                            </td>
                            <td className="px-3 py-3">
                              <div
                                className="flex justify-end gap-1.5"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {o.status === "pending_owner" ? (
                                  <>
                                    <button
                                      onClick={async () => {
                                        await api.put(
                                          `/orders/${o.id}/status`,
                                          { status: "confirmed" },
                                        );
                                        setOrders((prev) =>
                                          prev.map((x) =>
                                            x.id === o.id
                                              ? { ...x, status: "confirmed" }
                                              : x,
                                          ),
                                        );
                                        success("Confirmed");
                                      }}
                                      className="w-7 h-7 rounded-full border border-emerald-500/50 bg-emerald-500/10 text-emerald-400 grid place-items-center hover:bg-emerald-500 hover:text-white"
                                    >
                                      ✓
                                    </button>
                                    <button
                                      onClick={async () => {
                                        await api.put(
                                          `/orders/${o.id}/status`,
                                          { status: "cancelled" },
                                        );
                                        setOrders((prev) =>
                                          prev.map((x) =>
                                            x.id === o.id
                                              ? { ...x, status: "cancelled" }
                                              : x,
                                          ),
                                        );
                                      }}
                                      className="w-7 h-7 rounded-full border border-red-500/50 bg-red-500/10 text-red-400 grid place-items-center hover:bg-red-500 hover:text-white"
                                    >
                                      ✕
                                    </button>
                                  </>
                                ) : isReadyPickup ? (
                                  <button
                                    onClick={async () => {
                                      await api.put(`/orders/${o.id}/status`, {
                                        status: "confirmed",
                                      });
                                      setOrders((prev) =>
                                        prev.map((x) =>
                                          x.id === o.id
                                            ? { ...x, status: "confirmed" }
                                            : x,
                                        ),
                                      );
                                    }}
                                    className="w-7 h-7 rounded-full border border-emerald-500/50 bg-emerald-500/10 text-emerald-400 grid place-items-center"
                                  >
                                    ✓
                                  </button>
                                ) : null}
                              </div>
                            </td>
                            <td className="px-2 text-white/20 text-xs">‹</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {filteredOrders.length === 0 && (
                    <div
                      className={`p-10 text-center text-sm ${dark ? "text-white/40" : "text-gray-500"}`}
                    >
                      No orders for this filter •{" "}
                      <button
                        onClick={() => setOrderFilter("All")}
                        className={`underline ${dark ? "text-white" : "text-gray-900"}`}
                      >
                        Show All
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Bulk bar */}
              {filteredOrders.length > 0 && (
                <div
                  className={`mt-3 flex flex-wrap items-center gap-2 text-xs ${dark ? "text-white/60" : "text-gray-600"}`}
                >
                  <span>{filteredOrders.length} orders</span>
                  <span className="hidden md:inline">•</span>
                  <span className="inline-flex items-center gap-1">
                    Bulk status:{" "}
                    <select
                      value={bulkStatus}
                      onChange={(e) => setBulkStatus(e.target.value)}
                      className={`${dark ? "bg-[#1e1e24] border-white/10 text-white" : "bg-white border-gray-200 text-gray-700"} border rounded-full px-2 py-1 text-xs`}
                    >
                      <option>confirmed</option>
                      <option>shipped</option>
                      <option>delivered</option>
                      <option>cancelled</option>
                    </select>{" "}
                    <button
                      onClick={async () => {
                        for (let o of filteredOrders)
                          await api.put(`/orders/${o.id}/status`, {
                            status: bulkStatus,
                          });
                        setOrders((prev) =>
                          prev.map((x) =>
                            filteredOrders.find((f) => f.id === x.id)
                              ? { ...x, status: bulkStatus }
                              : x,
                          ),
                        );
                        success(`Bulk → ${bulkStatus}`);
                      }}
                      className="bg-[#2a5bd7] text-white px-3 py-1 rounded-full font-bold"
                    >
                      Apply
                    </button>
                  </span>
                </div>
              )}
            </div>
          )}

          {tab === "users" && (
            <div
              className={`${dark ? "bg-[#0a0a0f] text-white" : "bg-white text-gray-900"} -m-4 md:-m-6 lg:-m-8 p-4 md:p-6 min-h-[calc(100vh-80px)] relative overflow-hidden`}
            >
              <div
                className={`absolute -top-32 -right-32 w-[700px] h-[400px] rounded-full blur-[100px] pointer-events-none ${dark ? "bg-[#1e3a8a]/15" : "bg-blue-100/40"}`}
              ></div>
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-4 mb-5 relative">
                <div>
                  <h2
                    className={`text-[28px] font-black tracking-tight leading-none ${dark ? "text-white" : "text-gray-900"}`}
                  >
                    Customers
                  </h2>
                  <p
                    className={`text-sm mt-1 ${dark ? "text-white/60" : "text-gray-500"}`}
                  >
                    Manage customer accounts and order history • {users.length}{" "}
                    total
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      downloadPDF(
                        "Users Report",
                        ["Name", "Email", "Phone"],
                        users.map((u) => [u.name, u.email, u.phone || ""]),
                        "users.pdf",
                      )
                    }
                    className={`px-4 py-2 rounded-full text-xs font-bold hidden md:inline-flex border ${dark ? "bg-[#1a1a20] border-white/10 text-white/70" : "bg-white border-gray-200 text-gray-700"}`}
                  >
                    📄 PDF
                  </button>
                  <button
                    onClick={() => success("Invite — coming soon")}
                    className="bg-[#2a5bd7] hover:bg-[#1e4bc0] text-white px-5 py-2.5 rounded-full font-black text-sm inline-flex items-center gap-2"
                  >
                    + Invite Customer
                  </button>
                </div>
              </div>

              {/* Toolbar */}
              <div className="flex flex-wrap gap-3 items-center justify-between mb-3">
                <div className="relative flex-1 max-w-[420px]">
                  <span
                    className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-sm ${dark ? "text-white/40" : "text-gray-400"}`}
                  >
                    ⌕
                  </span>
                  <input
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search name or email..."
                    className={`w-full rounded-full pl-10 pr-4 py-2.5 text-sm outline-none border ${dark ? "bg-[#1a1a20] border-white/10 text-white placeholder:text-white/40 focus:border-white/20" : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-gray-300"}`}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`${dark ? "bg-[#1e1e24] border-white/10 text-white" : "bg-white border-gray-200 text-gray-700"} border px-3 py-1.5 rounded-full text-xs font-bold`}
                  >
                    {filteredUsers.length} shown
                  </span>
                  <span
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border ${filteredUsers.filter((u) => u.blocked).length ? "bg-red-900/30 text-red-300 border-red-800" : "bg-white/5 text-white/50 border-white/10"}`}
                  >
                    {filteredUsers.filter((u) => u.blocked).length} blocked
                  </span>
                </div>
              </div>

              {/* Table */}
              <div
                className={`${dark ? "bg-[#111116] border-white/10" : "bg-white border-gray-200"} rounded-xl border overflow-hidden`}
              >
                <div className="overflow-auto">
                  <table className="w-full text-sm min-w-[860px]">
                    <thead
                      className={`${dark ? "bg-[#18181f] border-white/10 text-white/50" : "bg-gray-50 border-gray-200 text-gray-500"} border-b text-xs`}
                    >
                      <tr>
                        <th className="text-left px-4 py-3 font-bold">
                          <input
                            type="checkbox"
                            className="rounded bg-white/10 border-white/20"
                          />
                        </th>
                        <th className="text-left px-4 py-3 font-bold">
                          Customer
                        </th>
                        <th className="text-left px-4 py-3 font-bold">
                          Contact
                        </th>
                        <th className="text-left px-4 py-3 font-bold">Role</th>
                        <th className="text-left px-4 py-3 font-bold">
                          Status
                        </th>
                        <th className="text-center px-4 py-3 font-bold">
                          Orders
                        </th>
                        <th className="text-left px-4 py-3 font-bold">
                          Joined
                        </th>
                        <th className="text-right px-4 py-3 font-bold">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody
                      className={`divide-y ${dark ? "divide-white/5" : "divide-gray-100"}`}
                    >
                      {filteredUsers.map((u) => {
                        const orderCount = orders.filter(
                          (o) => o.user_id === u.id,
                        ).length;
                        return (
                          <tr
                            key={u.id}
                            className={`${dark ? "hover:bg-white/[0.03]" : "hover:bg-gray-50"} group`}
                          >
                            <td className="px-4 py-3">
                              <input
                                type="checkbox"
                                className={`rounded ${dark ? "bg-white/10 border-white/20" : "bg-white border-gray-300"}`}
                              />
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={`https://i.pravatar.cc/100?u=${u.email}`}
                                  alt={u.name}
                                  className={`w-8 h-8 rounded-full object-cover border ${dark ? "border-white/10" : "border-gray-200"}`}
                                />
                                <div>
                                  <div
                                    className={`font-bold text-xs flex items-center gap-1.5 ${dark ? "text-white" : "text-gray-900"}`}
                                  >
                                    {u.name}{" "}
                                    {u.role === "admin" && (
                                      <span className="bg-[#1e3a5a] text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                        ADMIN
                                      </span>
                                    )}
                                  </div>
                                  <div
                                    className={`text-[11px] ${dark ? "text-white/40" : "text-gray-500"}`}
                                  >
                                    {u.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td
                              className={`px-4 py-3 text-xs ${dark ? "text-white/70" : "text-gray-600"}`}
                            >
                              {u.phone || "—"}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-bold border ${u.role === "admin" ? "bg-[#1e3a5a] text-white border-white/10" : dark ? "bg-white/5 text-white/60 border-white/10" : "bg-gray-100 text-gray-600 border-gray-200"}`}
                              >
                                {u.role}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-bold border ${u.blocked ? "bg-red-900/30 text-red-300 border-red-800" : "bg-emerald-900/20 text-emerald-300 border-emerald-800"}`}
                              >
                                {u.blocked ? "Blocked" : "Active"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() =>
                                  setExpandedUser(
                                    expandedUser === u.id ? null : u.id,
                                  )
                                }
                                className={`${dark ? "bg-[#1e1e24] border-white/10 text-white hover:bg-white/10" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"} border px-2 py-1 rounded-full text-xs font-bold`}
                              >
                                {orderCount} •{" "}
                                {expandedUser === u.id ? "Hide" : "View"}
                              </button>
                            </td>
                            <td
                              className={`px-4 py-3 text-xs ${dark ? "text-white/50" : "text-gray-500"}`}
                            >
                              {new Date(u.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex justify-end gap-1">
                                <button
                                  onClick={() => startEditUser(u)}
                                  className="w-7 h-7 rounded-full bg-white/5 border border-white/10 text-white/70 hover:bg-white hover:text-[#0a0a0f] grid place-items-center text-xs"
                                >
                                  ✎
                                </button>
                                <button
                                  onClick={() =>
                                    api
                                      .put(`/users/${u.id}/block`)
                                      .then(() =>
                                        setUsers((prev) =>
                                          prev.map((x) =>
                                            x.id === u.id
                                              ? { ...x, blocked: !x.blocked }
                                              : x,
                                          ),
                                        ),
                                      )
                                  }
                                  className={`w-7 h-7 rounded-full border grid place-items-center text-xs ${u.blocked ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-white" : "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white"}`}
                                >
                                  {u.blocked ? "✓" : "✕"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {filteredUsers.length === 0 && (
                    <div
                      className={`p-10 text-center text-sm ${dark ? "text-white/40" : "text-gray-500"}`}
                    >
                      No customers found
                    </div>
                  )}
                </div>
              </div>

              {/* Expanded / Edit drawers */}
              {filteredUsers.map((u) => (
                <div key={`exp-${u.id}`}>
                  {expandedUser === u.id && (
                    <div
                      className={`mt-2 border rounded-xl p-4 text-sm ${dark ? "bg-[#1a1a20] border-white/10 text-white/70" : "bg-white border-gray-200 text-gray-700"}`}
                    >
                      <div className="grid md:grid-cols-3 gap-3">
                        <div className={`rounded-xl p-3 border ${dark ? "bg-white/5 border-white/10" : "bg-[#f6f7f4] border-gray-200"}`}>
                          <div className={`text-[11px] font-black uppercase tracking-widest mb-2 ${dark ? "text-white/40" : "text-gray-500"}`}>Contact Details</div>
                          <div className="space-y-1 text-xs">
                            <div><span className={`font-bold ${dark ? "text-white" : "text-gray-900"}`}>Email:</span> {u.email}</div>
                            <div><span className={`font-bold ${dark ? "text-white" : "text-gray-900"}`}>Phone:</span> {u.phone || "—"}</div>
                            <div><span className={`font-bold ${dark ? "text-white" : "text-gray-900"}`}>Verified:</span>{" "}
                              <span className={u.email_verified ? "text-emerald-500" : "text-amber-500"}>
                                {u.email_verified ? "✓ Yes" : "✗ No"}
                              </span>
                            </div>
                            <div><span className={`font-bold ${dark ? "text-white" : "text-gray-900"}`}>Joined:</span> {new Date(u.created_at).toLocaleDateString()}</div>
                            <div><span className={`font-bold ${dark ? "text-white" : "text-gray-900"}`}>ID:</span> <span className="font-mono text-[10px]">{u.id}</span></div>
                          </div>
                        </div>
                        <div className={`rounded-xl p-3 border ${dark ? "bg-white/5 border-white/10" : "bg-[#f6f7f4] border-gray-200"}`}>
                          <div className={`text-[11px] font-black uppercase tracking-widest mb-2 ${dark ? "text-white/40" : "text-gray-500"}`}>Address</div>
                          <div className="text-xs leading-5">
                            {orders.filter((o) => o.user_id === u.id).length
                              ? (() => {
                                  const addr = orders.filter((o) => o.user_id === u.id)[0].address || {};
                                  return addr.street
                                    ? <>{addr.street}<br/>{addr.city}{addr.state ? `, ${addr.state}` : ""} {addr.postal_code}<br/>{addr.country || "India"}</>
                                    : <span className={dark ? "text-white/30" : "text-gray-400"}>No address on file</span>;
                                })()
                              : <span className={dark ? "text-white/30" : "text-gray-400"}>No address yet</span>}
                          </div>
                        </div>
                        <div className={`rounded-xl p-3 border ${dark ? "bg-white/5 border-white/10" : "bg-[#f6f7f4] border-gray-200"}`}>
                          <div className={`text-[11px] font-black uppercase tracking-widest mb-2 ${dark ? "text-white/40" : "text-gray-500"}`}>Order Summary</div>
                          <div className="text-xs space-y-1">
                            <div><span className={`font-bold ${dark ? "text-white" : "text-gray-900"}`}>Total Orders:</span> {orders.filter((o) => o.user_id === u.id).length}</div>
                            <div><span className={`font-bold ${dark ? "text-white" : "text-gray-900"}`}>Total Spend:</span> ₹{orders.filter((o) => o.user_id === u.id).reduce((s, o) => s + Number(o.total_amount || 0), 0).toFixed(0)}</div>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {orders.filter((o) => o.user_id === u.id).map((o) => (
                                <span key={o.id} className={`${dark ? "bg-[#2a2a30] border-white/10 text-white" : "bg-gray-100 border-gray-200 text-gray-700"} border px-2 py-0.5 rounded-full text-[10px]`}>
                                  {o.id.slice(0, 8)} • ₹{o.total_amount} • {o.status}
                                </span>
                              ))}
                              {orders.filter((o) => o.user_id === u.id).length === 0 && (
                                <span className={dark ? "text-white/30" : "text-gray-400"}>No orders</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {editingUser === u.id && (
                    <div
                      className={`mt-2 border rounded-xl p-4 ${dark ? "bg-[#111116] border-white/10" : "bg-white border-gray-200"}`}
                    >
                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <label
                            className={`text-xs font-bold ${dark ? "text-white/60" : "text-gray-600"}`}
                          >
                            Name
                          </label>
                          <input
                            value={editUserForm.name}
                            onChange={(e) =>
                              setEditUserForm({
                                ...editUserForm,
                                name: e.target.value,
                              })
                            }
                            className={`mt-1 w-full border rounded-xl px-3 py-2 text-sm ${dark ? "bg-[#1e1e24] border-white/10 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                          />
                        </div>
                        <div>
                          <label
                            className={`text-xs font-bold ${dark ? "text-white/60" : "text-gray-600"}`}
                          >
                            Phone
                          </label>
                          <input
                            value={editUserForm.phone}
                            onChange={(e) =>
                              setEditUserForm({
                                ...editUserForm,
                                phone: e.target.value,
                              })
                            }
                            className={`mt-1 w-full border rounded-xl px-3 py-2 text-sm ${dark ? "bg-[#1e1e24] border-white/10 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                          />
                        </div>
                        <div>
                          <label
                            className={`text-xs font-bold ${dark ? "text-white/60" : "text-gray-600"}`}
                          >
                            Email
                          </label>
                          <input
                            value={editUserForm.email}
                            onChange={(e) =>
                              setEditUserForm({
                                ...editUserForm,
                                email: e.target.value,
                              })
                            }
                            className={`mt-1 w-full border rounded-xl px-3 py-2 text-sm ${dark ? "bg-[#1e1e24] border-white/10 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                          />
                        </div>
                        <div>
                          <label
                            className={`text-xs font-bold ${dark ? "text-white/60" : "text-gray-600"}`}
                          >
                            Role
                          </label>
                          <select
                            value={editUserForm.role}
                            onChange={(e) =>
                              setEditUserForm({
                                ...editUserForm,
                                role: e.target.value,
                              })
                            }
                            className={`mt-1 w-full border rounded-xl px-3 py-2 text-sm ${dark ? "bg-[#1e1e24] border-white/10 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                          >
                            <option value="user">user</option>
                            <option value="admin">admin</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={saveUserEdit}
                          className="bg-[#2a5bd7] text-white px-5 py-2 rounded-full text-xs font-bold"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingUser(null)}
                          className={`${dark ? "bg-white/5 border-white/10 text-white" : "bg-white border-gray-200 text-gray-700"} border px-5 py-2 rounded-full text-xs font-bold`}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {tab === "messages" && (
            <div
              className={`${dark ? "bg-[#0a0a0f] text-white" : "bg-white text-gray-900"} -m-4 md:-m-6 lg:-m-8 p-4 md:p-6 min-h-[calc(100vh-80px)] relative overflow-hidden`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4 mb-5 relative">
                <div>
                  <h2
                    className={`text-[28px] font-black tracking-tight leading-none ${dark ? "text-white" : "text-gray-900"}`}
                  >
                    Messages
                  </h2>
                  <p
                    className={`text-sm mt-1 ${dark ? "text-white/60" : "text-gray-500"}`}
                  >
                    Customer contact messages • {msgs.length} total
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={msgFilter}
                    onChange={(e) => setMsgFilter(e.target.value)}
                    className={`${dark ? "bg-[#1a1a20] border-white/10 text-white" : "bg-white border-gray-200 text-gray-700"} border rounded-full px-3 py-2 text-xs font-bold`}
                  >
                    <option>All</option>
                    <option>Unread</option>
                    <option>Resolved</option>
                  </select>
                </div>
              </div>
              <div
                className={`${dark ? "bg-[#111116] border-white/10" : "bg-white border-gray-200"} rounded-xl border overflow-hidden`}
              >
                <div className="overflow-auto">
                  <table className="w-full text-sm min-w-[860px]">
                    <thead
                      className={`${dark ? "bg-[#18181f] border-white/10 text-white/50" : "bg-gray-50 border-gray-200 text-gray-500"} border-b text-xs`}
                    >
                      <tr>
                        <th className="text-left px-4 py-3 font-bold">Customer</th>
                        <th className="text-left px-4 py-3 font-bold">Subject</th>
                        <th className="text-left px-4 py-3 font-bold">Message</th>
                        <th className="text-left px-4 py-3 font-bold">Status</th>
                        <th className="text-left px-4 py-3 font-bold">Date</th>
                        <th className="text-right px-4 py-3 font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${dark ? "divide-white/5" : "divide-gray-100"}`}>
                      {filteredMsgs.map((m) => (
                        <tr key={m.id} className={`${dark ? "hover:bg-white/[0.03]" : "hover:bg-gray-50"}`}>
                          <td className="px-4 py-3">
                            <div className={`font-bold text-xs ${dark ? "text-white" : "text-gray-900"}`}>{m.name}</div>
                            <div className={`text-[11px] ${dark ? "text-white/40" : "text-gray-500"}`}>{m.email}</div>
                          </td>
                          <td className={`px-4 py-3 text-xs font-bold ${dark ? "text-white/80" : "text-gray-700"}`}>{m.subject || "—"}</td>
                          <td className={`px-4 py-3 text-xs max-w-[260px] ${dark ? "text-white/70" : "text-gray-600"}`}>
                            <div className="truncate">{m.message}</div>
                            {m.reply && (
                              <div className={`mt-1 p-2 rounded-lg text-xs ${dark ? "bg-white/5 text-white/80" : "bg-gray-50 text-gray-700"}`}>
                                <span className="font-black">Reply:</span> {m.reply}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold border ${m.reply ? "bg-emerald-900/20 text-emerald-300 border-emerald-800" : dark ? "bg-amber-900/20 text-amber-300 border-amber-800" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                              {m.reply ? "Replied" : "Unread"}
                            </span>
                          </td>
                          <td className={`px-4 py-3 text-xs whitespace-nowrap ${dark ? "text-white/50" : "text-gray-500"}`}>
                            {new Date(m.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {!m.reply && (
                              <button
                                onClick={async () => {
                                  const reply = prompt("Enter reply:");
                                  if (reply === null) return;
                                  if (!reply.trim()) { toastError("Reply cannot be empty"); return; }
                                  try {
                                    await api.put(`/contact/${m.id}/reply`, { message: reply.trim() });
                                    setMsgs((prev) => prev.map((x) => x.id === m.id ? { ...x, reply: reply.trim(), replied_at: new Date().toISOString() } : x));
                                    success("Reply sent");
                                  } catch (e) {
                                    toastError(e.response?.data?.error || "Failed to send reply");
                                  }
                                }}
                                className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-white grid place-items-center text-xs"
                              >
                                ↩
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredMsgs.length === 0 && (
                    <div className={`p-10 text-center text-sm ${dark ? "text-white/40" : "text-gray-500"}`}>No messages yet</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {tab === "reviews" && (
            <div
              className={`${dark ? "bg-[#0a0a0f] text-white" : "bg-white text-gray-900"} -m-4 md:-m-6 lg:-m-8 p-4 md:p-6 min-h-[calc(100vh-80px)] relative overflow-hidden`}
            >
              <div
                className={`absolute -top-32 -right-32 w-[700px] h-[400px] rounded-full blur-[100px] pointer-events-none ${dark ? "bg-[#1e3a8a]/15" : "bg-blue-100/40"}`}
              ></div>
              <div className="flex flex-wrap items-start justify-between gap-4 mb-5 relative">
                <div>
                  <h2
                    className={`text-[28px] font-black tracking-tight leading-none ${dark ? "text-white" : "text-gray-900"}`}
                  >
                    Reviews
                  </h2>
                  <p
                    className={`text-sm mt-1 ${dark ? "text-white/60" : "text-gray-500"}`}
                  >
                    Customer feedback on products • {reviews.length} total • Avg{" "}
                    {reviews.length
                      ? (
                          reviews.reduce((s, r) => s + (r.rating || 0), 0) /
                          reviews.length
                        ).toFixed(1)
                      : "—"}
                    ★
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={reviewFilter}
                    onChange={(e) => setReviewFilter(e.target.value)}
                    className={`${dark ? "bg-[#1a1a20] border-white/10 text-white" : "bg-white border-gray-200 text-gray-700"} border rounded-full px-3 py-2 text-xs font-bold`}
                  >
                    <option>All</option>
                    <option>5★</option>
                    <option>4★</option>
                    <option>3★</option>
                  </select>
                  <button
                    onClick={() =>
                      downloadPDF(
                        "Reviews",
                        ["Plant", "Rating", "Comment"],
                        reviews.map((r) => {
                          const p = plants.find((x) => x.id === r.plant_id);
                          return [
                            p?.name || r.plant_id,
                            r.rating + "★",
                            (r.comment || "").slice(0, 30),
                          ];
                        }),
                        "reviews.pdf",
                      )
                    }
                    className={`${dark ? "bg-[#1a1a20] border-white/10 text-white/70" : "bg-white border-gray-200 text-gray-700"} border px-4 py-2 rounded-full text-xs font-bold`}
                  >
                    📄 PDF
                  </button>
                </div>
              </div>

              <div className="relative flex-1 max-w-[420px] mb-3">
                <span
                  className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-sm ${dark ? "text-white/40" : "text-gray-400"}`}
                >
                  ⌕
                </span>
                <input
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  placeholder="Search reviews, product or customer..."
                  className={`w-full rounded-full pl-10 pr-4 py-2.5 text-sm outline-none border ${dark ? "bg-[#1a1a20] border-white/10 text-white placeholder:text-white/40 focus:border-white/20" : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-gray-300"}`}
                />
              </div>

              <div
                className={`${dark ? "bg-[#111116] border-white/10" : "bg-white border-gray-200"} rounded-xl border overflow-hidden`}
              >
                <div className="overflow-auto">
                  <table className="w-full text-sm min-w-[860px]">
                    <thead
                      className={`${dark ? "bg-[#18181f] border-white/10 text-white/50" : "bg-gray-50 border-gray-200 text-gray-500"} border-b text-xs`}
                    >
                      <tr>
                        <th className="text-left px-4 py-3 font-bold">
                          Product
                        </th>
                        <th className="text-left px-4 py-3 font-bold">
                          Customer
                        </th>
                        <th className="text-center px-4 py-3 font-bold">
                          Rating
                        </th>
                        <th className="text-left px-4 py-3 font-bold">
                          Comment
                        </th>
                        <th className="text-left px-4 py-3 font-bold">Date</th>
                        <th className="text-right px-4 py-3 font-bold">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody
                      className={`divide-y ${dark ? "divide-white/5" : "divide-gray-100"}`}
                    >
                      {filteredReviews.map((r) => {
                        const p = plants.find((x) => x.id === r.plant_id);
                        return (
                          <tr
                            key={r.id}
                            className={`${dark ? "hover:bg-white/[0.03]" : "hover:bg-gray-50"}`}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <img
                                  src={encodeURI(p?.images?.[0] || "")}
                                  alt=""
                                  className={`w-8 h-8 rounded-lg object-cover border ${dark ? "border-white/10 bg-[#1a1a20]" : "border-gray-200 bg-gray-50"}`}
                                />
                                <div>
                                  <div
                                    className={`font-bold text-xs ${dark ? "text-white" : "text-gray-900"}`}
                                  >
                                    {p?.name || r.plant_id}
                                  </div>
                                  <div
                                    className={`text-[11px] font-mono ${dark ? "text-white/40" : "text-gray-500"}`}
                                  >
                                    {p?.sku || r.plant_id.slice(0, 8)}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div
                                className={`font-bold text-xs ${dark ? "text-white" : "text-gray-900"}`}
                              >
                                {r.user_name || "Anonymous"}
                              </div>
                              <div
                                className={`text-[11px] ${dark ? "text-white/40" : "text-gray-500"}`}
                              >
                                {r.user_id?.slice(0, 8)}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-black ${r.rating >= 4 ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : r.rating === 3 ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-red-500/20 text-red-300 border border-red-500/30"}`}
                              >
                                {"★".repeat(r.rating)} {r.rating}
                              </span>
                            </td>
                            <td className="px-4 py-3 max-w-[320px]">
                              <div
                                className={`text-xs truncate ${dark ? "text-white/70" : "text-gray-700"}`}
                              >
                                {r.comment || "—"}
                              </div>
                            </td>
                            <td
                              className={`px-4 py-3 text-xs whitespace-nowrap ${dark ? "text-white/50" : "text-gray-500"}`}
                            >
                              {new Date(r.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={async () => {
                                  await api.delete(`/reviews/${r.id}`);
                                  setReviews((prev) =>
                                    prev.filter((x) => x.id !== r.id),
                                  );
                                  success("Review deleted");
                                }}
                                className="w-7 h-7 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white grid place-items-center text-xs"
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {filteredReviews.length === 0 && (
                    <div
                      className={`p-10 text-center text-sm ${dark ? "text-white/40" : "text-gray-500"}`}
                    >
                      No reviews yet •{" "}
                      {reviews.length === 0
                        ? "Customers will appear here after purchase"
                        : "No match for filter"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDeleteTarget(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center border">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 grid place-items-center mx-auto text-xl">
              ⚠️
            </div>
            <h3 className="font-black text-lg mt-3">
              Delete{" "}
              {deleteTarget.type === "bulk"
                ? deleteTarget.name
                : `"${deleteTarget.name}"`}
              ?
            </h3>
            <p className="text-sm text-gray-500 mt-2">
              This action cannot be undone. Are you sure you want to delete?
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 border-2 py-2.5 rounded-full font-bold bg-white hover:bg-gray-50"
              >
                No, Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-full font-bold"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminOrderView() {
  const { id } = useParams();
  const nav = useNavigate();
  const { success, error: toastError } = useToast();
  const [order, setOrder] = useState(null);
  const [users, setUsers] = useState([]);
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    street: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
    payment_method: "COD",
    note: "",
  });

  useEffect(() => {
    Promise.all([
      api
        .get(`/orders`)
        .then((r) => r.data)
        .catch(() => []),
      api
        .get("/users")
        .then((r) => r.data)
        .catch(() => []),
      api
        .get("/plants?limit=100")
        .then((r) => r.data.plants || [])
        .catch(() => []),
    ]).then(([ordersData, usersData, plantsData]) => {
      const found = ordersData.find((o) => o.id === id);
      if (found) setOrder(found);
      setUsers(usersData);
      setPlants(plantsData);
      setLoading(false);
    });
  }, [id]);

  const printInvoice = (ord) => {
    const customer = users.find((u) => u.id === ord.user_id) || {};
    const cName =
      (customer.name && customer.name.trim()) ||
      ord.user_name ||
      ord.customer_name ||
      "Customer";
    const cEmail = customer.email || ord.user_email || "";
    const cPhone = customer.phone || ord.customer_phone || "";
    const addr = ord.address || {};
    const items = ord.items || [];
    const subtotal = items.reduce((s, it) => {
      const p = plants.find((x) => x.id === it.plant_id);
      const price = it.price || p?.price || 0;
      return s + price * it.quantity;
    }, 0);
    const shipping = Number(ord.shipping ?? 49);
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>Invoice ${ord.id}</title>
      <style>
        body{font-family:Inter,system-ui,Arial,sans-serif;color:#111827;margin:0;padding:24px;background:#fff}
        .header{background:#0a2e1f;color:#fff;padding:16px 20px;display:flex;justify-content:space-between;align-items:center}
        .badge{background:#10b981;color:#fff;font-size:10px;font-weight:800;padding:4px 8px;border-radius:999px}
        .card{border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin-top:16px}
        .grid2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
        table{width:100%;border-collapse:collapse;margin-top:12px}
        th{background:#0a2e1f;color:#fff;text-align:left;font-size:11px;padding:8px}
        td{border:1px solid #e5e7eb;padding:8px;font-size:12px}
        tr:nth-child(even) td{background:#f9fafb}
        .totals{margin-left:auto;width:260px;margin-top:12px;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden}
        .totals div{display:flex;justify-content:space-between;padding:8px 12px;font-size:12px}
        .totals .grand{background:#0a2e1f;color:#fff;font-weight:800}
        .footer{margin-top:20px;text-align:center;font-size:11px;color:#6b7280;border-top:1px solid #e5e7eb;padding-top:12px}
        @media print{body{padding:0} .no-print{display:none}}
      </style></head><body>
      <div class="header">
        <div style="display:flex;gap:10px;align-items:center"><div style="width:32px;height:32px;background:#10b981;border-radius:8px;display:grid;place-items:center;font-weight:900">🌿</div><div><div style="font-weight:900">GreenNest</div><div style="font-size:11px;color:#a7f3d0">Pezhummoodu, Thiruvananthapuram, Kerala • H34Q+9FP</div></div></div>
        <div style="text-align:right"><div style="font-weight:900;letter-spacing:0.08em">INVOICE</div><div style="font-size:12px;margin-top:4px">${ord.id} • ${new Date(ord.created_at).toLocaleDateString()}</div><div style="margin-top:6px"><span class="badge">${ord.status.toUpperCase()}</span> <span class="badge" style="background:#fff;color:#0a2e1f;border:1px solid #e5e7eb">${ord.payment_method}</span></div></div>
      </div>
      <div class="grid2">
        <div class="card"><div style="font-size:11px;font-weight:800;letter-spacing:0.1em;color:#065f46">BILL TO</div><div style="font-weight:800;margin-top:6px">${cName}</div><div style="font-size:12px;color:#4b5563">${cEmail}<br/>${cPhone ? `Ph: ${cPhone}` : ""}</div><div style="font-size:11px;color:#6b7280;margin-top:6px">Customer ID: ${ord.user_id || ""}</div></div>
        <div class="card"><div style="font-size:11px;font-weight:800;letter-spacing:0.1em;color:#065f46">SHIP TO</div><div style="font-size:12px;margin-top:6px;line-height:1.5">${addr.street || ""}<br/>${addr.city || ""} ${addr.state || ""} ${addr.postal_code || ""}<br/>${addr.country || "India"}</div></div>
      </div>
      <table><thead><tr><th>#</th><th>Item</th><th>Qty</th><th>Price</th><th>Amount</th></tr></thead><tbody>
        ${items
          .map((it, i) => {
            const p = plants.find((x) => x.id === it.plant_id);
            const name = it.name || p?.name || it.plant_id;
            const price = it.price || p?.price || 0;
            const amt = price * it.quantity;
            return `<tr><td>${i + 1}</td><td><b>${name}</b><div style="font-size:11px;color:#6b7280">${it.variantId || it.selectedVariant || ""} ${p?.sku || ""}</div></td><td>${it.quantity}</td><td>₹${price}</td><td><b>₹${amt.toFixed(2)}</b></td></tr>`;
          })
          .join("")}
      </tbody></table>
      <div class="totals"><div><span>Subtotal</span><span>₹${subtotal.toFixed(2)}</span></div><div><span>Shipping</span><span>${shipping === 0 ? "FREE" : `₹${shipping.toFixed(2)}`}</span></div><div class="grand"><span>TOTAL</span><span>₹${(ord.total_amount || 0).toFixed(2)}</span></div></div>
      <div class="footer">Thank you for growing with GreenNest! • GST bill on request • hello@greenest.com • +91 98765 43210<br/>H34Q+9FP, Pezhummoodu, Thiruvananthapuram, Kerala 695575 • This is a computer generated invoice</div>
      <div class="no-print" style="text-align:center;margin-top:16px"><button onclick="window.print()" style="background:#0a2e1f;color:#fff;padding:10px 18px;border-radius:999px;border:none;font-weight:800;cursor:pointer">Print</button> <button onclick="window.close()" style="background:#fff;border:1px solid #e5e7eb;padding:10px 18px;border-radius:999px;font-weight:700;cursor:pointer;margin-left:8px">Close</button></div>
      </body></html>
    `);
    win.document.close();
    setTimeout(() => win.print(), 300);
  };

  if (loading)
    return (
      <div className="min-h-screen grid place-items-center bg-[#f6f7f4]">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-emerald-600 rounded-full animate-spin"></div>
      </div>
    );
  if (!order)
    return (
      <div className="min-h-screen grid place-items-center bg-[#f6f7f4] p-6">
        <div className="bg-white border rounded-2xl p-8 text-center max-w-md">
          <h3 className="font-black">Order not found</h3>
          <p className="text-sm text-gray-500 mt-1">#{id}</p>
          <button
            onClick={() => nav("/admin")}
            className="mt-4 bg-[#0a2e1f] text-white px-6 py-2.5 rounded-full font-bold"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );

  const customer = users.find((u) => u.id === order.user_id) || {};
  const cName =
    (customer.name && customer.name.trim()) ||
    order.user_name ||
    order.customer_name ||
    "Customer";
  const cEmail = customer.email || order.user_email || "";
  const cPhone = customer.phone || order.customer_phone || "";
  const items = order.items || [];
  const subtotal = items.reduce((s, it) => {
    const p = plants.find((x) => x.id === it.plant_id);
    const price = it.price || p?.price || 0;
    return s + price * it.quantity;
  }, 0);
  const shipping = Number(order.shipping ?? 49);
  const statusColor =
    order.status === "delivered"
      ? "bg-green-600"
      : order.status === "cancelled"
        ? "bg-red-600"
        : order.status === "shipped"
          ? "bg-blue-600"
          : order.status === "confirmed"
            ? "bg-emerald-600"
            : "bg-amber-500";

  const updateStatus = async (v) => {
    setUpdating(true);
    try {
      await api.put(`/orders/${order.id}/status`, { status: v });
      setOrder((o) => ({ ...o, status: v }));
      success(`Status → ${v}`);
    } catch (e) {
      toastError(e.response?.data?.error || "Failed");
    } finally {
      setUpdating(false);
    }
  };
  const updatePaymentStatus = async (v) => {
    setUpdating(true);
    try {
      await api.put(`/orders/${order.id}`, { payment_status: v });
      setOrder((o) => ({ ...o, payment_status: v }));
      success(`Payment → ${v}`);
    } catch (e) {
      toastError(e.response?.data?.error || "Failed");
    } finally {
      setUpdating(false);
    }
  };

  const steps = ["pending_owner", "confirmed", "shipped", "delivered"];
  const currentIdx = steps.indexOf(order.status);
  const isCancelled = order.status === "cancelled";
  return (
    <div className="min-h-screen bg-[#f6f7f4]">
      <div className="max-w-[1120px] mx-auto p-4 md:p-6">
        <button
          onClick={() => nav("/admin")}
          className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-900 mb-4"
        >
          <span className="w-8 h-8 rounded-full bg-white border grid place-items-center">
            ←
          </span>{" "}
          Back to Orders
        </button>

        {/* Header */}
        <div className="bg-white rounded-[24px] border shadow-sm overflow-hidden">
          <div className="bg-gradient-to-br from-[#0a2e1f] to-[#123d2a] text-white p-6 md:p-7">
            <div className="flex flex-wrap justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-black tracking-tight">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </h1>
                  <span
                    className={`text-xs font-black px-3 py-1 rounded-full border ${isCancelled ? "bg-red-500 border-red-400 text-white" : currentIdx >= 0 ? "bg-emerald-500 border-emerald-400 text-white" : "bg-white/15 border-white/20"}`}
                  >
                    {order.status.replace("_", " ")}
                  </span>
                  <span className="text-xs bg-white/10 border border-white/20 px-3 py-1 rounded-full font-bold">
                    {order.payment_method}
                  </span>
                </div>
                <p className="text-sm text-white/70 mt-2">
                  {new Date(order.created_at).toLocaleString()} • {items.length}{" "}
                  {items.length === 1 ? "item" : "items"} • COD
                </p>
              </div>
              <div className="text-left md:text-right">
                <div className="text-xs tracking-widest uppercase font-bold text-white/60">
                  Total Amount
                </div>
                <div className="text-3xl font-black">₹{order.total_amount}</div>
                <div className="text-xs text-white/60">
                  Subtotal ₹{subtotal.toFixed(0)} + Shipping{" "}
                  {shipping === 0 ? "FREE" : "₹" + shipping.toFixed(0)}
                </div>
              </div>
            </div>
            {/* Timeline */}
            <div className="mt-6">
              <div className="flex items-center gap-2 md:gap-3">
                {steps.map((s, i) => {
                  const done = currentIdx >= i && !isCancelled;
                  const active = currentIdx === i && !isCancelled;
                  return (
                    <div
                      key={s}
                      className="flex items-center gap-2 md:gap-3 flex-1"
                    >
                      <div
                        className={`w-8 h-8 md:w-9 md:h-9 rounded-full grid place-items-center text-xs font-black shrink-0 border-2 ${done ? "bg-white text-[#0a2e1f] border-white" : "bg-white/10 text-white/60 border-white/20"}`}
                      >
                        {done ? "✓" : i + 1}
                      </div>
                      <div className="hidden md:block leading-tight flex-1">
                        <div
                          className={`text-xs font-black capitalize ${active ? "text-white" : "text-white/60"}`}
                        >
                          {s.replace("_", " ")}
                        </div>
                        <div className="text-[11px] text-white/40">
                          {i === 0
                            ? "Placed"
                            : i === 1
                              ? "Confirmed"
                              : i === 2
                                ? "Shipped"
                                : "Delivered"}
                        </div>
                      </div>
                      {i < steps.length - 1 && (
                        <div
                          className={`hidden md:block flex-1 h-0.5 ${currentIdx > i ? "bg-white" : "bg-white/20"}`}
                        ></div>
                      )}
                    </div>
                  );
                })}
              </div>
              {isCancelled && (
                <div className="mt-3 text-xs font-bold bg-red-500 text-white px-3 py-1.5 rounded-full w-fit">
                  Cancelled — {order.cancel_reason || "No reason"}
                </div>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-[1.7fr_1fr] gap-6 p-4 md:p-6 bg-[#fcfcfa]">
            {/* Left */}
            <div className="space-y-4">
              {/* Items */}
              <div className="bg-white rounded-2xl border overflow-hidden">
                <div className="px-5 py-3 border-b bg-gray-50 flex justify-between items-center">
                  <span className="font-black text-sm">
                    Items • {items.length}
                  </span>
                  <span className="text-xs text-gray-500 hidden md:inline">
                    Live-packed • GST bill on request
                  </span>
                </div>
                <div className="divide-y max-h-[420px] overflow-auto">
                  {items.map((it, i) => {
                    const p = plants.find((x) => x.id === it.plant_id);
                    const price = it.price || p?.price || 0;
                    return (
                      <div
                        key={it.plant_id + i}
                        className="flex gap-4 p-4 items-center hover:bg-gray-50"
                      >
                        <img
                          src={encodeURI(p?.images?.[0] || "")}
                          alt={it.name || p?.name}
                          className="w-14 h-14 md:w-16 md:h-16 rounded-xl object-cover border bg-[#f6f7f4] shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm truncate">
                            {it.name || p?.name || it.plant_id}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {p?.sku || it.plant_id} •{" "}
                            {it.variantId ||
                              it.selectedVariant ||
                              p?.sunlight ||
                              ""}{" "}
                            • {p?.pot_size || ""}
                          </div>
                          <div className="text-sm font-black mt-1">
                            ₹{price} × {it.quantity} = ₹
                            {(price * it.quantity).toFixed(2)}
                          </div>
                        </div>
                        <span className="hidden md:inline text-xs font-bold bg-[#f6f7f4] border px-2 py-1 rounded-full">
                          Qty {it.quantity}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="bg-[#fcfcfa] p-4 border-t space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-bold">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Shipping</span>
                    <span className="font-bold">
                      {shipping === 0 ? "FREE" : `₹${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between font-black text-[16px] pt-2 border-t">
                    <span>Total (COD)</span>
                    <span>₹{order.total_amount}</span>
                  </div>
                </div>
              </div>

              {/* Shipping */}
              <div className="bg-white rounded-2xl border p-5">
                <div className="flex justify-between items-start">
                  <h4 className="font-black text-sm">Shipping Address</h4>
                  <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-full font-bold">
                    COD • 3-5 days
                  </span>
                </div>
                <p className="text-sm text-gray-700 mt-3 leading-6 bg-[#f6f7f4] border rounded-xl p-3">
                  {order.address?.street || "—"}
                  <br />
                  {order.address?.city || ""} {order.address?.state || ""}{" "}
                  {order.address?.postal_code || ""}
                  <br />
                  {order.address?.country || "India"}
                </p>
                {order.note && (
                  <p className="text-xs mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <span className="font-black">Note:</span> {order.note}
                  </p>
                )}
              </div>
            </div>

            {/* Right */}
            <div className="space-y-4">
              {/* Customer */}
              <div className="bg-white rounded-2xl border p-5">
                <div className="flex justify-between items-center">
                  <div className="text-[11px] font-black tracking-widest uppercase text-gray-500">
                    Customer{" "}
                    {isEditing && (
                      <span className="text-emerald-600 normal-case">
                        • Editing
                      </span>
                    )}
                  </div>
                  {!isEditing ? (
                    <button
                      onClick={() => {
                        setEditForm({
                          customer_name: cName,
                          customer_email: cEmail,
                          customer_phone: cPhone,
                          street: order.address?.street || "",
                          city: order.address?.city || "",
                          state: order.address?.state || "",
                          postal_code: order.address?.postal_code || "",
                          country: order.address?.country || "India",
                          payment_method: order.payment_method || "COD",
                          note: order.note || "",
                        });
                        setIsEditing(true);
                      }}
                      className="text-xs font-bold border bg-white px-3 py-1.5 rounded-full hover:bg-gray-50"
                    >
                      Edit
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          setUpdating(true);
                          try {
                            const payload = {
                              customer_name: editForm.customer_name,
                              customer_email: editForm.customer_email,
                              customer_phone: editForm.customer_phone,
                              address: {
                                street: editForm.street,
                                city: editForm.city,
                                state: editForm.state,
                                postal_code: editForm.postal_code,
                                country: editForm.country,
                              },
                              payment_method: editForm.payment_method,
                              note: editForm.note,
                            };
                            const res = await api.put(
                              `/orders/${order.id}`,
                              payload,
                            );
                            setOrder(res.data);
                            success("Order updated");
                            setIsEditing(false);
                          } catch (e) {
                            toastError(e.response?.data?.error || "Failed");
                          } finally {
                            setUpdating(false);
                          }
                        }}
                        disabled={updating}
                        className="bg-emerald-600 text-white px-3 py-1.5 rounded-full text-xs font-bold"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="border bg-white px-3 py-1.5 rounded-full text-xs font-bold"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
                {isEditing ? (
                  <div className="mt-3 grid gap-3">
                    <div>
                      <label className="text-xs font-bold">Name</label>
                      <input
                        value={editForm.customer_name}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            customer_name: e.target.value,
                          })
                        }
                        className="mt-1 w-full border rounded-xl px-3 py-2 text-sm bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold">Phone</label>
                      <input
                        value={editForm.customer_phone}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            customer_phone: e.target.value,
                          })
                        }
                        className="mt-1 w-full border rounded-xl px-3 py-2 text-sm bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold">Email</label>
                      <input
                        value={editForm.customer_email}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            customer_email: e.target.value,
                          })
                        }
                        className="mt-1 w-full border rounded-xl px-3 py-2 text-sm bg-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-bold">Street</label>
                        <input
                          value={editForm.street}
                          onChange={(e) =>
                            setEditForm({ ...editForm, street: e.target.value })
                          }
                          className="mt-1 w-full border rounded-xl px-3 py-2 text-sm bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold">City</label>
                        <input
                          value={editForm.city}
                          onChange={(e) =>
                            setEditForm({ ...editForm, city: e.target.value })
                          }
                          className="mt-1 w-full border rounded-xl px-3 py-2 text-sm bg-white"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-bold">State</label>
                        <input
                          value={editForm.state}
                          onChange={(e) =>
                            setEditForm({ ...editForm, state: e.target.value })
                          }
                          className="mt-1 w-full border rounded-xl px-3 py-2 text-sm bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold">Postal</label>
                        <input
                          value={editForm.postal_code}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              postal_code: e.target.value,
                            })
                          }
                          className="mt-1 w-full border rounded-xl px-3 py-2 text-sm bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3 items-center mt-4">
                    <img
                      src={`https://i.pravatar.cc/100?u=${cEmail || cName}`}
                      alt={cName}
                      className="w-12 h-12 rounded-full object-cover border-2 border-emerald-100"
                    />
                    <div className="min-w-0">
                      <div className="font-black">{cName}</div>
                      <div className="text-sm text-gray-600 truncate">
                        {cEmail}
                      </div>
                      <div className="text-xs font-bold mt-1">
                        {cPhone ? `📞 ${cPhone}` : "No phone"} • ID{" "}
                        {order.user_id?.slice(0, 6)}
                      </div>
                    </div>
                  </div>
                )}
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-[#f6f7f4] border rounded-xl p-2.5">
                    <div className="font-bold">Payment</div>
                    <div className="font-black text-emerald-700">
                      {order.payment_method}
                    </div>
                  </div>
                  <div className="bg-[#f6f7f4] border rounded-xl p-2.5">
                    <div className="font-bold">ID</div>
                    <div className="font-mono text-xs truncate">{order.id}</div>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="bg-white rounded-2xl border p-5">
                <div className="text-xs font-black tracking-widest uppercase text-gray-500">
                  Update Status
                </div>
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(e.target.value)}
                  disabled={updating}
                  className="mt-3 w-full border-2 rounded-xl px-4 py-3 font-bold text-sm bg-white"
                >
                  <option>pending_owner</option>
                  <option>confirmed</option>
                  <option>shipped</option>
                  <option>delivered</option>
                  <option>cancelled</option>
                </select>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => printInvoice(order)}
                    className="bg-[#0a2e1f] text-white py-2.5 rounded-full font-black text-sm"
                  >
                    🖨️ Invoice
                  </button>
                  <a
                    href={`https://wa.me/${cPhone?.replace(/[^0-9]/g, "") || "919876543210"}?text=Hi ${cName}, your GreenNest order ${order.id.slice(0, 8)} is ${order.status}`}
                    target="_blank"
                    className="bg-emerald-600 text-white py-2.5 rounded-full font-black text-sm text-center"
                  >
                    💬 WhatsApp
                  </a>
                </div>
                <p className="text-xs text-center text-gray-400 mt-2">
                  GST bill on request • 14-day replace
                </p>
                <div className="mt-4 pt-4 border-t">
                  <div className="text-xs font-black tracking-widest uppercase text-gray-500">
                    Payment Status
                  </div>
                  <select
                    value={
                      (order.payment_status || "pending").toLowerCase() ===
                        "paid" ||
                      (order.payment_status || "").toLowerCase() ===
                        "confirmed" ||
                      order.status === "delivered"
                        ? "paid"
                        : "unpaid"
                    }
                    onChange={(e) =>
                      updatePaymentStatus(
                        e.target.value === "paid" ? "paid" : "pending",
                      )
                    }
                    disabled={updating}
                    className={`mt-2 w-full border-2 rounded-xl px-4 py-3 font-black bg-white text-sm outline-none cursor-pointer ${(order.payment_status || "").toLowerCase() === "paid" || (order.payment_status || "").toLowerCase() === "confirmed" || order.status === "delivered" ? "border-emerald-300 text-emerald-700 bg-emerald-50" : "border-amber-300 text-amber-700 bg-amber-50"}`}
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function Messages() {
  return null;
}
