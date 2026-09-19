import { useToast } from './Toast';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function Footer(){
  const {success}=useToast();
  const {t}=useLanguage();
  const [email,setEmail]=useState('');

  const onSubscribe=(e)=>{
    e.preventDefault();
    if(!email.trim()) return;
    success(t('footer_subscribed'));
    setEmail('');
  };

  return (
    <footer className="relative bg-[#0a2e1f] text-white mt-20 overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a2e1f] to-[#0f2819]" />
        <div className="absolute -top-28 -left-28 w-[640px] h-[520px] bg-emerald-600/8 rounded-full blur-[80px]" />
      </div>

      <div className="relative max-w-[1320px] mx-auto px-4 md:px-6">
        {/* newsletter — compact */}
        <div className="pt-10">
          <div className="rounded-[28px] bg-white text-[#0a2e1f] border border-black/5 shadow-[0_20px_48px_rgba(0,0,0,0.22)] p-6 md:p-7 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1 min-w-0">
              <h3 className="font-[Outfit] text-[22px] md:text-[26px] font-extrabold tracking-[-0.03em] leading-none">
                Get 10% off + free<span className="text-emerald-700"> care guide PDF</span>
              </h3>
              <p className="text-stone-500 text-[14px] leading-relaxed mt-2">No spam. Unsubscribe anytime.</p>
            </div>
            <form onSubmit={onSubscribe} className="w-full lg:max-w-[420px] shrink-0 bg-[#f6f7f4] rounded-full p-1.5 flex items-center gap-2 border border-stone-200">
              <input value={email} onChange={e=>setEmail(e.target.value)} placeholder={t('footer_newsletter_placeholder')} type="email" required className="flex-1 bg-transparent outline-none text-[14px] text-[#0a2e1f] placeholder:text-stone-400 font-medium px-4 py-2"/>
              <button className="shrink-0 bg-[#0a2e1f] text-white rounded-full px-6 py-2.5 text-sm font-extrabold hover:bg-black transition">{t('footer_join')} →</button>
            </form>
          </div>
        </div>

        {/* main — 3 columns clean */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-12 gap-10">
          {/* brand */}
          <div className="lg:col-span-6">
            <Link to="/" className="inline-flex items-center gap-3">
              <img src="/ae224e0b-a91b-46d0-81c4-5b0eb6e31d27.png" alt="Shaji's Nursery and Gardens" className="w-10 h-10 rounded-[12px] object-contain bg-white p-1.5 border border-white/20 shadow-sm" />
              <div className="leading-none">
                <div className="font-[Outfit] font-extrabold text-[17px] tracking-tight text-white">Shaji’s Nursery and Gardens</div>
                <div className="text-[11px] tracking-[0.18em] uppercase font-bold text-white/50">Est. 2022 • Pezhummoodu • Botanical</div>
              </div>
            </Link>
            <p className="mt-4 text-white/65 leading-relaxed max-w-[44ch] text-[14px]">
              {t('footer_brand_desc')} 2-acre organic nursery in Pezhummoodu, Thiruvananthapuram — crush-proof packing, GST bill & lifetime WhatsApp care.
            </p>
            <div className="flex items-center gap-2 mt-5">
              {[
                {label:'IG', href:'#'},
                {label:'WA', href:'https://wa.me/919876543210'},
                {label:'FB', href:'#'},
              ].map(s=>(
                <a key={s.label} href={s.href} target={s.href.startsWith('http')?'_blank':undefined} rel={s.href.startsWith('http')?'noreferrer':undefined} aria-label={s.label} className="w-9 h-9 rounded-full bg-white/10 border border-white/15 grid place-items-center text-xs font-black tracking-widest text-white hover:bg-white hover:text-[#0a2e1f] transition">
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* quick links */}
          <div className="lg:col-span-2">
            <h4 className="font-extrabold text-white tracking-[0.14em] uppercase text-xs mb-4">{t('footer_quick_links')}</h4>
            <ul className="space-y-2.5 text-[14px] font-medium text-white/70">
              <li><Link to="/shop" className="hover:text-white transition">{t('footer_shop_link')}</Link></li>
              <li><Link to="/about" className="hover:text-white transition">{t('footer_about_link')}</Link></li>
              <li><Link to="/contact" className="hover:text-white transition">{t('footer_contact_link')}</Link></li>
            </ul>
          </div>

          {/* support */}
          <div className="lg:col-span-2">
            <h4 className="font-extrabold text-white tracking-[0.14em] uppercase text-xs mb-4">Support</h4>
            <ul className="space-y-2.5 text-[14px] font-medium text-white/70">
              <li><Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition">Terms & Conditions</Link></li>
              <li><Link to="/faq" className="hover:text-white transition">FAQs</Link></li>
            </ul>
          </div>

          {/* contact */}
          <div className="lg:col-span-2">
            <h4 className="font-extrabold text-white tracking-[0.14em] uppercase text-xs mb-4">{t('footer_contact_title')}</h4>
            <div className="space-y-2.5 text-[14px] text-white/70 leading-relaxed">
              <div className="text-white font-medium">{t('footer_contact_address_line1')}<br/><span className="text-white/60 text-[13px]">H34Q+9FP, Poovachal, 695575</span></div>
              <a href="tel:+919876543210" className="block font-bold text-white hover:text-emerald-200 transition">{t('footer_phone')}</a>
              <a href="mailto:hello@greennest.com" className="block text-white/70 hover:text-white transition">{t('footer_email')}</a>
            </div>
          </div>
        </div>

        {/* bottom — minimal */}
        <div className="border-t border-white/10 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-sm">
          <span className="text-white/60 font-medium text-center md:text-left">{t('footer_rights')}</span>
          <span className="text-white/40 text-xs">Made with ♥ in Kerala • GST bill on request</span>
        </div>
      </div>
    </footer>
  )
}
