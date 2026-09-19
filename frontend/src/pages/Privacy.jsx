import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const SECTIONS = [
  { id: 'collect', label: 'What we collect', icon: '▣' },
  { id: 'use', label: 'How we use', icon: '◐' },
  { id: 'sharing', label: 'Sharing', icon: '⇄' },
  { id: 'cookies', label: 'Cookies & Storage', icon: '◒' },
  { id: 'ai', label: 'AI Assistant', icon: '✦' },
  { id: 'refund', label: 'Refund & No Return', icon: '↩', highlight: true },
  { id: 'controls', label: 'Your controls', icon: '⚙' },
  { id: 'retention', label: 'Retention', icon: '◷' },
];

export default function Privacy(){
  return (
    <div className="bg-[#fdfbf7] min-h-[85vh] relative overflow-hidden">
      <div className="pointer-events-none absolute -top-24 -left-24 w-[600px] h-[600px] bg-[#e8f0e3] rounded-full blur-[90px] opacity-50" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-[600px] h-[600px] bg-emerald-100/40 rounded-full blur-[90px] opacity-40" />
      <div className="pointer-events-none absolute top-[40%] left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-gradient-to-b from-transparent via-amber-50/20 to-transparent blur-2xl" />

      <div className="relative max-w-[1120px] mx-auto px-4 md:px-6 py-6 md:py-10">
        {/* top bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold bg-white border border-[#0a2e1f]/10 rounded-full px-4 py-2 hover:bg-[#0a2e1f] hover:text-white transition shadow-sm">← Back to store</Link>
          <div className="flex items-center gap-2 text-xs">
            <span className="hidden sm:inline-flex items-center gap-1.5 bg-white border border-stone-200 rounded-full px-3 py-1.5 font-medium text-stone-600 shadow-sm"><span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"/> Updated Jan 2026</span>
            <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5 font-black text-amber-800">↩ No Returns • See Refund Policy</span>
          </div>
        </div>

        {/* hero */}
        <div className="mt-6 grid lg:grid-cols-[1.15fr_0.85fr] gap-6 items-start">
          <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} className="bg-[#0a2e1f] text-white rounded-[28px] p-6 md:p-8 relative overflow-hidden shadow-[0_20px_60px_rgba(10,46,31,0.18)] border border-white/10">
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3 py-1 text-[11px] font-black tracking-widest uppercase text-emerald-200">Privacy Policy • Shaji’s Nursery and Gardens</div>
              <h1 className="mt-3 font-[Outfit] text-[30px] md:text-[38px] font-black tracking-tight leading-[0.95]">Your privacy,<br/><span className="font-[Fraunces] italic font-normal text-emerald-300">rooted in trust.</span></h1>
              <p className="mt-3 text-white/70 text-[14px] leading-6 max-w-[60ch]">We collect only what we need to grow your order — never sold, never tracked for ads. Live plants mean no returns — but we replace transit damage within 24h.</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="bg-white text-[#0a2e1f] rounded-full px-3 py-1.5 text-xs font-black">COD only • No data selling</span>
                <span className="bg-white/10 border border-white/15 rounded-full px-3 py-1.5 text-xs font-bold text-emerald-200">Offline AI • No tracking</span>
                <Link to="/refund" className="bg-amber-400 text-[#0a2e1f] rounded-full px-3 py-1.5 text-xs font-black hover:bg-amber-300 transition">Refund → No Return Policy</Link>
              </div>
              <div className="mt-6 flex items-center gap-3 text-xs text-white/60">
                <span className="w-8 h-8 rounded-full bg-white/10 grid place-items-center border border-white/10">⌖</span>
                <span>H34Q+9FP, Poovachal, Kerala • <a href="tel:+919876543210" className="underline decoration-white/30 underline-offset-4 hover:text-white">+91 98765 43210</a></span>
              </div>
            </div>
          </motion.div>

          {/* quick TOC card */}
          <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.08}} className="bg-white/90 backdrop-blur-xl rounded-[28px] border border-white/60 shadow-[0_20px_60px_rgba(10,46,31,0.08)] p-5 md:p-6">
            <div className="flex items-center justify-between">
              <div className="font-black text-[#0a2e1f] text-sm tracking-tight">On this page</div>
              <span className="text-[11px] font-bold tracking-widest uppercase text-stone-400">8 sections • 2 min read</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {SECTIONS.map(s=>(
                <a key={s.id} href={`#${s.id}`} className={`group flex items-center gap-2 rounded-2xl border px-3 py-2.5 text-sm font-bold transition ${s.highlight ? 'bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100' : 'bg-[#f6f7f4] border-stone-200 text-[#0a2e1f] hover:bg-white hover:border-[#0a2e1f]/10 hover:shadow-sm'}`}>
                  <span className={`w-7 h-7 rounded-full grid place-items-center text-xs shrink-0 border ${s.highlight ? 'bg-amber-500 text-white border-amber-500' : 'bg-white border-stone-200 text-[#0a2e1f]/70 group-hover:border-[#0a2e1f]/10'}`}>{s.icon}</span>
                  <span className="leading-none text-[13px]">{s.label}</span>
                </a>
              ))}
            </div>
            <div className="mt-4 rounded-2xl bg-[#0a2e1f] text-white p-4 flex items-center justify-between gap-3">
              <div>
                <div className="font-black text-sm leading-none">Need the short version?</div>
                <div className="text-xs text-white/60 mt-1 leading-4">No returns on live plants. Damage in transit? Photo within 24h → free replace.</div>
              </div>
              <Link to="/refund" className="shrink-0 bg-white text-[#0a2e1f] rounded-full px-4 py-2 text-xs font-black hover:bg-amber-300 transition">View Refund Policy →</Link>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link to="/terms" className="flex-1 text-center bg-white border border-stone-200 rounded-full px-4 py-2 text-xs font-bold hover:bg-stone-50 transition">Terms →</Link>
              <Link to="/faq" className="flex-1 text-center bg-[#0a2e1f] text-white rounded-full px-4 py-2 text-xs font-black hover:bg-black transition">FAQs</Link>
            </div>
          </motion.div>
        </div>

        {/* content */}
        <div className="mt-6 bg-white/80 backdrop-blur-xl rounded-[28px] border border-white/60 shadow-[0_20px_60px_rgba(10,46,31,0.08)] overflow-hidden">
          <div className="hidden md:flex items-center gap-2 px-6 py-4 border-b border-stone-100 bg-[#f6f7f4]/60 backdrop-blur text-xs font-bold">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"/> Last updated: Jan 2026 • 2-acre nursery • GST bill on request • COD only
            <span className="ml-auto inline-flex items-center gap-1.5 bg-white border border-stone-200 rounded-full px-3 py-1"><span className="w-1.5 h-1.5 bg-amber-500 rounded-full"/> No returns — perishable live plants</span>
          </div>

          <div className="p-5 md:p-8 space-y-6 text-[14px] leading-6 text-[#1c1917]">
            <Section id="collect" n="01" title="What we collect" icon="▣" desc="Minimal, order-focused — nothing extra.">
              <ul className="grid sm:grid-cols-2 gap-2 mt-3">
                <Li title="Account" text="name, email, phone — for delivery & WhatsApp care." />
                <Li title="Address" text="saved delivery addresses + GPS only if you tap “Use current location”." />
                <Li title="Orders" text="plants, variants, qty, price, COD status & delivery timeline." />
                <Li title="Site" text="anonymous visits, device & cart in localStorage — no ad trackers." />
              </ul>
              <p className="text-xs text-stone-500 mt-3 bg-[#f6f7f4] border border-stone-100 rounded-xl px-3 py-2">We never ask for card/UPI details online — COD is cash/UPI to delivery person only.</p>
            </Section>

            <Section id="use" n="02" title="How we use it" icon="◐" desc="To pack, deliver and care — not to sell.">
              <p className="text-stone-600 mt-2">To pack & deliver live plants, generate GST bill on request, send WhatsApp care (free lifetime), and improve our nursery. Email only for order updates + care tips you requested. We do not sell data and we do not run third-party ad pixels.</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
                <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full px-3 py-1.5">✓ No ads • No resale</span>
                <span className="bg-white border border-stone-200 rounded-full px-3 py-1.5">Order updates only</span>
                <span className="bg-white border border-stone-200 rounded-full px-3 py-1.5">Care tips if you opt in</span>
              </div>
            </Section>

            <Section id="sharing" n="03" title="Sharing" icon="⇄" desc="Only with hands that deliver your plants.">
              <p className="text-stone-600 mt-2">Only with delivery partners (address + phone) and COD handlers. No third-party ads. Maps reverse-geocode via OpenStreetMap only when you tap location. We sign no data-broker deals — ever.</p>
            </Section>

            <Section id="cookies" n="04" title="Cookies & local storage" icon="◒" desc="Light, local, and deletable.">
              <ul className="list-disc ml-5 mt-2 space-y-1 text-stone-600">
                <li><b className="text-[#0a2e1f]">Cart & session:</b> stored in localStorage so your basket survives refresh.</li>
                <li><b className="text-[#0a2e1f]">Auth token:</b> stored securely to keep you logged in; clear on logout.</li>
                <li><b className="text-[#0a2e1f]">No trackers:</b> no Facebook/Google pixels, no cross-site cookies.</li>
              </ul>
            </Section>

            <Section id="ai" n="05" title="AI Assistant" icon="✦" desc="Runs offline — nothing leaves your browser.">
              <p className="text-stone-600 mt-2">Our on-site AI runs offline in your browser — no chat is sent to an external AI. “Ask AI to explain” stays local. Nothing is logged outside your device. You can use Browse → Add → Checkout guidance in English & Malayalam without login.</p>
              <div className="mt-3 inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5 text-xs font-bold text-emerald-800">● Offline • Private • No login needed</div>
            </Section>

            {/* HIGHLIGHT refund */}
            <section id="refund" className="rounded-[20px] border-2 border-amber-300 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-5 md:p-6 shadow-sm relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-200/30 rounded-full blur-2xl" />
              <div className="relative">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 bg-amber-500 text-white rounded-full px-3 py-1 text-xs font-black tracking-widest uppercase shadow-sm">↩ Refund & Return • No Return Policy</span>
                  <span className="inline-flex items-center gap-1.5 bg-white border border-amber-200 rounded-full px-3 py-1 text-xs font-bold text-amber-800">Live plants = perishable • No returns</span>
                </div>
                <h2 className="mt-3 font-black text-[18px] text-[#0a2e1f] flex items-center gap-2"><span className="w-8 h-8 rounded-full bg-amber-500 text-white grid place-items-center text-sm">06</span> Refund & No Return</h2>
                <p className="text-stone-600 mt-2">Live plants are perishable — <b className="text-[#0a2e1f]">we do not accept returns after delivery</b>. This keeps prices honest and plants fresh. Exceptions are only for transit damage, handled with care:</p>
                <div className="mt-4 grid md:grid-cols-3 gap-3">
                  <div className="bg-white rounded-2xl border border-amber-100 p-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white grid place-items-center text-xs">✓</div>
                    <div className="font-black text-sm mt-2 text-[#0a2e1f]">Transit damage</div>
                    <div className="text-xs text-stone-600 mt-1 leading-5">Photo/video within <b>24h</b> → free replacement or refund (owner’s call). We cover courier damage, not neglect after delivery.</div>
                  </div>
                  <div className="bg-white rounded-2xl border border-amber-100 p-4">
                    <div className="w-8 h-8 rounded-full bg-white border border-amber-200 grid place-items-center text-xs">✕</div>
                    <div className="font-black text-sm mt-2 text-[#0a2e1f]">No returns</div>
                    <div className="text-xs text-stone-600 mt-1 leading-5">Change of mind, wrong size choice, or care issues after healthy arrival — not eligible. We offer free lifetime WhatsApp diagnosis instead.</div>
                  </div>
                  <div className="bg-white rounded-2xl border border-amber-100 p-4">
                    <div className="w-8 h-8 rounded-full bg-[#0a2e1f] text-white grid place-items-center text-xs">◷</div>
                    <div className="font-black text-sm mt-2 text-[#0a2e1f]">Cancel before dispatch</div>
                    <div className="text-xs text-stone-600 mt-1 leading-5">Cancel anytime before <b>Shipped</b> from Dashboard → Orders. After dispatch, COD order can be refused at door (no fee).</div>
                  </div>
                </div>
                <ul className="list-disc ml-5 mt-4 space-y-1 text-stone-600 text-sm">
                  <li><b className="text-[#0a2e1f]">Cuttings & sale items:</b> non-returnable once healthy arrival is confirmed.</li>
                  <li><b className="text-[#0a2e1f]">Refunds:</b> if approved, processed in 3–5 working days via same COD reversal/UPI (no advance was taken).</li>
                  <li><b className="text-[#0a2e1f]">How to claim:</b> WhatsApp <a href="https://wa.me/919876543210" className="font-bold text-emerald-700 underline">+91 98765 43210</a> with order ID + 24h photo.</li>
                </ul>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link to="/refund" className="bg-[#0a2e1f] text-white rounded-full px-5 py-2.5 text-sm font-black hover:bg-black transition">Read full Refund Policy →</Link>
                  <a href="https://wa.me/919876543210?text=Hi%20Shaji%20Nursery%20-%20refund%20query" target="_blank" rel="noreferrer" className="bg-white border border-stone-200 rounded-full px-5 py-2.5 text-sm font-bold hover:bg-stone-50 transition">WhatsApp for help</a>
                </div>
              </div>
            </section>

            <Section id="controls" n="07" title="Your controls" icon="⚙" desc="Edit or delete anytime — you own your data.">
              <ul className="list-disc ml-5 mt-2 space-y-1 text-stone-600">
                <li>Dashboard → Profile / Addresses — edit or delete anytime.</li>
                <li>Dashboard → Profile → Danger zone — delete account (orders anonymized).</li>
                <li>Email <a href="mailto:hello@greennest.com" className="font-bold text-emerald-700 underline">hello@greennest.com</a> for data export or deletion — reply within 48h.</li>
              </ul>
            </Section>

            <Section id="retention" n="08" title="Retention" icon="◷" desc="Kept only as long as needed.">
              <p className="text-stone-600 mt-2">Order data retained for GST/legal compliance (up to 7 years anonymized). Addresses deleted on account deletion. LocalStorage cart clears on logout or manual clear. You can request early anonymization via email.</p>
            </Section>

            <div className="bg-[#f6f7f4] border border-[#0a2e1f]/5 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div>
                <h2 className="font-black text-sm text-[#0a2e1f]">Questions? Talk to a human</h2>
                <p className="text-stone-600 mt-1 text-sm">Shaji’s Nursery and Gardens, H34Q+9FP, Poovachal, Kerala 695575 • <a href="tel:+919876543210" className="font-bold text-[#0a2e1f] hover:underline">+91 98765 43210</a> • <a href="mailto:hello@greennest.com" className="font-bold text-emerald-700">hello@greennest.com</a></p>
                <p className="text-xs text-stone-500 mt-1">We reply in ~18 mins, 9am–7pm Mon–Sat. GST bill & care PDF on request.</p>
              </div>
              <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="shrink-0 bg-emerald-600 text-white rounded-full px-6 py-2.5 text-sm font-black hover:bg-emerald-700 shadow-md transition">💬 WhatsApp us →</a>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          <Link to="/terms" className="bg-white border border-[#0a2e1f]/10 rounded-full px-5 py-2.5 text-sm font-bold hover:bg-[#0a2e1f] hover:text-white transition shadow-sm">Terms →</Link>
          <Link to="/refund" className="bg-amber-500 text-white rounded-full px-5 py-2.5 text-sm font-black hover:bg-amber-600 transition shadow-sm">Refund & No Return →</Link>
          <Link to="/faq" className="bg-[#0a2e1f] text-white rounded-full px-5 py-2.5 text-sm font-black hover:bg-black transition shadow-sm">FAQs</Link>
        </div>
      </div>
    </div>
  )
}

