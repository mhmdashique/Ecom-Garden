import { useEffect, useState } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { useLanguage } from '../context/LanguageContext';

export default function Landing(){
  const [plants,setPlants]=useState([]);
  const [email,setEmail]=useState('');
  const {success}=useToast();
  const {t}=useLanguage();
  useEffect(()=>{ api.get('/plants?limit=8&sort=popular').then(r=>setPlants(r.data.plants)).catch(()=>setPlants([])); },[]);

  return (
    <div className="bg-white text-gray-900 overflow-hidden">
      {/* HERO - cleaned */}
      <section className="relative bg-[#f8f7f2]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 lg:px-12 pt-8 md:pt-14 pb-10 md:pb-16 grid lg:grid-cols-[1.05fr_0.95fr] gap-8 lg:gap-10 items-center">
          {/* left */}
          <div>
            <div className="inline-flex items-center gap-2 bg-white border border-green-100 rounded-full px-3 py-1.5 text-xs font-medium shadow-sm">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              {t('hero_badge')}
            </div>
            <h1 className="mt-5 text-[32px] md:text-[52px] font-black leading-[0.95] tracking-tight text-[#0a2e1f]">
              {t('hero_title1')} <br/>
              <span className="text-[#1a6b3c] font-serif italic font-normal">{t('hero_title2')}</span> <br/>
              {t('hero_title3')}
            </h1>
            <p className="mt-4 text-[15px] md:text-[17px] leading-7 text-gray-600 max-w-[520px]">
              {t('hero_desc')}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/shop" className="bg-[#0a2e1f] text-white px-7 py-3.5 rounded-full font-semibold text-sm hover:bg-black transition inline-flex items-center gap-2">
                {t('shop_collection')}
              </Link>
              <Link to="/about" className="bg-white border border-gray-200 text-gray-900 px-7 py-3.5 rounded-full font-semibold text-sm hover:bg-gray-50 transition">
                {t('how_we_grow')}
              </Link>
            </div>
          </div>

          {/* right visual - clean, no floating cards */}
          <div className="relative">
            <div className="relative bg-[#eaf5e9] rounded-[32px] p-3 md:p-4 overflow-hidden">
              <img src="https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=900&q=80" alt="hero plant" className="w-full h-[380px] md:h-[520px] object-cover rounded-[24px]"/>
            </div>
            {/* decorative */}
            <div className="absolute -z-10 -top-6 -right-6 w-32 h-32 bg-emerald-100 rounded-full blur-2xl opacity-60"></div>
            <div className="absolute -z-10 -bottom-6 -left-6 w-40 h-40 bg-yellow-100 rounded-full blur-2xl opacity-60"></div>
          </div>
        </div>
      </section>



      {/* MARQUEE */}
      <div className="overflow-hidden bg-[#0a2e1f] py-3 border-y border-emerald-900">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(3)].map((_, i) => (
            <span key={i} className="flex items-center gap-6 mx-6 text-white text-sm font-bold tracking-wide">
              <span className="text-emerald-400 animate-star">✦</span>
              Cuttings &amp; Potted Plants Available
              <span className="text-emerald-400 animate-star">✦</span>
              Wholesale &amp; Retail Available
              <span className="text-emerald-400 animate-star">✦</span>
              COD Available Across Kerala
              <span className="text-emerald-400 animate-star">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* BEST SELLING - PREMIUM REDESIGN */}
      <section className="bg-[#fdfbf7] border-y border-[#f0ebe3] py-10 md:py-14">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-7">
            <h2 className="text-[26px] md:text-[32px] font-black tracking-tight leading-none">{t('landing_best_title')}</h2>
            <div className="flex items-center gap-2">
              <span className="hidden md:inline text-xs font-bold tracking-widest uppercase text-gray-400 mr-1">{t('filter')}</span>
              <Link to="/shop?sort=popular" className="bg-[#0a0a0a] text-white text-xs font-black px-4 py-2 rounded-full shadow">{t('popular')}</Link>
              <Link to="/shop?sort=newest" className="bg-white border border-gray-200 text-xs font-bold px-4 py-2 rounded-full hover:border-gray-300">{t('new_in')}</Link>
              <Link to="/shop" className="bg-white border border-gray-200 text-xs font-bold px-4 py-2 rounded-full hover:border-gray-300">{t('sale')}</Link>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {[...new Map(plants.map(p=>[p.id,p])).values()].slice(0,8).map(p=> {
              const hasVariants = Array.isArray(p.variants) && p.variants.length>0;
              const potVariant = hasVariants ? p.variants.find(v=>v.id==='plastic-pot' && !v.disabled) : null;
              const available = hasVariants ? p.variants.filter(v=>!v.disabled) : [];
              const price = hasVariants ? (potVariant?.priceMin ?? Math.min(...available.map(v=>v.priceMin))) : (p.discount_price || p.price);
              const originalPrice = hasVariants ? null : (p.discount_price ? p.price : null);
              return (
                <Link key={p.id} to={`/plant/${p.id}`} className="group bg-white rounded-[16px] border border-gray-100 overflow-hidden hover:shadow-md hover:border-gray-200 transition shadow-sm">
                  <div className="relative bg-[#f6f7f4] overflow-hidden">
                    <img src={encodeURI(p.images?.[0]||'')} alt={p.name} className="w-full h-[160px] md:h-[200px] object-cover group-hover:scale-105 transition duration-500"/>
                    {!hasVariants && p.discount_price && <span className="absolute top-2.5 left-2.5 bg-[#0a7a2b] text-white text-[11px] font-black px-2 py-1 rounded-full">{t('landing_sale_badge')}</span>}
                    {hasVariants && <span className="absolute top-2.5 left-2.5 bg-emerald-600 text-white text-[10px] font-black px-2 py-1 rounded-full">{available.length} {t('landing_variants_fixed')}</span>}
                    <span className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur text-[11px] font-bold px-2 py-1 rounded-full border text-gray-700">{p.stock_qty} {t('landing_stock_left')}</span>
                  </div>
                  <div className="p-3 md:p-3.5">
                    <div className="font-bold text-sm leading-tight line-clamp-1">{p.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{p.sunlight} • {t('landing_stock_label')} {p.stock_qty} {hasVariants && <span className="text-emerald-600 font-bold">• {available.length} {t('landing_options')}</span>}</div>
                    <div className="mt-2.5 flex items-center justify-between gap-2">
                      <div className="flex flex-col">
                        <span className="font-black text-[#0f7a4a] text-sm">₹{Number(price).toFixed(2)} {hasVariants && <span className="text-[10px] font-bold bg-[#f8f7f2] border px-1.5 py-0.5 rounded-full ml-1">{t('landing_fixed')}</span>}</span>
                        {hasVariants ? <span className="text-[11px] text-gray-500">{t('landing_with_pot')}</span> : originalPrice && <span className="text-xs line-through text-gray-400">₹{originalPrice.toFixed(2)}</span>}
                      </div>
                      <span className="bg-[#0f7a4a] group-hover:bg-[#0a5e36] text-white text-[11px] font-black px-3 py-1.5 rounded-full transition-colors">{t('landing_add_to_cart')}</span>
                    </div>
                  </div>
                </Link>
              )
            })}
            {plants.length===0 && <div className="col-span-full text-center py-10"><div className="w-8 h-8 border-2 border-gray-200 border-t-[#0a2e1f] rounded-full animate-spin mx-auto"></div><p className="text-sm text-gray-500 mt-3">{t('landing_loading')}</p></div>}
          </div>

          <div className="text-center mt-7">
            <Link to="/shop" className="inline-flex items-center gap-2 bg-[#0a2e1f] text-white px-7 py-3 rounded-full font-black text-sm hover:bg-black transition shadow">
              {t('view_all_plants')}
            </Link>
          </div>
        </div>
      </section>

      {/* CURATED FOR EVERY SPACE — replaces Kerala-wide Service block */}
      <section className="bg-white py-12 md:py-16">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 lg:px-12">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#f0fdf4] border border-emerald-200 rounded-full px-3 py-1.5 text-[11px] font-black tracking-widest uppercase text-emerald-700">✦ {t('curated_badge')}</div>
              <h2 className="mt-4 text-[30px] md:text-[42px] font-black leading-[0.9] tracking-tight text-[#0a2e1f]">
                {t('curated_title1')}<br/>
                <span className="font-serif italic font-normal text-emerald-700">{t('curated_title2')}</span>
              </h2>
            </div>
            <p className="text-sm md:text-[15px] leading-6 text-gray-600 max-w-[440px]">{t('curated_desc')}</p>
          </div>

          <div className="grid md:grid-cols-12 gap-4">
            {/* Large feature */}
            <div className="md:col-span-7 relative rounded-[28px] overflow-hidden bg-[#0a2e1f] text-white min-h-[340px] flex flex-col justify-end p-6 md:p-8">
              <img src="https://images.unsplash.com/photo-1585328001265-45133cc8af29?w=900" alt="garden landscaping" className="absolute inset-0 w-full h-full object-cover opacity-50"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
              <div className="relative">
                <div className="inline-flex items-center gap-1.5 bg-white text-[#0a2e1f] px-3 py-1 rounded-full text-xs font-black">◉ {t('curated_feature_badge')}</div>
                <h3 className="mt-3 text-2xl md:text-3xl font-black leading-tight">{t('curated_feature_title').split(' & ')[0]} &<br/>{t('curated_feature_title').split(' & ')[1] || ''}</h3>
                <p className="mt-2 text-sm text-white/80 max-w-[420px]">{t('curated_feature_desc')}</p>
                <div className="mt-4 flex gap-2">
                  <a href="https://wa.me/919876543210?text=Hi Verdant, I need landscape design for my space" target="_blank" className="bg-white text-[#0a2e1f] px-5 py-2.5 rounded-full text-sm font-black">{t('curated_feature_cta1')}</a>
                  <a href="/shop" className="bg-white/15 backdrop-blur border border-white/20 text-white px-5 py-2.5 rounded-full text-sm font-bold">{t('curated_feature_cta2')}</a>
                </div>
              </div>
            </div>
            {/* Side stack */}
            <div className="md:col-span-5 grid grid-rows-2 gap-4">
              <div className="rounded-[24px] border border-gray-100 p-5 flex gap-4 items-center bg-[#fdfbf7]">
                <img src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300" alt="balcony" className="w-24 h-24 rounded-2xl object-cover shrink-0"/>
                <div>
                  <div className="text-xs font-black tracking-widest uppercase text-emerald-700">{t('curated_balcony_label')}</div>
                  <div className="font-black leading-tight mt-1">{t('curated_balcony_title')}</div>
                  <div className="text-xs text-gray-500 mt-1">{t('curated_balcony_desc')}</div>
                </div>
              </div>
              <div className="rounded-[24px] border border-gray-100 p-5 flex gap-4 items-center bg-white">
                <img src="https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=300" alt="office" className="w-24 h-24 rounded-2xl object-cover shrink-0"/>
                <div>
                  <div className="text-xs font-black tracking-widest uppercase text-emerald-700">{t('curated_office_label')}</div>
                  <div className="font-black leading-tight mt-1">{t('curated_office_title')}</div>
                  <div className="text-xs text-gray-500 mt-1">{t('curated_office_desc')}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Proof bar */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[#f8f7f2] rounded-2xl px-4 py-4 border border-gray-100 text-center">
              <div className="text-xl font-black text-[#0a2e1f]">12k+</div><div className="text-xs font-bold tracking-widest uppercase text-gray-500">{t('curated_stat_homes')}</div>
            </div>
            <div className="bg-emerald-600 rounded-2xl px-4 py-4 text-center text-white">
              <div className="text-xl font-black">4.9★</div><div className="text-xs font-bold tracking-widest uppercase text-emerald-100">3,421 {t('curated_stat_rating')}</div>
            </div>
            <div className="bg-[#f8f7f2] rounded-2xl px-4 py-4 border border-gray-100 text-center">
              <div className="text-xl font-black text-[#0a2e1f]">48h</div><div className="text-xs font-bold tracking-widest uppercase text-gray-500">{t('curated_stat_eta')}</div>
            </div>
            <div className="bg-[#0a2e1f] rounded-2xl px-4 py-4 text-center text-white">
              <div className="text-xl font-black">2-acre</div><div className="text-xs font-bold tracking-widest uppercase text-white/60">{t('curated_stat_nursery')}</div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
            <span className="inline-flex items-center gap-2"><span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> {t('curated_footer_note')}</span>
            <span className="font-mono">H34Q+9FP, Pezhummoodu, Thiruvananthapuram 695575</span>
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="max-w-[1280px] mx-auto px-4 md:px-8 lg:px-12 py-12 md:py-16">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="relative">
            <img src="https://images.unsplash.com/photo-1446071103084-c257b5f70672?w=800" alt="nursery" className="w-full h-[360px] md:h-[480px] object-cover rounded-[32px]"/>
            <div className="absolute bottom-4 left-4 right-4 md:left-6 md:right-auto bg-white rounded-2xl p-4 shadow-xl flex gap-4 max-w-[340px]">
              <div className="w-12 h-12 rounded-full bg-emerald-100 grid place-items-center text-xl">🌿</div>
              <div>
                <div className="font-bold text-sm">{t('landing_nursery_fresh_title')}</div>
                <div className="text-xs text-gray-500">{t('landing_nursery_fresh_desc')}</div>
              </div>
            </div>
          </div>
          <div>
            <div className="text-xs tracking-[0.2em] uppercase text-emerald-700 font-bold">{t('why_love_us')}</div>
            <h3 className="text-[30px] md:text-[40px] font-black leading-[0.95] tracking-tight mt-2">{t('not_just_plant')}<br/><span className="font-serif italic font-normal text-emerald-700">{t('healthy_start')}</span></h3>
            <div className="mt-8 grid sm:grid-cols-2 gap-6">
              {[
                { t:t('landing_organic_title'), d:t('landing_organic_desc'), icon:'🌱'},
                { t:t('landing_expert_title'), d:t('landing_expert_desc'), icon:'👩‍🌾'},
                { t:t('landing_safe_title'), d:t('landing_safe_desc'), icon:'📦'},
                { t:t('landing_eco_title'), d:t('landing_eco_desc'), icon:'♻️'},
              ].map(f=>(
                <div key={f.t} className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#f8f7f2] grid place-items-center text-lg shrink-0">{f.icon}</div>
                  <div><div className="font-bold text-sm">{f.t}</div><div className="text-sm text-gray-500 leading-5 mt-1">{f.d}</div></div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex gap-3">
              <Link to="/about" className="bg-[#0a2e1f] text-white px-6 py-3 rounded-full text-sm font-bold">{t('landing_our_story')}</Link>
              <span className="text-sm text-gray-500 self-center">{t('landing_reviews_rating')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* NEW BUSINESS IDEA - NURSERY DIRECT PROMISE (replaces Two ways) */}
      <section className="bg-[#0a2e1f] text-white py-12 md:py-16 overflow-hidden relative">
        <div className="absolute -top-20 -right-20 w-[420px] h-[420px] bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-[380px] h-[380px] bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 lg:px-12 relative">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 md:gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1.5 text-xs font-black tracking-widest uppercase text-emerald-300">{t('landing_direct_badge')}</div>
              <h2 className="mt-4 text-[28px] md:text-[42px] font-black leading-[0.9] tracking-tight">{t('landing_grown_title1')}<br/><span className="font-serif italic font-normal text-emerald-300">{t('landing_grown_title2')}</span></h2>
              <p className="mt-4 text-sm md:text-[15px] leading-6 text-white/70 max-w-[560px]">{t('landing_grown_desc')}</p>
              <div className="mt-7 grid grid-cols-3 gap-3">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                  <div className="text-xl font-black text-amber-300">{t('landing_stat_48h')}</div>
                  <div className="text-xs font-bold leading-tight mt-1">{t('landing_stat_48h_label')}</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                  <div className="text-xl font-black text-emerald-300">{t('landing_stat_damage')}</div>
                  <div className="text-xs font-bold leading-tight mt-1">{t('landing_stat_damage_label')}</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                  <div className="text-xl font-black">{t('landing_stat_replace')}</div>
                  <div className="text-xs font-bold leading-tight mt-1">{t('landing_stat_replace_label')}</div>
                </div>
              </div>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link to="/about" className="bg-white text-[#0a2e1f] px-6 py-3 rounded-full text-sm font-black">{t('landing_meet_growers')}</Link>
                <Link to="/shop" className="bg-emerald-600 text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-emerald-700">{t('landing_shop_live')}</Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {[
                { title:t('landing_handpicked_title'), desc:t('landing_handpicked_desc'), icon:'🤲', img:'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400' },
                { title:t('landing_livepacked_title'), desc:t('landing_livepacked_desc'), icon:'📦', img:'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400' },
                { title:t('landing_qr_title'), desc:t('landing_qr_desc'), icon:'📱', img:'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=400' },
                { title:t('landing_lifetime_title'), desc:t('landing_lifetime_desc'), icon:'💬', img:'https://images.unsplash.com/photo-1446071103084-c257b5f70672?w=400' },
              ].map(card=>(
                <div key={card.title} className="bg-white rounded-[20px] overflow-hidden border border-white/10">
                  <img src={card.img} alt={card.title} className="w-full h-28 object-cover"/>
                  <div className="p-4">
                    <div className="text-xs font-black tracking-widest uppercase text-emerald-700 flex items-center gap-1"><span>{card.icon}</span> {card.title}</div>
                    <div className="text-sm font-bold leading-tight mt-1 text-gray-900">{card.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 bg-white rounded-[24px] p-4 md:p-5 flex flex-col md:flex-row items-center gap-4 justify-between text-gray-900">
            <div className="flex items-center gap-3">
              <img src="https://i.pravatar.cc/100?img=5" alt="grower" className="w-10 h-10 rounded-full object-cover"/>
              <div><div className="font-black text-sm">{t('landing_quote')}</div><div className="text-xs text-gray-500">{t('landing_quote_author')}</div></div>
            </div>
            <div className="flex items-center gap-2 text-amber-500 text-sm font-black">★★★★★ <span className="text-gray-900">4.9/5</span><span className="text-gray-400 font-normal">• 3,421 reviews</span></div>
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="max-w-[1280px] mx-auto px-4 md:px-8 lg:px-12 py-10 md:py-14">
        <div className="bg-[#0a2e1f] rounded-[32px] p-6 md:p-10 flex flex-col lg:flex-row items-center gap-6 md:gap-8 text-white relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl"></div>
          <div className="flex-1 relative">
            <div className="text-emerald-300 text-xs tracking-[0.2em] uppercase font-bold">{t('landing_newsletter_badge')}</div>
            <h3 className="text-[26px] md:text-[32px] font-black leading-none mt-2">{t('landing_newsletter_title1')}<br/>{t('landing_newsletter_title2')}</h3>
            <p className="text-white/70 text-sm mt-3">{t('landing_newsletter_desc')}</p>
          </div>
          <form onSubmit={e=>{e.preventDefault(); success(`Thanks ${email}! Check your email — 10% off sent.`); setEmail('');}} className="flex-1 w-full lg:max-w-[420px] relative flex gap-2 bg-white rounded-full p-1.5">
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder={t('landing_your_email')} required type="email" className="flex-1 bg-transparent px-4 py-2 text-sm text-black outline-none placeholder:text-gray-400"/>
            <button className="bg-[#0a2e1f] text-white px-6 py-2.5 rounded-full text-sm font-bold shrink-0">{t('landing_join')}</button>
          </form>
        </div>
      </section>

    </div>
  )
}

