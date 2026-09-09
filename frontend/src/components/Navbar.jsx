import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar(){
  const {user,logout,isAdmin}=useAuth();
  const {cart}=useCart();
  const nav=useNavigate();
  const loc=useLocation();
  const [mobileOpen,setMobileOpen]=useState(false);
  const [showUserMenu,setShowUserMenu]=useState(false);
  const [bump,setBump]=useState(false);
  const { lang, toggle, t } = useLanguage();
  const count = cart.reduce((s,c)=>s+c.quantity,0);
  useEffect(()=>{ if(count>0){ setBump(true); const t=setTimeout(()=>setBump(false),600); return ()=>clearTimeout(t); } },[count]);
  const links=[
    {to:'/', label: t('nav_home')},
    {to:'/shop', label: t('nav_shop')},
    {to:'/about', label: t('nav_about')},
    {to:'/contact', label: t('nav_contact')},
  ];
  return (
    <>
      {/* New premium navbar - dark emerald top + white main */}
      <div className="bg-[#0a2e1f] text-emerald-100 text-xs hidden md:block">
        <div className="max-w-[1320px] mx-auto px-6 h-7 flex items-center justify-between">
          <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> Est. 2022 • Pezhummoodu, TVM • Organic since day one</span>
          <span className="font-bold tracking-widest uppercase">Free support • 9am-7pm • +91 98765 43210</span>
        </div>
      </div>

      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-[1320px] mx-auto px-4 md:px-6">
          <div className="h-[62px] flex items-center justify-between gap-4">
            {/* logo */}
            <Link to="/" className="flex items-center gap-3 shrink-0">
              <div className="w-11 h-11 rounded-xl bg-[#0a2e1f] text-white grid place-items-center text-xl border-2 border-emerald-200">🌿</div>
              <div className="leading-none hidden sm:block">
                <div className="font-serif text-[20px] font-black tracking-tight text-[#0a2e1f]">Verdant</div>
                <div className="text-[10px] tracking-[0.18em] uppercase font-bold text-gray-500 -mt-1">Est. 2022 • Botanical</div>
              </div>
              <div className="sm:hidden font-black text-[#0a2e1f]">Verdant</div>
            </Link>

            {/* desktop nav - underline style */}
            <nav className="hidden lg:flex items-center gap-8">
              {links.map(l=>{
                const active = loc.pathname===l.to;
                return (
                  <Link key={l.to} to={l.to} className={`relative text-[13px] font-bold tracking-[0.14em] uppercase py-2 ${active?'text-[#0a2e1f]':'text-gray-500 hover:text-[#0a2e1f]'}`}>
                    {l.label}
                    <span className={`absolute left-0 -bottom-1 h-[2px] bg-[#0a2e1f] transition-all ${active?'w-full':'w-0'}`}></span>
                  </Link>
                )
              })}
            </nav>

            {/* search + actions */}
            <div className="flex items-center gap-2">
              <button onClick={toggle} className="hidden md:inline-flex items-center gap-1 border border-gray-200 bg-white px-3 py-1.5 rounded-full text-xs font-black hover:bg-gray-50" title="Switch language">{lang==='en'?'മ': 'EN'} <span className="text-[11px]">{lang==='en'?'ML':'മലയാളം'}</span></button>
              <div className="hidden md:flex items-center bg-[#f6f7f4] border rounded-full px-3 py-1.5">
                <span className="text-gray-400 text-sm">⌕</span>
                <input onKeyDown={e=>{ if(e.key==='Enter'){ nav(`/shop?search=${encodeURIComponent(e.target.value)}`); e.target.value=''; }}} placeholder={t('search_placeholder')} className="bg-transparent outline-none text-sm ml-2 placeholder:text-gray-400 w-32 lg:w-44 focus:w-56 transition-all"/>
              </div>

              <Link to="/cart" id="cart-icon" className={`relative w-10 h-10 rounded-full bg-[#f6f7f4] border grid place-items-center hover:bg-white hover:shadow transition ${bump?'animate-[cartBump_0.6s_ease]':''}`}>
                <span className={bump?'animate-[wiggle_0.4s_ease]':''}>🛒</span>
                {count>0 && <span className={`absolute -top-1 -right-1 bg-red-500 text-white text-[11px] font-black min-w-[18px] h-[18px] grid place-items-center rounded-full border-2 border-white ${bump?'animate-[pulse_0.6s_ease]':''}`}>{count}</span>}
                <style>{`@keyframes cartBump{0%{transform:scale(1)}30%{transform:scale(1.15)}60%{transform:scale(0.95)}100%{transform:scale(1)}} @keyframes wiggle{0%,100%{transform:rotate(0)}25%{transform:rotate(-12deg)}75%{transform:rotate(12deg)}}`}</style>
              </Link>

              {user ? (
                <div className="relative hidden sm:block">
                  <button onClick={()=>setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 border-2 border-[#0a2e1f] rounded-full pl-1 pr-3 py-1 bg-[#0a2e1f] text-white hover:bg-black transition">
                    <img src={`https://i.pravatar.cc/100?u=${user.email}`} alt="" className="w-7 h-7 rounded-full object-cover border border-white/30"/>
                    <span className="text-xs font-black max-w-[90px] truncate hidden lg:block">{user.name}</span>
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-2xl border overflow-hidden z-50">
                      <div className="p-4 bg-[#f6f7f4] border-b">
                        <div className="font-black text-sm truncate">{user.name}</div>
                        <div className="text-xs text-gray-500 truncate">{user.email}</div>
                        <div className="text-xs text-emerald-700 font-bold mt-1">Est. member since 2022</div>
                      </div>
                      <div className="p-2 space-y-1 text-sm">
                        <Link to={isAdmin?"/admin":"/dashboard"} onClick={()=>setShowUserMenu(false)} className="block px-3 py-2.5 rounded-xl hover:bg-gray-50 font-bold">Dashboard →</Link>
                        <button onClick={()=>{logout(); setShowUserMenu(false); nav('/');}} className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-red-50 text-red-600 font-bold">Logout</button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link to="/login" className="text-sm font-bold px-4 py-2 rounded-full hover:bg-gray-100">Login</Link>
                  <Link to="/register" className="bg-emerald-600 text-white text-sm font-black px-5 py-2.5 rounded-full hover:bg-emerald-700 shadow">Sign Up</Link>
                </div>
              )}

              <button onClick={()=>setMobileOpen(!mobileOpen)} className="lg:hidden w-10 h-10 rounded-full bg-[#0a2e1f] text-white grid place-items-center ml-1">
                <span className="text-sm">{mobileOpen?'✕':'☰'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t bg-white">
            <div className="px-4 py-3 space-y-3">
              <div className="relative">
                <input onKeyDown={e=>{ if(e.key==='Enter'){ nav(`/shop?search=${encodeURIComponent(e.target.value)}`); setMobileOpen(false); }}} placeholder={t('search_placeholder')} className="w-full bg-[#f6f7f4] border rounded-full pl-4 pr-10 py-3 text-sm outline-none"/>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">⌕</span>
              </div>
              <button onClick={toggle} className="w-full border border-gray-200 bg-white px-4 py-2.5 rounded-full text-xs font-black flex items-center justify-center gap-2">🌐 {lang==='en'?'Switch to Malayalam — മലയാളം':'Switch to English'} </button>
            </div>
            <div className="px-4 pb-4 space-y-2">
              {links.map(l=>(
                <Link key={l.to} to={l.to} onClick={()=>setMobileOpen(false)} className={`flex justify-between items-center px-4 py-3.5 rounded-2xl font-black text-sm border ${loc.pathname===l.to?'bg-[#0a2e1f] text-white border-[#0a2e1f]':'bg-[#f6f7f4] border-gray-100'}`}>
                  <span className="tracking-widest uppercase">{l.label}</span><span>→</span>
                </Link>
              ))}
              {!user && (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link to="/login" onClick={()=>setMobileOpen(false)} className="text-center border-2 border-[#0a2e1f] rounded-full py-3 font-black text-sm">Login</Link>
                  <Link to="/register" onClick={()=>setMobileOpen(false)} className="text-center bg-emerald-600 text-white rounded-full py-3 font-black text-sm">Join Now</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t shadow-[0_-8px_20px_rgba(0,0,0,0.08)]">
        <div className="grid grid-cols-4">
          {[
            {to:'/', icon:'🏠', label:'Home'},
            {to:'/shop', icon:'🌿', label:'Shop'},
            {to:'/cart', icon:'🛒', label:'Cart', badge:count},
            {to: user ? (isAdmin?'/admin':'/dashboard'):'/login', icon:'👤', label: user?'You':'Login'},
          ].map(it=>(
            <Link key={it.label} to={it.to} className={`flex flex-col items-center py-3 gap-1 relative ${loc.pathname===it.to?'text-emerald-700 bg-emerald-50':'text-gray-400'}`}>
              <span className="text-lg leading-none">{it.icon}</span>
              <span className="text-[10px] font-black tracking-widest uppercase">{it.label}</span>
              {it.badge>0 && <span className="absolute top-1 right-6 bg-red-500 text-white text-[10px] font-black min-w-[14px] h-[14px] grid place-items-center rounded-full">{it.badge}</span>}
            </Link>
          ))}
        </div>
        <div className="h-[env(safe-area-inset-bottom)]"></div>
      </div>
      <div className="lg:hidden h-[56px]"></div>
    </>
  )
}
