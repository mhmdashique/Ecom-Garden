import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Terms(){
  return (
    <div className="bg-[#fdfbf7] min-h-[85vh] relative overflow-hidden">
      <div className="pointer-events-none absolute -top-24 -left-24 w-[520px] h-[520px] bg-[#e8f0e3] rounded-full blur-[80px] opacity-60" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-[520px] h-[520px] bg-amber-100/40 rounded-full blur-[80px] opacity-40" />
      <div className="relative max-w-[880px] mx-auto px-4 md:px-6 py-6 md:py-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold bg-white border border-[#0a2e1f]/10 rounded-full px-4 py-2 hover:bg-[#0a2e1f] hover:text-white transition shadow-sm">← Back to store</Link>

        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="mt-6 bg-white/90 backdrop-blur-xl rounded-[28px] border border-white/60 shadow-[0_20px_60px_rgba(10,46,31,0.08)] overflow-hidden">
          <div className="bg-[#0a2e1f] text-white p-6 md:p-8 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3 py-1 text-[11px] font-black tracking-widest uppercase text-emerald-200">Terms & Conditions • Shaji’s Nursery and Gardens</div>
              <h1 className="mt-3 font-[Outfit] text-[28px] md:text-[36px] font-black tracking-tight leading-none">Simple terms,<span className="font-[Fraunces] italic font-normal text-emerald-300"> honest growing.</span></h1>
              <p className="mt-2 text-white/70 text-sm leading-6">COD only • No advance • Owner confirms before dispatch • <span className="text-amber-300 font-black">No returns</span> — live plants. Last updated: Jan 2026.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="bg-white text-[#0a2e1f] rounded-full px-3 py-1.5 text-xs font-black">COD • No advance</span>
                <span className="bg-amber-400 text-[#0a2e1f] rounded-full px-3 py-1.5 text-xs font-black">↩ No Returns</span>
                <Link to="/refund" className="bg-white/10 border border-white/15 rounded-full px-3 py-1.5 text-xs font-bold text-emerald-200 hover:bg-white hover:text-[#0a2e1f] transition">Refund Policy →</Link>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-7 text-sm leading-6 text-[#1c1917]">
            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex gap-3">
              <span className="w-9 h-9 rounded-full bg-amber-500 text-white grid place-items-center shrink-0">↩</span>
              <div className="text-[13px] leading-5 text-amber-900">
                <b>No Return Policy:</b> Live plants are perishable — no returns after delivery. Only transit/packing damage within <b>24h</b> → free replacement or refund. Cancel before <b>Shipped</b> anytime. See <Link to="/refund" className="font-black underline">Refund & No Return Policy</Link> for full details.
              </div>
            </section>

            <section>
              <h2 className="font-black text-[16px] text-[#0a2e1f] flex items-center gap-2"><span className="w-7 h-7 rounded-full bg-[#0a2e1f] text-white grid place-items-center text-xs">1</span> Nursery & stock</h2>
              <p className="text-stone-600 mt-2">All plants are nursery-fresh from our 2-acre greenhouse, H34Q+9FP, Pezhummoodu, Thiruvananthapuram, Kerala. Stock & “health score” are updated live. Wholesale (10+ pcs) gets 5–20% tiers — owner confirms final price via WhatsApp.</p>
            </section>

            <section>
              <h2 className="font-black text-[16px] text-[#0a2e1f] flex items-center gap-2"><span className="w-7 h-7 rounded-full bg-[#0a2e1f] text-white grid place-items-center text-xs">2</span> Orders & COD</h2>
              <ul className="list-disc ml-5 mt-2 space-y-1 text-stone-600">
                <li>Place order → owner gets WhatsApp on +91 98765 43210 → replies in 30–60 mins (9am–7pm) → you see “Thank you and contact soon”.</li>
                <li>No online payment. Pay on delivery — cash / UPI to delivery person. No advance.</li>
                <li>Potted extra shipping ₹39–79 (soil weight) confirmed at call. Cuttings ship light & free. GST bill on request.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-black text-[16px] text-[#0a2e1f] flex items-center gap-2"><span className="w-7 h-7 rounded-full bg-[#0a2e1f] text-white grid place-items-center text-xs">3</span> Delivery</h2>
              <p className="text-stone-600 mt-2">Pan-Kerala 14 districts, 3–5 days from Pezhummoodu. Crush-proof, breathable tube. Delivery person will call before arrival. If you’re unreachable, we hold 24h then reschedule.</p>
            </section>

            <section className="rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-white p-5">
              <h2 className="font-black text-[16px] text-[#0a2e1f] flex items-center gap-2"><span className="w-7 h-7 rounded-full bg-amber-500 text-white grid place-items-center text-xs">4</span> Refund & No Return</h2>
              <p className="text-stone-600 mt-2"><b className="text-[#0a2e1f]">No returns after delivery.</b> Live plants cannot be restocked. Exceptions only for transit damage:</p>
              <ul className="list-disc ml-5 mt-2 space-y-1 text-stone-600">
                <li><b className="text-[#0a2e1f]">Transit damage:</b> photo/video within 24h → free replace or refund (owner’s call, 3–5 days).</li>
                <li><b className="text-[#0a2e1f]">Not eligible:</b> change of mind, care issues after healthy arrival, cuttings/sale items once healthy arrival confirmed. We provide free lifetime WhatsApp diagnosis instead.</li>
                <li><b className="text-[#0a2e1f]">Cancellation:</b> free before Shipped (Dashboard → Orders). After Shipped, COD can be refused at door. No return process needed.</li>
              </ul>
              <Link to="/refund" className="mt-3 inline-flex bg-[#0a2e1f] text-white rounded-full px-4 py-2 text-xs font-black hover:bg-black transition">Full Refund Policy →</Link>
            </section>

            <section>
              <h2 className="font-black text-[16px] text-[#0a2e1f] flex items-center gap-2"><span className="w-7 h-7 rounded-full bg-[#0a2e1f] text-white grid place-items-center text-xs">5</span> Care & warranty</h2>
              <p className="text-stone-600 mt-2">Every plant ships with QR care guide + free lifetime WhatsApp help from horticulturists. Follow watering, light & pot size in guide — we’re not liable for neglect after healthy delivery, but we’ll always help you revive.</p>
            </section>

            <section className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-black text-sm text-emerald-900">Need bulk or landscaping?</h2>
                <p className="text-sm text-emerald-800/70 mt-1">Any plant, any qty, 2-acre nursery, on-site team, GST bill — Get quote via <Link to="/contact" className="font-black underline">Contact</Link> or WhatsApp +91 98765 43210.</p>
              </div>
              <Link to="/contact" className="shrink-0 bg-emerald-600 text-white rounded-full px-5 py-2.5 text-sm font-black hover:bg-emerald-700 transition">Get quote →</Link>
            </section>
          </div>
        </motion.div>

        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          <Link to="/privacy" className="bg-white border border-[#0a2e1f]/10 rounded-full px-5 py-2.5 text-sm font-bold hover:bg-[#0a2e1f] hover:text-white transition shadow-sm">Privacy →</Link>
          <Link to="/refund" className="bg-amber-500 text-white rounded-full px-5 py-2.5 text-sm font-black hover:bg-amber-600 transition shadow-sm">Refund →</Link>
          <Link to="/faq" className="bg-[#0a2e1f] text-white rounded-full px-5 py-2.5 text-sm font-black hover:bg-black transition shadow-sm">FAQs</Link>
        </div>
      </div>
    </div>
  )
}
