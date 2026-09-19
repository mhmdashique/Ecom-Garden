import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const CATS = ['All','COD & Payment','Delivery','Refund & No Return','Plants & Care','Orders & Support'];

const FAQS = [
  { q:'Is payment COD only?', a:'Yes — no advance. Pay on delivery (cash / UPI) to delivery person. Potted extra shipping ₹39–79 (soil weight) is confirmed by owner on WhatsApp before dispatch. Cuttings are light & ship free. No online payment needed.', cat:'COD & Payment', badge:'COD' },
  { q:'Can I return a plant? What is your return policy?', a:'Live plants are perishable — we do NOT offer returns after delivery. Change of mind, size preference, or care issues after healthy arrival are not eligible for return. We offer free lifetime WhatsApp diagnosis instead. Only transit damage qualifies (see next).', cat:'Refund & No Return', badge:'No Return', highlight:true },
  { q:'Do you offer refunds?', a:'Refunds/replacement only for transit damage: share photo/video within 24h of delivery on WhatsApp +91 98765 43210 with order ID. Owner approves free replacement or refund (3–5 working days) if damage is from packing/courier. Healthy-arrival orders are not refundable. You can cancel before Shipped for no charge.', cat:'Refund & No Return', badge:'Refund', highlight:true },
  { q:'What if plant arrives damaged or dies after delivery?', a:'Photo within 24h → free replace or refund (owner’s call). After 24h healthy arrival, we provide free diagnosis + care tips for 14 days; if our fault (wrong plant, pest from nursery) we still replace. Neglect, overwatering, or climate after delivery is not covered — but we’ll always help revive.', cat:'Refund & No Return', badge:'Damage', highlight:true },
  { q:'Can I cancel my order?', a:'Yes, anytime before Shipped: Dashboard → Orders → View → Cancel. After dispatch, you can refuse delivery at door (no fee) since it’s COD. Once delivered, no cancellation/return.', cat:'Orders & Support', badge:'Cancel' },
  { q:'How fast is delivery in Kerala?', a:'Pan-Kerala 14 districts, 3–5 days from Pezhummoodu, Thiruvananthapuram. Hand-packed in crush-proof breathable tubes, delivery person calls before arrival. 48h nursery-to-doorstep in most districts. Hold 24h if you’re unreachable, then reschedule.', cat:'Delivery', badge:'3–5 days' },
  { q:'Do you do landscaping & bulk?', a:'Yes — any plant, any qty, 2-acre nursery, on-site team for lawn, hedges, palms, flowering borders. GST bill, WhatsApp quote on +91 98765 43210. Bulk 10+ pcs gets 5–20% tiers, owner confirms price.', cat:'Plants & Care', badge:'Bulk' },
  { q:'How does the AI Website Guide work?', a:'It runs offline in your browser — no login, no data sent. Tap “Ask AI to explain” anywhere, it guides Browse → Add → Checkout step-by-step, in English & Malayalam. Nothing is logged outside your device.', cat:'Orders & Support', badge:'AI offline' },
  { q:'Where is the nursery?', a:'H34Q+9FP, Poovachal, Pezhummoodu, Thiruvananthapuram, Kerala 695575. Open Sat 10am–4pm for tours. Pan-Kerala delivery, installation on request.', cat:'Delivery', badge:'Visit' },
  { q:'Can I track my order?', a:'Login → Dashboard → Orders → View details. You’ll see Pending → Confirmed → Shipped → Delivered, plus invoice & care guide PDFs. WhatsApp updates also sent.', cat:'Orders & Support', badge:'Track' },
  { q:'Do you give care help?', a:'Every plant ships with QR care guide (sun, water, soil, pet-safe). Plus free lifetime WhatsApp help from horticulturists — reply in ~18 mins, 9am–7pm. No return needed — we help you revive.', cat:'Plants & Care', badge:'Free care' },
  { q:'Are cuttings & sale items returnable?', a:'No — cuttings and sale items are non-returnable/non-refundable once healthy arrival is confirmed (they’re priced light/free ship). Transit damage still covered within 24h with photo.', cat:'Refund & No Return', badge:'Cuttings' },
];

