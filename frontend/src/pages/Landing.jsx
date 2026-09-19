import { useEffect, useState, useRef } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';

// ——— helpers ———
const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: (i=0) => ({ opacity: 1, y: 0, transition: { delay: i*0.08, duration: 0.7, ease: [0.22,1,0.36,1] }}),
};

function Reveal({ children, delay=0, className="" }){
  return (
    <motion.div
      initial={{ opacity:0, y:24 }}
      whileInView={{ opacity:1, y:0 }}
      viewport={{ once:true, margin:"-80px" }}
      transition={{ duration:0.7, delay, ease:[0.22,1,0.36,1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Magnetic({ children }){
  const ref = useRef(null);
  const x = useMotionValue(0); const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 180, damping: 18 });
  const sy = useSpring(y, { stiffness: 180, damping: 18 });
  return (
    <motion.div
      ref={ref}
      style={{ x: sx, y: sy }}
      onMouseMove={e=>{
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width/2) * 0.18);
        y.set((e.clientY - r.top - r.height/2) * 0.22);
      }}
      onMouseLeave={()=>{ x.set(0); y.set(0); }}
      className="inline-flex"
    >
      {children}
    </motion.div>
  );
}

// Fallback catalog — ensures home page always shows plants even if backend is down / Network Error
const FALLBACK_PLANTS = [
  { id:'p1', name:'Aloe Vera', price:180, discount_price:229, stock_qty:85, sunlight:'Bright', rating:4.8, images:['/aloevera plant.png'], variants:[{id:'plastic-pot',label:'With Plastic Pot',priceMin:180,priceMax:180}] },
  { id:'p2', name:'Calathea Plant', price:180, discount_price:399, stock_qty:34, sunlight:'Indirect', rating:4.7, images:['/calathea plant.jpg'], variants:[{id:'plastic-pot',label:'With Plastic Pot',priceMin:180,priceMax:180}] },
  { id:'p3', name:'Chinese Evergreen', price:150, discount_price:259, stock_qty:48, sunlight:'Indirect', rating:4.6, images:['/chinese evergreen.png'], variants:[] },
  { id:'p4', name:'Patharchatta', price:60, discount_price:149, stock_qty:62, sunlight:'Full', rating:4.5, images:['/paathi pull.jpg'], variants:[] },
  { id:'p5', name:'Lucky Bamboo — 2 Layer', price:150, discount_price:349, stock_qty:110, sunlight:'Indirect', rating:4.9, images:['/lucky bamboo.jpg'], variants:[] },
  { id:'p6', name:'Areca Palm', price:180, discount_price:349, stock_qty:27, sunlight:'Bright', rating:4.7, images:['/palm.jpg'], variants:[] },
  { id:'p7', name:'Red Calathea', price:200, discount_price:599, stock_qty:19, sunlight:'Indirect', rating:4.8, images:['/red calathea.jpg'], variants:[] },
  { id:'p1b', name:'Snake Plant', price:120, discount_price:199, stock_qty:64, sunlight:'Low', rating:4.6, images:['https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600'], variants:[] },
];

export default function Landing(){
  const [plants,setPlants]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState(null);
  const {t}=useLanguage();
  const [activeFilter,setActiveFilter]=useState('popular');

  const heroRef = useRef(null);
  const { scrollY, scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });

  // parallax blobs (symmetric)
  const yBlob1 = useTransform(scrollY, [0,600], [0, 40]);
  const yBlob2 = useTransform(scrollY, [0,600], [0, -30]);

  useEffect(()=>{
    let cancelled = false;
    const controller = new AbortController();
    async function load(retries=2){
      try{
        setLoading(true);
        setError(null);
        const r = await api.get('/plants?limit=8&sort=popular', { signal: controller.signal });
        const list = r.data.plants || [];
        if(!cancelled){
          // if backend returns empty (cold start) use fallback so page never looks empty
          setPlants(list.length ? list : FALLBACK_PLANTS);
        }
      }catch(e){
        if(cancelled || e.name==='CanceledError' || e.code==='ERR_CANCELED') return;
        if(retries>0){
          setTimeout(()=>{ if(!cancelled) load(retries-1); }, 600);
        } else {
          if(!cancelled){
            // Network Error → show cached fallback catalog instead of empty error; keep small offline flag
            setPlants(FALLBACK_PLANTS);
            setError(null);
          }
        }
      }finally{
        if(!cancelled) setLoading(false);
      }
    }
    load();
    return ()=>{ cancelled=true; controller.abort(); };
  },[]);
  const filteredPlants = [...new Map(plants.map(p=>[String(p.id),p])).values()].slice(0,8);

  return (
    <div className="bg-[#fdfbf7] text-[#1c1917] overflow-hidden selection:bg-emerald-200 relative">
      {/* NEW LANDING BACKGROUND — photographic + aurora + botanical mesh */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 landing-photo-bg opacity-[0.13]" />
        <div className="absolute inset-0 bg-[#fdfbf7]/72" />
        <div className="absolute inset-0 aurora-bg opacity-45" />
        <div className="absolute inset-0 botanical-bg opacity-[0.22]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#fdfbf7]/0 via-transparent to-[#fdfbf7]/88" />
        {/* soft leaf silhouettes — top left / bottom right */}
        <div className="absolute -top-24 -left-24 w-[520px] h-[520px] bg-emerald-100/22 rounded-full blur-[90px]" />
        <div className="absolute top-[32%] -right-32 w-[480px] h-[480px] bg-amber-100/18 rounded-full blur-[90px]" />
        <div className="absolute bottom-[18%] left-[8%] w-[640px] h-[420px] bg-[#e8f0e3]/28 rounded-full blur-[90px]" />
      </div>
      {/* floating pollen field - whole page */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {[...Array(10)].map((_,i)=>(
          <motion.span
            key={`page-pollen-${i}`}
            className="absolute w-1.5 h-1.5 bg-amber-200/50 rounded-full blur-[0.3px]"
            style={{ left:`${8 + i*9}%`, top:`${18 + (i*17)%72}%` }}
            animate={{ y:[0, -90 - (i%3)*18], x:[0, 14 - i%8], opacity:[0,0.55,0], rotate:[0,90] }}
            transition={{ duration: 13 + i%6, repeat:Infinity, delay: i*1.2, ease:'easeInOut' }}
          />
        ))}
      </div>
      {/* scroll progress */}
      <motion.div style={{ scaleX }} className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500 via-[#0a2e1f] to-amber-400 origin-left z-[60]" />

      {/* ========== HERO - CENTERED CINEMATIC + SYMMETRIC DRIFT ========== */}
      <section ref={heroRef} className="hero relative bg-[#fdfbf7] overflow-hidden text-center">
        {/* Subtle cinematic greenhouse layer - symmetric, light, loopable 8-10s */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* image dolly - 16% opacity, desktop only */}
          <motion.div
            className="absolute inset-0 hidden md:block cinematic-dolly will-change-transform opacity-[0.15]"
            style={{ transformOrigin: '50% 45%' }}
          >
            <img
              src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1920&q=80"
              alt=""
              className="w-full h-full object-cover scale-[1.06]"
              style={{ objectPosition: '50% 42%' }}
            />
          </motion.div>
          {/* video - desktop only, tiny opacity */}
          <video
            autoPlay muted loop playsInline preload="metadata"
            poster="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1920&q=80"
            className="absolute inset-0 hidden md:block w-full h-full object-cover opacity-[0.12]"
            style={{ filter: 'saturate(0.92) brightness(1.02)' }}
            onError={(e)=> e.currentTarget.style.display='none'}
          >
            <source src="https://videos.pexels.com/video-files/3191571/3191571-uhd_2560_1440_25fps.mp4" type="video/mp4" />
          </video>
          {/* light wash - keeps center bright for text */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#fdfbf7]/10 via-transparent to-[#fdfbf7]/60" />
          {/* radial vignette - symmetric, frames centered text (bright center, soft dark edges) */}
          <div className="absolute inset-0 hidden md:block bg-[radial-gradient(ellipse_78%_68%_at_50%_46%,transparent_42%,rgba(253,251,247,0.35)_62%,rgba(10,46,31,0.08)_82%,rgba(10,46,31,0.14)_100%)]" />
          {/* god rays - SYMMETRIC: mirrored left + right crossing */}
          <div className="absolute inset-0 overflow-hidden hidden md:block">
            <div className="godrays absolute -top-10 -left-[18%] w-[34%] h-[120%] rotate-[14deg] opacity-[0.14]" />
            <div className="godrays absolute -top-10 -left-[2%] w-[28%] h-[120%] rotate-[10deg] opacity-[0.10]" style={{ animationDelay: '1.1s' }} />
            <div className="godrays absolute -top-10 right-[-18%] w-[34%] h-[120%] rotate-[-14deg] opacity-[0.14]" style={{ transform: 'scaleX(-1)' }} />
            <div className="godrays absolute -top-10 right-[-2%] w-[28%] h-[120%] rotate-[-10deg] opacity-[0.10]" style={{ animationDelay: '0.7s', transform: 'scaleX(-1)' }} />
          </div>
          {/* mist - symmetric, centered */}
          <motion.div className="absolute inset-0 hidden md:block overflow-hidden opacity-50">
            <motion.div className="mist-layer absolute top-[44%] left-1/2 -translate-x-1/2 w-[90%] h-[14%] max-w-[900px]" animate={{ x: ['-3%', '3%'] }} transition={{ duration: 11, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }} />
            <motion.div className="mist-layer absolute top-[58%] left-1/2 -translate-x-1/2 w-[70%] h-[10%] max-w-[700px] opacity-60" animate={{ x: ['3%', '-3%'] }} transition={{ duration: 13, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut', delay: 0.8 }} />
          </motion.div>
        </div>

        {/* premium blobs - symmetrized + breathing life */}
        <motion.div className="pointer-events-none absolute inset-0">
          <motion.div style={{ y: yBlob1 }} className="absolute -top-28 -left-24 w-[580px] h-[580px] bg-[#e8f0e3] rounded-full blur-[90px] opacity-50 md:opacity-65 animate-drift breath" />
          <motion.div style={{ y: yBlob2 }} className="absolute -top-20 -right-24 w-[560px] h-[560px] bg-emerald-100 rounded-full blur-[80px] opacity-40 md:opacity-55 animate-drift2 breath" />
          <motion.div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-[860px] h-[380px] bg-amber-100/45 rounded-full blur-[70px] opacity-60 breath hidden md:block" />
          <motion.div
            animate={{ scale:[1,1.07,1], x:[0,12,-10,0], opacity:[0.05,0.09,0.05] }}
            transition={{ duration:11, repeat:Infinity, ease:"easeInOut" }}
            className="absolute top-[46%] left-1/2 w-[980px] h-[460px] -translate-x-1/2 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.10),transparent_70%)]"
          />
        </motion.div>
        {/* hero pollen - slow upward drift gives life */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden hidden md:block" aria-hidden>
          {[...Array(8)].map((_,i)=>(
            <motion.span
              key={`hero-pollen-${i}`}
              className="absolute w-1 h-1 bg-emerald-600/25 rounded-full"
              style={{ left:`${14 + i*11}%`, top:`${62 + (i%3)*12}%` }}
              animate={{ y:[0, -70 - (i%4)*10], x:[0, 10 - (i%6)], opacity:[0,0.7,0] }}
              transition={{ duration: 9 + i%4, repeat:Infinity, delay: i*0.9, ease:'easeInOut' }}
            />
          ))}
        </div>

        {/* SYMMETRIC leaf fringe - frames centered text evenly (3 left + 3 right) */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden hidden md:block">
          {/* left fringe */}
          {[
            { left:'2.5%', top:'18%', s:'text-[28px]', d:0 },
            { left:'7%', top:'42%', s:'text-[22px]', d:0.4 },
            { left:'11%', top:'68%', s:'text-[20px]', d:0.9 },
          ].map((p,i)=>(
            <motion.span
              key={`L-${i}`}
              className={`absolute ${p.s} text-emerald-700/12 select-none`}
              style={{ left:p.left, top:p.top }}
              animate={{ y:[0, -10, 0], x:[0, 6, 0], rotate:[ -2, 3, -2], opacity:[0.45,0.75,0.45] }}
              transition={{ duration: 5 + i*0.5, repeat:Infinity, delay: p.d, ease:"easeInOut" }}
            >{i===0?'🌿': i===1?'🍃':'🌱'}</motion.span>
          ))}
          {/* right fringe - mirrored */}
          {[
            { right:'2.5%', top:'18%', s:'text-[28px]', d:0.2 },
            { right:'7%', top:'42%', s:'text-[22px]', d:0.6 },
            { right:'11%', top:'68%', s:'text-[20px]', d:1.1 },
          ].map((p,i)=>(
            <motion.span
              key={`R-${i}`}
              className={`absolute ${p.s} text-emerald-700/12 select-none`}
              style={{ right:p.right, top:p.top }}
              animate={{ y:[0, -10, 0], x:[0, -6, 0], rotate:[ 2, -3, 2], opacity:[0.45,0.75,0.45] }}
              transition={{ duration: 5 + i*0.5, repeat:Infinity, delay: p.d, ease:"easeInOut" }}
            >{i===0?'🌿': i===1?'🌱':'🍃'}</motion.span>
          ))}
        </div>
        {/* mobile: tiny centered sparkles only */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden md:hidden">
          {[...Array(3)].map((_,i)=>(
            <motion.span
              key={i}
              className="absolute text-emerald-700/10 text-xl select-none"
              style={{ left: `${18 + i*28}%`, top: `${14 + (i%2)*28}%` }}
              animate={{ y:[0, -8, 0], opacity:[0.4,0.7,0.4] }}
              transition={{ duration: 4, repeat:Infinity, delay: i*0.4, ease:"easeInOut" }}
            >🌿</motion.span>
          ))}
        </div>

        {/* CENTERED content - increased height for airier landing */}
        <div className="relative max-w-[860px] mx-auto px-4 md:px-8 lg:px-12 pt-16 md:pt-28 pb-16 md:pb-28 flex flex-col items-center text-center">
          <motion.div initial="hidden" animate="show" className="flex flex-col items-center space-y-5 w-full">
              <motion.div custom={0} variants={fadeUp} className="inline-flex items-center gap-2 bg-white/90 backdrop-blur border border-emerald-100 rounded-full px-3.5 py-1.5 text-xs font-semibold shadow-sm">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.65)]"></span>
                {t('hero_badge')}
                <motion.span animate={{ scale:[1,1.05,1] }} transition={{ duration:2, repeat:Infinity }} className="hidden sm:inline-flex ml-1 bg-emerald-600 text-white text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full">2026</motion.span>
              </motion.div>

              <motion.h1 custom={1} variants={fadeUp} className="text-[34px] md:text-[56px] font-black leading-[0.88] tracking-[-0.045em] text-[#0a2e1f] text-center max-w-[720px] text-balance">
                <motion.span className="block" initial={{ y: 32, opacity:0 }} animate={{ y:0, opacity:1 }} transition={{ duration:0.7, delay:0.12, ease:[0.22,1,0.36,1] }}>
                  {t('hero_title1')}
                </motion.span>
                <motion.span className="block font-[Fraunces] italic font-normal text-[#1a6b3c] tracking-tight" initial={{ y: 32, opacity:0 }} animate={{ y:0, opacity:1 }} transition={{ duration:0.7, delay:0.22, ease:[0.22,1,0.36,1] }}>
                  {t('hero_title2')}
                </motion.span>
                <motion.span className="block" initial={{ y: 32, opacity:0 }} animate={{ y:0, opacity:1 }} transition={{ duration:0.7, delay:0.32, ease:[0.22,1,0.36,1] }}>
                  {t('hero_title3')}
                </motion.span>
              </motion.h1>

              <motion.p custom={2} variants={fadeUp} className="text-[15px] md:text-[17px] leading-7 text-[#57534e] max-w-[640px] text-center text-balance">
                {t('hero_desc')}
              </motion.p>

              <motion.div custom={3} variants={fadeUp} className="flex flex-wrap gap-3 pt-1 justify-center">
                <Magnetic>
                  <Link to="/shop" className="group relative bg-[#0a2e1f] text-white px-7 py-3.5 rounded-full font-bold text-sm hover:bg-black transition inline-flex items-center gap-2 shadow-[0_12px_28px_rgba(10,46,31,0.20)] hover:shadow-[0_18px_34px_rgba(10,46,31,0.26)] hover:-translate-y-0.5 duration-300 overflow-hidden">
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition duration-700" />
                    {t('shop_collection')}
                    <motion.span animate={{ x:[0,4,0] }} transition={{ duration:1.2, repeat:Infinity, ease:"easeInOut" }} className="w-6 h-6 rounded-full bg-white/15 grid place-items-center text-xs">→</motion.span>
                  </Link>
                </Magnetic>
                <Link to="/about" className="bg-white/90 backdrop-blur border border-stone-200 text-[#1c1917] px-7 py-3.5 rounded-full font-bold text-sm hover:bg-white transition shadow-sm hover:-translate-y-0.5 duration-300">
                  {t('how_we_grow')}
                </Link>
              </motion.div>

              <motion.div custom={4} variants={fadeUp} className="flex items-center gap-4 pt-1 justify-center">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map(i=>(
                    <motion.img key={i} initial={{ scale:0, opacity:0 }} animate={{ scale:1, opacity:1 }} transition={{ delay: 0.6 + i*0.08, type:"spring", stiffness:260 }} src={`https://i.pravatar.cc/100?img=${i+10}`} alt="" className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm" />
                  ))}
                  <motion.span initial={{ scale:0 }} animate={{ scale:1 }} transition={{ delay:0.95, type:"spring" }} className="w-8 h-8 rounded-full bg-[#0a2e1f] text-white grid place-items-center text-[11px] font-black border-2 border-white">+12k</motion.span>
                </div>
                <div className="text-xs leading-tight text-left">
                  <div className="font-black flex items-center gap-1">★★★★★ <span className="text-[#0a2e1f]">4.9</span><span className="font-normal text-stone-500">• 3,421 reviews</span></div>
                  <div className="text-stone-500">{t('landing_trusted')}</div>
                </div>
              </motion.div>

              {/* micro usp strip - centered */}
              <motion.div custom={5} variants={fadeUp} className="hidden md:flex items-center gap-2 pt-2 text-xs justify-center">
                {[t('landing_usp_free'),t('landing_usp_delivery'),t('landing_usp_support')].map((x,i)=>(
                  <span key={x} className="inline-flex items-center gap-1.5 bg-white border border-stone-100 rounded-full px-2.5 py-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> {x}
                  </span>
                ))}
              </motion.div>
          </motion.div>
        </div>
      </section>

      {/* MARQUEE - enhanced with glow */}
      <div className="overflow-hidden bg-[#0a2e1f] py-3.5 border-y border-emerald-900/50 relative">
        <motion.div className="absolute inset-0 bg-gradient-to-r from-emerald-900/20 via-transparent to-amber-900/10 pointer-events-none" animate={{ opacity:[0.6,1,0.6] }} transition={{ duration:3, repeat:Infinity }} />
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(3)].map((_, i) => (
            <span key={i} className="flex items-center gap-6 mx-6 text-white text-sm font-bold tracking-wide">
              <span className="text-emerald-400 animate-star">✦</span>
              {t('landing_marquee_cuttings')}
              <span className="text-emerald-400 animate-star">✦</span>
              {t('landing_marquee_wholesale')}
              <span className="text-emerald-400 animate-star">✦</span>
              {t('landing_marquee_cod')}
              <span className="text-emerald-400 animate-star">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* BEST SELLING - PREMIUM FILTER PILL + HOVER LIFT + LIVING BG */}
      <section className="bg-[#fdfbf7]/90 backdrop-blur-[1px] border-y border-[#f0ebe3] py-10 md:py-14 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <motion.div className="absolute -top-16 -right-12 w-[520px] h-[520px] bg-emerald-100/50 rounded-full blur-[80px] breath" animate={{ scale:[1,1.06,1] }} transition={{ duration:9, repeat:Infinity, ease:'easeInOut' }} />
          <motion.div className="absolute -bottom-20 -left-16 w-[640px] h-[420px] bg-amber-50/60 rounded-full blur-[90px] breath" style={{ animationDelay:'1s' }} animate={{ scale:[1,1.05,1] }} transition={{ duration:11, repeat:Infinity, ease:'easeInOut' }} />
        </div>
        <div className="relative max-w-[1280px] mx-auto px-4 md:px-8 lg:px-12">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
              <div>
                <motion.div initial={{ opacity:0, scale:0.92 }} whileInView={{ opacity:1, scale:1 }} viewport={{ once:true }} className="inline-flex items-center gap-2 bg-white border border-stone-200 rounded-full px-3 py-1 text-[11px] font-black tracking-widest uppercase text-stone-600">✦ {t('landing_best_badge')}</motion.div>
                <h2 className="mt-3 text-[28px] md:text-[36px] font-black tracking-[-0.03em] leading-none text-[#0a2e1f]">{t('landing_best_title')} <span className="font-[Fraunces] italic font-normal text-emerald-700">this week</span></h2>
                <p className="text-sm text-stone-500 mt-2">{t('landing_best_sub')}</p>
              </div>
              {/* filter pill bar with layout animation */}
              <div className="flex items-center gap-2 bg-white rounded-full p-1.5 border border-stone-200 shadow-sm w-fit">
                <span className="hidden md:inline text-xs font-black tracking-widest uppercase text-stone-400 ml-2 mr-1">{t('filter')}</span>
                {[
                  { id:'popular', label:t('popular'), to:'/shop?sort=popular'},
                  { id:'new', label:t('new_in'), to:'/shop?sort=newest'},
                  { id:'sale', label:t('sale'), to:'/shop'},
                ].map(pill=> (
                  <button
                    key={pill.id}
                    onClick={()=>setActiveFilter(pill.id)}
                    className={`relative text-xs font-black px-4 py-2 rounded-full transition ${activeFilter===pill.id ? 'text-white' : 'text-stone-700'}`}
                  >
                    {activeFilter===pill.id && <motion.span layoutId="active-pill" className="absolute inset-0 bg-[#0a0a0a] rounded-full shadow" transition={{ type:"spring", stiffness:400, damping:30 }} />}
                    <span className="relative z-10">{pill.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </Reveal>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once:true, margin:"-60px" }}
            variants={{ hidden:{}, show:{ transition:{ staggerChildren:0.07 } } }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5"
          >
            {filteredPlants.map((p,i)=> {
              const hasVariants = Array.isArray(p.variants) && p.variants.length>0;
              const potVariant = hasVariants ? p.variants.find(v=>v.id==='plastic-pot' && !v.disabled) : null;
              const available = hasVariants ? p.variants.filter(v=>!v.disabled) : [];
              const price = hasVariants ? (potVariant?.priceMin ?? Math.min(...available.map(v=>v.priceMin))) : (p.discount_price || p.price);
              const originalPrice = hasVariants ? null : (p.discount_price ? p.price : null);
              return (
                <motion.div
                  key={p.id}
                  variants={{ hidden:{ opacity:0, y:18 }, show:{ opacity:1, y:0, transition:{ duration:0.5, ease:[0.22,1,0.36,1] } } }}
                  whileHover={{ y:-6 }}
                  transition={{ type:"spring", stiffness:300 }}
                  className="group"
                >
                  <Link to={`/plant/${p.id}`} className="bg-white rounded-[22px] md:rounded-[28px] border border-stone-100 overflow-hidden hover:shadow-[0_20px_40px_rgba(10,46,31,0.10)] hover:border-stone-200 transition-all duration-300 shadow-[0_8px_24px_rgba(10,46,31,0.04)] flex flex-col h-full">
                    <div className="relative bg-[#f6f7f4] overflow-hidden rounded-[20px] md:rounded-[24px] m-2">
                      {p.images?.[0] ? (
                        <motion.img
                          src={encodeURI(p.images[0])}
                          alt={p.name}
                          loading="lazy"
                          className="w-full h-[160px] md:h-[210px] object-cover"
                          whileHover={{ scale:1.06 }}
                          transition={{ duration:0.7 }}
                          onError={(e)=>{ e.currentTarget.src='https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=60'; }}
                        />
                      ) : (
                        <div className="w-full h-[160px] md:h-[210px] bg-[#e8f0e3] grid place-items-center text-emerald-700/40 text-3xl">🌿</div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition" />
                      {!hasVariants && p.discount_price && <span className="absolute top-2.5 left-2.5 bg-[#0a7a2b] text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-sm">{t('landing_sale_badge')}</span>}
                      {hasVariants && <span className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur text-emerald-700 text-[10px] font-black px-2 py-1 rounded-full border">{available.length} {t('landing_variants_fixed')}</span>}
                      <span className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur text-[11px] font-bold px-2.5 py-1 rounded-full border border-white text-stone-700 shadow-sm">{p.stock_qty} {t('landing_stock_left')}</span>
                      <motion.span initial={{ opacity:0, y:6 }} whileHover={{ opacity:1, y:0 }} className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full bg-white shadow-md grid place-items-center text-stone-700 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition">→</motion.span>
                    </div>
                    <div className="p-3.5 md:p-4 flex-1 flex flex-col">
                      <div className="font-bold text-[14px] leading-tight line-clamp-1 tracking-tight">{p.name}</div>
                      <div className="text-xs text-stone-500 mt-1 line-clamp-1">{p.sunlight} • {t('landing_stock_label')} {p.stock_qty} {hasVariants && <span className="text-emerald-600 font-bold">• {available.length} {t('landing_options')}</span>}</div>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <div className="flex flex-col">
                          <span className="font-black text-[#0f7a4a] text-[15px]">₹{Number(price).toFixed(2)} {hasVariants && <span className="text-[10px] font-bold bg-[#f8f7f2] border border-stone-200 px-1.5 py-0.5 rounded-full ml-1 align-middle">{t('landing_fixed')}</span>}</span>
                          {hasVariants ? <span className="text-[11px] text-stone-500">{t('landing_with_pot')}</span> : originalPrice && <span className="text-xs line-through text-stone-400">₹{originalPrice.toFixed(2)}</span>}
                        </div>
                        <span className="bg-[#0f7a4a] group-hover:bg-[#0a5e36] text-white text-[11px] font-black px-3.5 py-2 rounded-full transition-colors shadow-sm whitespace-nowrap shine">{t('landing_add_to_cart')}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
            {loading && (
              <div className="col-span-full grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
                {Array.from({length:8}).map((_,i)=>(
                  <div key={i} className="bg-white rounded-[22px] md:rounded-[28px] border border-stone-100 overflow-hidden p-2 animate-pulse">
                    <div className="w-full h-[160px] md:h-[210px] bg-[#e8f0e3] rounded-[20px]" />
                    <div className="p-3 space-y-2">
                      <div className="h-4 bg-stone-100 rounded-full w-3/4" />
                      <div className="h-3 bg-stone-50 rounded-full w-1/2" />
                      <div className="h-6 bg-[#f6f7f4] rounded-full w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!loading && error && (
              <div className="col-span-full text-center py-10 bg-white rounded-[20px] border border-red-100">
                <p className="text-sm text-red-600 font-bold">Failed to load plants — {error}</p>
                <button onClick={()=>{ setError(null); setLoading(true); api.get('/plants?limit=8&sort=popular').then(r=>setPlants(r.data.plants||[])).catch(e=>setError(e.message)).finally(()=>setLoading(false)); }} className="mt-3 bg-[#0a2e1f] text-white px-5 py-2 rounded-full text-xs font-black">Retry →</button>
              </div>
            )}
            {!loading && !error && filteredPlants.length===0 && (
              <div className="col-span-full text-center py-10 bg-white rounded-[20px] border border-stone-100">
                <p className="text-sm text-stone-500">{t('landing_loading')} — no plants found. <button onClick={()=>window.location.reload()} className="text-emerald-700 font-bold underline">Reload</button></p>
              </div>
            )}
          </motion.div>

          <Reveal delay={0.1}>
            <div className="text-center mt-8">
              <Magnetic>
                <Link to="/shop" className="inline-flex items-center gap-2 bg-[#0a2e1f] text-white px-8 py-3.5 rounded-full font-black text-sm hover:bg-black transition shadow-[0_12px_24px_rgba(10,46,31,0.18)] hover:-translate-y-0.5 duration-300">
                  {t('view_all_plants')} <motion.span animate={{ x:[0,5,0] }} transition={{ duration:1.2, repeat:Infinity }}>→</motion.span>
                </Link>
              </Magnetic>
              <div className="text-xs text-stone-400 mt-3">{t('landing_gst_note')}</div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CURATED FOR EVERY SPACE — NEW EDITORIAL (taller, premium, centered) */}
      <section className="bg-white py-16 md:py-24 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 right-0 w-[640px] h-[640px] bg-emerald-50 rounded-full blur-[90px] opacity-55" />
          <div className="absolute bottom-0 left-0 w-[720px] h-[520px] bg-amber-50/70 rounded-full blur-[90px] opacity-40" />
        </div>
        <div className="relative max-w-[1280px] mx-auto px-4 md:px-8 lg:px-12">
          <Reveal>
            <div className="text-center max-w-[760px] mx-auto">
              <div className="inline-flex items-center gap-2 bg-[#f0fdf4] border border-emerald-200 rounded-full px-4 py-1.5 text-[11px] font-black tracking-widest uppercase text-emerald-700">✦ {t('curated_badge')}</div>
              <h2 className="mt-5 text-[32px] md:text-[48px] font-black leading-[0.9] tracking-[-0.03em] text-[#0a2e1f] text-balance">
                {t('curated_title1')}<br/><span className="font-[Fraunces] italic font-normal text-emerald-700">{t('curated_title2')}</span>
              </h2>
              <p className="mt-4 text-sm md:text-[16px] leading-7 text-stone-600 max-w-[640px] mx-auto text-balance bg-[#fdfbf7] border border-stone-100 rounded-2xl px-5 py-3.5 shadow-sm">{t('curated_desc')}</p>
            </div>
          </Reveal>

          <div className="mt-10 grid md:grid-cols-3 gap-5 md:gap-6">
            {/* Garden — featured dark */}
            <Reveal>
              <motion.div whileHover={{ y:-6 }} className="group relative rounded-[28px] overflow-hidden bg-[#0a2e1f] text-white min-h-[420px] flex flex-col justify-end p-6 md:p-7 shadow-[0_24px_48px_rgba(10,46,31,0.18)]">
                <img src="https://images.unsplash.com/photo-1585328001265-45133cc8af29?w=700&q=80" alt="garden landscaping" className="absolute inset-0 w-full h-full object-cover opacity-55 group-hover:scale-[1.04] transition duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <div className="absolute top-4 left-4 bg-white/10 backdrop-blur border border-white/15 rounded-full px-3 py-1.5 text-xs font-bold hidden md:flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /> {t('landing_live_visits')}
                </div>
                <div className="relative">
                  <span className="inline-flex items-center gap-1.5 bg-white text-[#0a2e1f] px-3 py-1 rounded-full text-xs font-black shadow-sm">◉ {t('curated_feature_badge')}</span>
                  <h3 className="mt-3 text-[22px] md:text-[26px] font-black leading-tight tracking-tight text-balance">{t('curated_feature_title')}</h3>
                  <p className="mt-2 text-sm text-white/80 leading-6 line-clamp-3">{t('curated_feature_desc')}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <a href="https://wa.me/919876543210?text=Hi Shaji’s Nursery and Gardens, I need landscape design for my space" target="_blank" rel="noreferrer" className="bg-white text-[#0a2e1f] px-5 py-2.5 rounded-full text-sm font-black hover:bg-stone-100 transition shadow inline-flex items-center gap-1.5">{t('curated_feature_cta1')}</a>
                    <Link to="/shop" className="bg-white/15 backdrop-blur border border-white/20 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-white/20 transition">{t('curated_feature_cta2')}</Link>
                  </div>
                </div>
              </motion.div>
            </Reveal>
            {/* Balcony */}
            <Reveal delay={0.1}>
              <motion.div whileHover={{ y:-6 }} className="group bg-[#fdfbf7] rounded-[28px] border border-stone-100 overflow-hidden flex flex-col shadow-sm hover:shadow-[0_16px_32px_rgba(10,46,31,0.08)] transition">
                <div className="relative overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80" alt="balcony" className="w-full h-[220px] object-cover group-hover:scale-[1.04] transition duration-700" />
                  <span className="absolute top-4 left-4 bg-white/90 backdrop-blur border border-white rounded-full px-3 py-1 text-[11px] font-black tracking-widest uppercase text-emerald-700 shadow-sm">{t('curated_balcony_label')}</span>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h4 className="font-black text-[18px] leading-tight tracking-tight">{t('curated_balcony_title')}</h4>
                  <p className="text-sm text-stone-500 mt-2 leading-6 flex-1">{t('curated_balcony_desc')}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-emerald-700">Explore <span>→</span></span>
                </div>
              </motion.div>
            </Reveal>
            {/* Offices */}
            <Reveal delay={0.18}>
              <motion.div whileHover={{ y:-6 }} className="group bg-white rounded-[28px] border border-stone-100 overflow-hidden flex flex-col shadow-sm hover:shadow-[0_16px_32px_rgba(10,46,31,0.08)] transition">
                <div className="relative overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=600&q=80" alt="office" className="w-full h-[220px] object-cover group-hover:scale-[1.04] transition duration-700" />
                  <span className="absolute top-4 left-4 bg-white/90 backdrop-blur border border-white rounded-full px-3 py-1 text-[11px] font-black tracking-widest uppercase text-emerald-700 shadow-sm">{t('curated_office_label')}</span>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h4 className="font-black text-[18px] leading-tight tracking-tight">{t('curated_office_title')}</h4>
                  <p className="text-sm text-stone-500 mt-2 leading-6 flex-1">{t('curated_office_desc')}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-emerald-700">Explore <span>→</span></span>
                </div>
              </motion.div>
            </Reveal>
          </div>

          {/* Proof bar — taller pills */}
          <Reveal delay={0.12}>
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {[
                { v:"12k+", k:t('curated_stat_homes'), cls:"bg-[#f8f7f2] border border-stone-100 text-[#0a2e1f]" },
                { v:"4.9★", k:`3,421 ${t('curated_stat_rating')}`, cls:"bg-emerald-600 text-white shadow-md border border-emerald-600" },
                { v:"48h", k:t('curated_stat_eta'), cls:"bg-[#f8f7f2] border border-stone-100 text-[#0a2e1f]" },
                { v:"2-acre", k:t('curated_stat_nursery'), cls:"bg-[#0a2e1f] text-white border border-[#0a2e1f]" },
              ].map((s,i)=>(
                <motion.div key={s.v} initial={{ opacity:0, y:12 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.08 }} whileHover={{ y:-3 }} className={`rounded-[22px] px-4 py-6 md:py-7 text-center ${s.cls}`}>
                  <div className="text-xl md:text-2xl font-black">{s.v}</div><div className="text-[11px] font-bold tracking-widest uppercase opacity-60 mt-1">{s.k}</div>
                </motion.div>
              ))}
            </div>
          </Reveal>

          <div className="mt-6 flex flex-col md:flex-row items-center justify-center gap-3 text-xs text-stone-500 text-center">
            <span className="inline-flex items-center gap-2"><span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> {t('curated_footer_note')}</span>
            <span className="hidden md:block w-1 h-1 bg-stone-300 rounded-full" />
            <span className="font-mono bg-stone-50 border rounded-full px-3 py-1">H34Q+9FP, Pezhummoodu, Thiruvananthapuram 695575</span>
          </div>
        </div>
      </section>

      {/* WHY US — SHAJI'S EDITORIAL FULL-WIDTH (fresh premium, larger type) */}
      <section className="bg-[#f6f7f4] py-16 md:py-24 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 -left-20 w-[560px] h-[560px] bg-emerald-50 rounded-full blur-[80px] opacity-60" />
          <div className="absolute -bottom-20 -right-20 w-[640px] h-[520px] bg-amber-50/60 rounded-full blur-[90px] opacity-40" />
        </div>
        <div className="relative max-w-[1280px] mx-auto px-4 md:px-8 lg:px-12">
          <Reveal>
            <div className="text-center max-w-[760px] mx-auto">
              <div className="inline-flex items-center gap-2 bg-white border border-emerald-200 rounded-full px-4 py-1.5 text-xs font-black tracking-widest uppercase text-emerald-700 shadow-sm">✦ {t('why_love_us')}</div>
              <h3 className="text-[34px] md:text-[48px] font-black leading-[0.9] tracking-[-0.03em] mt-5 text-[#0a2e1f] text-balance">{t('not_just_plant')}<br/><span className="font-[Fraunces] italic font-normal text-emerald-700">{t('healthy_start')}</span></h3>
              <p className="text-[16px] md:text-[17px] text-stone-600 mt-4 leading-7 max-w-[640px] mx-auto text-balance">{t('landing_why_desc')}</p>
            </div>
          </Reveal>

          {/* 4 premium cards — 2x2 on mobile, 4-col on desktop, larger */}
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {[
              { t:t('landing_organic_title'), d:t('landing_organic_desc'), icon:'🌱', grad:'from-emerald-500 to-emerald-600' },
              { t:t('landing_expert_title'), d:t('landing_expert_desc'), icon:'👩‍🌾', grad:'from-amber-400 to-orange-400' },
              { t:t('landing_safe_title'), d:t('landing_safe_desc'), icon:'📦', grad:'from-[#0a2e1f] to-[#1a3d2e]' },
              { t:t('landing_eco_title'), d:t('landing_eco_desc'), icon:'♻️', grad:'from-teal-500 to-emerald-600' },
            ].map((f,i)=>(
              <Reveal key={f.t} delay={i*0.07}>
                <motion.div whileHover={{ y:-6, scale:1.01 }} className="group bg-white rounded-[26px] border border-stone-100 p-6 md:p-7 shadow-sm hover:shadow-[0_20px_40px_rgba(10,46,31,0.1)] hover:border-stone-200 transition flex flex-col h-full">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.grad} text-white grid place-items-center text-xl shadow-md group-hover:scale-[1.06] group-hover:rotate-1 transition`}>{f.icon}</div>
                  <div className="font-black text-[16px] tracking-tight text-[#0a2e1f] mt-4">{f.t}</div>
                  <div className="text-[14px] text-stone-500 leading-6 mt-2 flex-1">{f.d}</div>
                  <span className="mt-4 inline-flex w-8 h-8 rounded-full bg-stone-50 border border-stone-100 place-items-center text-stone-400 group-hover:bg-[#0a2e1f] group-hover:text-white transition self-start">→</span>
                </motion.div>
              </Reveal>
            ))}
          </div>

          {/* nursery banner — full width */}
          <Reveal delay={0.12}>
            <div className="mt-10 relative overflow-hidden rounded-[28px] md:rounded-[32px] border border-stone-100 shadow-[0_24px_48px_rgba(10,46,31,0.1)]">
              <img src="https://images.unsplash.com/photo-1446071103084-c257b5f70672?w=1200&q=80" alt="Shaji’s Nursery and Gardens greenhouse" className="w-full h-[380px] md:h-[460px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
              <div className="absolute top-5 left-5 hidden md:flex bg-white/90 backdrop-blur rounded-full px-4 py-2 shadow-md border border-white items-center gap-2">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" /> {t('landing_nursery_badge_small')}
              </div>
              <div className="absolute bottom-5 left-5 right-5 md:left-6 md:right-auto bg-white/95 backdrop-blur-xl rounded-[20px] p-5 shadow-xl flex gap-4 max-w-[380px] border border-white/70">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white grid place-items-center text-xl shrink-0">🌿</div>
                <div>
                  <div className="font-black text-[15px] tracking-tight text-[#0a2e1f]">{t('landing_nursery_fresh_title')}</div>
                  <div className="text-sm text-stone-500 leading-5 mt-1">{t('landing_nursery_fresh_desc')}</div>
                </div>
              </div>
              <div className="absolute top-5 right-5 hidden md:flex bg-white rounded-full px-4 py-2 shadow-lg border border-stone-100 items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-amber-400 grid place-items-center text-sm">✦</span>
                <span className="text-sm font-black">{t('landing_organic_since')}</span>
              </div>
              <div className="absolute bottom-5 right-5 hidden lg:flex bg-[#0a2e1f] text-white rounded-full px-4 py-2 shadow-lg items-center gap-2 border border-white/10">
                <span className="text-amber-300">★★★★★</span> <span className="text-sm font-bold">{t('landing_reviews_rating')}</span>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.18}>
            <div className="mt-8 flex flex-wrap gap-3 items-center justify-center">
              <Magnetic><Link to="/about" className="bg-[#0a2e1f] text-white px-7 py-3.5 rounded-full text-sm font-black hover:bg-black transition shadow-md inline-flex items-center gap-2">{t('landing_our_story')} <span>→</span></Link></Magnetic>
              <span className="bg-white border border-stone-200 rounded-full px-5 py-2.5 text-sm font-bold text-stone-700 flex items-center gap-2 shadow-sm"><span className="text-amber-500">★★★★★</span> {t('landing_reviews_rating')}</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* NURSERY DIRECT PROMISE - DARK GLASS */}
      <section className="bg-[#0a2e1f] text-white py-12 md:py-16 overflow-hidden relative">
        <motion.div animate={{ x:[0,14,0], y:[0,-10,0] }} transition={{ duration:9, repeat:Infinity, ease:"easeInOut" }} className="absolute -top-20 -right-20 w-[420px] h-[420px] bg-emerald-500/10 rounded-full blur-3xl"></motion.div>
        <motion.div animate={{ x:[0,-10,0], y:[0,12,0] }} transition={{ duration:10, repeat:Infinity, ease:"easeInOut" }} className="absolute -bottom-20 -left-20 w-[380px] h-[380px] bg-amber-500/10 rounded-full blur-3xl"></motion.div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.06),transparent_50%)]" />

        <div className="max-w-[1280px] mx-auto px-4 md:px-8 lg:px-12 relative">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 md:gap-10 items-center">
            <Reveal>
              <div>
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-full px-3 py-1.5 text-xs font-black tracking-widest uppercase text-emerald-200">{t('landing_direct_badge')}</div>
                <h2 className="mt-4 text-[28px] md:text-[44px] font-black leading-[0.9] tracking-[-0.03em]">{t('landing_grown_title1')}<br/><span className="font-[Fraunces] italic font-normal text-emerald-300">{t('landing_grown_title2')}</span></h2>
                <p className="mt-4 text-sm md:text-[15px] leading-6 text-white/70 max-w-[560px]">{t('landing_grown_desc')}</p>

                <div className="mt-7 grid grid-cols-3 gap-3">
                  {[
                    { v:t('landing_stat_48h'), k:t('landing_stat_48h_label'), cls:"bg-white/10 backdrop-blur border border-white/15" },
                    { v:t('landing_stat_damage'), k:t('landing_stat_damage_label'), cls:"bg-white/10 backdrop-blur border border-white/15" },
                    { v:t('landing_stat_replace'), k:t('landing_stat_replace_label'), cls:"bg-white text-[#0a2e1f] shadow-lg" },
                  ].map((s,i)=>(
                    <motion.div key={s.v} initial={{ opacity:0, y:12 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.08 }} whileHover={{ y:-3, scale:1.02 }} className={`${s.cls} rounded-[20px] p-4 text-center`}>
                      <div className={`text-xl font-black ${i===2?'text-[#0a2e1f]': i===0?'text-amber-300':'text-emerald-300'}`}>{s.v}</div>
                      <div className={`text-xs font-bold leading-tight mt-1 ${i===2?'text-[#0a2e1f]':'text-white/90'}`}>{s.k}</div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-7 flex flex-wrap gap-3">
                  <motion.div whileHover={{ scale:1.03 }}><Link to="/about" className="bg-white text-[#0a2e1f] px-6 py-3 rounded-full text-sm font-black hover:bg-stone-100 transition shadow inline-flex">{t('landing_meet_growers')}</Link></motion.div>
                  <Link to="/shop" className="bg-emerald-600 text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-emerald-700 transition border border-emerald-500">{t('landing_shop_live')}</Link>
                </div>
              </div>
            </Reveal>

            <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={{ hidden:{}, show:{ transition:{ staggerChildren:0.08 } } }} className="grid grid-cols-2 gap-3 md:gap-4">
              {[
                { title:t('landing_handpicked_title'), desc:t('landing_handpicked_desc'), icon:'🤲', img:'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400' },
                { title:t('landing_livepacked_title'), desc:t('landing_livepacked_desc'), icon:'📦', img:'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400' },
                { title:t('landing_qr_title'), desc:t('landing_qr_desc'), icon:'📱', img:'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=400' },
                { title:t('landing_lifetime_title'), desc:t('landing_lifetime_desc'), icon:'💬', img:'https://images.unsplash.com/photo-1446071103084-c257b5f70672?w=400' },
              ].map(card=>(
                <motion.div key={card.title} variants={{ hidden:{ opacity:0, y:16 }, show:{ opacity:1, y:0 } }} whileHover={{ y:-6, rotate:0.4 }} className="bg-white rounded-[24px] overflow-hidden border border-white/10 shadow-[0_16px_32px_rgba(0,0,0,0.18)] group">
                  <div className="relative overflow-hidden">
                    <motion.img whileHover={{ scale:1.08 }} transition={{ duration:0.6 }} src={card.img} alt={card.title} className="w-full h-28 object-cover"/>
                    <motion.div whileHover={{ scale:1.15, rotate:8 }} className="absolute top-2 left-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur grid place-items-center text-xs shadow">{card.icon}</motion.div>
                  </div>
                  <div className="p-4">
                    <div className="text-[11px] font-black tracking-widest uppercase text-emerald-700">{card.title}</div>
                    <div className="text-sm font-bold leading-tight mt-1 text-stone-900">{card.desc}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <Reveal delay={0.15}>
            <motion.div whileHover={{ y:-2 }} className="mt-10 bg-white rounded-[28px] p-4 md:p-5 flex flex-col md:flex-row items-center gap-4 justify-between text-stone-900 shadow-[0_16px_40px_rgba(0,0,0,0.18)] border border-white/50">
              <div className="flex items-center gap-3">
                <img src="https://i.pravatar.cc/100?img=5" alt="grower" className="w-10 h-10 rounded-full object-cover border border-stone-200"/>
                <div><div className="font-black text-sm tracking-tight">{t('landing_quote')}</div><div className="text-xs text-stone-500">{t('landing_quote_author')}</div></div>
              </div>
              <div className="flex items-center gap-2 text-amber-500 text-sm font-black">{t('landing_reviews_rating')}</div>
            </motion.div>
          </Reveal>
        </div>
      </section>

    </div>
  )
}
