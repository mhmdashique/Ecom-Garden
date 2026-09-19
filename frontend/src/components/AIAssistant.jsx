import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

const QUICK = [
  { q: "How to shop?", a: "Shop → pick a plant → choose pot & quantity → Add to Cart → Checkout with address + phone. We confirm on WhatsApp!" },
  { q: "Track my order", a: "Go to Dashboard → Orders → View details. Status: Pending → Confirmed → Shipped → Delivered." },
  { q: "COD & delivery?", a: "Cash on Delivery only. Shipping ₹49 extra for potted plants, confirmed by our team on call." },
  { q: "Explain this page", a: "" },
];

function getPageHelp(path){
  if(path==="/") return "Home — seasonal picks, categories & offers. Tap Shop to browse, or open a plant for care details.";
  if(path.startsWith("/shop")) return "Shop — filter by category, search, tap a plant for details, add to cart.";
  if(path.startsWith("/plant")) return "Plant detail — photos, care guide (sun, water, soil), pot options. Add to cart or save to wishlist.";
  if(path.startsWith("/cart")) return "Cart — adjust quantity, see subtotal + delivery note, then Checkout.";
  if(path.startsWith("/checkout")) return "Checkout — choose saved address or use current location, add phone, then Place Order. We’ll call to confirm.";
  if(path.startsWith("/dashboard")) return "Dashboard — Orders, Wishlist, Addresses, Profile. Tap View details for tracking and invoice.";
  if(path.startsWith("/orders/")) return "Order details — items, address, payment, tracking steps, reorder and invoice.";
  if(path.startsWith("/contact")) return "Contact — form + map. For order help, WhatsApp +91 98765 43210 (9am–7pm).";
  if(path.startsWith("/login")||path.startsWith("/register")) return "Sign in to place orders and track them.";
  return "We’re a 2-acre nursery at Pezhummoodu, TVM. Browse plants, ask our growers, COD delivery 3–5 days.";
}

function mockAnswer(input, path){
  const t = input.toLowerCase();
  if(t.includes("shop") || t.includes("buy") || t.includes("browse")) return QUICK[0].a;
  if(t.includes("track") || t.includes("order") || t.includes("where")) return QUICK[1].a;
  if(t.includes("cod") || t.includes("pay") || t.includes("delivery") || t.includes("shipping")) return QUICK[2].a;
  if(t.includes("explain") || t.includes("this page") || t.includes("understand")) return getPageHelp(path);
  if(t.includes("wishlist")) return "Tap the heart on a plant to save. Dashboard → Wishlist to move to cart.";
  if(t.includes("address")) return "Checkout lets you pick a saved address or use current location. Dashboard → Addresses to manage.";
  if(t.includes("admin")) return "Admin access is restricted to the nursery team.";
  if(t.includes("plant") || t.includes("care") || t.includes("water")) return "Each plant page has a care guide: sunlight, water, soil and more. You can download the PDF.";
  if(t.includes("hello") || t.includes("hi")) return "Hi! I’m here to help with shop, tracking and care — ask me anything 🌿";
  return "Got it — " + getPageHelp(path) + " Try: ‘How to shop?’ or ‘Track my order’.";
}

