import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function About(){
  const { t } = useLanguage();
  return (
    <div className="bg-[#fdfbf7] text-[#1c1917] overflow-hidden selection:bg-emerald-200">
      {/* HERO - premium sage/cream + glass */}
      <section className="relative overflow-hidden bg-[#f8f7f2] border-b border-[#eee8dc]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -left-20 w-[520px] h-[520px] bg-[#e8f0e3] rounded-full blur-[80px] opacity-70" />
          <div className="absolute top-10 right-0 w-[420px] h-[420px] bg-emerald-100 rounded-full blur-[70px] opacity-50" />
        </div>
        <div className="relative max-w-[1280px] mx-auto px-4 md:px-8 lg:px-12 py-10 md:py-16 grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur border border-stone-200 rounded-full px-3.5 py-1.5 text-xs font-bold tracking-widest uppercase text-emerald-700 shadow-sm">{t('about_badge')}</div>
            <h1 className="mt-4 text-[36px] md:text-[52px] font-black leading-[0.9] tracking-[-0.04em] text-[#0a2e1f]">{t('about_hero_title1')} <span className="font-[Fraunces] italic font-normal text-emerald-700">{t('about_hero_title2')}</span></h1>
            <p className="mt-4 text-[15px] leading-7 text-stone-600 max-w-[560px]">{t('about_hero_desc')}</p>
            <div className="mt-6 flex gap-3">
              <Link to="/shop" className="bg-[#0a2e1f] text-white px-6 py-3 rounded-full text-sm font-black hover:bg-black transition shadow-[0_12px_24px_rgba(10,46,31,0.18)]">{t('about_shop_plants')}</Link>
              <a href="#story" className="bg-white border border-stone-200 px-6 py-3 rounded-full text-sm font-bold hover:bg-stone-50 transition shadow-sm">{t('about_our_story')}</a>
            </div>
            {/* stats glass */}
            <div className="mt-8 grid grid-cols-3 gap-3 max-w-[460px]">
              <div className="bg-white rounded-[20px] border border-stone-100 p-4 text-center shadow-[0_8px_24px_rgba(10,46,31,0.06)]">
                <div className="text-xl font-black tracking-tight text-[#0a2e1f]">50k+</div><div className="text-[11px] font-bold tracking-widest uppercase text-stone-500">{t('about_stats_plants')}</div>
              </div>
              <div className="bg-[#0a2e1f] rounded-[20px] p-4 text-center text-white shadow-md">
                <div className="text-xl font-black">4.9★</div><div className="text-[11px] font-bold tracking-widest uppercase text-white/60">{t('about_stats_reviews')}</div>
              </div>
              <div className="bg-white rounded-[20px] border border-stone-100 p-4 text-center shadow-[0_8px_24px_rgba(10,46,31,0.06)]">
                <div className="text-xl font-black tracking-tight text-[#0a2e1f]">12k+</div><div className="text-[11px] font-bold tracking-widest uppercase text-stone-500">{t('about_stats_families')}</div>
              </div>
            </div>
            <div className="mt-3 inline-flex items-center gap-2 text-xs text-stone-500 bg-white border rounded-full px-3 py-1.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Est. 2022 • Pezhummoodu, Thiruvananthapuram • 2-acre organic farm
            </div>
          </div>
          <div className="relative">
            <div className="bg-white/60 backdrop-blur rounded-[32px] p-2 md:p-3 shadow-[0_24px_64px_rgba(10,46,31,0.12)] border border-white/60">
              <img src="https://images.unsplash.com/photo-1446071103084-c257b5f70672?w=900" alt="nursery" className="w-full h-[380px] md:h-[500px] object-cover rounded-[24px]"/>
            </div>
            <div className="absolute -bottom-4 left-4 right-4 md:left-6 md:right-auto bg-white/85 backdrop-blur-xl rounded-[20px] p-4 flex gap-3 shadow-xl border border-white/60 max-w-[360px]">
              <span className="w-11 h-11 rounded-2xl bg-emerald-600 text-white grid place-items-center shadow-sm">🌱</span>
              <div><div className="font-black text-sm tracking-tight">{t('about_organic_title')}</div><div className="text-xs text-stone-500 leading-5">{t('about_organic_desc')}</div></div>
            </div>
            <div className="absolute -top-3 -right-3 bg-white rounded-full px-4 py-2 shadow-lg border border-stone-100 flex items-center gap-2 animate-float hidden md:flex">
              <span className="w-7 h-7 rounded-full bg-[#0a2e1f] text-white grid place-items-center text-xs">✓</span>
              <span className="text-xs font-black">Organic • Zero pesticides</span>
            </div>
          </div>
        </div>
      </section>

      {/* OUR STORY */}
      <section id="story" className="max-w-[1280px] mx-auto px-4 md:px-8 lg:px-12 py-12 md:py-16">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
          <div>
            <div className="text-xs tracking-[0.2em] uppercase font-black text-emerald-700">{t('about_story_label')}</div>
            <h2 className="mt-2 text-[30px] md:text-[42px] font-black leading-[0.95] tracking-[-0.03em] text-[#0a2e1f]">{t('about_story_title1')}<br/><span className="font-[Fraunces] italic font-normal text-emerald-700">{t('about_story_title2')}</span></h2>
            <div className="mt-6 space-y-4 text-[15px] leading-7 text-stone-600">
              <p>{t('about_story_p1')}</p>
              <p>{t('about_story_p2')}</p>
              <p>{t('about_story_p3')}</p>
              <p className="bg-white border border-stone-100 rounded-2xl p-4 shadow-sm">{t('about_story_p4')}</p>
            </div>
          </div>
          <div className="space-y-4 lg:sticky lg:top-6">
            <div className="bg-white rounded-[28px] p-2 shadow-[0_16px_32px_rgba(10,46,31,0.06)] border border-stone-100">
              <img src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=700" alt="story" className="w-full h-[300px] object-cover rounded-[20px]"/>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#f8f7f2] rounded-[20px] p-5 border border-stone-100">
                <div className="w-8 h-8 rounded-full bg-white border grid place-items-center text-xs">🌱</div>
                <div className="font-black mt-2">2022</div><div className="text-sm text-stone-600 leading-5">{t('about_year_2022')}</div>
              </div>
              <div className="bg-[#0a2e1f] rounded-[20px] p-5 text-white shadow-md">
                <div className="w-8 h-8 rounded-full bg-white/15 border border-white/20 grid place-items-center text-xs">✦</div>
                <div className="font-black mt-2">2026</div><div className="text-sm text-white/70 leading-5">{t('about_year_2026')}</div>
              </div>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-[20px] p-4 flex gap-3 items-center">
              <span className="w-9 h-9 rounded-xl bg-emerald-600 text-white grid place-items-center shrink-0">💚</span>
              <p className="text-sm leading-5 font-medium">{t('about_promise')}</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-12 relative">
          <div className="hidden md:block absolute top-[34px] left-6 right-6 h-px bg-gradient-to-r from-stone-200 via-emerald-200 to-stone-200" />
          <div className="grid md:grid-cols-4 gap-4 relative">
            {[
              { year:'2022', title:t('about_timeline1_title'), desc:t('about_timeline1_desc') },
              { year:'2023', title:t('about_timeline2_title'), desc:t('about_timeline2_desc') },
              { year:'2024', title:t('about_timeline3_title'), desc:t('about_timeline3_desc') },
              { year:'2026', title:t('about_timeline4_title'), desc:t('about_timeline4_desc') },
            ].map(tt=>(
              <div key={tt.year} className="bg-white border border-stone-100 rounded-[24px] p-5 shadow-[0_8px_24px_rgba(10,46,31,0.04)] hover:shadow-[0_16px_32px_rgba(10,46,31,0.08)] hover:-translate-y-1 transition relative">
                <div className="w-10 h-10 rounded-full bg-[#0a2e1f] text-white grid place-items-center font-black text-sm shadow-md ring-4 ring-[#f8f7f2]">{tt.year}</div>
                <div className="font-black mt-4 tracking-tight">{tt.title}</div>
                <div className="text-sm text-stone-500 mt-1 leading-5">{tt.desc}</div>
                <div className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-emerald-700">Learn more →</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VISION & MISSION + VALUES */}
      <section className="bg-[#f8f7f2] border-y border-[#eee8dc] py-12 md:py-16">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 lg:px-12">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-[28px] border border-stone-100 p-6 md:p-8 shadow-[0_16px_32px_rgba(10,46,31,0.06)] hover:shadow-[0_20px_40px_rgba(10,46,31,0.08)] transition">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-200 grid place-items-center text-xl">👁️</div>
              <h3 className="mt-4 text-[22px] font-black tracking-tight text-[#0a2e1f]">{t('about_vision_title')}</h3>
              <p className="mt-2 text-sm leading-6 text-stone-600">{t('about_vision_desc')}</p>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex gap-2 items-center bg-[#f8f7f2] rounded-full px-3 py-2 border border-stone-100"><span className="w-6 h-6 rounded-full bg-emerald-600 text-white grid place-items-center text-xs">✓</span> {t('about_vision_b1')}</li>
                <li className="flex gap-2 items-center bg-[#f8f7f2] rounded-full px-3 py-2 border border-stone-100"><span className="w-6 h-6 rounded-full bg-emerald-600 text-white grid place-items-center text-xs">✓</span> {t('about_vision_b2')}</li>
                <li className="flex gap-2 items-center bg-[#f8f7f2] rounded-full px-3 py-2 border border-stone-100"><span className="w-6 h-6 rounded-full bg-emerald-600 text-white grid place-items-center text-xs">✓</span> {t('about_vision_b3')}</li>
              </ul>
            </div>
            <div className="bg-[#0a2e1f] rounded-[28px] p-6 md:p-8 text-white shadow-[0_20px_40px_rgba(10,46,31,0.18)] border border-white/10 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl" />
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 grid place-items-center text-xl">🎯</div>
              <h3 className="mt-4 text-[22px] font-black tracking-tight">{t('about_mission_title')}</h3>
              <p className="mt-2 text-sm leading-6 text-white/80">{t('about_mission_desc')}</p>
              <ul className="mt-4 space-y-2 text-sm text-white/80">
                <li className="flex gap-2 items-center bg-white/10 rounded-full px-3 py-2 border border-white/15"><span className="w-6 h-6 rounded-full bg-white text-[#0a2e1f] grid place-items-center text-xs">✓</span> {t('about_mission_b1')}</li>
                <li className="flex gap-2 items-center bg-white/10 rounded-full px-3 py-2 border border-white/15"><span className="w-6 h-6 rounded-full bg-white text-[#0a2e1f] grid place-items-center text-xs">✓</span> {t('about_mission_b2')}</li>
                <li className="flex gap-2 items-center bg-white/10 rounded-full px-3 py-2 border border-white/15"><span className="w-6 h-6 rounded-full bg-white text-[#0a2e1f] grid place-items-center text-xs">✓</span> {t('about_mission_b3')}</li>
              </ul>
            </div>
          </div>

          {/* Values bento */}
          <div className="mt-10">
            <h4 className="text-center text-xs tracking-[0.2em] uppercase font-black text-stone-500">{t('about_values_label')}</h4>
            <div className="mt-4 grid md:grid-cols-4 gap-4">
              {[
                { icon:'🌱', title:t('about_value1_title'), desc:t('about_value1_desc') },
                { icon:'🤝', title:t('about_value2_title'), desc:t('about_value2_desc') },
                { icon:'♻️', title:t('about_value3_title'), desc:t('about_value3_desc') },
                { icon:'💚', title:t('about_value4_title'), desc:t('about_value4_desc') },
              ].map(v=>(
                <div key={v.title} className="bg-white rounded-[24px] border border-stone-100 p-5 text-center shadow-[0_8px_24px_rgba(10,46,31,0.04)] hover:shadow-[0_16px_32px_rgba(10,46,31,0.08)] hover:-translate-y-1 transition">
                  <div className="w-12 h-12 rounded-2xl bg-[#f8f7f2] border border-stone-100 grid place-items-center text-xl mx-auto">{v.icon}</div>
                  <div className="font-black mt-3 tracking-tight">{v.title}</div>
                  <div className="text-sm text-stone-500 mt-1 leading-5">{v.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STATS - glass dark */}
      <section className="max-w-[1280px] mx-auto px-4 md:px-8 lg:px-12 py-8">
        <div className="bg-[#0a2e1f] rounded-[28px] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-white relative overflow-hidden shadow-[0_20px_40px_rgba(10,46,31,0.18)] border border-white/10">
          <div className="absolute -top-10 -right-10 w-56 h-56 bg-emerald-500/15 rounded-full blur-3xl" />
          <div className="grid grid-cols-3 gap-6 flex-1 w-full">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-black tracking-tight">2-acre</div>
              <div className="text-xs font-bold tracking-widest uppercase text-white/60 mt-1">Organic Nursery</div>
              <div className="text-xs text-white/40">Pezhummoodu</div>
            </div>
            <div className="text-center border-x border-white/10">
              <div className="text-2xl md:text-3xl font-black tracking-tight text-emerald-300">0.8%</div>
              <div className="text-xs font-bold tracking-widest uppercase text-white/60 mt-1">Damage Rate</div>
              <div className="text-xs text-white/40">Crush-proof tubes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-black tracking-tight">48h</div>
              <div className="text-xs font-bold tracking-widest uppercase text-white/60 mt-1">Nursery → Door</div>
              <div className="text-xs text-white/40">Live-packed daily</div>
            </div>
          </div>
          <div className="hidden md:block w-px h-16 bg-white/10" />
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-full bg-white text-[#0a2e1f] grid place-items-center">✓</span>
            <div className="text-sm leading-5"><span className="font-black">GST bill • COD • 14-day replace</span><br/><span className="text-white/60 text-xs">Trusted by 12k+ families • 4.9★ rating</span></div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-[1280px] mx-auto px-4 md:px-8 lg:px-12 pb-12 md:pb-16">
        <div className="bg-gradient-to-br from-[#e8f0e3] via-white to-[#fdfbf7] rounded-[32px] border border-stone-100 p-6 md:p-10 flex flex-col lg:flex-row items-center gap-6 shadow-[0_16px_40px_rgba(10,46,31,0.06)] relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-100 rounded-full blur-3xl opacity-50" />
          <div className="flex-1 relative">
            <div className="inline-flex items-center gap-2 bg-[#0a2e1f] text-white rounded-full px-3 py-1 text-xs font-black tracking-widest uppercase">✦ Est. 2022 • Pezhummoodu</div>
            <h3 className="mt-3 text-[26px] md:text-[34px] font-black leading-tight tracking-[-0.03em] text-[#0a2e1f]">Bring home a healthier <span className="font-[Fraunces] italic font-normal text-emerald-700">breath of fresh air.</span></h3>
            <p className="text-sm text-stone-600 mt-2 max-w-[520px] leading-6">Join 12k+ families who green their homes with Shaji’s Nursery and Gardens. Organic, honestly priced, supported for life — with GST bill and live-packed guarantee.</p>
            <div className="mt-2 flex items-center gap-2 text-xs text-stone-500">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white grid place-items-center text-[10px]">✓</span> Free care guide • COD • WhatsApp help forever
            </div>
          </div>
          <div className="flex flex-col gap-3 w-full lg:w-auto lg:min-w-[220px] relative">
            <Link to="/shop" className="bg-[#0a2e1f] text-white px-7 py-3.5 rounded-full font-black text-sm text-center hover:bg-black transition shadow-md">Shop Plants →</Link>
            <a href="https://wa.me/919876543210?text=Hi Shaji’s Nursery and Gardens" target="_blank" rel="noreferrer" className="bg-white border border-stone-200 px-7 py-3.5 rounded-full font-bold text-sm text-center hover:bg-stone-50 transition">Chat on WhatsApp</a>
            <p className="text-xs text-stone-400 text-center">Visit: H34Q+9FP, Poovachal, Kerala 695575 • Sat 10am-4pm</p>
          </div>
        </div>
      </section>
    </div>
  )
}
