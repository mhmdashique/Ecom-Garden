import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar(){
  const {user,isAdmin}=useAuth();
  const {cart}=useCart();
  const nav=useNavigate();
  const loc=useLocation();
  const [mobileOpen,setMobileOpen]=useState(false);
  const [bump,setBump]=useState(false);
  const [scrolled,setScrolled]=useState(false);
  const [searchOpen,setSearchOpen]=useState(false);
  const { lang, toggle, t } = useLanguage();
  const count = cart.reduce((s,c)=>s+c.quantity,0);

  useEffect(()=>{ if(count>0){ setBump(true); const tm=setTimeout(()=>setBump(false),600); return ()=>clearTimeout(tm); } },[count]);
  useEffect(()=>{
    const onScroll=()=> setScrolled(window.scrollY>12);
    onScroll();
    window.addEventListener('scroll',onScroll,{passive:true});
    return ()=> window.removeEventListener('scroll',onScroll);
  },[]);
  useEffect(()=>{ setMobileOpen(false); setSearchOpen(false); },[loc.pathname]);
  useEffect(()=>{
    if(mobileOpen) document.body.style.overflow='hidden';
    else document.body.style.overflow='';
    return ()=>{ document.body.style.overflow=''; };
  },[mobileOpen]);

  const isDashboard = loc.pathname.startsWith('/dashboard') || loc.pathname.startsWith('/orders');
  const links=[
    {to:'/', label: t('nav_home')},
    {to:'/shop', label: t('nav_shop')},
    {to:'/about', label: t('nav_about')},
    {to:'/contact', label: t('nav_contact')},
  ];

  const isPublicPath = (to) => {
    if (!to) return true;
    const publicExact = ['/', '/shop', '/about', '/contact', '/privacy', '/terms', '/refund', '/returns', '/return-policy', '/faq', '/login', '/register'];
    if (publicExact.includes(to)) return true;
    if (to.startsWith('/shop?')) return true;
    // /plant/:id, /cart, /checkout, /dashboard, /orders are protected when not logged in
    return false;
  };
  const requireAuth = (e, to) => {
    if (isPublicPath(to)) return true;
    if (!user) {
      e.preventDefault();
      nav('/login', { state: { from: to } });
      return false;
    }
    return true;
  };
  const handleNavClick = (e, to) => { if (!requireAuth(e, to)) return; };
  const handleSearch=(val)=>{
    const q=val.trim();
    if(!q) return;
    nav(`/shop?search=${encodeURIComponent(q)}`);
    setSearchOpen(false);
  };
  const handleCartClick = (e) => requireAuth(e, '/cart');

  return (
    <>
      {/* Top accent line + announcement — modern thin */}
      <div className="hidden md:block bg-[#0a2e1f] text-white relative z-50">
        <div className="h-[2px] w-full bg-gradient-to-r from-emerald-400 via-lime-300 to-emerald-400" />
        <div className="max-w-[1280px] mx-auto px-6 h-7 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 font-semibold tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-300 shadow-[0_0_6px_rgba(132,204,2,0.8)] animate-pulse" />
              PEZHUMMOODU • EST. 2022
            </span>
            <span className="hidden lg:inline text-white/25">—</span>
            <span className="hidden lg:inline text-white/60 font-medium">2-acre organic nursery • Pan-Kerala 3–5 days</span>
          </div>
          <div className="flex items-center gap-3 text-white/70 font-medium">
            <span className="hidden xl:inline-flex items-center gap-1.5"><span className="w-1 h-1 bg-white/40 rounded-full" /> COD • WhatsApp support</span>
            <a href="tel:+919876543210" className="text-white font-bold hover:text-lime-200 transition">+91 98765 43210</a>
            <span className="bg-lime-300 text-[#0a2e1f] rounded-full px-2.5 py-1 text-[10px] font-black tracking-widest">9AM–7PM</span>
          </div>
        </div>
      </div>

      {/* FLOATING ISLAND NAVBAR — seamless green on dashboard, no white halo/gaps */}
      <div className={`sticky top-0 z-50 px-3 md:px-4 transition-colors duration-300 ${isDashboard ? 'bg-[#0a2e1f] pt-2 pb-3 -mb-px border-b border-white/[0.06]' : `${scrolled ? 'pt-3' : 'pt-3 md:pt-4'} bg-transparent`}`}>
        <div className={`mx-auto max-w-[1280px] rounded-[22px] md:rounded-full border backdrop-blur-2xl transition-all duration-300 ${isDashboard ? 'bg-[#123422] border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]' : `bg-white/85 supports-[backdrop-filter]:bg-white/70 ${scrolled ? 'shadow-[0_8px_40px_rgba(10,46,31,0.12),0_1px_0_rgba(255,255,255,0.6)_inset] border-black/[0.06]' : 'shadow-[0_4px_24px_rgba(10,46,31,0.06)] border-black/[0.05]'}`}`}>
          <div className="h-[60px] md:h-[64px] flex items-center gap-3 md:gap-4 px-2 md:px-3">
            {/* Brand */}
            <Link to="/" onClick={(e)=>handleNavClick(e,'/')} className="flex items-center gap-3 pl-1 shrink-0 group">
              <div className={`w-10 h-10 rounded-full grid place-items-center shadow-[0_4px_12px_rgba(10,46,31,0.25)] group-hover:scale-[1.02] transition ${isDashboard ? 'bg-white text-[#0a2e1f]' : 'bg-[#0a2e1f] text-white'}`}>
                <span className="text-[18px] leading-none">🌿</span>
              </div>
              <div className="hidden sm:block leading-tight">
                <div className={`font-black tracking-tight text-[15px] leading-none ${isDashboard ? 'text-white' : 'text-[#0a2e1f]'}`}>Shaji’s Nursery</div>
                <div className={`text-[10px] font-bold tracking-[0.16em] uppercase ${isDashboard ? 'text-white/50' : 'text-[#0a2e1f]/40'}`}>and Gardens</div>
              </div>
            </Link>

            {/* Center pill — desktop */}
            <nav className={`hidden lg:flex items-center gap-1 ml-2 rounded-full p-1 border ${isDashboard ? 'bg-white/10 border-white/10' : 'bg-[#f0f3ec] border-black/[0.03]'}`}>
              {links.map(l=>{
                const active = loc.pathname===l.to;
                return (
                  <Link key={l.to} to={l.to} onClick={(e)=>handleNavClick(e,l.to)} className={`px-4 py-2 rounded-full text-[12.5px] font-black tracking-[0.11em] uppercase transition-all ${active ? (isDashboard ? 'bg-white text-[#0a2e1f] shadow-sm' : 'bg-[#0a2e1f] text-white shadow-sm') : (isDashboard ? 'text-white/60 hover:text-white hover:bg-white/10' : 'text-[#0a2e1f]/60 hover:text-[#0a2e1f] hover:bg-white')}`}>
                    {l.label}
                  </Link>
                )
              })}
            </nav>

            <div className="flex-1 hidden lg:block" />

            {/* Search — modern expand */}
            <div className="hidden md:flex items-center">
              {searchOpen ? (
                <div className={`flex items-center gap-2 border rounded-full pl-4 pr-1.5 py-1.5 w-[340px] animate-[in_0.2s_ease] ${isDashboard ? 'bg-white border-white/20' : 'bg-[#f0f3ec] border-[#0a2e1f]/10'}`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0a2e1f" strokeWidth="2" opacity="0.35"><circle cx="11" cy="11" r="7"/><path d="M20 20L16 16"/></svg>
                  <input autoFocus onKeyDown={e=>{ if(e.key==='Enter'){ handleSearch(e.target.value); } if(e.key==='Escape') setSearchOpen(false); }} placeholder={t('search_placeholder')} className="flex-1 bg-transparent outline-none text-sm placeholder:text-[#0a2e1f]/40 font-medium" />
                  <button onClick={()=>setSearchOpen(false)} className="w-8 h-8 rounded-full bg-white border border-black/5 grid place-items-center text-black/50 hover:text-black">✕</button>
                </div>
              ) : (
                <button onClick={()=>setSearchOpen(true)} aria-label="search" className={`w-10 h-10 rounded-full border grid place-items-center transition ${isDashboard ? 'bg-white/10 border-white/10 text-white/70 hover:bg-white hover:text-[#0a2e1f]' : 'bg-[#f0f3ec] border-black/[0.04] text-[#0a2e1f]/60 hover:bg-white hover:border-black/10 hover:text-[#0a2e1f]'}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M20 20L16 16"/></svg>
                </button>
              )}
            </div>

            {/* Language */}
            <button onClick={toggle} className={`hidden sm:inline-flex items-center gap-1.5 h-10 px-3 rounded-full border transition text-xs font-black ${isDashboard ? 'bg-white/10 hover:bg-white border-white/10 hover:border-white text-white' : 'bg-[#f0f3ec] hover:bg-white border-transparent hover:border-black/5 text-[#0a2e1f]'}`}>
              <span className={`w-6 h-6 rounded-full grid place-items-center text-[10px] leading-none ${isDashboard ? 'bg-white text-[#0a2e1f]' : 'bg-[#0a2e1f] text-white'}`}>A</span>
              {lang==='en' ? 'മ' : 'EN'}
            </button>

            {/* Cart — lime accent when has items */}
            <Link to="/cart" onClick={handleCartClick} className={`relative w-10 h-10 md:w-11 md:h-11 rounded-full grid place-items-center transition shadow-sm border ${count>0 ? 'bg-lime-300 border-lime-300 text-[#0a2e1f] hover:bg-lime-200' : (isDashboard ? 'bg-white border-white text-[#0a2e1f] hover:bg-lime-200' : 'bg-[#0a2e1f] border-[#0a2e1f] text-white hover:bg-black')} ${bump?'animate-[cartBump_0.5s_ease]':''}`}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 6h15l-1.5 9h-13z"/><path d="M6 6L5 2H2"/><circle cx="9" cy="20" r="1.8" fill="currentColor" stroke="none"/><circle cx="18" cy="20" r="1.8" fill="currentColor" stroke="none"/></svg>
              {count>0 && <span className={`absolute -top-1.5 -right-1.5 bg-[#0a2e1f] text-white text-[11px] font-black min-w-[20px] h-[20px] px-1 grid place-items-center rounded-full border-2 ${isDashboard ? 'border-[#0a2e1f]' : 'border-white'} ${bump?'animate-[pop_0.5s_ease]':''}`}>{count}</span>}
            </Link>

            {/* Auth */}
            {user ? (
              <Link to={isAdmin?"/admin":"/dashboard"} className={`hidden sm:flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-full transition ${isDashboard ? 'bg-white text-[#0a2e1f] hover:bg-lime-200' : 'bg-[#0a2e1f] text-white hover:bg-black'}`}>
                <img src={`https://i.pravatar.cc/100?u=${user.email}`} alt="" className={`w-8 h-8 rounded-full object-cover border-2 ${isDashboard ? 'border-[#0a2e1f]/10' : 'border-white/20'}`}/>
                <span className="text-sm font-bold max-w-[84px] truncate hidden lg:block">{user.name}</span>
                <span className={`w-7 h-7 rounded-full grid place-items-center text-xs ${isDashboard ? 'bg-[#0a2e1f]/10' : 'bg-white/15'}`}>→</span>
              </Link>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login" className={`h-10 px-5 grid place-items-center rounded-full text-sm font-bold transition ${isDashboard ? 'text-white hover:bg-white/10' : 'text-[#0a2e1f] hover:bg-[#f0f3ec]'}`}>Login</Link>
                <Link to="/register" className={`h-10 px-6 grid place-items-center rounded-full text-sm font-black transition shadow-[0_4px_16px_rgba(10,46,31,0.2)] ${isDashboard ? 'bg-white text-[#0a2e1f] hover:bg-lime-200' : 'bg-[#0a2e1f] text-white hover:bg-black'}`}>Sign Up</Link>
              </div>
            )}

            {/* Mobile menu */}
            <button onClick={()=>setMobileOpen(v=>!v)} aria-label="Menu" className={`lg:hidden w-11 h-11 rounded-full grid place-items-center shadow-md ${isDashboard ? 'bg-white text-[#0a2e1f]' : 'bg-[#0a2e1f] text-white'}`}>
              <span className="w-4 h-4 flex flex-col justify-between">
                <span className={`h-0.5 bg-white rounded-full transition ${mobileOpen?'rotate-45 translate-y-[6px]':''}`} />
                <span className={`h-0.5 bg-white rounded-full transition ${mobileOpen?'opacity-0':''}`} />
                <span className={`h-0.5 bg-white rounded-full transition ${mobileOpen?'-rotate-45 -translate-y-[6px]':''}`} />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer — modern bottom sheet */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-[60]">
          <div onClick={()=>setMobileOpen(false)} className="absolute inset-0 bg-[#0a2e1f]/30 backdrop-blur-sm" />
          <div className="absolute inset-x-0 bottom-0 bg-[#fdfbf7] rounded-t-[28px] shadow-[0_-20px_60px_rgba(10,46,31,0.25)] max-h-[88dvh] flex flex-col overflow-hidden">
            <div className="mx-auto mt-3 w-10 h-1 rounded-full bg-black/10" />
            <div className="px-5 h-[56px] flex items-center justify-between border-b border-black/5 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#0a2e1f] grid place-items-center text-white text-sm">🌿</div>
                <div className="font-black text-sm text-[#0a2e1f]">Menu</div>
              </div>
              <button onClick={()=>setMobileOpen(false)} className="w-9 h-9 rounded-full bg-white border border-black/5 grid place-items-center">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="relative">
                <input onKeyDown={e=>{ if(e.key==='Enter'){ handleSearch(e.target.value); setMobileOpen(false); }}} placeholder={t('search_placeholder')} className="w-full bg-white border border-black/5 rounded-full pl-4 pr-12 py-3.5 text-sm outline-none focus:border-[#0a2e1f]/20 shadow-sm" />
                <span className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#0a2e1f] text-white grid place-items-center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M20 20L16 16"/></svg></span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {links.map(l=>{
                  const active = loc.pathname===l.to;
                  return (
                    <Link key={l.to} to={l.to} onClick={(e)=>{ handleNavClick(e,l.to); setMobileOpen(false); }} className={`rounded-[20px] p-4 border flex flex-col gap-3 transition ${active?'bg-[#0a2e1f] text-white border-[#0a2e1f] shadow-lg':'bg-white border-black/5 hover:border-black/10'}`}>
                      <span className={`w-9 h-9 rounded-full grid place-items-center text-sm ${active?'bg-white/15 text-white':'bg-lime-300 text-[#0a2e1f]'}`}>{l.to==='/'?'⌂':l.to==='/shop'?'🌿':l.to==='/about'?'◐':'✉'}</span>
                      <span className="font-black text-sm tracking-wide">{l.label}</span>
                    </Link>
                  )
                })}
              </div>

              <button onClick={toggle} className="w-full flex items-center justify-between px-4 py-3 rounded-full bg-white border border-black/5">
                <span className="flex items-center gap-2 text-sm font-bold">🌐 Language</span>
                <span className="text-xs font-black px-3 py-1.5 rounded-full bg-[#0a2e1f] text-white">{lang==='en'?'മലയാളം':'English'}</span>
              </button>

              {user ? (
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-black/5">
                  <img src={`https://i.pravatar.cc/100?u=${user.email}`} alt="" className="w-11 h-11 rounded-full border-2 border-white shadow-sm" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate">{user.name}</div>
                    <div className="text-xs text-black/50 truncate">{user.email}</div>
                  </div>
                  <Link to={isAdmin?'/admin':'/dashboard'} onClick={()=>setMobileOpen(false)} className="w-10 h-10 rounded-full bg-[#0a2e1f] text-white grid place-items-center">→</Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link to="/login" onClick={()=>setMobileOpen(false)} className="h-12 grid place-items-center rounded-full border-2 border-[#0a2e1f] font-bold">Login</Link>
                  <Link to="/register" onClick={()=>setMobileOpen(false)} className="h-12 grid place-items-center rounded-full bg-[#0a2e1f] text-white font-black">Join Now →</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom pill — modern floating */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 pointer-events-none">
        <div className="px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-2">
          <div className="pointer-events-auto mx-auto max-w-[420px] bg-[#0a2e1f] rounded-full p-1.5 flex gap-1 shadow-[0_12px_32px_rgba(10,46,31,0.3)]">
            {[
              {to:'/', label:'Home'},
              {to:'/shop', label:'Shop'},
              {to:'/cart', label:'Cart', badge:count},
              {to: user ? (isAdmin?'/admin':'/dashboard'):'/login', label: user?'You':'Login'},
            ].map(it=>{
              const active = loc.pathname===it.to;
              return (
                <Link key={it.label} to={it.to} onClick={(e)=>{ if(!user && it.to!=='/login') handleNavClick(e,it.to); }} className={`flex-1 py-2.5 rounded-full text-center text-[12px] font-black tracking-widest uppercase transition ${active?'bg-white text-[#0a2e1f] shadow-sm':'text-white/60 hover:text-white hover:bg-white/10'}`}>
                  {it.label} {it.badge>0 && <span className="ml-1 bg-lime-300 text-[#0a2e1f] text-[10px] px-1.5 py-0.5 rounded-full">{it.badge}</span>}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
      <div className="lg:hidden h-[20px]" aria-hidden />

      <style>{`@keyframes cartBump{0%{transform:scale(1)}30%{transform:scale(1.12)}100%{transform:scale(1)}} @keyframes pop{0%{transform:scale(1)}50%{transform:scale(1.18)}100%{transform:scale(1)}} @keyframes in{from{opacity:0;transform:scale(0.98)}to{opacity:1;transform:scale(1)}}`}</style>
    </>
  )
}
