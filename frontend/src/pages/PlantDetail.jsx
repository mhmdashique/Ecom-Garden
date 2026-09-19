import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import PlantCard from '../components/PlantCard';
import VariantPricingWidget from '../components/VariantPricingWidget';
import { useLanguage } from '../context/LanguageContext';



export default function PlantDetail(){
  const {id}=useParams();
  const [plant,setPlant]=useState(null);
  const [qty,setQty]=useState(1);
  const [review,setReview]=useState({rating:5,comment:''});
  const [activeImg,setActiveImg]=useState(0);
  const [adding,setAdding]=useState(false);
  const [buying,setBuying]=useState(false);
  const [added,setAdded]=useState(false);
  const [fly,setFly]=useState(null);
  const [zoom,setZoom]=useState(false);
  const [wish,setWish]=useState(false);
  const imgRef=useRef(null);
  const btnRef=useRef(null);
  const buyRef=useRef(null);
  const {add}=useCart();
  const {user}=useAuth();
  const nav = useNavigate();
  const {success, error: toastError}=useToast();
  const {t}=useLanguage();

  const requireLogin = () => {
    if (!user) {
      toastError('Please login to add to cart or explore');
      nav('/login');
      return false;
    }
    return true;
  };

  useEffect(()=>{
    if(!user || !id) return;
    let cancelled=false;
    api.get('/wishlist').then(r=>{
      if(cancelled) return;
      const ids=new Set((r.data||[]).map(w=>String(w.plant_id)));
      if(ids.has(String(id))) setWish(true);
    }).catch(()=>{});
    return ()=>{cancelled=true;};
  },[user,id]);

  const toggleWish = async () => {
    if(!user){ toastError('Please login to use wishlist'); return; }
    try{
      if(!wish){
        await api.post('/wishlist',{plant_id:id});
        setWish(true);
        success('Added to wishlist');
      } else {
        try{ await api.delete(`/wishlist/by-plant/${id}`); }
        catch{
          const {data}=await api.get('/wishlist');
          const entry=(data||[]).find(w=>String(w.plant_id)===String(id));
          if(entry) await api.delete(`/wishlist/${entry.id}`);
        }
        setWish(false);
        success('Removed from wishlist');
      }
    } catch(err){ toastError(err.response?.data?.error||'Wishlist failed'); }
  };

  const [variant,setVariant]=useState('potted');
  const [priceMode,setPriceMode]=useState('retail');

  useEffect(()=>{ api.get(`/plants/${id}`).then(r=>setPlant(r.data)).catch(()=>{}); },[id]);
  if(!plant) return <div className="max-w-6xl mx-auto p-6"><div className="animate-pulse rounded-[24px] bg-[#e8f0e3] h-[480px] border" /></div>;

  const handleAdd=(buyNow=false)=>{
    if (!requireLogin()) return;
    if(adding || buying) return;
    if(buyNow) setBuying(true); else setAdding(true);
    const imgRect = imgRef.current?.getBoundingClientRect();
    if(imgRect){
      setFly({ startX: imgRect.left + imgRect.width/2, startY: imgRect.top + imgRect.height/3, endX: window.innerWidth - 40, endY: 20 });
      setTimeout(()=>setFly(null), 900);
    }
    setTimeout(()=>{
      const priceToUse = price;
      const cartPlant = { ...plant, price: priceToUse, discount_price: null, selectedVariant: variant, priceMode };
      add(cartPlant,qty);
      if(buyNow){
        setBuying(false);
        success(`Buying ${qty} × ${plant.name} — redirecting to cart`);
        window.location.href='/cart';
      } else {
        setAdding(false);
        setAdded(true);
        success(`${plant.name} ×${qty} added to cart`);
        setTimeout(()=>setAdded(false), 1800);
      }
    }, buyNow? 600 : 450);
  };

  const submitReview=async(e)=>{
    e.preventDefault();
    try{
      await api.post('/reviews',{plant_id:id, rating:review.rating, comment:review.comment});
      success('Review submitted — thank you!');
      setTimeout(()=>window.location.reload(),800);
    } catch { toastError('Failed to submit review'); }
  };

  const isWholesale = priceMode==='wholesale';
  let basePrice = isWholesale ? (plant.wholesale_price||plant.price) : plant.price;
  let calcPrice = plant.discount_price && !isWholesale ? plant.discount_price : basePrice;
  if(variant==='cutting' && plant.cuttings_available){
    calcPrice = Math.round(calcPrice * 0.8 * 100)/100;
  }
  const price = calcPrice;
  const marketPrice = plant.market_price;
  const cutSavings = variant==='cutting' ? Math.round((isWholesale ? (plant.wholesale_price||plant.price) : (plant.discount_price||plant.price) ) * 0.2) : 0;

  const stockLabel = plant.stock_qty>10 ? 'In stock' : plant.stock_qty>0 ? 'Low stock' : 'Out of stock';
  const stockTone = plant.stock_qty>10 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : plant.stock_qty>0 ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-red-50 border-red-200 text-red-700';

  return (
    <div className="bg-[#fdfbf7] min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
        {/* breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs">
          <Link to="/" className="rounded-full bg-white border px-3 py-1 font-bold text-gray-600 hover:border-emerald-200">{t('pd_home')}</Link>
          <span aria-hidden className="text-gray-400">›</span>
          <Link to="/shop" className="rounded-full bg-white border px-3 py-1 font-bold text-gray-600 hover:border-emerald-200">{t('pd_shop')}</Link>
          <span aria-hidden className="text-gray-400">›</span>
          <span className="rounded-full bg-[#0a2e1f] px-3 py-1 font-black text-white">{plant.name}</span>
        </nav>

        <div className="mt-5 grid lg:grid-cols-[1.15fr_0.85fr] gap-6 md:gap-8">
          {/* left gallery */}
          <div className="flex flex-col gap-3 md:flex-row">
            {/* thumbnails - vertical on desktop */}
            <div className="order-2 md:order-1 flex md:flex-col gap-2.5 overflow-auto md:w-[96px] md:shrink-0 pb-1 md:pb-0">
              {plant.images?.map((img,i)=>(
                <button
                  key={i}
                  onClick={()=>setActiveImg(i)}
                  aria-label={`View image ${i+1}`}
                  aria-current={activeImg===i}
                  className={`shrink-0 overflow-hidden rounded-2xl border-2 bg-white transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0a2e1f] ${activeImg===i?'border-[#0a2e1f] shadow-md':'border-white/60 hover:border-emerald-200'}`}
                >
                  <img src={encodeURI(img)} className="h-20 w-20 md:h-[88px] md:w-[88px] object-cover" alt={`Thumb ${i+1}`}/>
                </button>
              ))}
              {plant.images?.length===1 && (
                <div className="hidden md:grid h-[88px] w-[88px] place-items-center rounded-2xl border-2 border-dashed bg-white text-xs font-bold text-gray-400">+ more<br/>on request</div>
              )}
            </div>

            {/* main */}
            <div className="order-1 md:order-2 flex-1">
              <div
                ref={imgRef}
                onMouseEnter={()=>setZoom(true)}
                onMouseLeave={()=>setZoom(false)}
                className="relative overflow-hidden rounded-[28px] border border-white/60 bg-white/70 backdrop-blur-xl p-2 shadow-[0_12px_40px_rgba(10,46,31,0.08)]"
              >
                <div className="relative overflow-hidden rounded-[20px] bg-[#f6f7f4]">
                  <img
                    src={encodeURI(plant.images?.[activeImg]||'')}
                    alt={plant.name}
                    className={`w-full h-[380px] md:h-[560px] object-cover transition duration-700 ${zoom ? 'scale-[1.06]' : 'scale-100'}`}
                  />
                  {/* zoom hint */}
                  <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-[#0a2e1f] backdrop-blur border shadow-sm">
                    {zoom ? 'Zoomed • hover to inspect' : 'Hover to zoom'}
                  </span>
                  {/* stock pill */}
                  <span className={`absolute right-4 top-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black backdrop-blur-md shadow-sm ${stockTone}`}>
                    <span className={`h-2 w-2 rounded-full ${plant.stock_qty>10?'bg-emerald-500': plant.stock_qty>0?'bg-amber-500':'bg-red-500'}`} /> {stockLabel} • {plant.stock_qty} pcs
                  </span>
                </div>
              </div>

              {/* quick meta */}
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[
                  {k:t('pd_height'), v: plant.height_at_shipping || t('pd_height_val')},
                  {k:t('pd_pot'), v: plant.pot_size || t('pd_pot_val')},
                  {k:t('pd_pet_safe'), v: plant.pet_safe ? '✓ Safe' : 'Check tag'},
                ].map(s=>(
                  <div key={s.k} className="rounded-2xl border bg-white/80 backdrop-blur p-3 text-center shadow-sm">
                    <div className="text-[11px] font-black tracking-widest text-gray-500">{s.k}</div>
                    <div className="mt-0.5 text-sm font-black text-[#0a2e1f]">{s.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* right info */}
          <div className="rounded-[28px] border border-white/60 bg-white/80 backdrop-blur-xl shadow-[0_12px_40px_rgba(10,46,31,0.08)] p-5 md:p-7 h-fit lg:sticky lg:top-[80px]">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="font-outfit text-[26px] md:text-[32px] font-black tracking-tight leading-none text-[#0a2e1f]">{plant.name}</h1>
                {plant.botanical && <p className="mt-1 text-xs italic text-gray-500">{plant.botanical_name || plant.botanical}</p>}
                <p className="mt-2 flex flex-wrap items-center gap-2 text-xs font-bold">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f6f7f4] border px-2.5 py-1 text-gray-700">{plant.sunlight} • {plant.care_level || 'Easy'}</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-amber-700">★ {plant.rating || 4.9} <span className="text-gray-500">({plant.reviews?.length||1})</span></span>
                  {plant.sku && <span className="rounded-full border bg-white px-2.5 py-1 font-mono text-gray-600">SKU {plant.sku}</span>}
                </p>
              </div>
              <button
                type="button"
                aria-label={wish ? 'Remove from wishlist' : 'Add to wishlist'}
                aria-pressed={wish}
                onClick={toggleWish}
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0a2e1f] ${wish ? 'bg-[#0a2e1f] text-white border-[#0a2e1f]' : 'bg-white text-gray-600 hover:bg-[#fdfbf7]'}`}
              >
                <span aria-hidden className="text-lg leading-none">{wish ? '♥' : '♡'}</span>
              </button>
            </div>

            {/* variant pricing */}
            {plant.variants ? (
              <div className="mt-5">
                <VariantPricingWidget product={plant} onAddToCart={({variant, variantId, unitPrice, quantity})=>{
                  if (!requireLogin()) return;
                  const cartPlant = { ...plant, price: unitPrice, discount_price: null, selectedVariant: variant, variantId, priceMode: 'variant', variants: undefined };
                  const imgRect = imgRef.current?.getBoundingClientRect();
                  if(imgRect){
                    setFly({ startX: imgRect.left + imgRect.width/2, startY: imgRect.top + imgRect.height/3, endX: window.innerWidth - 40, endY: 20 });
                    setTimeout(()=>setFly(null), 900);
                  }
                  add(cartPlant, quantity);
                  success(`${plant.name} (${variant}) ×${quantity} — ₹${unitPrice*quantity} added`);
                }} />
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {/* variant pills */}
                <div className="flex gap-2">
                  {plant.potted_available && <button type="button" onClick={()=>setVariant('potted')} aria-pressed={variant==='potted'} className={`flex-1 rounded-full border-2 py-2.5 text-xs font-black transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0a2e1f] ${variant==='potted'?'bg-[#0a2e1f] text-white border-[#0a2e1f] shadow-md':'bg-white border-gray-200 hover:border-emerald-200'}`}>🪴 {t('pd_potted_available')}</button>}
                  {plant.cuttings_available && <button type="button" onClick={()=>setVariant('cutting')} aria-pressed={variant==='cutting'} className={`flex-1 rounded-full border-2 py-2.5 text-xs font-black transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0a2e1f] ${variant==='cutting'?'bg-emerald-600 text-white border-emerald-600 shadow-md':'bg-white border-gray-200 hover:border-emerald-200'}`}>✂️ {t('pd_cuttings_available')}</button>}
                  {!plant.cuttings_available && !plant.potted_available && <span className="text-xs font-bold text-gray-500">{t('pd_potted_only')}</span>}
                </div>
                {/* wholesale toggle */}
                <div className="flex flex-wrap items-center gap-2 rounded-full border bg-[#f6f7f4] p-1 w-fit">
                  <button type="button" onClick={()=>setPriceMode('retail')} aria-pressed={!isWholesale} className={`rounded-full px-4 py-1.5 text-xs font-black transition ${!isWholesale?'bg-white shadow border text-[#0a2e1f]':'text-gray-600'}`}>{t('pd_retail')}</button>
                  <button type="button" onClick={()=>setPriceMode('wholesale')} aria-pressed={isWholesale} className={`rounded-full px-4 py-1.5 text-xs font-black transition ${isWholesale?'bg-[#0a2e1f] text-white shadow':'text-gray-600'}`}>{t('pd_wholesale')}</button>
                  <span className="pr-2 text-xs text-gray-500 hidden sm:block">{isWholesale?t('pd_min_bulk'):t('pd_single_unit')}</span>
                </div>
              </div>
            )}

            {!plant.variants && (
              <div className="mt-4 flex flex-wrap items-baseline gap-3 rounded-2xl border bg-[#fdfbf7] px-4 py-3">
                <span className="text-[28px] font-black text-[#0a2e1f]">₹{price.toFixed(2)}</span>
                {!isWholesale && variant==='cutting' && plant.cuttings_available && <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-black text-emerald-700">{t('pd_cutting_20')}</span>}
                {!isWholesale && variant==='potted' && plant.discount_price && <span className="text-sm text-gray-400 line-through font-medium">₹{plant.price.toFixed(2)}</span>}
                {marketPrice && marketPrice > price && <span className="rounded-full bg-white border px-2.5 py-1 text-xs font-bold text-gray-500">MRP ₹{Number(marketPrice).toFixed(2)}</span>}
                {isWholesale && <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-black text-amber-700">{t('pd_wholesale_badge')}</span>}
                {variant==='cutting' && plant.cuttings_available && <span className="text-xs font-bold text-emerald-700">• {t('pd_save_vs_potted')} ₹{cutSavings}</span>}
                <span className="w-full text-xs text-gray-500">incl. taxes • Extra potted shipping ₹39-79 at owner confirmation</span>
              </div>
            )}

            <p className="mt-4 text-sm leading-6 text-gray-600">{plant.description}</p>

            {!plant.variants && (
              <div className="mt-6">
                <div className="text-xs font-black tracking-widest text-gray-500">{t('pd_quantity')}</div>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex items-center rounded-full border bg-[#f6f7f4] p-1">
                    <button type="button" aria-label="Decrease quantity" onClick={()=>setQty(q=>Math.max(1,q-1))} className="grid h-9 w-9 place-items-center rounded-full bg-white border hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0a2e1f]">−</button>
                    <span className="w-12 text-center font-black" aria-live="polite">{qty}</span>
                    <button type="button" aria-label="Increase quantity" onClick={()=>setQty(q=>Math.min(plant.stock_qty||99, q+1))} className="grid h-9 w-9 place-items-center rounded-full bg-white border hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0a2e1f]">+</button>
                  </div>
                  <span className="text-xs font-bold text-gray-600">₹{(price*qty).toFixed(2)} {t('pd_total')} • ₹{price.toFixed(2)}/unit</span>
                </div>

                <div className="mt-4 flex gap-3">
                  <button ref={btnRef} type="button" onClick={()=>handleAdd(false)} disabled={adding || buying || plant.stock_qty===0} className={`flex-1 inline-flex items-center justify-center gap-2 rounded-full py-3.5 text-sm font-black shadow-md transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0a2e1f] disabled:opacity-50 ${added ? 'bg-emerald-600 text-white' : 'bg-[#0a7a2b] hover:bg-[#095e22] text-white hover:shadow-lg active:scale-[0.99]'}`}>
                    {adding ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> {t('pd_adding')}</> : added ? <>✓ {t('pd_added')} • {qty} × ₹{price.toFixed(2)}</> : <><span aria-hidden>🛒</span> {t('pd_add_to_cart')}</>}
                  </button>
                  <button ref={buyRef} type="button" onClick={()=>handleAdd(true)} disabled={adding || buying || plant.stock_qty===0} className="group relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-full bg-[#0a2e1f] py-3.5 text-sm font-black text-white shadow-md hover:bg-black hover:shadow-lg active:scale-[0.99] transition disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0a2e1f]">
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition duration-700" aria-hidden />
                    {buying ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> {t('pd_buying')}</> : <><span aria-hidden className="text-amber-300">⚡</span> {t('pd_buy_now')}</>}
                  </button>
                </div>
                <p className="mt-2.5 flex items-center justify-center gap-2 text-xs font-medium text-gray-500"><span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> {t('pd_in_stock_ships')}</p>

                {/* mobile sticky bar */}
                <div className="lg:hidden fixed bottom-[68px] inset-x-0 z-30 border-t bg-white/95 backdrop-blur shadow-[0_-8px_24px_rgba(0,0,0,0.08)] px-4 py-3 flex gap-3">
                  <div className="flex items-center rounded-full border bg-[#f6f7f4] p-1">
                    <button type="button" aria-label="Decrease" onClick={()=>setQty(q=>Math.max(1,q-1))} className="grid h-8 w-8 place-items-center rounded-full bg-white border">−</button>
                    <span className="w-8 text-center text-sm font-black">{qty}</span>
                    <button type="button" aria-label="Increase" onClick={()=>setQty(q=>Math.min(plant.stock_qty||99, q+1))} className="grid h-8 w-8 place-items-center rounded-full bg-white border">+</button>
                  </div>
                  <button type="button" onClick={()=>handleAdd(false)} className="flex-1 rounded-full bg-[#0a7a2b] py-2.5 text-sm font-black text-white">{adding?'...':`🛒 ${t('pd_add_to_cart')}`}</button>
                  <button type="button" onClick={()=>handleAdd(true)} className="flex-1 rounded-full bg-[#0a2e1f] py-2.5 text-sm font-black text-white">{buying?'...':`⚡ ${t('pd_buy_now')}`}</button>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* PLANT DETAILS - COMPREHENSIVE */}
        <div className="mt-6 rounded-[24px] border border-white/60 bg-white/80 backdrop-blur-xl shadow-[0_8px_30px_rgba(10,46,31,0.06)] p-6 md:p-7">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 text-lg font-black text-[#0a2e1f]">🌿 {t('pd_plant_details')} <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold tracking-widest text-emerald-700">{plant.sku || plant.id}</span></h3>
            <span className={`rounded-full border px-3 py-1 text-xs font-black ${plant.stock_status==='in_stock'?'bg-emerald-50 border-emerald-200 text-emerald-700': plant.stock_status==='low_stock'?'bg-amber-50 border-amber-200 text-amber-700':'bg-red-50 border-red-200 text-red-700'}`}>● {(plant.stock_status?.replace('_',' ') || (plant.stock_qty>20?t('pd_in_stock'): 'low stock'))} • {plant.stock_qty} pcs</span>
          </div>
          <p className="mt-1 text-xs text-gray-500">{t('pd_id')}: <span className="font-mono font-bold">{plant.id}</span> • {t('pd_created')}: {plant.created_at ? new Date(plant.created_at).toLocaleDateString() : '—'} • {t('pd_updated')}: {plant.updated_at ? new Date(plant.updated_at).toLocaleDateString() : '—'}</p>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border bg-[#f8f7f2] p-4">
              <h4 className="text-xs font-black tracking-widest text-emerald-700">{t('pd_short_description')}</h4>
              <p className="mt-2 text-sm leading-6 text-gray-700">{plant.short_description || plant.description}</p>
            </div>
            <div className="rounded-2xl border bg-white p-4">
              <h4 className="text-xs font-black tracking-widest text-gray-600">{t('pd_long_description')}</h4>
              <p className="mt-2 text-sm leading-6 text-gray-700">{plant.long_description || plant.description}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="text-xs font-black tracking-widest text-gray-500">{t('pd_core_specs')}</h4>
              <div className="mt-3 divide-y overflow-hidden rounded-2xl border bg-white">
                {[
                  [t('pd_id'), plant.id],
                  ['Name', plant.name],
                  ['Botanical', plant.botanical_name || plant.botanical || '—'],
                  ['Category ID', (plant.category_id || '—') + ' • ' + ({ '1':'Indoor', '2':'Outdoor', '3':'Succulents', '4':'Flowering', '5':'Seeds & Tools' }[plant.category_id] || '')],
                  [t('pd_sku_label'), plant.sku || '—'],
                  [t('pd_price_retail'), `₹${plant.price}`],
                  [t('pd_discount_price'), plant.discount_price ? `₹${plant.discount_price}` : '—'],
                  [t('pd_wholesale_price'), plant.wholesale_price ? `₹${plant.wholesale_price}` : '—'],
                  [t('pd_market_price'), marketPrice ? `₹${marketPrice}` : '—'],
                  [t('pd_stock_qty'), plant.stock_qty],
                  [t('pd_stock_status'), plant.stock_status || stockLabel],
                  [t('pd_pet_safe_label'), plant.pet_safe ? '✅ '+t('pd_yes') : '❌ '+t('pd_no')],
                  [t('pd_growth_rate'), plant.growth_rate || '—'],
                  [t('pd_mature_size'), plant.mature_size || '—'],
                  [t('pd_difficulty'), plant.difficulty_level || plant.care_level || '—'],
                  [t('pd_pot_included'), plant.pot_included ? t('pd_yes') : t('pd_no')],
                  [t('pd_pot_size'), plant.pot_size || '—'],
                  [t('pd_height_shipping'), plant.height_at_shipping || '—'],
                  [t('pd_weight'), plant.weight || '—'],
                ].map(([k,v])=>(
                  <div key={k} className="flex justify-between gap-4 px-4 py-2 text-sm">
                    <span className="shrink-0 font-medium text-gray-500">{k}</span>
                    <span className="break-all text-right font-bold text-gray-900">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl border bg-[#f8f7f2] p-4">
                <h4 className="text-xs font-black tracking-widest text-emerald-700">{t('pd_plant_images')}</h4>
                <div className="mt-3 flex gap-2 overflow-auto pb-1">
                  {(plant.images || []).map((u,i)=>(
                    <div key={i} className="shrink-0 text-center">
                      <img src={encodeURI(u)} alt={`img ${i}`} className="h-20 w-20 rounded-xl border bg-white object-cover"/>
                      <div className="mt-1 text-xs font-bold">#{i} order {i}</div>
                      <div className="w-20 truncate text-[10px] text-gray-500">{u.split('/').pop()}</div>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-xs text-gray-500">{t('pd_table_note')}</p>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <h4 className="text-xs font-black tracking-widest text-amber-800">{t('pd_shipping_wholesale')}</h4>
                <p className="mt-1 text-xs leading-5 text-amber-900">{plant.shipping_extra || 'Extra potted shipping ₹39-79 confirmed by owner at call. Cuttings ship light & free.'}</p>
                <p className="mt-2 text-xs font-bold leading-5 text-amber-800">{plant.wholesale_note || 'Wholesale: 10+ pcs = 5% off, 25+ =10%, 50+ =15%, 100+ =20%. Mix variants allowed.'}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full border bg-[#f6f7f4] px-3 py-1.5 text-xs font-bold">✓ {t('pd_sku_label')}: {plant.sku || plant.id}</span>
            <span className="rounded-full border bg-[#f6f7f4] px-3 py-1.5 text-xs font-bold">✓ {t('pd_pot_label')}: {plant.pot_included?t('pd_included'):t('pd_not_included')} • {plant.pot_size || '5 inch'}</span>
            <span className={`rounded-full border px-3 py-1.5 text-xs font-bold ${plant.pet_safe?'bg-emerald-50 border-emerald-200 text-emerald-700':'bg-red-50 border-red-200 text-red-700'}`}>{plant.pet_safe?'🐾 '+t('pd_pet_safe'):'⚠️ Not Pet Safe'}</span>
            <span className="rounded-full border bg-[#f6f7f4] px-3 py-1.5 text-xs font-bold">{t('pd_weight')}: {plant.weight || '—'}</span>
          </div>
        </div>

        {/* reviews */}
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-[24px] border border-white/60 bg-white/80 backdrop-blur-xl shadow-sm p-6 md:p-7">
            <div className="flex items-center justify-between">
              <h3 className="font-outfit text-lg font-black text-[#0a2e1f]">{t('pd_customer_reviews')}</h3>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">★ {plant.rating || 4.9} • {plant.reviews?.length||0} {t('pd_reviews_label')}</span>
            </div>
            <div className="mt-5 space-y-4">
              {plant.reviews?.length ? plant.reviews.map(r=>(
                <div key={r.id} className="border-b pb-4 last:border-0">
                  <div className="flex items-center gap-2 text-sm"><span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-100 font-bold text-emerald-700">{r.user_name?.[0] || r.user_id?.[0] || 'U'}</span><strong>{r.user_name || r.user_id}</strong> <span className="text-amber-500">{'★'.repeat(r.rating)}</span><span className="ml-auto text-xs text-gray-400">{r.created_at ? new Date(r.created_at).toLocaleDateString() : ''}</span></div>
                  <p className="mt-2 text-sm leading-6 text-gray-600">{r.comment}</p>
                  {r.review_image_url && <img src={encodeURI(r.review_image_url)} alt="review" className="mt-2 h-20 w-32 rounded-xl border object-cover"/>}
                  <p className="mt-1 font-mono text-[11px] text-gray-400">plant_reviews: {r.id} • plant_id {r.plant_id} • user_id {r.user_id} {r.review_image_url ? `• image ${r.review_image_url}` : '• no image'}</p>
                </div>
              )) : <p className="rounded-2xl border bg-[#f6f7f4] px-4 py-6 text-center text-sm text-gray-500">{t('pd_no_reviews')}</p>}
            </div>
            {user ? (
              <form onSubmit={submitReview} className="mt-6 flex flex-col gap-3 rounded-2xl border bg-[#f6f7f4] p-4">
                <div className="text-xs font-black tracking-widest text-[#0a2e1f]">{t('pd_write_review')}</div>
                <label className="text-xs font-bold text-gray-600">Rating
                  <select value={review.rating} onChange={e=>setReview({...review,rating:+e.target.value})} className="mt-1 w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-300"><option value={5}>{t('pd_excellent')}</option><option value={4}>{t('pd_good')}</option><option value={3}>{t('pd_average')}</option><option value={2}>{t('pd_poor')}</option><option value={1}>{t('pd_bad')}</option></select>
                </label>
                <label className="text-xs font-bold text-gray-600">Comment
                  <textarea placeholder={t('pd_share_experience')} value={review.comment} onChange={e=>setReview({...review,comment:e.target.value})} className="mt-1 min-h-[80px] w-full rounded-xl border bg-white px-3 py-3 text-sm outline-none focus:border-emerald-300" required/>
                </label>
                <button type="submit" className="rounded-full bg-[#0a2e1f] py-2.5 text-sm font-black text-white hover:bg-black"> {t('pd_submit_review')} </button>
              </form>
            ) : <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-gray-700">{t('pd_login_to_review')} <Link to="/login" className="font-black text-emerald-700 underline">{t('pd_login')}</Link> </p>}
          </div>

          <div className="space-y-4">
            <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-6">
              <h4 className="font-black text-[#0a2e1f]">{t('pd_need_help')}</h4>
              <p className="mt-1 text-sm leading-5 text-gray-600">{t('pd_need_help_desc')}</p>
              <a href="#" className="mt-3 inline-block rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-black text-white hover:bg-emerald-700">{t('pd_chat_whatsapp')}</a>
            </div>
            <div className="rounded-[24px] border bg-white p-6">
              <h4 className="text-sm font-black text-[#0a2e1f]">{t('pd_delivery_returns')}</h4>
              <ul className="mt-2 space-y-1 text-sm leading-5 text-gray-600">
                <li>• {t('pd_delivery_2_5')}</li>
                <li>• {t('pd_secure_payments')}</li>
                <li>• 14-day replacement if harmed in transit</li>
                <li>• GST bill on request • Pezhummoodu → all Kerala</li>
              </ul>
            </div>
          </div>
        </div>

        {plant.related?.length>0 && (
          <div className="mt-10"><h3 className="font-outfit text-xl font-black text-[#0a2e1f]">{t('pd_you_may_also_like')}</h3><div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">{plant.related.map(p=><PlantCard key={p.id} plant={p}/>)}</div></div>
        )}
      </div>

      {/* fly animation */}
      {fly && (
        <img src={encodeURI(plant.images?.[0]||'')} alt="fly" className="pointer-events-none fixed z-[100] h-10 w-10 rounded-full border-2 border-white object-cover shadow-xl"
          style={{
            left: fly.startX, top: fly.startY,
            animation: 'flyToCart 0.85s cubic-bezier(0.2,0.6,0.4,1) forwards'
          }}
        />
      )}
      <style>{`@keyframes flyToCart {
        0% { transform: translate(0,0) scale(1); opacity:1 }
        60% { opacity:1 }
        100% { transform: translate(${fly ? fly.endX - fly.startX : 0}px, ${fly ? fly.endY - fly.startY : 0}px) scale(0.2); opacity:0 }
      }`}</style>

      {/* toast */}
      {added && (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full bg-[#0a2e1f] px-5 py-3 shadow-2xl animate-[slideUp_0.3s_ease]">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-500 text-white">✓</span>
          <span className="text-sm font-bold text-white">{plant.name} × {qty} added to cart</span>
          <Link to="/cart" className="rounded-full bg-white px-4 py-1.5 text-xs font-black text-black">View Cart</Link>
        </div>
      )}
      <style>{`@keyframes slideUp { from { transform: translate(-50%, 20px); opacity:0 } to { transform: translate(-50%,0); opacity:1 } }`}</style>
    </div>
  )
}