function Section({ id, n, title, icon, desc, children }){
  return (
    <section id={id} className="scroll-mt-6 rounded-2xl border border-stone-100 bg-white p-5 shadow-[0_8px_24px_rgba(10,46,31,0.04)] hover:shadow-[0_12px_32px_rgba(10,46,31,0.06)] transition">
      <div className="flex items-start gap-3">
        <span className="w-10 h-10 rounded-2xl bg-[#0a2e1f] text-white grid place-items-center font-black text-xs shrink-0 shadow-sm">{n}</span>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-black text-[15px] text-[#0a2e1f]">{title}</h2>
            <span className="w-6 h-6 rounded-full bg-[#f6f7f4] border border-stone-100 grid place-items-center text-xs text-stone-600">{icon}</span>
          </div>
          <p className="text-xs font-bold tracking-wide text-emerald-700 mt-0.5">{desc}</p>
          <div>{children}</div>
        </div>
      </div>
    </section>
  )
}

function Li({ title, text }){
  return (
    <li className="list-none bg-[#f6f7f4] border border-stone-100 rounded-2xl p-3 flex gap-2.5">
      <span className="w-7 h-7 rounded-full bg-white border border-stone-200 grid place-items-center text-[11px] shrink-0 mt-0.5">✓</span>
      <span className="text-stone-600 text-sm leading-5"><b className="text-[#0a2e1f]">{title}:</b> {text}</span>
    </li>
  )
}
