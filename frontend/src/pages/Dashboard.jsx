import { useEffect, useState, useMemo } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../components/Toast";
import { useLanguage } from "../context/LanguageContext";

/* ---------- icons ---------- */
const Ico = {
  grid: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>),
  box: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M12 2l9 4.5v9L12 20 3 15.5v-9L12 2z"/><path d="M3 7.5l9 4.5 9-4.5"/><path d="M12 12v8"/></svg>),
  heart: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M12 21s-6.5-4.2-8.8-8.3A5.2 5.2 0 0112 4.8a5.2 5.2 0 018.8 7.9C18.5 16.8 12 21 12 21z"/></svg>),
  pin: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M12 21s7-5 7-11a7 7 0 10-14 0c0 6 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>),
  user: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><circle cx="12" cy="8" r="4"/><path d="M5 20a7 7 0 0114 0"/></svg>),
  leaf: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><path d="M12 2a10 10 0 00-2 19.7c.2.1.5 0 .6-.3A8 8 0 0112 2z"/><path d="M12 2c3 3 5 6 5 9a5 5 0 01-5 5"/></svg>),
  spark: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/><path d="M19 14l1 2 2 1-2 1-1 2-1-2-2-1 2-1z"/><path d="M5 14l1 2 2 1-2 1-1 2-1-2-2-1 2-1z"/></svg>),
  flame: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M12 3s4 3.5 4 7a4 4 0 01-8 0c0-3.5 4-7 4-7z"/><path d="M9 21h6"/></svg>),
  trophy: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M6 3h12v4a4 4 0 01-4 4h-4a4 4 0 01-4-4V3z"/><path d="M6 7H4a2 2 0 000 4h2"/><path d="M18 7h2a2 2 0 010 4h-2"/><path d="M10 11v3l-2 2h8l-2-2v-3"/></svg>),
  search: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><circle cx="11" cy="11" r="7"/><path d="M20 20L16 16"/></svg>),
  clock: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>),
  droplet: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M12 3l7 9a7 7 0 01-14 0l7-9z"/></svg>),
  analytics: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M3 3v18h18"/><path d="M7 16l4-4 3 3 4-6"/></svg>),
  settings: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>),
};

