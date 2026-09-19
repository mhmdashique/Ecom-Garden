import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Refund(){
  return (
    <div className="bg-[#fdfbf7] min-h-[85vh] relative overflow-hidden">
      <div className="pointer-events-none absolute -top-24 -left-24 w-[520px] h-[520px] bg-[#e8f0e3] rounded-full blur-[80px] opacity-60" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-[520px] h-[520px] bg-amber-100/40 rounded-full blur-[80px] opacity-40" />
      <div className="relative max-w-[880px] mx-auto px-4 md:px-6 py-6 md:py-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold bg-white border border-[#0a2e1f]/10 rounded-full px-4 py-2 hover:bg-[#0a2e1f] hover:text-white transition shadow-sm">← Back to store</Link>

        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="mt-6 bg-white/90 backdrop-blur-xl rounded-[28px] border border-white/60 shadow-[0_20px_60px_rgba(10,46,31,0.08)] overflow-hidden">
          <div className="bg-[#0a2e1f] text-white p-6 md:p-8 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-amber-500 text-white rounded-full px-3 py-1 text-xs font-black tracking-widest uppercase shadow-sm">↩ Refund & Return Policy • No Returns</div>
              <h1 className="mt-3 font-[Outfit] text-[28px] md:text-[36px] font-black tracking-tight leading-none">No returns — <span className="font-[Fraunces] italic font-normal text-amber-300">but we’ve got you if transit hurts.</span></h1>
              <p className="mt-2 text-white/70 text-sm leading-6 max-w-[66ch]">Live plants are perishable and packed fresh — so we <b className="text-white">cannot accept returns</b> after delivery. Only courier/packing damage within 24h qualifies for free replacement or refund. Last updated: Jan 2026.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="bg-white text-[#0a2e1f] rounded-full px-3 py-1.5 text-xs font-black">COD only • Pay on delivery</span>
                <span className="bg-amber-400 text-[#0a2e1f] rounded-full px-3 py-1.5 text-xs font-black">↩ No Returns after delivery</span>
                <span className="bg-white/10 border border-white/15 rounded-full px-3 py-1.5 text-xs font-bold text-emerald-200">24h damage window</span>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-7 text-sm leading-6 text-[#1c1917]">
            {/* Hero notice */}
            <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 flex gap-3">
              <span className="w-10 h-10 rounded-2xl bg-amber-500 text-white grid place-items-center shrink-0 text-lg">⚠</span>
              <div>
                <div className="font-black text-amber-900">Short version — please read before ordering</div>
                <ul className="list-disc ml-5 mt-1 text-amber-900/80 space-y-0.5 text-[13px] leading-5">
                  <li><b>No returns</b> after delivery — live plants can’t be restocked.</li>
                  <li><b>Only transit damage</b> → photo/video within <b>24h</b> → free replace or refund.</li>
                  <li>Cancel anytime <b>before Shipped</b> (Dashboard → Orders). After dispatch, COD can be refused at door.</li>
                </ul>
              </div>
            </div>

            <section>
              <h2 className="font-black text-[16px] text-[#0a2e1f] flex items-center gap-2"><span className="w-7 h-7 rounded-full bg-[#0a2e1f] text-white grid place-items-center text-xs">1</span> Why no returns?</h2>
              <p className="text-stone-600 mt-2">Plants are living, perishable goods. Once out of our greenhouse (H34Q+9FP, Pezhummoodu) and in courier transit, returning stresses and often kills the plant. For hygiene and survival, we cannot resell returned plants. This lets us keep COD honest and prices low — you pay only if you accept healthy delivery.</p>
              <div className="mt-3 grid sm:grid-cols-3 gap-2 text-xs">
                <span className="bg-[#f6f7f4] border border-stone-200 rounded-full px-3 py-2 font-bold text-center">🌱 Perishable — can’t restock</span>
                <span className="bg-[#f6f7f4] border border-stone-200 rounded-full px-3 py-2 font-bold text-center">♻ No resale after transit</span>
                <span className="bg-[#f6f7f4] border border-stone-200 rounded-full px-3 py-2 font-bold text-center">✓ COD protects you</span>
              </div>
            </section>

            <section>
              <h2 className="font-black text-[16px] text-[#0a2e1f] flex items-center gap-2"><span className="w-7 h-7 rounded-full bg-emerald-600 text-white grid place-items-center text-xs">2</span> What qualifies for refund/replacement</h2>
              <div className="mt-3 grid md:grid-cols-2 gap-3">
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                  <div className="font-black text-emerald-900 text-sm">✓ Covered (24h window)</div>
                  <ul className="list-disc ml-5 mt-1 text-stone-700 space-y-1 text-[13px]">
                    <li>Transit crush / stem snap from packing or courier</li>
                    <li>Wrong plant / wrong variant shipped</li>
                    <li>Pest/disease clearly from nursery (photo within 24h)</li>
                  </ul>
                  <div className="mt-2 inline-flex bg-white border border-emerald-200 rounded-full px-3 py-1 text-xs font-bold text-emerald-800">→ Free replace or refund (owner’s call)</div>
                </div>
                <div className="bg-white border border-stone-200 rounded-2xl p-4">
                  <div className="font-black text-[#0a2e1f] text-sm">✕ Not covered</div>
                  <ul className="list-disc ml-5 mt-1 text-stone-600 space-y-1 text-[13px]">
                    <li>Change of mind, size/color preference after delivery</li>
                    <li>Overwatering, underwatering, light issues after healthy arrival</li>
                    <li>Natural leaf drop / acclimatization (we guide free)</li>
                    <li>Cuttings & sale items once healthy arrival confirmed</li>
                  </ul>
                  <div className="mt-2 text-xs text-stone-500">We still help — free lifetime WhatsApp diagnosis, no return needed.</div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="font-black text-[16px] text-[#0a2e1f] flex items-center gap-2"><span className="w-7 h-7 rounded-full bg-[#0a2e1f] text-white grid place-items-center text-xs">3</span> How to claim (within 24h)</h2>
              <ol className="mt-3 space-y-2">
                <Step n="1" title="Photo/video within 24h" text="Unbox on arrival, take clear photo/video of damage + outer tube + shipping label." />
                <Step n="2" title="WhatsApp owner" text="Send to +91 98765 43210 with order ID (Dashboard → Orders). Reply in 30–60 mins, 9am–7pm." />
                <Step n="3" title="Owner review" text="We verify packing vs courier fault. You get free replacement (priority dispatch) or refund in 3–5 working days (UPI/reversal — no advance was charged)." />
              </ol>
              <p className="text-xs text-stone-500 mt-3 bg-[#f6f7f4] border border-stone-100 rounded-xl px-3 py-2">Keep the plant & packaging until we reply — helps us improve crush-proof tubes. Damage rate is &lt;0.8%.</p>
            </section>

            <section>
              <h2 className="font-black text-[16px] text-[#0a2e1f] flex items-center gap-2"><span className="w-7 h-7 rounded-full bg-[#0a2e1f] text-white grid place-items-center text-xs">4</span> Cancellations</h2>
              <ul className="list-disc ml-5 mt-2 space-y-1 text-stone-600">
                <li><b className="text-[#0a2e1f]">Before Shipped:</b> Dashboard → Orders → View → Cancel → instant, no fee. No payment was taken (COD).</li>
                <li><b className="text-[#0a2e1f]">After Shipped:</b> refuse at door — courier returns to nursery, no fee, no return process.</li>
                <li><b className="text-[#0a2e1f]">After Delivered:</b> no cancellation/return. WhatsApp care for free revival help.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-black text-[16px] text-[#0a2e1f] flex items-center gap-2"><span className="w-7 h-7 rounded-full bg-[#0a2e1f] text-white grid place-items-center text-xs">5</span> Shipping & extras</h2>
              <p className="text-stone-600 mt-2">Pan-Kerala 14 districts, 3–5 days from Pezhummoodu. Potted soil weight → extra ₹39–79 confirmed on WhatsApp before dispatch. Cuttings ship free & light. Crush-proof breathable tube +GST bill on request. Delivery person calls before arrival; hold 24h if unreachable.</p>
            </section>

            <section className="bg-[#f6f7f4] border border-[#0a2e1f]/5 rounded-2xl p-4">
              <h2 className="font-black text-sm text-[#0a2e1f]">Need help deciding before you order?</h2>
              <p className="text-stone-600 mt-1 text-sm">Chat with horticulturist for size, light, pet-safe guidance — so you don’t need a return. <a href="https://wa.me/919876543210" className="font-bold text-emerald-700 underline">WhatsApp +91 98765 43210</a> • 9am–7pm Mon–Sat • reply in ~18 mins.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a href="https://wa.me/919876543210?text=Hi%20Shaji%20Nursery%20-%20refund%20query" target="_blank" rel="noreferrer" className="bg-emerald-600 text-white rounded-full px-5 py-2.5 text-sm font-black hover:bg-emerald-700 transition">💬 WhatsApp us →</a>
                <Link to="/faq" className="bg-white border border-stone-200 rounded-full px-5 py-2.5 text-sm font-bold hover:bg-stone-50 transition">See FAQs</Link>
              </div>
            </section>
          </div>
        </motion.div>

        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          <Link to="/privacy" className="bg-white border border-[#0a2e1f]/10 rounded-full px-5 py-2.5 text-sm font-bold hover:bg-[#0a2e1f] hover:text-white transition shadow-sm">Privacy →</Link>
          <Link to="/terms" className="bg-white border border-[#0a2e1f]/10 rounded-full px-5 py-2.5 text-sm font-bold hover:bg-[#0a2e1f] hover:text-white transition shadow-sm">Terms →</Link>
          <Link to="/faq" className="bg-[#0a2e1f] text-white rounded-full px-5 py-2.5 text-sm font-black hover:bg-black transition shadow-sm">FAQs</Link>
        </div>

        <p className="text-center text-xs text-stone-400 mt-4">Shaji’s Nursery and Gardens • H34Q+9FP, Poovachal, Kerala 695575 • GST bill on request • COD • 24h damage support</p>
      </div>
    </div>
  )
}

function Step({ n, title, text }){
  return (
    <li className="flex gap-3 bg-white border border-stone-100 rounded-2xl p-3 shadow-sm">
      <span className="w-8 h-8 rounded-full bg-[#0a2e1f] text-white grid place-items-center font-black text-xs shrink-0">{n}</span>
      <span><b className="text-[#0a2e1f]">{title}:</b> <span className="text-stone-600">{text}</span></span>
    </li>
  )
}