export default function AIAssistant(){
  const [open,setOpen]=useState(false);
  const [input,setInput]=useState("");
  const [typing,setTyping]=useState(false);
  const [msgs,setMsgs]=useState(()=>[
    {role:"ai", text:"Hi, I’m your grower’s assistant 🌿 — ask about shop, orders or care. Tap ‘Explain this page’ to start."},
  ]);
  const loc = useLocation();
  const listRef = useRef(null);
  const unread = !open && msgs.length>1;

  useEffect(()=>{ if(listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight; },[msgs, typing, open]);

  useEffect(()=>{
    const seen = localStorage.getItem("grower-nudge");
    if(!seen){ setTimeout(()=>setOpen(true), 3000); localStorage.setItem("grower-nudge","1"); }
    const handler = ()=> setOpen(true);
    window.addEventListener("open-ai-assistant", handler);
    return ()=> window.removeEventListener("open-ai-assistant", handler);
  },[]);

  const send = (q)=>{
    const text = (q ?? input).trim();
    if(!text) return;
    setMsgs(m=>[...m,{role:"user", text}]);
    setInput("");
    setTyping(true);
    const help = text==="Explain this page" ? getPageHelp(loc.pathname) : mockAnswer(text, loc.pathname);
    setTimeout(()=>{ setTyping(false); setMsgs(m=>[...m,{role:"ai", text: help}]); }, 600);
  };

  const quickWithExplain = QUICK.map(x=> x.q==="Explain this page" ? {...x, a:getPageHelp(loc.pathname)} : x);

  return (
    <>
      {/* floating button — human grower, not AI sparkle */}
      <button onClick={()=>setOpen(v=>!v)} aria-label="Grower help" className="fixed bottom-[84px] lg:bottom-6 right-4 z-40 w-14 h-14 rounded-full bg-[#0a2e1f] text-white shadow-[0_12px_28px_rgba(10,46,31,0.25)] grid place-items-center hover:bg-black active:scale-[0.97] transition-all border border-white/10">
        <span className="w-6 h-6 grid place-items-center">{open ? <span className="text-xl leading-none">✕</span> : <span className="text-[20px]">💬</span>}</span>
        {unread && <span className="absolute -top-1 -right-1 w-3 h-3 bg-lime-300 rounded-full animate-pulse border-2 border-white"/>}
        <span className="absolute -top-8 right-0 bg-[#0a2e1f] text-white text-xs px-2.5 py-1 rounded-full whitespace-nowrap hidden md:block shadow-md font-bold">Grower help</span>
      </button>

      {/* panel — warm, human */}
      {open && (
        <div className="fixed bottom-[144px] lg:bottom-[88px] right-3 md:right-4 z-40 w-[calc(100vw-24px)] max-w-[360px] h-[min(62vh,520px)] bg-[#fdfbf7] rounded-[24px] border border-[#0a2e1f]/10 shadow-[0_20px_60px_rgba(10,46,31,0.18)] flex flex-col overflow-hidden">
          {/* header — human, warm */}
          <div className="bg-[#0a2e1f] text-white p-4 flex items-start justify-between gap-3">
            <div className="flex gap-3">
              <img src="https://i.pravatar.cc/100?img=15" alt="grower" className="w-9 h-9 rounded-full object-cover border-2 border-white/20" />
              <div>
                <div className="font-black text-sm leading-none">Grower help</div>
                <div className="text-xs text-white/70 flex items-center gap-1.5"><span className="w-2 h-2 bg-lime-300 rounded-full animate-pulse"/> Online • 9am–7pm • Real team</div>
              </div>
            </div>
            <button onClick={()=>setOpen(false)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white hover:text-[#0a2e1f] grid place-items-center transition">✕</button>
          </div>

          {/* page context */}
          <div className="px-3 py-2 bg-white border-b border-[#0a2e1f]/5 flex items-center justify-between gap-2">
            <div className="text-xs text-[#0a2e1f]/60 truncate">On: <span className="font-bold text-[#0a2e1f]">{loc.pathname}</span></div>
            <button onClick={()=>send("Explain this page")} className="shrink-0 text-xs border border-[#0a2e1f] bg-white text-[#0a2e1f] px-3 py-1 rounded-full hover:bg-[#0a2e1f] hover:text-white font-bold transition">Explain this page</button>
          </div>

          {/* messages */}
          <div ref={listRef} className="flex-1 overflow-auto p-3 space-y-3 bg-[#fdfbf7]">
            {msgs.map((m,i)=>(
              <div key={i} className={`flex ${m.role==='user'?'justify-end':'justify-start'}`}>
                <div className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm leading-5 ${m.role==='user'?'bg-[#0a2e1f] text-white rounded-br-md':'bg-white border border-[#0a2e1f]/10 text-[#0a2e1f] rounded-bl-md'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {typing && <div className="flex justify-start"><div className="bg-white border border-[#0a2e1f]/10 rounded-2xl rounded-bl-md px-3 py-2 text-sm text-[#0a2e1f]/60">Typing…</div></div>}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {quickWithExplain.map(q=>(
                <button key={q.q} onClick={()=>send(q.q)} className="text-xs border border-[#0a2e1f]/10 bg-white px-2.5 py-1 rounded-full hover:bg-[#0a2e1f] hover:text-white hover:border-[#0a2e1f] transition">{q.q}</button>
              ))}
            </div>
          </div>

          {/* input */}
          <form onSubmit={e=>{e.preventDefault(); send();}} className="p-3 border-t border-[#0a2e1f]/5 bg-white flex gap-2">
            <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Ask about plants, orders, delivery…" className="flex-1 border border-[#0a2e1f]/10 rounded-full px-4 py-2.5 text-sm outline-none focus:border-[#0a2e1f]/20 focus:ring-2 focus:ring-[#0a2e1f]/10 bg-[#fdfbf7]" />
            <button type="submit" className="w-10 h-10 rounded-full bg-[#0a2e1f] text-white grid place-items-center hover:bg-black active:scale-[0.97] transition">→</button>
          </form>
          <div className="px-3 pb-2 text-[10px] text-[#0a2e1f]/40 text-center">Real growers • Malayalam & English • WhatsApp +91 98765 43210</div>
        </div>
      )}
    </>
  )
}