/* level system */
function getLevelInfo(points) {
  if (points >= 700) return { name: "Guardian", icon: "🌳", next: 1000, color: "from-emerald-700 to-teal-600", bg: "bg-emerald-900", text: "text-emerald-100" };
  if (points >= 300) return { name: "Bloom", icon: "🌸", next: 700, color: "from-pink-500 to-rose-400", bg: "bg-pink-600", text: "text-white" };
  if (points >= 100) return { name: "Sprout", icon: "🌱", next: 300, color: "from-lime-500 to-emerald-400", bg: "bg-lime-600", text: "text-white" };
  return { name: "Seedling", icon: "🌰", next: 100, color: "from-amber-500 to-orange-400", bg: "bg-amber-600", text: "text-white" };
}

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
  const [notifPrefs, setNotifPrefs] = useState({ order: true, promo: false, care: true });
  const [showDanger, setShowDanger] = useState(false);
  const [orderFilter, setOrderFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelId, setCancelId] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelErr, setCancelErr] = useState("");
  const [notifyWishlist, setNotifyWishlist] = useState({});
  const [addressTab, setAddressTab] = useState(false);
  const [addrForm, setAddrForm] = useState({ label: "Home", street: "", city: "", state: "", postal_code: "", country: "India", is_default: false });
  const [editingAddr, setEditingAddr] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [journal, setJournal] = useState(() => { try { return JSON.parse(localStorage.getItem("careJournal") || "{}"); } catch { return {}; } });
  const [referralCopied, setReferralCopied] = useState(false);
  const [supportTickets, setSupportTickets] = useState(() => { try { return JSON.parse(localStorage.getItem("supportTickets") || '[{"id":"1","subject":"Delivery query","status":"Resolved","date":"2026-08-20","msg":"Where is my Aloe order?"}]'); } catch { return []; } });
  const [newTicket, setNewTicket] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [exploreFilter, setExploreFilter] = useState("");
  const [wishlistSearch, setWishlistSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [careNote, setCareNote] = useState("");
  // gamification: streak + check-in
  const [streak, setStreak] = useState(() => { try { return JSON.parse(localStorage.getItem("gn_streak") || '{"count":1,"last":"'+new Date().toISOString().slice(0,10)+'"}'); } catch { return { count: 1, last: new Date().toISOString().slice(0,10)}; } });
  const [checkedIn, setCheckedIn] = useState(() => localStorage.getItem("gn_checkin") === new Date().toISOString().slice(0,10));
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizAns, setQuizAns] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    api.get("/orders/my").then((r) => setOrders(r.data)).catch(() => {});
    api.get("/users/profile").then((r) => { setProfile(r.data); setEdit({ name: r.data.name || "", phone: r.data.phone || "", email: r.data.email || "" }); }).catch(() => {});
    api.get("/plants?limit=100").then((r) => setPlants(r.data.plants || [])).catch(() => {});
    api.get("/wishlist").then((r) => setWishlist(r.data || [])).catch(() => {});
  }, []);
  useEffect(() => { localStorage.setItem("careJournal", JSON.stringify(journal)); }, [journal]);
  useEffect(() => { localStorage.setItem("supportTickets", JSON.stringify(supportTickets)); }, [supportTickets]);
  useEffect(() => { localStorage.setItem("gn_streak", JSON.stringify(streak)); }, [streak]);

  const totalSpent = useMemo(() => orders.reduce((s, o) => s + (o.total_amount || 0), 0), [orders]);
  const loyaltyPoints = Math.floor(totalSpent / 10) + (checkedIn ? 15 : 0) + streak.count * 2;
  const level = getLevelInfo(loyaltyPoints);
  const levelProgress = Math.min(100, Math.round((loyaltyPoints / level.next) * 100));
  const pendingCount = orders.filter((o) => ["pending", "pending_owner", "processing"].includes(o.status)).length;
  const deliveredCount = orders.filter((o) => o.status === "delivered").length;
  const wishlistCount = wishlist.length;
  const completion = useMemo(() => { let c = 0; if (edit.name) c += 30; if (edit.email) c += 30; if (edit.phone) c += 20; if (profile?.addresses?.length) c += 20; return Math.min(100, c); }, [edit, profile]);
  const completionLabel = !edit.phone ? "add phone number" : !profile?.addresses?.length ? "add address" : "profile complete!";
  const referralCode = `GREEN-${(user?.email || "user").slice(0, 3).toUpperCase()}${(user?.id || "").slice(0, 4).toUpperCase() || "1234"}`;
  const referralLink = `https://greennest.com/r/${referralCode}`;
  const nextReward = 100 - (loyaltyPoints % 100);
  const activeOrder = orders.find((o) => ["pending", "pending_owner", "processing", "confirmed", "shipped"].includes(o.status));
  const activeOrderPlant = activeOrder ? plants.find((p) => p.id === activeOrder.items?.[0]?.plant_id) : null;

  const ownedPlants = useMemo(() => {
    const ids = new Set(); orders.forEach((o) => o.items?.forEach((it) => ids.add(it.plant_id)));
    return Array.from(ids).map((id) => plants.find((p) => p.id === id)).filter(Boolean);
  }, [orders, plants]);

  const todayStr = new Date().toISOString().slice(0,10);
  const careTasks = useMemo(() => {
    return ownedPlants.slice(0,4).map(p => {
      const done = !!journal[`${p.id}_${todayStr}`];
      return { plant: p, done, id: `${p.id}_${todayStr}` };
    });
  }, [ownedPlants, journal, todayStr]);

  const frequentlyBought = useMemo(() => {
    const map = {}; orders.forEach((o) => o.items?.forEach((it) => { map[it.plant_id] = (map[it.plant_id] || 0) + it.quantity; }));
    return Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,4).map(([id])=>plants.find(p=>p.id===id)).filter(Boolean);
  }, [orders, plants]);

  const seasonalTip = useMemo(() => { const m=new Date().getMonth(); if(m===11||m===0||m===1) return "Winter: Reduce watering, keep near bright window."; if(m>=2&&m<=4) return "Spring: Repot & fertilize every 2 weeks — growth season!"; if(m>=5&&m<=7) return "Summer: Water early morning, mist tropicals, shade harsh sun."; return "Autumn: Propagate cuttings & prep for dormancy."; }, []);

  const explorePlants = useMemo(() => {
    let list = plants;
    if (exploreFilter) list = list.filter(p => (p.category||"").toLowerCase().includes(exploreFilter.toLowerCase()));
    // boost frequently bought + wishlist to top, then shuffle a bit
    return list.slice(0,12);
  }, [plants, exploreFilter]);

  const handleCheckIn = () => {
    if (checkedIn) return;
    const today = new Date().toISOString().slice(0,10);
    const yesterday = new Date(Date.now()-86400000).toISOString().slice(0,10);
    setStreak(s => {
      if (s.last === yesterday) return { count: s.count+1, last: today };
      if (s.last === today) return s;
      return { count: 1, last: today };
    });
    setCheckedIn(true);
    localStorage.setItem("gn_checkin", today);
    success("Checked in! +15 XP 🌱 Keep streak alive");
  };

  const toggleCare = (taskId) => {
    setJournal(j => {
      const next = { ...j };
      if (next[taskId]) delete next[taskId];
      else next[taskId] = { doneAt: Date.now(), note: careNote };
      return next;
    });
  };

  const saveProfile = async () => {
    if (!edit.name.trim() || !edit.email.trim()) { setSaveMsg("Name and email required"); toastError("Name and email required"); return; }
    if (!/^\S+@\S+\.\S+$/.test(edit.email)) { setSaveMsg("Invalid email"); toastError("Invalid email"); return; }
    try { await api.put("/users/profile", { name: edit.name, phone: edit.phone, email: edit.email }); setProfile((p) => ({ ...p, name: edit.name, phone: edit.phone, email: edit.email })); setSaveMsg("✓ Saved successfully"); success("Profile updated"); setEmailChanged(false); setTimeout(()=>setSaveMsg(""),2200); } catch (e) { const m = e.response?.data?.error || "Failed to save"; setSaveMsg(m); toastError(m); }
  };
  const handleEmailChange = (v) => { setEdit({ ...edit, email: v }); setEmailChanged(v !== profile?.email); };
  const changePassword = async () => {
    if (!pw.next || pw.next !== pw.confirm) { setPwMsg("Passwords do not match"); toastError("Passwords do not match"); return; }
    if (pw.next.length < 6) { setPwMsg("Min 6 characters"); toastError("Password must be 6+ characters"); return; }
    try { await api.put("/users/password", { currentPassword: pw.current, newPassword: pw.next }); setPwMsg("✓ Password updated"); success("Password updated"); setPw({ current:"", next:"", confirm:"" }); setTimeout(()=>setPwMsg(""),2200); } catch (e) { const message = e.response?.data?.error || "Failed to update password"; setPwMsg(message); toastError(message); }
  };

  const addresses = profile?.addresses || [];
  const useCurrentLocation = () => {
    setGeoLoading(true);
    if (!navigator.geolocation) { setGeoLoading(false); toastError("Geolocation not supported"); return; }
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try { const { latitude, longitude } = pos.coords; const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`); const data = await res.json(); const addr = data.address || {}; setAddrForm((f) => ({ ...f, street: data.display_name?.split(",")[0] || f.street, city: addr.city || addr.town || addr.village || f.city, state: addr.state || f.state, postal_code: addr.postcode || f.postal_code, country: addr.country || f.country })); success("Location filled — please verify and save"); } catch { toastError("Failed to reverse geocode"); } setGeoLoading(false);
    }, () => { setGeoLoading(false); toastError("Location permission denied"); });
  };
  const saveAddress = async (e) => {
    e.preventDefault();
    if (!addrForm.street || !addrForm.city) { toastError("Street & City required"); return; }
    try {
      if (editingAddr) {
        const r = await api.put(`/users/addresses/${editingAddr}`, addrForm);
        const saved = r.data;
        setProfile((p) => ({ ...p, addresses: p.addresses.map((a) => (a.id === editingAddr ? saved : addrForm.is_default ? { ...a, is_default: false } : a)).map((a) => a.id === editingAddr ? saved : a) }));
        const fresh = await api.get("/users/profile").then((res) => res.data).catch(() => null);
        if (fresh?.addresses) setProfile((p) => ({ ...p, addresses: fresh.addresses }));
        setEditingAddr(null); success("Address updated");
      } else {
        const r = await api.post("/users/addresses", addrForm);
        const newAddr = r.data;
        const fresh = await api.get("/users/profile").then((res) => res.data).catch(() => null);
        if (fresh?.addresses) setProfile((p) => ({ ...p, addresses: fresh.addresses }));
        else { let updated = [...addresses, newAddr]; if (addrForm.is_default) updated = updated.map((a) => ({ ...a, is_default: a.id === newAddr.id })); setProfile((p) => ({ ...p, addresses: updated })); }
        success("Address added");
      }
    } catch (err) { toastError(err.response?.data?.error || "Failed to save address"); return; }
    setAddrForm({ label: "Home", street:"", city:"", state:"", postal_code:"", country:"India", is_default:false }); setAddressTab(false);
  };
  const deleteAddress = (id) => { setDeleteTarget({ type:'address', id, name:'this address' }); };
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const target = { ...deleteTarget };
    if (target.type === 'address') {
      try {
        await api.delete(`/users/addresses/${target.id}`);
        // optimistic update - remove immediately so UI reflects delete even if profile fetch lags
        setProfile((p) => ({ ...p, addresses: (p.addresses || []).filter((a) => a.id !== target.id) }));
        // sync with server profile (authoritative)
        const fresh = await api.get("/users/profile").then((res)=>res.data).catch(()=>null);
        if (fresh?.addresses) setProfile((p)=>({ ...p, addresses: fresh.addresses }));
        success("Address deleted");
      } catch (e) {
        if (e.response?.status === 404) {
          // address already not on server (stale memory/uuid mismatch) — remove locally anyway so UI updates
          setProfile((p) => ({ ...p, addresses: (p.addresses || []).filter((a) => a.id !== target.id) }));
          success("Address removed");
        } else {
          const msg = e.response?.data?.error || "Failed to delete address";
          toastError(msg);
        }
      }
    }
    else if (target.type === 'wishlist') { const entry = wishlist.find((x)=>x.plant_id===target.id); if (entry) await api.delete(`/wishlist/${entry.id}`).catch(()=>{}); setWishlist((prev)=>prev.filter((x)=>x.plant_id!==target.id)); success(`${target.name} removed from wishlist`); }
    else if (target.type === 'account') { success("Account deletion requested — contact support"); logout(); }
    setDeleteTarget(null);
  };
  const setDefaultAddress = async (id) => { try { await api.put(`/users/addresses/${id}/default`);} catch{} const fresh = await api.get("/users/profile").then((res)=>res.data).catch(()=>null); if (fresh?.addresses) setProfile((p)=>({...p, addresses: fresh.addresses})); else setProfile((p)=>({...p, addresses: p.addresses.map((a)=>({...a, is_default: a.id===id}))})); success("Default address updated"); };
  const startEditAddr = (a) => { setAddrForm({ label: a.label||"Home", street:a.street, city:a.city, state:a.state, postal_code:a.postal_code, country:a.country||"India", is_default: !!a.is_default }); setEditingAddr(a.id); setAddressTab(true); };

  const wishlistPlants = wishlist.map((w)=>plants.find((p)=>p.id===w.plant_id)).filter(Boolean).filter(p => !wishlistSearch || p.name.toLowerCase().includes(wishlistSearch.toLowerCase()));
  const removeWishlist = async (w) => { setDeleteTarget({ type:'wishlist', id:w.id, name:w.name }); };
  const moveToCart = (p) => { addToCart(p,1); success(`${p.name} moved to cart`); };

  const filteredOrders = (() => {
    let list = orderFilter==="All" ? orders : orders.filter((o)=>{ if(orderFilter==="Pending") return ["pending","pending_owner","processing"].includes(o.status); if(orderFilter==="Shipped") return o.status==="shipped"; if(orderFilter==="Delivered") return o.status==="delivered"; if(orderFilter==="Cancelled") return o.status==="cancelled"; return o.status===orderFilter.toLowerCase(); });
    if (orderSearch) list = list.filter(o => o.id.toLowerCase().includes(orderSearch.toLowerCase()) || o.items?.some(it => plants.find(p=>p.id===it.plant_id)?.name.toLowerCase().includes(orderSearch.toLowerCase())));
    return list;
  })();
  const openCancel = (id) => { setCancelId(id); setCancelReason(""); setCancelErr(""); };
  const submitCancel = async () => {
    const reason = cancelReason.trim(); if (reason.length < 10) { setCancelErr("Please give reason (min 10 characters) — mandatory"); toastError("Cancel reason is mandatory"); return; }
    try { const res = await api.put(`/orders/${cancelId}/cancel`, { reason }); setOrders((prev)=>prev.map((o)=>(o.id===cancelId ? res.data : o))); if (selectedOrder?.id===cancelId) setSelectedOrder(res.data); success("Order cancelled — reason recorded"); setCancelId(null); setCancelReason(""); } catch (e) { const m = e.response?.data?.error || "Failed to cancel"; setCancelErr(m); toastError(m); }
  };
  const reorder = (order) => { order.items.forEach((it)=>{ const plant=plants.find((p)=>p.id===it.plant_id); if(plant) addToCart(plant,it.quantity); }); success("Items added to cart — Buy again!"); };
  const downloadInvoice = async (order) => {
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF("p","mm","a4"); const pageW=210, pageH=297, m=10; const green=[12,46,31], emerald=[16,185,129], lightBg=[248,250,247], border=[226,232,240];
    doc.setFillColor(...green); doc.rect(0,0,pageW,28,"F"); doc.setFillColor(16,122,62); doc.circle(14,14,6,"F"); doc.setFont("helvetica","bold"); doc.setTextColor(255,255,255); doc.setFontSize(8); doc.text("🌿",12.5,15.5); doc.setFontSize(14); doc.text("Shaji’s Nursery and Gardens",24,13); doc.setFontSize(7); doc.setFont("helvetica","normal"); doc.setTextColor(167,243,208); doc.text("Pezhummoodu, Thiruvananthapuram, Kerala  •  nursery@greenest.com  •  +91 98765 43210",24,18); doc.setFont("helvetica","bold"); doc.setTextColor(255,255,255); doc.setFontSize(11); doc.text("INVOICE",pageW-m,14,{align:"right"}); doc.setFontSize(7); doc.setFont("helvetica","normal"); doc.text(`#${order.id.slice(0,8).toUpperCase()}`,pageW-m,19,{align:"right"}); doc.setFontSize(6.5); doc.setTextColor(200,255,220); doc.text(`${new Date(order.created_at).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})} • ${order.payment_method} • ${order.status.replace("_"," ")}`,pageW-m,22,{align:"right"});
    let y=36; doc.setFillColor(...lightBg); doc.setDrawColor(...border); doc.rect(m,y,(pageW-m*2)/2-2,26,"FD"); doc.rect(m+(pageW-m*2)/2+2,y,(pageW-m*2)/2-2,26,"FD"); doc.setFont("helvetica","bold"); doc.setTextColor(12,46,31); doc.setFontSize(7); doc.text("BILL TO",m+4,y+6); doc.setFont("helvetica","normal"); doc.setTextColor(30,30,30); doc.setFontSize(8); doc.text(`${order.user_name||user?.name||"Customer"}`,m+4,y+10); doc.setFontSize(7); doc.setTextColor(80,80,80); doc.text(`${order.user_email||user?.email||""}`,m+4,y+14); if(order.customer_phone||profile?.phone) doc.text(`Ph: ${order.customer_phone||profile.phone}`,m+4,y+18); doc.text(`Payment: ${order.payment_method} • ${order.status}`,m+4,y+22); const rx=m+(pageW-m*2)/2+2; doc.setFont("helvetica","bold"); doc.setTextColor(12,46,31); doc.setFontSize(7); doc.text("SHIP TO",rx+4,y+6); doc.setFont("helvetica","normal"); doc.setTextColor(30,30,30); doc.setFontSize(7.5); const ship=`${order.address?.street||""}, ${order.address?.city||""}${order.address?.city&&order.address?.state?", ":""}${order.address?.state||""} ${order.address?.postal_code||""}${order.address?.country?", "+order.address.country:""}`; const shipLines=doc.splitTextToSize(ship,(pageW-m*2)/2-10); doc.text(shipLines,rx+4,y+11); y+=32;
    const colX=[m,m+10,m+92,m+112,m+142]; doc.setFillColor(...green); doc.rect(m,y,pageW-m*2,9,"F"); doc.setTextColor(255,255,255); doc.setFont("helvetica","bold"); doc.setFontSize(7); ["#","ITEM","QTY","PRICE","AMOUNT"].forEach((h,i)=>doc.text(h,colX[i]+2,y+6)); y+=9; doc.setFont("helvetica","normal"); doc.setTextColor(30,30,30); let subtotal=0; order.items?.forEach((it,idx)=>{ const p=plants.find((x)=>x.id===it.plant_id); const name=p?.name||it.plant_id; const price=p?.price||it.price||0; const amt=price*it.quantity; subtotal+=amt; if(y>275){doc.addPage(); y=20;} if(idx%2===0){doc.setFillColor(249,250,251); doc.rect(m,y,pageW-m*2,9,"F");} doc.setDrawColor(...border); doc.rect(m,y,pageW-m*2,9,"S"); for(let i=1;i<colX.length;i++) doc.line(colX[i],y,colX[i],y+9); doc.setFontSize(7); doc.text(String(idx+1),colX[0]+3,y+6); doc.setFont("helvetica","bold"); doc.text(doc.splitTextToSize(name,78)[0],colX[1]+2,y+6); doc.setFont("helvetica","normal"); doc.text(String(it.quantity),colX[2]+6,y+6,{align:"center"}); doc.text(`Rs.${price}`,colX[3]+2,y+6); doc.setFont("helvetica","bold"); doc.text(`Rs.${amt.toFixed(2)}`,colX[4]+2,y+6); y+=9; });
    const shipping=Number(order.shipping??49); const boxX=pageW-m-60, boxY=y+4, boxW=60; doc.setDrawColor(...border); doc.setFillColor(255,255,255); doc.rect(boxX,boxY,boxW,22,"FD"); doc.setFont("helvetica","normal"); doc.setFontSize(7); doc.setTextColor(80,80,80); doc.text("Subtotal",boxX+4,boxY+6); doc.text(`Rs.${subtotal.toFixed(2)}`,boxX+boxW-4,boxY+6,{align:"right"}); doc.text("Shipping",boxX+4,boxY+11); doc.text(shipping===0?"FREE":`Rs.${shipping.toFixed(2)}`,boxX+boxW-4,boxY+11,{align:"right"}); doc.setDrawColor(...border); doc.line(boxX,boxY+14,boxX+boxW,boxY+14); doc.setFillColor(...green); doc.rect(boxX,boxY+14,boxW,8,"F"); doc.setTextColor(255,255,255); doc.setFont("helvetica","bold"); doc.setFontSize(8); doc.text("TOTAL",boxX+4,boxY+19); doc.text(`Rs.${order.total_amount.toFixed(2)}`,boxX+boxW-4,boxY+19,{align:"right"}); const fy=pageH-18; doc.setDrawColor(...emerald); doc.setLineWidth(0.6); doc.line(m,fy-6,pageW-m,fy-6); doc.setFont("helvetica","normal"); doc.setTextColor(80,80,80); doc.setFontSize(6.5); doc.text("Thank you for growing with Shaji’s Nursery and Gardens! • GST bill on request • Questions? hello@greenest.com • +91 98765 43210",pageW/2,fy,{align:"center"}); doc.setFontSize(6); doc.setTextColor(130,130,130); doc.text("This is a computer generated invoice • H34Q+9FP, Pezhummoodu, Thiruvananthapuram, Kerala 695575",pageW/2,fy+4,{align:"center"}); doc.setFontSize(6); doc.text(`Page 1 of 1  •  Generated ${new Date().toLocaleString("en-IN")}`,pageW-m,fy+4,{align:"right"}); doc.save(`Shaji’s Nursery and Gardens-Invoice-${order.id.slice(0,8).toUpperCase()}.pdf`); success("Invoice downloaded — new design");
  };
  const downloadCareGuide = async (plant) => {
    const { default: jsPDF } = await import("jspdf"); const doc=new jsPDF(); doc.setFontSize(16); doc.text(`${plant.name} - Care Guide`,14,18); doc.setFontSize(10); doc.text(`Botanical: ${plant.botanical_name||""}`,14,26); doc.text(`Sunlight: ${plant.sunlight} • Water: ${plant.watering_frequency}`,14,32); doc.text(`Soil: ${plant.soil_type}`,14,38); doc.text(`Temp: ${plant.temperature_range} • Humidity: ${plant.humidity_preference}`,14,44); doc.setFontSize(9); const lines=doc.splitTextToSize(plant.care_instructions||plant.long_description||"",180); doc.text(lines,14,52); doc.text("Shaji’s Nursery and Gardens • Follow seasonal reminders for best growth",14,280); doc.save(`${plant.name}-care-guide.pdf`); success(`${plant.name} care guide downloaded`);
  };
  const downloadAllGuides = async () => { for(const p of ownedPlants){ await downloadCareGuide(p); } };

  const menu = [
    { id:"overview", label:t("dash_sidebar_overview"), icon:Ico.grid },
    { id:"orders", label:t("dash_sidebar_orders"), icon:Ico.box },
    { id:"wishlist", label:t("dash_sidebar_wishlist"), icon:Ico.heart },
    { id:"addresses", label:t("dash_sidebar_addresses"), icon:Ico.pin },
    { id:"profile", label:t("dash_sidebar_profile_link"), icon:Ico.user },
    { id:"analytics", label:"Analytics", icon:Ico.analytics },
    { id:"settings", label:"Settings", icon:Ico.settings },
  ];

  const achievements = [
    { id: "first", label: "First Sprout", desc: "1st order", done: orders.length>=1, icon:"🌿" },
    { id: "collector", label: "Collector", desc: "5 plants", done: ownedPlants.length>=5, icon:"🌵" },
    { id: "loyal", label: "Loyal", desc: "₹5k spent", done: totalSpent>=5000, icon:"💎" },
    { id: "care", label: "Caring", desc: "7-day streak", done: streak.count>=7, icon:"💧" },
    { id: "wishlist", label: "Wisher", desc: "5 wishlist", done: wishlistCount>=5, icon:"💚" },
    { id: "explorer", label: "Explorer", desc: "10 orders", done: orders.length>=10, icon:"🧭" },
  ];

  const quiz = [
    { q:"Your light?", opts:["Bright direct","Indirect / Low","Balcony sun","No clue"] },
    { q:"Your space?", opts:["Desk / small","Living room","Balcony / terrace","Garden"] },
    { q:"Care time?", opts:["Daily love","Weekly","Forgetful but want green","Busy, low care"] },
  ];

  const selectTab = (id) => { setTab(id); setMobileNav(false); window.scrollTo({ top:0, behavior:"smooth"}); };

  return (
    <div className="bg-[#fdfbf7] min-h-screen font-sans pb-20 lg:pb-0">
      {/* mobile top bar - flush */}
      <div className="lg:hidden sticky top-[64px] z-30 bg-white/85 backdrop-blur-xl border-b border-black/5 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={()=>setMobileNav(true)} className="w-9 h-9 rounded-xl border border-black/5 bg-white grid place-items-center hover:bg-zinc-50 shadow-sm"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg></button>
          <span className="text-sm font-black tracking-tight text-zinc-900 capitalize">{tab}</span>
          <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-[#0a2e1f] text-white">{level.icon} {level.name}</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#0a2e1f] text-white grid place-items-center text-xs font-black border-2 border-white shadow">{(user?.name||"G").slice(0,1).toUpperCase()}</div>
      </div>

      <div className="w-full flex flex-col lg:flex-row items-stretch">
        {mobileNav && <div onClick={()=>setMobileNav(false)} className="fixed inset-0 bg-[#0a2e1f]/30 backdrop-blur-sm z-40 lg:hidden" />}

        {/* SIDEBAR - IDENTITY HUB - flush under green navbar, no gaps */}
        <aside className={`bg-[#0a2e1f] text-white flex flex-col lg:sticky lg:top-[72px] lg:h-[calc(100vh-72px)] lg:w-[300px] lg:shrink-0 lg:overflow-y-auto no-scrollbar fixed inset-y-0 left-0 z-50 w-[300px] transition-transform duration-300 lg:translate-x-0 ${mobileNav ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} overflow-y-auto`}>
          {/* subtle grain */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{backgroundImage:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")"}} />
          <div className="relative px-5 pb-5 pt-3 flex-1 flex flex-col gap-5">
            <button onClick={()=>setMobileNav(false)} className="lg:hidden self-end w-8 h-8 rounded-xl bg-white/10 grid place-items-center text-white">✕</button>

            {/* nav - tightened to align with content header */}
            <nav className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/40 px-3 mb-2">Your Garden</p>
              {menu.map((m)=>{
                const active = tab===m.id;
                const Icon=m.icon;
                return (
                  <button key={m.id} onClick={()=>selectTab(m.id)} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition border ${active ? "bg-white text-[#0a2e1f] border-white shadow-lg" : "text-white/80 hover:bg-white/10 hover:text-white border-transparent"}`}>
                    <span className={`w-8 h-8 rounded-lg grid place-items-center ${active ? "bg-[#0a2e1f] text-white" : "bg-white/10 text-white/80"}`}><Icon className="w-4 h-4"/></span>
                    <span className="flex-1 text-left font-bold">{m.label}</span>
                    {m.id==="orders" && orders.length>0 && <span className={`text-xs font-black px-2 py-1 rounded-full ${active ? "bg-[#0a2e1f] text-white" : "bg-white/15 text-white"}`}>{orders.length}</span>}
                    {m.id==="wishlist" && wishlistCount>0 && <span className={`text-xs font-black px-2 py-1 rounded-full ${active ? "bg-pink-500 text-white" : "bg-pink-500/90 text-white"}`}>{wishlistCount}</span>}
                  </button>
                );
              })}
            </nav>

            {/* loyalty mini */}
            <div className="rounded-[20px] bg-gradient-to-br from-lime-300 to-emerald-200 p-4 text-[#0a2e1f] shadow-lg border border-white/30">
              <div className="flex items-center gap-2 text-xs font-black tracking-widest uppercase opacity-70"><Ico.trophy className="w-4 h-4"/> Loyalty</div>
              <div className="mt-1 font-black text-lg leading-none">{loyaltyPoints} points</div>
              <div className="text-xs font-medium opacity-70">₹1 = 0.1 pts • 100 pts = ₹10 off</div>
              <div className="mt-3 flex gap-2">
                <button onClick={()=>{navigator.clipboard.writeText(referralLink).catch(()=>{}); setReferralCopied(true); setTimeout(()=>setReferralCopied(false),1500); success("Referral link copied");}} className="flex-1 bg-[#0a2e1f] text-white text-xs font-black py-2.5 rounded-full hover:bg-black transition">{referralCopied ? "✓ Copied" : "Invite & earn →"}</button>
              </div>
              <div className="text-[10px] font-mono mt-2 bg-white/70 border rounded-full px-2 py-1 text-center truncate">{referralCode}</div>
            </div>

            <div className="space-y-1 pt-2 border-t border-white/10">
              <Link to="/shop" onClick={()=>setMobileNav(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-white/80 hover:bg-white/10 hover:text-white transition"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg> Shop • Explore</Link>
              <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-red-200 hover:bg-red-500/15 transition"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> Sign out</button>
            </div>

            <div className="rounded-2xl bg-white/10 backdrop-blur border border-white/10 p-3 flex gap-3 items-center">
              <div className="w-9 h-9 rounded-xl bg-white text-[#0a2e1f] grid place-items-center">💬</div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-black">Need help?</div>
                <div className="text-[11px] text-white/60">Mon–Sat 9am–7pm IST</div>
              </div>
              <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="shrink-0 bg-white text-[#0a2e1f] text-xs font-black px-3 py-2 rounded-full hover:bg-lime-200">WhatsApp</a>
            </div>
          </div>
        </aside>

        {/* MAIN - flush top, no gap under green navbar */}
        <div className="flex-1 min-w-0 bg-[#fdfbf7] p-4 sm:p-6 lg:p-8 pt-4 lg:pt-6 space-y-5">
          {tab === "overview" && (
            <>
              {/* Header */}
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3">
                <div>
                  <p className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">🌿 {new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})} • 🔥 {streak.count} day streak</p>
                  <h1 className="mt-2 text-[26px] md:text-[30px] font-black tracking-tight text-[#0a2e1f] leading-none">Good {new Date().getHours()<12?"morning":new Date().getHours()<17?"afternoon":"evening"}, {user?.name?.split(" ")[0]||"there"} 👋</h1>
                  <p className="text-sm text-stone-500 mt-1.5 max-w-[60ch]">{seasonalTip} Stay consistent and your garden will thrive.</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={handleCheckIn} disabled={checkedIn} className={`inline-flex items-center gap-2 text-sm font-black px-4 py-2.5 rounded-full border shadow-sm transition ${checkedIn ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-[#0a2e1f] text-white border-[#0a2e1f] hover:bg-black"}`}><Ico.flame className="w-4 h-4"/> {checkedIn ? "Checked in ✓" : "Daily check-in +15 XP"}</button>
                  <Link to="/shop" className="hidden sm:inline-flex items-center gap-2 bg-white border text-[#0a2e1f] text-sm font-black px-4 py-2.5 rounded-full hover:border-[#0a2e1f] transition">Browse Shop →</Link>
                </div>
              </div>

              {/* XP banner */}
              <div className="rounded-[22px] bg-gradient-to-br from-[#0a2e1f] via-[#0f3a26] to-[#134e33] text-white p-5 md:p-6 flex flex-col md:flex-row gap-5 items-start md:items-center justify-between overflow-hidden relative">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-lime-300/20 rounded-full blur-3xl" />
                <div className="absolute inset-0 opacity-[0.06]" style={{backgroundImage:"radial-gradient(circle at 1.2px 1.2px, white 1.2px, transparent 0)", backgroundSize:"22px 22px"}} />
                <div className="relative flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-2xl bg-white text-[#0a2e1f] grid place-items-center text-xl shadow-lg">{level.icon}</div>
                  <div>
                    <div className="text-xs font-black tracking-widest uppercase text-lime-200">Level • {level.name}</div>
                    <div className="font-black text-lg leading-none mt-1">{loyaltyPoints} XP • {levelProgress}% to {level.next} </div>
                    <div className="text-xs text-white/60 mt-1">Keep watering, shopping & exploring — every action grows your garden identity.</div>
                  </div>
                </div>
                <div className="relative w-full md:w-[360px] shrink-0">
                  <div className="h-3 bg-white/15 rounded-full overflow-hidden border border-white/10"><div className="h-full bg-lime-300 rounded-full transition-all duration-700" style={{width:`${levelProgress}%`}} /></div>
                  <div className="flex justify-between text-[11px] font-bold text-white/70 mt-2"><span>{loyaltyPoints} XP</span><span>{level.next} XP</span></div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  {label:"Total Orders", value:orders.length, sub:`${pendingCount} pending`, color:"text-emerald-700 bg-emerald-50 border-emerald-100", icon:<Ico.box className="w-4 h-4"/>},
                  {label:"Delivered", value:deliveredCount, sub:"completed", color:"text-blue-700 bg-blue-50 border-blue-100", icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><polyline points="20 6 9 17 4 12"/></svg>},
                  {label:"Wishlist", value:wishlistCount, sub:"saved items", color:"text-pink-700 bg-pink-50 border-pink-100", icon:<Ico.heart className="w-4 h-4"/>},
                  {label:"Total Spent", value:`₹${totalSpent.toLocaleString()}`, sub:`${loyaltyPoints} XP`, color:"text-amber-700 bg-amber-50 border-amber-100", icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>},
                ].map((s)=>(
                  <div key={s.label} className="bg-white border border-black/5 rounded-[20px] p-4 hover:shadow-md transition shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-black uppercase tracking-widest text-stone-400">{s.label}</span>
                      <span className={`w-8 h-8 rounded-xl border grid place-items-center ${s.color}`}>{s.icon}</span>
                    </div>
                    <div className="text-2xl font-black text-[#0a2e1f] leading-none">{s.value}</div>
                    <div className="text-xs text-stone-400 mt-1 font-medium">{s.sub}</div>
                  </div>
                ))}
              </div>

              {completion < 100 && (
                <div className="bg-white border border-amber-200 rounded-[18px] p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 grid place-items-center text-amber-600">✨</div>
                    <div>
                      <p className="text-sm font-black text-zinc-800">Complete your profile — {completion}%</p>
                      <p className="text-xs text-stone-500">{completionLabel} · Unlock faster checkout</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-28 h-1.5 bg-stone-100 rounded-full overflow-hidden"><div className="h-full bg-amber-500 rounded-full transition-all" style={{width:`${completion}%`}}/></div>
                    <button onClick={()=>selectTab("profile")} className="text-xs font-black bg-[#0a2e1f] text-white px-4 py-2 rounded-full hover:bg-black">Complete →</button>
                  </div>
                </div>
              )}

              {/* Active order + Care Guide */}
              <div className="grid lg:grid-cols-[1.45fr_0.55fr] gap-3">
                <div className="bg-white border border-black/5 rounded-[20px] p-5 shadow-sm">
                  <p className="text-[11px] font-black uppercase tracking-widest text-emerald-700 mb-1">Your next move</p>
                  <h2 className="text-[18px] font-black text-[#0a2e1f] leading-tight">{activeOrder ? "Your plants are on the way" : orders.length ? "Keep your collection thriving" : "Start your green journey"}</h2>
                  <p className="text-sm text-stone-500 mt-1.5 leading-6">{activeOrder ? `Order #${activeOrder.id.slice(0,8).toUpperCase()} is ${activeOrder.status.replace("_"," ")}.` : orders.length ? `${ownedPlants.length} plants in your collection. Fresh picks waiting in the shop.` : "Choose a low-maintenance favourite and make your first space feel alive."}</p>
                  {activeOrder && activeOrderPlant && (
                    <div className="mt-4 flex items-center gap-3 border border-emerald-100 rounded-2xl p-3 bg-emerald-50/50">
                      <img src={activeOrderPlant.images?.[0]} alt="" className="w-12 h-12 rounded-xl object-cover border border-white bg-white shadow-sm shrink-0"/>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-black truncate text-[#0a2e1f]">{activeOrderPlant.name}</div>
                        <div className="text-xs text-stone-500">{activeOrder.items?.length||0} items · ₹{activeOrder.total_amount}</div>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">In progress</span>
                    </div>
                  )}
                  <div className="flex gap-2 mt-4 flex-wrap">
                    {activeOrder ? <button onClick={()=>nav(`/orders/${activeOrder.id}`)} className="bg-[#0a2e1f] text-white px-5 py-2.5 rounded-full text-xs font-black hover:bg-black transition">Track order →</button> : <Link to="/shop" className="bg-[#0a2e1f] text-white px-5 py-2.5 rounded-full text-xs font-black hover:bg-black transition">Find a plant →</Link>}
                    <button onClick={()=>selectTab("orders")} className="border border-black/10 bg-white text-[#0a2e1f] px-5 py-2.5 rounded-full text-xs font-black hover:bg-stone-50 transition">View orders</button>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-[20px] p-5 text-white flex flex-col shadow-lg border border-white/10 relative overflow-hidden">
                  <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 grid place-items-center mb-3"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-lime-200">Plant Care Guide</p>
                    <p className="text-sm font-bold mt-1 leading-6">Watering, light, soil & seasonal tips for your plants.</p>
                    <p className="text-xs text-white/70 mt-2">PDF • 2 min read • Offline</p>
                    <a href="/Plant_Care_Guide.pdf" target="_blank" rel="noreferrer" download className="mt-4 flex items-center justify-center gap-2 bg-white text-emerald-700 text-xs font-black py-3 rounded-full hover:bg-lime-200 transition">Download PDF ↓</a>
                  </div>
                </div>
              </div>

              {/* Recent Orders - now before Keep Exploring as requested */}
              <div className="bg-white border border-black/5 rounded-[20px] overflow-hidden flex flex-col shadow-sm">
                <div className="px-5 py-4 border-b flex items-center justify-between">
                  <h2 className="text-sm font-black text-[#0a2e1f] flex items-center gap-2"><span className="w-8 h-8 rounded-xl bg-[#0a2e1f] text-white grid place-items-center"><Ico.box className="w-4 h-4"/></span> Recent Orders</h2>
                  <button onClick={()=>selectTab("orders")} className="text-xs font-black text-[#0a2e1f] border px-3 py-1.5 rounded-full hover:bg-stone-50">View all →</button>
                </div>
                {orders.length===0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-12 px-6 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-stone-50 border grid place-items-center"><Ico.box className="w-5 h-5 text-stone-300"/></div>
                    <p className="text-sm font-bold text-stone-600 mt-3">No orders yet</p>
                    <p className="text-xs text-stone-400 mt-1">Your green journey starts with one plant</p>
                    <Link to="/shop" className="mt-4 bg-[#0a2e1f] text-white text-xs font-black px-5 py-2.5 rounded-full">Browse plants →</Link>
                  </div>
                ) : (
                  <div className="divide-y flex-1">
                    {orders.slice(0,4).map((o)=>{
                      const img=plants.find(p=>p.id===o.items?.[0]?.plant_id)?.images?.[0];
                      return (
                        <button key={o.id} onClick={()=>nav(`/orders/${o.id}`)} className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-stone-50 transition text-left group">
                          <img src={img||"/aloevera plant.png"} alt="" className="w-10 h-10 rounded-xl object-cover border bg-stone-50 shrink-0"/>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-[#0a2e1f]">#{o.id.slice(0,8).toUpperCase()}</p>
                            <p className="text-xs text-stone-400 mt-0.5">₹{o.total_amount} · {o.items?.length} items · {new Date(o.created_at).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}</p>
                          </div>
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize border shrink-0 ${o.status==="delivered"?"bg-emerald-50 text-emerald-700 border-emerald-200":o.status==="cancelled"?"bg-red-50 text-red-600 border-red-200":o.status==="shipped"?"bg-blue-50 text-blue-700 border-blue-200":"bg-amber-50 text-amber-700 border-amber-200"}`}>{o.status.replace("_"," ")}</span>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-stone-300 group-hover:text-stone-500 shrink-0"><polyline points="9 18 15 12 9 6"/></svg>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* EXPLORER - Keep Exploring now after Recent Orders */}
              <div className="bg-white border border-black/5 rounded-[20px] overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-sm font-black text-[#0a2e1f] flex items-center gap-2"><span className="w-8 h-8 rounded-xl bg-lime-300 text-[#0a2e1f] grid place-items-center"><Ico.search className="w-4 h-4"/></span> Keep Exploring</h2>
                  <div className="flex gap-1.5 overflow-auto no-scrollbar">
                    {["","Indoor","Outdoor","Succulents","Flowering"].map(c=>(
                      <button key={c||"all"} onClick={()=>setExploreFilter(c)} className={`px-3.5 py-2 rounded-full text-xs font-black border whitespace-nowrap ${exploreFilter===c ? "bg-[#0a2e1f] text-white border-[#0a2e1f]" : "bg-stone-50 hover:bg-white border-black/5"}`}>{c||"All"}</button>
                    ))}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex gap-4 overflow-auto pb-2 snap-x snap-mandatory -mx-1 px-1">
                    {explorePlants.map(p=>(
                      <div key={p.id} className="min-w-[184px] w-[184px] snap-start border rounded-[18px] overflow-hidden bg-white hover:shadow-lg transition group flex flex-col">
                        <Link to={`/plant/${p.id}`} className="block">
                          <div className="relative h-36 bg-stone-50 overflow-hidden">
                            <img src={p.images?.[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500"/>
                            {p.discount_price && p.discount_price < p.price && <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-full">{Math.round((1-p.discount_price/p.price)*100)}% OFF</span>}
                            <span className={`absolute top-2 right-2 text-[10px] font-black px-2 py-1 rounded-full border bg-white ${p.stock_qty>0 ? "text-emerald-700 border-emerald-200" : "text-red-600 border-red-200"}`}>{p.stock_qty>0?"In stock":"Out"}</span>
                          </div>
                          <div className="p-3">
                            <div className="text-sm font-black truncate text-[#0a2e1f] group-hover:text-emerald-700">{p.name}</div>
                            <div className="text-xs text-stone-400 truncate italic">{p.botanical_name||""}</div>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-sm font-black text-[#0a2e1f]">₹{p.discount_price && p.discount_price < p.price ? p.discount_price : p.price}</span>
                              <span className="text-[11px] text-stone-400 truncate max-w-[70px]">{p.sunlight||""}</span>
                            </div>
                          </div>
                        </Link>
                        <div className="px-3 pb-3 mt-auto">
                          <button onClick={()=>{addToCart(p,1); success(`${p.name} added — keep exploring!`);}} className="w-full bg-[#0a2e1f] hover:bg-black text-white text-xs font-black py-2.5 rounded-full transition">Add to cart +</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs text-stone-500">Tip: Add to wishlist to get price-drop alerts • Tap card to see care guide</p>
                    <Link to="/shop" className="text-xs font-black text-[#0a2e1f] border px-3 py-1.5 rounded-full hover:bg-stone-50">View all →</Link>
                  </div>
                </div>
              </div>
            </>
          )}

          {tab === "orders" && (
            <div className="space-y-4">
              <div className="bg-white rounded-[20px] border border-black/5 p-4 md:p-5 flex flex-col gap-4 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl border bg-white grid place-items-center"><Ico.box className="w-5 h-5 text-zinc-700"/></div>
                    <div>
                      <h3 className="font-black text-[16px] tracking-tight text-[#0a2e1f] leading-none">{t("dash_my_orders")}</h3>
                      <p className="text-xs text-stone-500 mt-1">{t("dash_track_reorder")} • {orders.length} orders • Keep exploring while you track</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <label className="relative">
                      <Ico.search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"/>
                      <input value={orderSearch} onChange={e=>setOrderSearch(e.target.value)} placeholder="Search order # or plant…" className="pl-9 pr-4 py-2.5 rounded-full border bg-stone-50 text-sm outline-none focus:bg-white focus:border-emerald-300 w-[220px]"/>
                    </label>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-full border overflow-x-auto no-scrollbar w-fit">
                  {[
                    { id:"All", count:orders.length },
                    { id:"Pending", count:orders.filter(o=>["pending","pending_owner","processing"].includes(o.status)).length },
                    { id:"Shipped", count:orders.filter(o=>o.status==="shipped").length },
                    { id:"Delivered", count:orders.filter(o=>o.status==="delivered").length },
                    { id:"Cancelled", count:orders.filter(o=>o.status==="cancelled").length },
                  ].map((f)=>(<button key={f.id} onClick={()=>setOrderFilter(f.id)} className={`px-4 py-2 rounded-full text-xs font-black whitespace-nowrap transition ${orderFilter===f.id ? "bg-[#0a2e1f] text-white shadow" : "text-stone-600 hover:bg-white"}`}>{f.id} <span className="opacity-60 ml-1">{f.count}</span></button>))}
                </div>
              </div>

              <div className="space-y-3">
                {filteredOrders.length===0 ? (
                  <div className="bg-white rounded-[18px] border border-dashed p-12 text-center shadow-sm">
                    <div className="w-14 h-14 bg-stone-50 rounded-2xl grid place-items-center mx-auto text-xl">📦</div>
                    <p className="text-sm font-black text-zinc-700 mt-3">No orders in "{orderFilter}"</p>
                    <p className="text-xs text-stone-500">Try another filter or shop now</p>
                  </div>
                ) : (
                  filteredOrders.map((o)=>{
                    const expanded = selectedOrder?.id===o.id;
                    // allow expand inline
                    const isPaid = (o.payment_status||"pending")==="paid" || o.status==="delivered";
                    const isFailed = (o.payment_status||"pending")==="failed";
                    return (
                      <div key={o.id} className={`bg-white rounded-[18px] border transition shadow-sm ${expanded ? "border-[#0a2e1f] shadow-lg" : "border-black/5 hover:border-black/10 hover:shadow-md"}`}>
                        <div className="p-4 md:p-5 flex flex-wrap gap-3 items-center justify-between">
                          <div className="min-w-0 flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="bg-[#0a2e1f] text-white px-3 py-1.5 rounded-full text-xs font-mono tracking-widest">#{o.id.slice(0,8).toUpperCase()}</span>
                              <button onClick={async()=>{await navigator.clipboard.writeText(o.id).catch(()=>{}); success("Copied");}} className="border bg-white hover:bg-[#0a2e1f] hover:text-white px-2.5 py-1 rounded-full text-xs font-bold transition">Copy</button>
                              <span className="text-xs text-stone-400 font-medium">{new Date(o.created_at).toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`px-2.5 py-1 rounded-full border text-xs capitalize font-black ${o.status==="delivered"?"bg-emerald-50 border-emerald-200 text-emerald-700":o.status==="cancelled"?"bg-red-50 border-red-200 text-red-600":o.status==="shipped"?"bg-blue-50 border-blue-200 text-blue-700":o.status==="confirmed"?"bg-purple-50 border-purple-200 text-purple-700":"bg-amber-50 border-amber-200 text-amber-700"}`}>{o.status?.replace("_"," ")}</span>
                              <span className="bg-stone-50 border px-2.5 py-1 rounded-full text-xs font-bold text-stone-600">₹{o.total_amount} • {o.payment_method} • {o.items?.length} items</span>
                              <span className={`px-2.5 py-1 rounded-full border text-xs font-black ${isPaid?"bg-emerald-50 border-emerald-200 text-emerald-700":isFailed?"bg-red-50 border-red-200 text-red-600":"bg-amber-50 border-amber-200 text-amber-700"}`}>{isPaid?"✓ Paid":isFailed?"✕ Failed":"⏳ Unpaid"}</span>
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button onClick={()=> setSelectedOrder(expanded ? null : o)} className={`text-xs font-black px-4 py-2.5 rounded-full border transition ${expanded ? "bg-[#0a2e1f] text-white border-[#0a2e1f]" : "bg-white border-black/10 hover:bg-stone-50"}`}>{expanded ? "Hide ↑" : "Details →"}</button>
                            <button onClick={()=>nav(`/orders/${o.id}`)} className="hidden sm:inline-flex text-xs font-black px-4 py-2.5 rounded-full border-2 border-[#0a2e1f] bg-white text-[#0a2e1f] hover:bg-[#0a2e1f] hover:text-white transition">View →</button>
                          </div>
                        </div>
                        <div className="px-4 flex gap-2.5 overflow-auto py-3 bg-stone-50/60 border-y">
                          {o.items?.map((it)=>{
                            const p=plants.find(x=>x.id===it.plant_id);
                            return (
                              <div key={it.plant_id} className="flex items-center gap-3 border rounded-2xl p-2.5 bg-white shrink-0 min-w-[180px] shadow-sm">
                                <img src={p?.images?.[0]||"/aloevera plant.png"} alt="" className="w-11 h-11 rounded-xl object-cover bg-stone-50 border"/>
                                <div className="text-xs min-w-0">
                                  <div className="font-black truncate max-w-[120px] text-[#0a2e1f]">{p?.name||it.plant_id}</div>
                                  <div className="text-stone-500 font-medium">×{it.quantity} • ₹{p?.price||""}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {expanded && (
                          <div className="p-4 md:p-5 bg-stone-50">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                              <div className="bg-white border rounded-2xl p-3"><div className="text-[10px] font-black tracking-widest uppercase text-stone-400">Order No.</div><div className="font-mono text-xs break-all mt-1">{o.id}</div><div className="text-[11px] text-stone-500 mt-1">{o.items?.length} items</div></div>
                              <div className="bg-white border rounded-2xl p-3"><div className="text-[10px] font-black tracking-widest uppercase text-stone-400">Payment</div><div className="font-bold text-sm mt-1">{o.payment_method}</div><span className={`inline-block mt-2 px-2.5 py-1 rounded-full text-xs font-bold border ${isPaid?"bg-emerald-50 border-emerald-200 text-emerald-700":isFailed?"bg-red-50 border-red-200 text-red-600":"bg-amber-50 border-amber-200 text-amber-700"}`}>{isPaid?"Paid":isFailed?"Failed":"Unpaid"}</span></div>
                              <div className="bg-white border rounded-2xl p-3"><div className="text-[10px] font-black tracking-widest uppercase text-stone-400">Status</div><div className={`font-bold text-sm mt-1 capitalize flex items-center gap-2 ${o.status==="delivered"?"text-emerald-700":o.status==="cancelled"?"text-red-600":o.status==="shipped"?"text-blue-700":"text-amber-700"}`}><span className={`w-2 h-2 rounded-full ${o.status==="delivered"?"bg-emerald-500":o.status==="cancelled"?"bg-red-500":o.status==="shipped"?"bg-blue-500":"bg-amber-500"}`}/>{o.status.replace("_"," ")}</div><div className="text-xs text-stone-500 mt-1">{new Date(o.created_at).toLocaleDateString("en-IN")}</div></div>
                              <div className="bg-[#0a2e1f] text-white rounded-2xl p-3"><div className="text-[10px] font-black tracking-widest uppercase text-white/60">Amount</div><div className="font-black text-lg mt-1">₹{o.total_amount}</div><div className="text-xs text-white/70">{o.payment_method} • {o.items?.length} items</div></div>
                            </div>
                            <div className="grid lg:grid-cols-[1.25fr_0.75fr] gap-4">
                              <div className="space-y-3">
                                <div className="bg-white rounded-2xl border overflow-hidden">
                                  <div className="px-4 py-3 border-b flex justify-between items-center"><h4 className="font-black text-sm flex items-center gap-2"><Ico.box className="w-4 h-4"/> Items • {o.items?.length}</h4><span className="text-xs text-stone-400 hidden md:inline">GST bill on request</span></div>
                                  <div className="divide-y">
                                    {o.items?.map((it)=>{
                                      const p=plants.find(x=>x.id===it.plant_id); const price=p?.price||it.price||0;
                                      return (
                                        <div key={it.plant_id} className="flex items-center gap-3 p-3 hover:bg-stone-50">
                                          <img src={p?.images?.[0]||"/aloevera plant.png"} alt="" className="w-10 h-10 rounded-xl object-cover border bg-white"/>
                                          <div className="flex-1 min-w-0"><div className="font-bold text-sm truncate">{p?.name||it.plant_id}</div><div className="text-xs text-stone-500">Qty × {it.quantity} • ₹{price} each</div></div>
                                          <div className="text-right"><div className="font-black text-sm">₹{(price*it.quantity).toFixed(2)}</div><button onClick={()=>p&&downloadCareGuide(p)} className="text-[11px] text-stone-600 hover:text-black underline">Guide</button></div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                  <div className="border-t px-4 py-3 flex justify-between items-center bg-stone-50"><span className="font-black tracking-widest uppercase text-xs text-stone-500">Total</span><span className="font-black text-base">₹{o.total_amount}</span></div>
                                </div>
                                <div className="grid grid-cols-2 gap-2"><button onClick={()=>reorder(o)} className="bg-[#0a2e1f] text-white py-3 rounded-full text-sm font-black hover:bg-black">Reorder</button><button onClick={()=>downloadInvoice(o)} className="bg-white border text-[#0a2e1f] py-3 rounded-full text-sm font-black hover:bg-stone-50">Invoice</button></div>
                                <div className="bg-white border rounded-2xl p-3">
                                  <p className="text-xs font-black text-[#0a2e1f]">Explore similar</p>
                                  <div className="flex gap-2 overflow-auto mt-2 pb-1">
                                    {plants.filter(pp=> pp.category===plants.find(x=>x.id===o.items?.[0]?.plant_id)?.category).slice(0,3).map(pp=>(
                                      <button key={pp.id} onClick={()=>nav(`/plant/${pp.id}`)} className="shrink-0 border rounded-xl p-2 flex items-center gap-2 hover:bg-stone-50 bg-white"><img src={pp.images?.[0]} alt="" className="w-8 h-8 rounded-lg object-cover"/><span className="text-xs font-bold max-w-[90px] truncate text-left">{pp.name}</span></button>
                                    ))}
                                  </div>
                                </div>
                                {["pending","pending_owner","processing"].includes(o.status) && <button onClick={()=>openCancel(o.id)} className="w-full text-xs font-bold border bg-white py-3 rounded-full hover:bg-stone-50">Cancel order</button>}
                              </div>
                              <div className="space-y-3">
                                <div className="bg-white border rounded-2xl p-4"><div className="font-bold text-sm flex items-center gap-2"><Ico.pin className="w-4 h-4"/> Shipping Address</div><div className="mt-3 border rounded-xl p-3 text-sm leading-6 bg-stone-50"><div className="font-bold">{o.address?.street||"—"}</div><div className="text-stone-600">{o.address?.city}{o.address?.city&&o.address?.state?", ":""}{o.address?.state} {o.address?.postal_code}</div><div className="text-stone-500 text-xs">{o.address?.country||"India"}</div></div></div>
                                <div className="bg-white border rounded-2xl p-4"><div className="font-bold text-sm flex items-center gap-2"><Ico.box className="w-4 h-4 text-emerald-600"/> Tracking</div><div className="mt-4 relative"><div className="absolute left-[11px] top-2 bottom-2 w-px bg-stone-200"></div>{[{label:"Order placed",done:true,date:o.created_at},{label:"Confirmed",done:["confirmed","shipped","delivered"].includes(o.status)},{label:"Shipped",done:["shipped","delivered"].includes(o.status)},{label:"Delivered",done:o.status==="delivered"}].map((s)=>(
                                  <div key={s.label} className="relative flex gap-3 pb-4 last:pb-0"><span className={`w-6 h-6 rounded-full border-2 bg-white grid place-items-center shrink-0 z-10 text-xs ${s.done?"border-emerald-500 bg-emerald-500 text-white":"border-stone-300 text-stone-300"}`}>{s.done?"✓":""}</span><div className="flex-1"><div className={`text-sm ${s.done?"font-bold text-[#0a2e1f]":"text-stone-400"}`}>{s.label}</div><div className={`text-xs ${s.done?"text-emerald-600":"text-stone-400"}`}>{s.done&&s.date?new Date(s.date).toLocaleString("en-IN"):s.done?"Completed":"Pending"}</div></div></div>
                                ))}</div></div>
                                {o.status==="cancelled"&&o.cancel_reason&&<div className="bg-white border rounded-2xl p-4"><div className="font-bold text-xs">Cancelled — reason</div><div className="text-sm text-stone-700 mt-2 border rounded-xl p-3 bg-stone-50">{o.cancel_reason}</div></div>}
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
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={()=>setCancelId(null)}/>
                  <div className="relative bg-white rounded-[20px] border shadow-2xl w-full max-w-md p-6">
                    <h3 className="font-black text-lg">Cancel reason is mandatory <span className="text-red-600">*</span></h3>
                    <p className="text-xs text-stone-500 mt-1">Please tell us why you want to cancel — mandatory.</p>
                    <textarea value={cancelReason} onChange={(e)=>setCancelReason(e.target.value)} placeholder={t("cancel_reason_placeholder")} className="mt-4 w-full border-2 rounded-2xl px-4 py-3 text-sm min-h-[110px] outline-none focus:border-red-300 focus:ring-2 focus:ring-red-50" autoFocus/>
                    <div className="text-xs text-stone-400 mt-1">{cancelReason.length}/200 • min 10 chars</div>
                    {cancelErr && <div className="mt-2 text-xs bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl">{cancelErr}</div>}
                    <div className="flex gap-2 mt-5"><button onClick={()=>setCancelId(null)} className="flex-1 border-2 py-3 rounded-full font-black text-sm bg-white hover:bg-stone-50">Keep order</button><button onClick={submitCancel} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-full font-black text-sm">Confirm cancel</button></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "wishlist" && (
            <div className="bg-white rounded-[20px] border border-black/5 p-6 md:p-7 shadow-sm">
              <div className="flex flex-col lg:flex-row gap-3 justify-between">
                <div>
                  <h3 className="font-black text-xl tracking-tight text-[#0a2e1f]">My Wishlist <span className="text-stone-400 font-bold text-sm">• {wishlistPlants.length} saved</span></h3>
                  <p className="text-xs text-stone-500">Save now, buy when ready — get notified when back in stock. Explore more while you decide.</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <label className="relative">
                    <Ico.search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"/>
                    <input value={wishlistSearch} onChange={e=>setWishlistSearch(e.target.value)} placeholder="Search wishlist…" className="pl-9 pr-4 py-2.5 rounded-full border bg-stone-50 text-sm outline-none focus:bg-white focus:border-emerald-300 w-[180px]"/>
                  </label>
                  <button onClick={downloadAllGuides} className="border-2 border-emerald-600 bg-emerald-50 text-emerald-700 px-4 py-2.5 rounded-full text-xs font-black hover:bg-emerald-600 hover:text-white">📄 Guides</button>
                  <Link to="/shop" className="bg-[#0a2e1f] text-white px-4 py-2.5 rounded-full text-xs font-black">Browse →</Link>
                </div>
              </div>
              {wishlistPlants.length===0 ? (
                <div className="text-center py-14 border-2 border-dashed rounded-[18px] mt-6 bg-stone-50/50">
                  <div className="w-16 h-16 bg-white border rounded-2xl grid place-items-center mx-auto text-2xl shadow-sm">♡</div>
                  <p className="font-black mt-4">Your wishlist is empty</p><p className="text-sm text-stone-500">Save your favourites to buy later</p>
                  <Link to="/shop" className="inline-block mt-4 bg-[#0a2e1f] text-white px-6 py-2.5 rounded-full text-sm font-black">Browse plants</Link>
                </div>
              ) : (
                <>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
                    {wishlistPlants.map((p)=>(
                      <div key={p.id} className="border rounded-[18px] overflow-hidden bg-white hover:shadow-lg transition flex flex-col group">
                        <div className="relative overflow-hidden">
                          <img src={p.images?.[0]} alt={p.name} className="w-full h-48 object-cover bg-stone-50 group-hover:scale-[1.03] transition duration-500"/>
                          <span className={`absolute top-3 left-3 text-xs font-black px-3 py-1 rounded-full shadow border ${p.stock_qty>0?"bg-emerald-600 text-white border-emerald-600":"bg-red-500 text-white border-red-500"}`}>{p.stock_qty>0?"In stock":"Out of stock"}</span>
                          <button onClick={()=>removeWishlist(p)} className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur border shadow grid place-items-center hover:bg-red-50 text-stone-600">✕</button>
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                          <div className="font-black text-sm truncate">{p.name}</div><div className="text-xs text-stone-500 truncate">{p.botanical_name}</div>
                          <div className="text-sm font-black mt-1">₹{p.price} {p.discount_price && <span className="text-xs text-stone-400 line-through ml-1">₹{p.market_price}</span>}</div>
                          <div className="flex gap-2 mt-4"><button onClick={()=>moveToCart(p)} className="flex-1 bg-[#0a2e1f] text-white py-2.5 rounded-full text-xs font-black hover:bg-black">Move to cart</button><button onClick={()=>removeWishlist(p)} className="flex-1 border py-2.5 rounded-full text-xs font-black bg-white hover:bg-stone-50">Remove</button></div>
                          {p.stock_qty===0 && <label className="flex items-center gap-2 mt-3 text-xs bg-amber-50 border border-amber-200 rounded-full px-3 py-2.5"><input type="checkbox" checked={!!notifyWishlist[p.id]} onChange={(e)=>setNotifyWishlist((n)=>({...n,[p.id]:e.target.checked}))} className="accent-emerald-600"/> Notify me when back in stock</label>}
                          <button onClick={()=>downloadCareGuide(p)} className="w-full mt-3 bg-white border-2 border-emerald-600 text-emerald-700 py-2.5 rounded-full text-xs font-black hover:bg-emerald-600 hover:text-white">📄 Care guide PDF</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 bg-stone-50 border rounded-2xl p-4">
                    <p className="text-xs font-black uppercase tracking-widest text-stone-500">You may also like — keep exploring</p>
                    <div className="flex gap-3 overflow-auto mt-3 pb-1">
                      {plants.filter(pp=>!wishlistPlants.find(w=>w.id===pp.id)).slice(0,6).map(pp=>(
                        <Link key={pp.id} to={`/plant/${pp.id}`} className="shrink-0 w-[140px] border rounded-2xl overflow-hidden bg-white hover:shadow-md">
                          <img src={pp.images?.[0]} alt={pp.name} className="w-full h-24 object-cover bg-stone-50"/>
                          <div className="p-2"><div className="text-xs font-bold truncate">{pp.name}</div><div className="text-xs font-black text-emerald-700">₹{pp.price}</div></div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {tab === "addresses" && (
            <div className="space-y-4">
              <div className="bg-white rounded-[20px] border border-black/5 p-6 md:p-7 shadow-sm">
                <div className="flex flex-wrap justify-between items-center gap-3">
                  <div>
                    <h3 className="font-black text-xl tracking-tight text-[#0a2e1f]">Saved Addresses</h3>
                    <p className="text-xs text-stone-500">Manage delivery locations • Default used at checkout • Tap pin to preview</p>
                  </div>
                  <button onClick={()=>{setAddressTab(!addressTab); setEditingAddr(null); setAddrForm({label:"Home",street:"",city:"",state:"",postal_code:"",country:"India",is_default:false});}} className={`px-5 py-2.5 rounded-full text-xs font-black shadow border-2 ${addressTab ? "bg-white border-[#0a2e1f] text-[#0a2e1f]" : "bg-[#0a2e1f] text-white border-[#0a2e1f] hover:bg-black"}`}>{addressTab ? "Close" : "＋ Add new address"}</button>
                </div>

                {addressTab && (
                  <form onSubmit={saveAddress} className="mt-6 border-2 border-emerald-100 rounded-[18px] p-5 bg-stone-50 grid md:grid-cols-2 gap-3">
                    <div className="md:col-span-2 flex flex-wrap gap-2">
                      {["Home","Work","Other"].map((l)=>(<button type="button" key={l} onClick={()=>setAddrForm({...addrForm,label:l})} className={`px-4 py-2 rounded-full text-xs font-black border-2 ${addrForm.label===l ? "bg-[#0a2e1f] text-white border-[#0a2e1f]" : "bg-white hover:bg-stone-50 border-black/10"}`}>{l}</button>))}
                      <button type="button" onClick={useCurrentLocation} disabled={geoLoading} className="ml-auto text-xs bg-emerald-600 text-white px-4 py-2 rounded-full font-black disabled:opacity-60 shadow">{geoLoading ? "Locating..." : "📍 Use current location"}</button>
                    </div>
                    <input placeholder="Street *" value={addrForm.street} onChange={(e)=>setAddrForm({...addrForm,street:e.target.value})} className="border-2 rounded-2xl px-4 py-3 text-sm bg-white outline-none focus:border-emerald-300" required/>
                    <input placeholder="City *" value={addrForm.city} onChange={(e)=>setAddrForm({...addrForm,city:e.target.value})} className="border-2 rounded-2xl px-4 py-3 text-sm bg-white outline-none focus:border-emerald-300" required/>
                    <input placeholder="State" value={addrForm.state} onChange={(e)=>setAddrForm({...addrForm,state:e.target.value})} className="border-2 rounded-2xl px-4 py-3 text-sm bg-white outline-none"/>
                    <input placeholder="Postal Code" value={addrForm.postal_code} onChange={(e)=>setAddrForm({...addrForm,postal_code:e.target.value})} className="border-2 rounded-2xl px-4 py-3 text-sm bg-white outline-none"/>
                    <input placeholder="Country" value={addrForm.country} onChange={(e)=>setAddrForm({...addrForm,country:e.target.value})} className="border-2 rounded-2xl px-4 py-3 text-sm bg-white outline-none md:col-span-2"/>
                    <label className="flex items-center gap-2 text-sm md:col-span-2 bg-white border-2 rounded-2xl px-3 py-3"><input type="checkbox" checked={addrForm.is_default} onChange={(e)=>setAddrForm({...addrForm,is_default:e.target.checked})} className="accent-emerald-600 w-4 h-4"/> Set as default address</label>
                    <div className="md:col-span-2 h-36 rounded-2xl border-2 border-dashed bg-white overflow-hidden relative grid place-items-center">
                      {addrForm.city ? <iframe title="map" className="w-full h-full border-0" loading="lazy" src={`https://maps.google.com/maps?q=${encodeURIComponent(addrForm.street + ", " + addrForm.city)}&z=14&output=embed`}/> : <span className="text-xs text-stone-400">📍 Pin will appear after you fill city • Map preview</span>}
                      {addrForm.city && <span className="absolute bottom-2 left-2 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-black border shadow">📍 {addrForm.city}</span>}
                    </div>
                    <div className="md:col-span-2 flex gap-2 pt-1"><button className="flex-1 bg-[#0a2e1f] text-white py-3 rounded-full font-black text-sm shadow">{editingAddr ? "Update address" : "Save address"}</button><button type="button" onClick={()=>{setAddressTab(false); setEditingAddr(null);}} className="px-8 border-2 rounded-full font-black text-sm bg-white hover:bg-stone-50">Cancel</button></div>
                  </form>
                )}

                <div className="mt-6 grid md:grid-cols-2 gap-4">
                  {addresses.length===0 ? (
                    <div className="col-span-2 text-center py-10 border-2 border-dashed rounded-[18px] text-sm text-stone-500 bg-stone-50">No addresses saved. Added on checkout — or add one above.</div>
                  ) : (
                    addresses.map((a)=>(
                      <div key={a.id} className={`border-2 rounded-[18px] p-5 pt-7 relative transition ${a.is_default ? "border-emerald-300 bg-emerald-50/40 shadow-sm" : "bg-stone-50 border-transparent hover:border-black/10 hover:bg-white"}`}>
                        {a.is_default && <span className="absolute -top-3 left-5 bg-emerald-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow">DEFAULT • PRIMARY</span>}
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-black tracking-widest uppercase bg-white border shadow-sm px-3 py-1.5 rounded-full">{a.label||"Home"}</span>
                          <span className="text-xs text-stone-400 font-mono bg-white border px-2 py-1 rounded-full">{a.postal_code}</span>
                        </div>
                        <div className="font-black text-sm mt-4 leading-5">{a.street}</div>
                        <div className="text-sm text-stone-600">{a.city}, {a.state} {a.postal_code}</div>
                        <div className="text-xs text-stone-500">{a.country}</div>
                        <div className="flex gap-2 mt-5"><button onClick={()=>startEditAddr(a)} className="flex-1 border-2 bg-white py-2.5 rounded-full text-xs font-black hover:bg-stone-50">Edit</button><button onClick={()=>deleteAddress(a.id)} className="flex-1 border-2 border-red-100 text-red-600 bg-white py-2.5 rounded-full text-xs font-black hover:bg-red-50">Delete</button></div>
                        {!a.is_default && <button onClick={()=>setDefaultAddress(a.id)} className="w-full mt-3 text-xs font-black bg-[#0a2e1f] text-white py-2.5 rounded-full hover:bg-black">Set as default</button>}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {tab === "profile" && profile && (
            <div className="space-y-5">
              <div className="bg-white rounded-[20px] border border-black/5 p-6 md:p-7 shadow-sm">
                <div className="flex flex-wrap justify-between gap-3 items-start">
                  <div>
                    <h3 className="font-black text-xl tracking-tight text-[#0a2e1f]">Profile Settings</h3>
                    <p className="text-xs text-stone-500">Manage identity, security & preferences • Your garden persona lives here</p>
                  </div>
                  <span className="text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full">Last updated {new Date().toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-5 mt-6 p-4 rounded-2xl bg-[#f6f7f0] border">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-[20px] bg-[#0a2e1f] text-white grid place-items-center text-3xl font-black border-4 border-white shadow-lg shrink-0">{(profile.name||"G").slice(0,1).toUpperCase()}</div>
                  <div className="min-w-0">
                    <div className="font-black text-[#0a2e1f] text-lg leading-none truncate">{profile.name}</div>
                    <div className="text-xs text-stone-500 truncate">{profile.email} • Joined {new Date(profile.created_at||Date.now()).toLocaleDateString()}</div>
                    <div className="text-xs font-bold mt-1 inline-flex items-center gap-1.5 bg-white border px-2.5 py-1 rounded-full"><span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"/> {level.name} • {level.icon} • {loyaltyPoints} XP</div>
                  </div>
                  <div className="ml-auto hidden md:flex items-center gap-2"><span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"/><span className="text-xs font-black text-emerald-700">Verified</span></div>
                </div>

                {/* persona */}
                <div className="mt-6 grid md:grid-cols-3 gap-3">
                  {[
                    {k:"Gardener", v:`${ownedPlants.length} plants owned`, icon:"🪴"},
                    {k:"Explorer", v:`${orders.length} orders • ${streak.count} day streak`, icon:"🧭"},
                    {k:"Level", v:`${level.name} — ${levelProgress}%`, icon: level.icon},
                  ].map(c=>(
                    <div key={c.k} className="rounded-2xl border bg-stone-50 p-4 flex items-center gap-3">
                      <span className="w-10 h-10 rounded-xl bg-white border grid place-items-center text-lg">{c.icon}</span>
                      <div><div className="text-xs font-black uppercase tracking-widest text-stone-500">{c.k}</div><div className="text-sm font-bold text-[#0a2e1f]">{c.v}</div></div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid md:grid-cols-2 gap-4 max-w-3xl">
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-stone-600">Full Name</label>
                    <input value={edit.name} onChange={(e)=>setEdit({...edit,name:e.target.value})} className="mt-1.5 w-full border-2 rounded-2xl px-4 py-3 text-sm bg-stone-50 focus:bg-white outline-none focus:border-emerald-300"/>
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-stone-600">Phone number</label>
                    <input value={edit.phone} onChange={(e)=>setEdit({...edit,phone:e.target.value})} placeholder="+91 ..." className="mt-1.5 w-full border-2 rounded-2xl px-4 py-3 text-sm bg-stone-50 focus:bg-white outline-none focus:border-emerald-300"/>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-black uppercase tracking-widest text-stone-600">Email <span className="text-stone-400 normal-case tracking-normal font-medium">(re-verify if changed)</span></label>
                    <input value={edit.email} onChange={(e)=>handleEmailChange(e.target.value)} className="mt-1.5 w-full border-2 rounded-2xl px-4 py-3 text-sm bg-stone-50 focus:bg-white outline-none focus:border-emerald-300"/>
                    {emailChanged && <p className="text-xs text-amber-700 mt-2 bg-amber-50 border-2 border-amber-200 rounded-full px-3 py-1.5 inline-block">⚠ Email changed — you’ll need to re-verify after saving.</p>}
                  </div>
                </div>

                <div className="mt-6 max-w-3xl border-2 rounded-[18px] p-5 bg-stone-50">
                  <h4 className="font-black text-sm flex items-center gap-2"><span className="w-7 h-7 rounded-xl bg-white border grid place-items-center text-sm">🔔</span> Notification preferences</h4>
                  <div className="mt-3 space-y-1 divide-y">
                    {[
                      {k:"order",label:"Order updates (SMS/Email)",desc:"Shipping, delivery, cancellations"},
                      {k:"promo",label:"Promotions & offers",desc:"Seasonal discounts, new arrivals"},
                      {k:"care",label:"Care-tip emails",desc:"Weekly watering & fertilizing tips"},
                    ].map((p)=>(
                      <label key={p.k} className="flex justify-between items-center py-3.5 cursor-pointer">
                        <div><div className="font-black text-sm text-[#0a2e1f]">{p.label}</div><div className="text-xs text-stone-500">{p.desc}</div></div>
                        <input type="checkbox" checked={notifPrefs[p.k]} onChange={(e)=>setNotifPrefs({...notifPrefs,[p.k]:e.target.checked})} className="w-5 h-5 accent-emerald-600"/>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-6">
                  <button onClick={saveProfile} className="bg-[#0a2e1f] text-white px-8 py-3 rounded-full font-black text-sm shadow hover:bg-black">Save changes</button>
                  {saveMsg && <span className={`text-sm font-black px-4 py-2 rounded-full border-2 ${saveMsg.includes("✓") ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-600"}`}>{saveMsg}</span>}
                </div>

                <div className="mt-6 max-w-3xl border-2 rounded-[18px] p-5 bg-[#f6f7f0] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-10 h-10 rounded-xl bg-white border grid place-items-center text-[#0a2e1f] shrink-0"><Ico.pin className="w-5 h-5"/></span>
                    <div className="min-w-0"><div className="font-black text-sm text-[#0a2e1f]">Saved addresses • {addresses.length}</div><div className="text-xs text-stone-500 truncate max-w-[28ch] md:max-w-[40ch]">{addresses.length ? `${addresses.find(a=>a.is_default)?.street || addresses[0].street} — ${addresses.find(a=>a.is_default)?.city || addresses[0].city}` : "No addresses yet — add one for faster checkout"}</div></div>
                  </div>
                  <button onClick={()=>selectTab("addresses")} className="shrink-0 bg-white border-2 border-[#0a2e1f] text-[#0a2e1f] px-4 py-2 rounded-full text-xs font-black hover:bg-[#0a2e1f] hover:text-white transition">Manage →</button>
                </div>

                <div className="mt-8 pt-6 border-t-2 max-w-3xl">
                  <h4 className="font-black text-sm flex items-center gap-2">🔒 Change password</h4>
                  <div className="mt-3 grid md:grid-cols-3 gap-3">
                    <input type="password" placeholder="Current password" value={pw.current} onChange={(e)=>setPw({...pw,current:e.target.value})} className="border-2 rounded-2xl px-4 py-3 text-sm bg-stone-50 focus:bg-white outline-none"/>
                    <input type="password" placeholder="New password" value={pw.next} onChange={(e)=>setPw({...pw,next:e.target.value})} className="border-2 rounded-2xl px-4 py-3 text-sm bg-stone-50 focus:bg-white outline-none"/>
                    <input type="password" placeholder="Confirm new" value={pw.confirm} onChange={(e)=>setPw({...pw,confirm:e.target.value})} className="border-2 rounded-2xl px-4 py-3 text-sm bg-stone-50 focus:bg-white outline-none"/>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <button onClick={changePassword} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-full font-black text-sm shadow">Update password</button>
                    {pwMsg && <span className={`text-sm font-black px-4 py-1.5 rounded-full border-2 ${pwMsg.includes("✓") ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-600"}`}>{pwMsg}</span>}
                  </div>
                </div>

                <div className="mt-8 border-2 border-red-100 rounded-[18px] overflow-hidden max-w-3xl">
                  <button onClick={()=>setShowDanger(!showDanger)} className="w-full text-left px-5 py-4 bg-red-50 flex justify-between items-center hover:bg-red-100/60">
                    <span className="font-black text-sm text-red-700 flex items-center gap-2">⚠️ Danger zone — Delete account</span>
                    <span className="w-7 h-7 rounded-full bg-white border grid place-items-center text-red-700 text-xs">{showDanger ? "▲" : "▼"}</span>
                  </button>
                  {showDanger && (
                    <div className="p-5 bg-white">
                      <p className="text-sm text-stone-600">Delete your account and all data. This cannot be undone. Orders will be anonymized.</p>
                      <button onClick={()=>{setDeleteTarget({type:'account',id:'account',name:'your account'});}} className="mt-4 border-2 border-red-200 text-red-600 px-5 py-2.5 rounded-full text-sm font-black bg-white hover:bg-red-50">Delete account permanently</button>
                    </div>
                  )}
                </div>

                <div id="support-history" className="mt-8 max-w-3xl bg-[#f6f7f0] border-2 border-dashed rounded-[18px] p-5">
                  <h4 className="font-black text-sm flex items-center gap-2">Support ticket history <span className="bg-[#0a2e1f] text-white text-xs px-2.5 py-1 rounded-full">{supportTickets.length}</span></h4>
                  <div className="mt-3 space-y-2 max-h-56 overflow-auto pr-1">
                    {supportTickets.map((t)=>(
                      <div key={t.id} className="bg-white border rounded-2xl p-3 flex justify-between gap-3 text-sm shadow-sm">
                        <div className="min-w-0"><div className="font-black truncate">{t.subject}</div><div className="text-xs text-stone-500 truncate">{t.msg} • {t.date}</div></div>
                        <span className={`text-xs px-2.5 py-1 rounded-full border font-black h-fit shrink-0 ${t.status==="Resolved"?"bg-emerald-50 border-emerald-200 text-emerald-700":"bg-amber-50 border-amber-200 text-amber-700"}`}>{t.status}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <input value={newTicket} onChange={(e)=>setNewTicket(e.target.value)} placeholder="New query — e.g., delivery issue..." className="flex-1 border-2 rounded-full px-4 py-2.5 text-sm bg-white outline-none focus:border-emerald-300"/>
                    <button onClick={()=>{ if(!newTicket) return; setSupportTickets([...supportTickets,{id:Date.now().toString(),subject:newTicket.slice(0,22),status:"Open",date:new Date().toISOString().slice(0,10),msg:newTicket}]); setNewTicket("");}} className="bg-[#0a2e1f] text-white px-6 py-2.5 rounded-full text-xs font-black shadow">Submit</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "analytics" && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-[#0a2e1f] to-[#123d2a] rounded-[20px] p-6 md:p-7 text-white relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-lime-300/20 rounded-full blur-3xl" />
                <div className="relative flex flex-wrap justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-black tracking-widest uppercase text-lime-200 flex items-center gap-2"><Ico.analytics className="w-4 h-4"/> Your Analytics</p>
                    <h2 className="text-2xl font-black tracking-tight mt-1">Garden Insights</h2>
                    <p className="text-sm text-white/70 mt-1 max-w-[50ch]">Track your green journey — spend, streak & collection growth. The more you explore, the more your identity blooms.</p>
                  </div>
                  <div className="bg-white text-[#0a2e1f] rounded-2xl px-5 py-3 text-center shadow-lg shrink-0">
                    <div className="text-[11px] font-black uppercase tracking-widest text-stone-500">Garden Score</div>
                    <div className="text-2xl font-black">{Math.min(10, (loyaltyPoints/70).toFixed(1))}/10</div>
                    <div className="text-xs font-bold text-emerald-600">{level.name} • {streak.count} day streak</div>
                  </div>
                </div>
                <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
                  {[
                    {l:"Total Spent", v:`₹${totalSpent.toLocaleString()}`, s:`${orders.length} orders`},
                    {l:"XP Earned", v:`${loyaltyPoints}`, s:`${levelProgress}% to ${level.next}`},
                    {l:"Plants Owned", v:ownedPlants.length, s:`${careTasks.filter(c=>c.done).length} cared today`},
                    {l:"Wishlist", v:wishlistCount, s:`${(wishlistCount? Math.round(wishlistCount/plants.length*100):0)}% of catalog`},
                  ].map(c=>(
                    <div key={c.l} className="bg-white/10 backdrop-blur border border-white/15 rounded-2xl p-4">
                      <div className="text-[11px] font-black uppercase tracking-widest text-white/60">{c.l}</div>
                      <div className="text-xl font-black mt-1">{c.v}</div>
                      <div className="text-xs text-white/60 mt-1">{c.s}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-4">
                <div className="bg-white border border-black/5 rounded-[20px] p-5 lg:col-span-2 shadow-sm">
                  <h3 className="font-black text-[#0a2e1f]">Spending Timeline</h3>
                  <p className="text-xs text-stone-500">Last 6 orders • keep ordering to grow XP</p>
                  <div className="mt-4 flex items-end gap-2 h-32">
                    {orders.slice(0,6).reverse().map((o,i)=>{
                      const max = Math.max(...orders.map(x=>x.total_amount||1), 1);
                      const h = Math.max(16, (o.total_amount/max)*112);
                      return <div key={o.id} className="flex-1 flex flex-col items-center gap-2"><div className="w-full bg-gradient-to-t from-emerald-600 to-lime-300 rounded-t-xl transition-all" style={{height:h}} /><span className="text-[10px] font-bold text-stone-500">₹{o.total_amount}</span></div>
                    })}
                    {orders.length===0 && <div className="flex-1 grid place-items-center text-sm text-stone-400">No orders yet — shop to see your chart</div>}
                  </div>
                </div>
                <div className="bg-white border border-black/5 rounded-[20px] p-5 shadow-sm">
                  <h3 className="font-black text-[#0a2e1f]">Category Mix</h3>
                  <div className="mt-4 space-y-3">
                    {["Indoor","Outdoor","Succulents","Flowering"].map(cat=>{
                      const cnt = ownedPlants.filter(p=> (p.category||"").toLowerCase().includes(cat.toLowerCase())).length;
                      const pct = ownedPlants.length ? Math.round(cnt/ownedPlants.length*100) : 0;
                      return <div key={cat}><div className="flex justify-between text-xs font-bold"><span>{cat}</span><span className="text-stone-500">{pct}%</span></div><div className="mt-1 h-2 bg-stone-100 rounded-full overflow-hidden"><div className="h-full bg-[#0a2e1f] rounded-full" style={{width:`${pct}%`}}/></div></div>
                    })}
                  </div>
                  <button onClick={()=>selectTab("overview")} className="mt-4 w-full bg-stone-50 border py-2.5 rounded-full text-xs font-black hover:bg-white">Explore more to diversify →</button>
                </div>
              </div>

              <div className="bg-white border border-black/5 rounded-[20px] p-5 shadow-sm">
                <h3 className="font-black text-[#0a2e1f]">Activity Heatmap</h3>
                <p className="text-xs text-stone-500">Recent activity • darker = more action</p>
                <div className="mt-4 grid grid-cols-12 gap-1.5">
                  {Array.from({length:48},(_,i)=>{
                    const v=Math.random();
                    const bg=v>0.75?"bg-emerald-600":v>0.5?"bg-emerald-300":v>0.3?"bg-emerald-100":"bg-stone-100";
                    return <div key={i} className={`h-6 rounded ${bg}`} />
                  })}
                </div>
                <div className="flex justify-between text-[11px] text-stone-400 mt-2"><span>4 weeks ago</span><span>Today</span></div>
              </div>
            </div>
          )}

          {tab === "settings" && (
            <div className="space-y-4 w-full">
              <div className="bg-white border border-black/5 rounded-[20px] p-6 md:p-7 shadow-sm w-full">
                <h2 className="text-xl font-black tracking-tight text-[#0a2e1f]">Settings</h2>
                <p className="text-xs text-stone-500 mt-1">Personalize your dashboard experience</p>

                <div className="mt-6 rounded-2xl border-2 border-dashed p-5 bg-stone-50">
                  <h3 className="font-black text-sm flex items-center gap-2"><Ico.settings className="w-4 h-4"/> Appearance</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="bg-white border px-3 py-1.5 rounded-full text-xs font-bold">🌿 Forest theme (active)</span>
                    <span className="bg-stone-100 border px-3 py-1.5 rounded-full text-xs">Light</span>
                  </div>
                  <p className="text-xs text-stone-500 mt-2">Dashboard identity adapts as you level up — Guardian gets exclusive dark garden skin.</p>
                </div>

                <div className="mt-6 border rounded-2xl p-5 bg-white">
                  <h3 className="font-black text-sm">Notifications</h3>
                  <div className="mt-3 divide-y">
                    {[
                      {k:"order",l:"Order updates",d:"SMS & Email for shipping"},
                      {k:"promo",l:"Offers & drops",d:"New arrivals & price drops"},
                      {k:"care",l:"Care reminders",d:"Watering & seasonal tips"},
                    ].map(p=>(
                      <label key={p.k} className="flex justify-between items-center py-3 cursor-pointer">
                        <div><div className="font-bold text-sm">{p.l}</div><div className="text-xs text-stone-500">{p.d}</div></div>
                        <input type="checkbox" checked={notifPrefs[p.k]} onChange={e=>setNotifPrefs({...notifPrefs,[p.k]:e.target.checked})} className="w-5 h-5 accent-emerald-600"/>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mt-6 rounded-2xl bg-[#0a2e1f] text-white p-5 flex flex-wrap gap-4 items-center justify-between">
                  <div>
                    <div className="font-black text-sm">Danger Zone</div>
                    <div className="text-xs text-white/60">Delete account & anonymize orders</div>
                  </div>
                  <button onClick={()=>setShowDanger(v=>!v)} className="bg-white text-red-600 px-5 py-2 rounded-full text-xs font-black hover:bg-red-50">{showDanger?"Hide":"Manage →"}</button>
                </div>
                {showDanger && (
                  <div className="border-2 border-red-100 rounded-2xl p-5 mt-3 bg-red-50/50">
                    <p className="text-sm text-stone-600">This cannot be undone.</p>
                    <button onClick={()=>setDeleteTarget({type:'account',id:'account',name:'your account'})} className="mt-3 bg-red-600 text-white px-5 py-2.5 rounded-full text-xs font-black hover:bg-red-700">Delete account permanently</button>
                  </div>
                )}

                <div className="mt-6 flex gap-2">
                  <button onClick={()=>success("Settings saved")} className="bg-[#0a2e1f] text-white px-6 py-2.5 rounded-full text-sm font-black">Save settings</button>
                  <button onClick={()=>selectTab("profile")} className="border bg-white px-6 py-2.5 rounded-full text-sm font-bold">Back to Profile</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* mobile bottom nav — scrollable for 7 tabs */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-black/5 z-30 px-2 py-1.5">
        <div className="flex items-center gap-1 overflow-auto no-scrollbar snap-x">
          {menu.map((m)=>{
            const active=tab===m.id; const Icon=m.icon;
            return (
              <button key={m.id} onClick={()=>selectTab(m.id)} className={`snap-start flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-2xl transition min-w-[64px] shrink-0 ${active ? "text-[#0a2e1f]" : "text-stone-400 hover:text-stone-600"}`}>
                <div className={`w-9 h-9 rounded-2xl grid place-items-center transition ${active ? "bg-[#0a2e1f] text-white shadow-md" : "bg-transparent"}`}><Icon className="w-4 h-4"/></div>
                <span className="text-[10px] font-bold truncate">{m.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={()=>setDeleteTarget(null)}/>
          <div className="relative bg-white rounded-[18px] shadow-xl w-full max-w-sm p-6 text-center border">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 grid place-items-center mx-auto text-xl">⚠️</div>
            <h3 className="font-black text-lg mt-3">Delete {deleteTarget.name}?</h3>
            <p className="text-sm text-stone-500 mt-2">This action cannot be undone. Are you sure?</p>
            <div className="flex gap-3 mt-6"><button onClick={()=>setDeleteTarget(null)} className="flex-1 border-2 py-2.5 rounded-full font-bold bg-white hover:bg-stone-50">No, Cancel</button><button onClick={confirmDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-full font-bold">Yes, Delete</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