export default function FAQ(){
  const [open,setOpen]=useState(0);
  const [cat,setCat]=useState('All');
  const [q,setQ]=useState('');

  const filtered = useMemo(()=>{
    return FAQS.filter(f=>{
      const catOk = cat==='All' || f.cat===cat;
      const qOk = !q.trim() || f.q.toLowerCase().includes(q.toLowerCase()) || f.a.toLowerCase().includes(q.toLowerCase());
      return catOk && qOk;
    })
  },[cat,q]);

  return (
    <div className="bg-[#fdfbf7] min-h-[85vh] relative overflow-hidden">
      <div className="pointer-events-none absolute -top-24 -left-24 w-[520px] h-[520px] bg-[#e8f0e3] rounded-full blur-[80px] opacity-60" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-[520px] h-[520px] bg-emerald-100/40 rounded-full blur-[80px] opacity-40" />

      <div className="relative max-w-[880px] mx-auto px-4 md:px-6 py-6 md:py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold bg-white border border-[#0a2e1f]/10 rounded-full px-4 py-2 hover:bg-[#0a2e1f] hover:text-white transition shadow-sm">← Back to store</Link>
          <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5 text-xs font-black text-amber-800">↩ No Returns • Refunds only for transit damage</span>
        </div>

        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="mt-6 bg-white/90 backdrop-blur-xl rounded-[28px] border border-white/60 shadow-[0_20px_60px_rgba(10,46,31,0.08)] overflow-hidden">
          <div className="bg-[#0a2e1f] text-white p-6 md:p-8 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3 py-1 text-[11px] font-black tracking-widest uppercase text-emerald-200">FAQs • Shaji’s Nursery and Gardens</div>
              <h1 className="mt-3 font-[Outfit] text-[28px] md:text-[36px] font-black tracking-tight leading-none">Every question,<span className="font-[Fraunces] italic font-normal text-emerald-300"> answered.</span></h1>
              <p className="mt-2 text-white/70 text-sm leading-6 max-w-[62ch]">COD, delivery, care, and our <b className="text-amber-300">No Return</b> refund policy — tap a question. Still stuck? <Link to="/contact" className="font-bold underline decoration-emerald-400 underline-offset-4 text-white">Contact us</Link> or WhatsApp +91 98765 43210.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="bg-white/10 border border-white/15 rounded-full px-3 py-1 text-xs font-bold text-emerald-200">9am–7pm Mon–Sat</span>
                <span className="bg-white text-[#0a2e1f] rounded-full px-3 py-1 text-xs font-black">COD • GST bill • No Returns</span>
                <Link to="/refund" className="bg-amber-400 text-[#0a2e1f] rounded-full px-3 py-1 text-xs font-black hover:bg-amber-300 transition">Refund Policy →</Link>
              </div>

              {/* search + cats */}
              <div className="mt-5 bg-white rounded-2xl p-2 flex items-center gap-2 border border-white/20 shadow-lg">
                <span className="w-9 h-9 rounded-full bg-[#f6f7f4] grid place-items-center text-[#0a2e1f] border border-stone-200 shrink-0">⌕</span>
                <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search — e.g. return, refund, delivery, COD" className="flex-1 bg-transparent outline-none text-sm text-[#0a2e1f] placeholder:text-stone-400 font-medium py-1"/>
                {q && <button onClick={()=>setQ('')} className="text-xs font-bold bg-stone-100 hover:bg-stone-200 rounded-full px-3 py-1.5 transition">Clear</button>}
                <span className="hidden sm:inline-flex text-xs font-bold bg-[#0a2e1f] text-white rounded-full px-3 py-1.5 shrink-0">{filtered.length} results</span>
              </div>

              <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-none pb-1 -mx-1 px-1">
                {CATS.map(c=>(
                  <button key={c} onClick={()=>setCat(c)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-black border transition ${cat===c ? 'bg-white text-[#0a2e1f] border-white shadow-sm' : 'bg-white/10 text-white border-white/15 hover:bg-white/15'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* alert */}
          <div className="mx-4 md:mx-6 mt-4 rounded-2xl border-2 border-amber-200 bg-amber-50 p-3 md:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex gap-3">
              <span className="w-9 h-9 rounded-full bg-amber-500 text-white grid place-items-center shrink-0 text-sm">↩</span>
              <div>
                <div className="font-black text-sm text-amber-900 leading-none">No Returns — Live plants are perishable</div>
                <div className="text-xs text-amber-800/80 mt-1 leading-5">We don’t accept returns after delivery. Transit damage? Photo within 24h → free replacement/refund. <Link to="/refund" className="font-black underline">Full policy</Link></div>
              </div>
            </div>
            <Link to="/refund" className="shrink-0 bg-[#0a2e1f] text-white rounded-full px-4 py-2 text-xs font-black hover:bg-black transition">Read Refund Policy →</Link>
          </div>

          <div className="p-4 md:p-6 space-y-3">
            {filtered.length===0 && (
              <div className="rounded-2xl border border-dashed border-stone-200 bg-[#f6f7f4] p-8 text-center">
                <div className="font-black text-[#0a2e1f]">No matches</div>
                <div className="text-sm text-stone-500 mt-1">Try another keyword or switch category.</div>
                <button onClick={()=>{setQ('');setCat('All')}} className="mt-3 bg-[#0a2e1f] text-white rounded-full px-4 py-2 text-xs font-black">Reset</button>
              </div>
            )}
            {filtered.map((item,i)=>{
              const idx = FAQS.indexOf(item);
              const isOpen = open===idx;
              return (
                <motion.div key={item.q} layout className={`rounded-[20px] border-2 overflow-hidden transition ${item.highlight ? (isOpen ? 'border-amber-400 bg-amber-50/70 shadow-sm' : 'border-amber-200 bg-amber-50/40 hover:border-amber-300') : (isOpen ? 'border-emerald-500 bg-emerald-50/60 shadow-sm' : 'border-[#0a2e1f]/5 bg-white hover:border-[#0a2e1f]/10')}`}>
                  <button onClick={()=> setOpen(isOpen ? -1 : idx)} className="w-full text-left flex items-center justify-between gap-4 p-4 md:p-5">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-black tracking-widest uppercase border ${item.highlight ? 'bg-amber-500 text-white border-amber-500' : 'bg-[#0a2e1f] text-white border-[#0a2e1f]'}`}>{item.badge}</span>
                        <span className="text-[11px] font-bold tracking-widest uppercase text-stone-400">{item.cat}</span>
                      </div>
                      <span className="font-black text-[15px] text-[#0a2e1f] leading-tight">{item.q}</span>
                    </div>
                    <span className={`w-8 h-8 rounded-full grid place-items-center shrink-0 border-2 transition ${isOpen ? 'bg-[#0a2e1f] text-white border-[#0a2e1f] rotate-45' : 'bg-white border-[#0a2e1f]/10 text-[#0a2e1f]'}`}>+</span>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} className="overflow-hidden">
                        <div className="px-4 md:px-5 pb-4 md:pb-5 text-sm leading-6 text-stone-600">{item.a}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>

          <div className="px-4 md:px-6 pb-6">
            <div className="bg-[#f6f7f4] border border-[#0a2e1f]/5 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
              <div>
                <div className="font-black text-sm text-[#0a2e1f]">Still need help?</div>
                <div className="text-xs text-stone-500">Horticulturist replies in ~18 mins • Free lifetime • No return needed — we help revive</div>
              </div>
              <a href="https://wa.me/919876543210?text=Hi%20Shaji%20Nursery%20-%20FAQ%20help" target="_blank" rel="noreferrer" className="shrink-0 bg-emerald-600 text-white rounded-full px-6 py-2.5 text-sm font-black hover:bg-emerald-700 shadow-md transition inline-flex items-center gap-2">💬 WhatsApp us →</a>
            </div>
          </div>
        </motion.div>

        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          <Link to="/privacy" className="bg-white border border-[#0a2e1f]/10 rounded-full px-5 py-2.5 text-sm font-bold hover:bg-[#0a2e1f] hover:text-white transition shadow-sm">Privacy →</Link>
          <Link to="/refund" className="bg-amber-500 text-white rounded-full px-5 py-2.5 text-sm font-black hover:bg-amber-600 transition shadow-sm">Refund →</Link>
          <Link to="/terms" className="bg-white border border-[#0a2e1f]/10 rounded-full px-5 py-2.5 text-sm font-bold hover:bg-[#0a2e1f] hover:text-white transition shadow-sm">Terms →</Link>
          <Link to="/contact" className="bg-[#0a2e1f] text-white rounded-full px-5 py-2.5 text-sm font-black hover:bg-black transition shadow-sm">Contact</Link>
        </div>
      </div>
    </div>
  )
}
