import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function About(){
  const { t } = useLanguage();
  return (
    <div className="bg-white text-gray-900">
      {/* HERO */}
      <section className="relative overflow-hidden bg-[#f8f7f2]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 lg:px-12 py-10 md:py-16 grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white border rounded-full px-3 py-1.5 text-xs font-bold tracking-widest uppercase text-emerald-700">{t('about_badge')}</div>
            <h1 className="mt-4 text-[34px] md:text-[48px] font-black leading-[0.9] tracking-tight">{t('about_hero_title1')} <span className="font-serif italic font-normal text-emerald-700">{t('about_hero_title2')}</span></h1>
            <p className="mt-4 text-[15px] leading-7 text-gray-600 max-w-[560px]">{t('about_hero_desc')}</p>
            <div className="mt-6 flex gap-3">
              <Link to="/shop" className="bg-[#0a2e1f] text-white px-6 py-3 rounded-full text-sm font-black">{t('about_shop_plants')}</Link>
              <a href="#story" className="bg-white border px-6 py-3 rounded-full text-sm font-bold">{t('about_our_story')}</a>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-4 max-w-[420px]">
              <div className="bg-white rounded-2xl border p-4 text-center"><div className="text-xl font-black">50k+</div><div className="text-xs text-gray-500">{t('about_stats_plants')}</div></div>
              <div className="bg-white rounded-2xl border p-4 text-center"><div className="text-xl font-black">4.9★</div><div className="text-xs text-gray-500">{t('about_stats_reviews')}</div></div>
              <div className="bg-white rounded-2xl border p-4 text-center"><div className="text-xl font-black">12k+</div><div className="text-xs text-gray-500">{t('about_stats_families')}</div></div>
            </div>
          </div>
          <div className="relative">
            <img src="https://images.unsplash.com/photo-1446071103084-c257b5f70672?w=900" alt="nursery" className="w-full h-[380px] md:h-[460px] object-cover rounded-[28px]"/>
            <div className="absolute bottom-4 left-4 right-4 bg-white rounded-2xl p-4 flex gap-3 shadow-xl">
              <span className="w-10 h-10 rounded-full bg-emerald-100 grid place-items-center">🌱</span>
              <div><div className="font-bold text-sm">{t('about_organic_title')}</div><div className="text-xs text-gray-500">{t('about_organic_desc')}</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* OUR STORY */}
      <section id="story" className="max-w-[1280px] mx-auto px-4 md:px-8 lg:px-12 py-12 md:py-16">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
          <div>
            <div className="text-xs tracking-[0.2em] uppercase font-black text-emerald-700">{t('about_story_label')}</div>
            <h2 className="mt-2 text-[30px] md:text-[40px] font-black leading-[0.95] tracking-tight">{t('about_story_title1')}<br/><span className="font-serif italic font-normal text-emerald-700">{t('about_story_title2')}</span></h2>
            <div className="mt-6 space-y-4 text-[15px] leading-7 text-gray-600">
              <p>{t('about_story_p1')}</p>
              <p>{t('about_story_p2')}</p>
              <p>{t('about_story_p3')}</p>
              <p>{t('about_story_p4')}</p>
            </div>
          </div>
          <div className="space-y-4">
            <img src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=700" alt="story" className="w-full h-[260px] object-cover rounded-[24px]"/>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#f8f7f2] rounded-2xl p-5 border"><div className="font-black">2022</div><div className="text-sm text-gray-600">{t('about_year_2022')}</div></div>
              <div className="bg-[#0a2e1f] rounded-2xl p-5 text-white"><div className="font-black">2026</div><div className="text-sm text-white/70">{t('about_year_2026')}</div></div>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex gap-3">
              <span className="text-xl">💚</span>
              <p className="text-sm leading-5"><span className="font-black">{t('about_promise')}</span></p>
            </div>
          </div>
        </div>

        {/* Timeline - starts 2022 */}
        <div className="mt-12 grid md:grid-cols-4 gap-4">
          {[
            { year:'2022', title:t('about_timeline1_title'), desc:t('about_timeline1_desc') },
            { year:'2023', title:t('about_timeline2_title'), desc:t('about_timeline2_desc') },
            { year:'2024', title:t('about_timeline3_title'), desc:t('about_timeline3_desc') },
            { year:'2026', title:t('about_timeline4_title'), desc:t('about_timeline4_desc') },
          ].map(tt=>(
            <div key={tt.year} className="bg-white border rounded-2xl p-5">
              <div className="w-10 h-10 rounded-full bg-[#0a2e1f] text-white grid place-items-center font-black text-sm">{tt.year}</div>
              <div className="font-black mt-3">{tt.title}</div>
              <div className="text-sm text-gray-500 mt-1">{tt.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* VISION & MISSION */}
      <section className="bg-[#f8f7f2] border-y py-12 md:py-16">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 lg:px-12">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-[28px] border p-6 md:p-8">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 grid place-items-center text-xl">👁️</div>
              <h3 className="mt-4 text-[22px] font-black">{t('about_vision_title')}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">{t('about_vision_desc')}</p>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex gap-2"><span className="text-emerald-600">✓</span> {t('about_vision_b1')}</li>
                <li className="flex gap-2"><span className="text-emerald-600">✓</span> {t('about_vision_b2')}</li>
                <li className="flex gap-2"><span className="text-emerald-600">✓</span> {t('about_vision_b3')}</li>
              </ul>
            </div>
            <div className="bg-[#0a2e1f] rounded-[28px] p-6 md:p-8 text-white">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 grid place-items-center text-xl">🎯</div>
              <h3 className="mt-4 text-[22px] font-black">{t('about_mission_title')}</h3>
              <p className="mt-2 text-sm leading-6 text-white/80">{t('about_mission_desc')}</p>
              <ul className="mt-4 space-y-2 text-sm text-white/80">
                <li className="flex gap-2"><span className="text-emerald-300">✓</span> {t('about_mission_b1')}</li>
                <li className="flex gap-2"><span className="text-emerald-300">✓</span> {t('about_mission_b2')}</li>
                <li className="flex gap-2"><span className="text-emerald-300">✓</span> {t('about_mission_b3')}</li>
              </ul>
            </div>
          </div>

          {/* Values */}
          <div className="mt-8">
            <h4 className="text-center text-sm tracking-[0.2em] uppercase font-black text-gray-500">{t('about_values_label')}</h4>
            <div className="mt-4 grid md:grid-cols-4 gap-4">
              {[
                { icon:'🌱', title:t('about_value1_title'), desc:t('about_value1_desc') },
                { icon:'🤝', title:t('about_value2_title'), desc:t('about_value2_desc') },
                { icon:'♻️', title:t('about_value3_title'), desc:t('about_value3_desc') },
                { icon:'💚', title:t('about_value4_title'), desc:t('about_value4_desc') },
              ].map(v=>(
                <div key={v.title} className="bg-white rounded-2xl border p-5 text-center">
                  <div className="w-12 h-12 rounded-full bg-[#f8f7f2] grid place-items-center text-xl mx-auto">{v.icon}</div>
                  <div className="font-black mt-3">{v.title}</div>
                  <div className="text-sm text-gray-500 mt-1 leading-5">{v.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


    </div>
  )
}
