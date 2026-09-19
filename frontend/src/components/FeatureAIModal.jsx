import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const CONTENT = {
  cart_add: {
    eyebrow: 'Good pick • from our greenhouse',
    title: 'Added to your cart',
    sub: 'We packed this live from Pezhummoodu. Need care tips or COD help? Our growers reply on WhatsApp 9am–7pm.',
    primary: 'Checkout →',
    secondary: 'Keep browsing',
  },
  login: {
    eyebrow: 'Welcome back • Pezhummoodu, since 2022',
    title: 'Your greens missed you',
    sub: 'New seasonal picks just arrived — grown without middlemen. Pick up where you left off or ask a grower for advice.',
    primary: 'See what’s new →',
    secondary: 'Go to dashboard',
  },
  signup: {
    eyebrow: 'You’re in • 12,000+ homes greened',
    title: 'Welcome to the family',
    sub: 'From our 2-acre nursery to your doorstep in 3–5 days. Hand-picked, health-checked, with lifetime WhatsApp care.',
    primary: 'Start exploring →',
    secondary: 'How it works',
  },
  order_complete: {
    eyebrow: 'Order confirmed • thank you',
    title: 'We’ve got your order',
    sub: 'Owner was pinged on WhatsApp and will confirm delivery + extra potting charge (₹39–79) within 30–60 mins.',
    primary: 'Track order',
    secondary: 'Continue shopping',
  },
  general: {
    eyebrow: 'From Pezhummoodu • handpicked',
    title: 'A quick hello from the nursery',
    sub: 'We grow, pack and ship ourselves — no warehouses. Browse seasonal picks or chat with a real grower.',
    primary: 'Browse plants →',
    secondary: 'Maybe later',
  },
};

export default function FeatureAIModal(){
  const { user } = useAuth();
  const [open,setOpen]=useState(false);
  const [source,setSource]=useState('general');
  const lastShownRef = useRef(0);
  const pendingRef = useRef(null);

  const trigger = (src='general')=>{
    const now = Date.now();
    if(now - lastShownRef.current < 8000){
      pendingRef.current = src;
      return;
    }
    lastShownRef.current = now;
    setSource(src);
    setOpen(true);
  };

  useEffect(()=>{
    const handler = (e)=>{
      const src = e.detail?.source || 'general';
      trigger(src);
    };
    window.addEventListener('show-ai-feature', handler);
    return ()=> window.removeEventListener('show-ai-feature', handler);
  },[]);

  useEffect(()=>{
    if(!user) return;
    const key = `welcome-shown-${user.id}`;
    if(sessionStorage.getItem(key)) return;
    const t = setTimeout(()=>{
      if(!open) { trigger('login'); sessionStorage.setItem(key,'1'); }
    }, 1100);
    return ()=> clearTimeout(t);
  },[user]);

  const close = ()=>{
    setOpen(false);
    if(user) localStorage.setItem(`ai-feature-seen-${user.id}`,'1');
    if(pendingRef.current){
      const p = pendingRef.current;
      pendingRef.current=null;
      setTimeout(()=> trigger(p), 1200);
    }
  };
  const openAssistant = ()=>{
    close();
    window.dispatchEvent(new Event("open-ai-assistant"));
  };
  const goPrimary = ()=>{
    close();
    if(source==='cart_add' || source==='order_complete') window.location.href='/cart';
    else if(source==='login') window.location.href='/shop';
    else window.dispatchEvent(new Event("open-ai-assistant"));
  };
  const copy = CONTENT[source] || CONTENT.general;

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="absolute inset-0 bg-[#0a2e1f]/40 backdrop-blur-[3px]" onClick={close} />
          <motion.div
            initial={{ opacity:0, y:14, scale:0.98 }}
            animate={{ opacity:1, y:0, scale:1 }}
            exit={{ opacity:0, y:10, scale:0.98 }}
            transition={{ type:'spring', damping:26, stiffness:320 }}
            className="relative w-full max-w-[420px] overflow-hidden bg-[#fdfbf7] rounded-[28px] shadow-[0_24px_64px_rgba(10,46,31,0.22)] border border-[#0a2e1f]/10 flex flex-col"
            role="dialog" aria-modal="true"
          >
            <button onClick={close} aria-label="Close" className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white border border-[#0a2e1f]/10 grid place-items-center text-[#0a2e1f]/60 hover:text-[#0a2e1f] hover:border-[#0a2e1f]/15 transition">✕</button>

            <div className="px-7 pt-8 pb-6">
              {/* grower note — human */}
              <div className="flex items-center gap-3">
                <img src="https://i.pravatar.cc/100?img=15" alt="grower" className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
                <div className="leading-tight">
                  <div className="text-[11px] font-black tracking-[0.14em] uppercase text-[#0a2e1f]/50">{copy.eyebrow}</div>
                  <div className="text-sm font-bold text-[#0a2e1f]">A note from Shaji — head grower</div>
                </div>
              </div>

              <h3 className="mt-5 text-[24px] leading-[1.1] font-black tracking-tight text-[#0a2e1f]" style={{fontFamily:'Outfit, serif'}}>
                {copy.title}
              </h3>
              <p className="mt-2 text-[13.5px] leading-5 text-[#57534e]">{copy.sub}</p>

              {/* steps — editorial, muted, no emoji AI */}
              <div className="mt-6 grid grid-cols-3 gap-2">
                {[
                  { k:'Browse', v:'Shop → Plant', img:'/ae224e0b-a91b-46d0-81c4-5b0eb6e31d27.png' },
                  { k:'Pick', v:'Pot • Qty', img:'/aloevera plant.png' },
                  { k:'We deliver', v:'COD • 3–5 days', img:'/palm.jpg' },
                ].map(s=>(
                  <div key={s.k} className="bg-white border border-[#0a2e1f]/5 rounded-[16px] p-3 text-center shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-[#f0f3ec] border border-[#0a2e1f]/5 mx-auto overflow-hidden grid place-items-center">
                      <img src={s.img} alt="" className="w-full h-full object-contain p-1" />
                    </div>
                    <div className="text-[11px] font-black tracking-wide mt-2 text-[#0a2e1f]">{s.k}</div>
                    <div className="text-[11px] text-[#0a2e1f]/50 leading-none mt-0.5">{s.v}</div>
                  </div>
                ))}
              </div>

              {/* CTAs — human */}
              <div className="mt-6 flex flex-col gap-2.5">
                <button onClick={goPrimary} className="w-full bg-[#0a2e1f] text-white py-3.5 rounded-full font-black text-[14px] hover:bg-black transition inline-flex items-center justify-center gap-2">
                  {copy.primary}
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={openAssistant} className="w-full bg-white border border-[#0a2e1f]/10 py-3 rounded-full font-bold text-[13px] text-[#0a2e1f] hover:bg-[#f6f7f4] transition">Ask a grower</button>
                  <button onClick={close} className="w-full bg-[#f0f3ec] py-3 rounded-full font-bold text-[13px] text-[#0a2e1f] hover:bg-[#e8f0e3] transition">{copy.secondary}</button>
                </div>
                <p className="text-[11px] text-[#a8a29e] text-center">Real growers • Malayalam & English • 9am–7pm • No bots</p>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-[#0a2e1f]/5 bg-white/60 flex items-center justify-between gap-3">
              <span className="text-[11px] text-[#0a2e1f]/50">Tip: Grower chat is always free — lifetime.</span>
              <button onClick={close} className="text-xs font-bold text-[#0a2e1f] hover:underline underline-offset-4">Close</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
