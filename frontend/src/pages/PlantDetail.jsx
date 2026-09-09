import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  const imgRef=useRef(null);
  const btnRef=useRef(null);
  const buyRef=useRef(null);
  const {add}=useCart();
  const {user}=useAuth();
  const {success, error: toastError}=useToast();
  const {t}=useLanguage();

  const [variant,setVariant]=useState('potted');
  const [priceMode,setPriceMode]=useState('retail');

  useEffect(()=>{ api.get(`/plants/${id}`).then(r=>setPlant(r.data)).catch(()=>{}); },[id]);
  if(!plant) return <div className="max-w-6xl mx-auto p-10"><div className="animate-pulse bg-gray-100 h-[420px] rounded-[24px]"></div></div>;

  const handleAdd=(buyNow=false)=>{
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

  return (
    <div className="bg-[#fcfcfa] min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
        <div className="text-xs text-gray-500 flex gap-1.5 items-center">
          <Link to="/" className="hover:underline">{t('pd_home')}</Link> <span>›</span> <Link to="/shop" className="hover:underline">{t('pd_shop')}</Link> <span>›</span> <span className="text-gray-900 font-semibold">{plant.name}</span>
        </div>

        <div className="mt-4 grid lg:grid-cols-[1.1fr_0.9fr] gap-6 md:gap-8">
          {/* left gallery */}
          <div>
            <div ref={imgRef} className="relative bg-[#f6f7f4] rounded-[28px] overflow-hidden p-3 md:p-4 border">
              <img src={encodeURI(plant.images?.[activeImg]||'')} alt={plant.name} className="w-full h-[380px] md:h-[520px] object-cover rounded-[20px] transition hover:scale-[1.01] duration-500" />
              <span className={`absolute top-6 right-6 text-xs font-bold px-3 py-1.5 rounded-full border ${plant.stock_qty>10?'bg-emerald-50 border-emerald-200 text-emerald-700': plant.stock_qty>0?'bg-amber-50 border-amber-200 text-amber-700':'bg-red-50 border-red-200 text-red-700'}`}>
                {plant.stock_qty>0 ? `● ${t('pd_in_stock')} (${plant.stock_qty})` : t('pd_out_of_stock')}
              </span>
            </div>
            <div className="flex gap-2.5 mt-3 overflow-auto pb-1">
              {plant.images?.map((img,i)=>(
                <button key={i} onClick={()=>setActiveImg(i)} className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 ${activeImg===i?'border-emerald-600':'border-gray-200 hover:border-gray-300'}`}>
                  <img src={encodeURI(img)} className="w-full h-full object-cover" alt="thumb"/>
                </button>
              ))}
              {plant.images?.length===1 && (
                <>
                  <div className="w-20 h-20 rounded-xl border-2 border-dashed grid place-items-center text-[10px] text-gray-400">+2 more</div>
                </>
              )}
            </div>


          </div>

          {/* right info */}
          <div className="bg-white rounded-[28px] border p-5 md:p-7 h-fit lg:sticky lg:top-[80px]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-[28px] md:text-[34px] font-black tracking-tight leading-none">{plant.name}</h1>
                {plant.botanical && <p className="text-xs italic text-gray-500 mt-1">{plant.botanical}</p>}
                <p className="mt-1.5 text-xs tracking-widest uppercase font-bold text-gray-400">{plant.sunlight} • {plant.stock_qty>0?t('pd_in_stock'):t('pd_out_of_stock')} • <span className="text-amber-500">★ {plant.rating}</span> <span className="text-gray-500">({plant.reviews?.length||1} {t('pd_reviews_label')})</span> • <span className="text-emerald-700">{plant.care_level} {t('pd_care')}</span></p>
              </div>
              <button className="w-10 h-10 rounded-full border grid place-items-center hover:bg-gray-50">♡</button>
            </div>

            {/* variant pricing — trimmed to 3 SKUs as requested */}
            {plant.variants ? (
              <div className="mt-4">
                <VariantPricingWidget product={plant} onAddToCart={({variant, variantId, unitPrice, quantity})=>{
                  const cartPlant = { ...plant, price: unitPrice, discount_price: null, selectedVariant: variant, variantId, priceMode: 'variant', variants: undefined };
                  const imgRect = imgRef.current?.getBoundingClientRect();
                  if(imgRect){
                    setFly({ startX: imgRect.left + imgRect.width/2, startY: imgRect.top + imgRect.height/3, endX: window.innerWidth - 40, endY: 20 });
                    setTimeout(()=>setFly(null), 900);
                  }
                  add(cartPlant, quantity);
                  success(`${plant.name} (${variant}) ×${quantity} — ₹${unitPrice*quantity} added`);
                }} />
                <div className="mt-2 text-[11px] text-gray-500 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">{t('pd_variant_note')}</div>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {/* variant pills cuttings / potted */}
                <div className="flex gap-2">
                  {plant.potted_available && <button onClick={()=>setVariant('potted')} className={`flex-1 py-2.5 rounded-full text-xs font-black border-2 ${variant==='potted'?'bg-[#0a2e1f] text-white border-[#0a2e1f]':'bg-white border-gray-200 hover:border-emerald-300'}`}>{t('pd_potted_available')}</button>}
                  {plant.cuttings_available && <button onClick={()=>setVariant('cutting')} className={`flex-1 py-2.5 rounded-full text-xs font-black border-2 ${variant==='cutting'?'bg-emerald-600 text-white border-emerald-600':'bg-white border-gray-200 hover:border-emerald-300'}`}>{t('pd_cuttings_available')}</button>}
                  {!plant.cuttings_available && !plant.potted_available && <span className="text-xs font-bold text-gray-500">{t('pd_potted_only')}</span>}
                </div>
                {/* wholesale / retail toggle */}
                <div className="flex items-center gap-2 bg-[#f6f7f4] rounded-full p-1 border w-fit">
                  <button onClick={()=>setPriceMode('retail')} className={`px-4 py-1.5 rounded-full text-xs font-black ${!isWholesale?'bg-white shadow border':'text-gray-600'}`}>{t('pd_retail')}</button>
                  <button onClick={()=>setPriceMode('wholesale')} className={`px-4 py-1.5 rounded-full text-xs font-black ${isWholesale?'bg-[#0a2e1f] text-white':'text-gray-600'}`}>{t('pd_wholesale')}</button>
                  <span className="text-[11px] text-gray-500 pr-2 hidden sm:block">{isWholesale?t('pd_min_bulk'):t('pd_single_unit')}</span>
                </div>
              </div>
            )}

            {!plant.variants && (
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-[30px] font-black text-emerald-700">₹{price.toFixed(2)}</span>
                {!isWholesale && variant==='cutting' && plant.cuttings_available && <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black px-2 py-1 rounded-full">{t('pd_cutting_20')}</span>}
              {!isWholesale && variant==='potted' && plant.discount_price && <span className="text-gray-400 line-through font-medium">₹{plant.price.toFixed(2)}</span>}
                {isWholesale && <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-black px-2 py-1 rounded-full">{t('pd_wholesale_badge')}</span>}
                {variant==='cutting' && plant.cuttings_available && <span className="text-xs text-emerald-600 font-bold">• {t('pd_save_vs_potted')} ₹{cutSavings}</span>}
              </div>
            )}

            <p className="mt-4 text-[14.5px] leading-6 text-gray-600">{plant.description}</p>

            {!plant.variants && (
              <div className="mt-6">
                <div className="text-xs font-bold tracking-widest uppercase text-gray-600 mb-2">{t('pd_quantity')}</div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-[#f6f7f4] border rounded-full p-1">
                    <button onClick={()=>setQty(q=>Math.max(1,q-1))} className="w-9 h-9 rounded-full bg-white border grid place-items-center hover:bg-gray-50">−</button>
                    <span className="w-12 text-center font-black">{qty}</span>
                    <button onClick={()=>setQty(q=>Math.min(plant.stock_qty||99, q+1))} className="w-9 h-9 rounded-full bg-white border grid place-items-center hover:bg-gray-50">+</button>
                  </div>
                  <span className="text-xs text-gray-500">₹{(price*qty).toFixed(2)} {t('pd_total')}</span>
                </div>

                <div className="mt-4 flex gap-3">
                  <button ref={btnRef} onClick={()=>handleAdd(false)} disabled={adding || buying || plant.stock_qty===0} className={`flex-1 relative overflow-hidden rounded-full py-3.5 font-black text-sm transition flex items-center justify-center gap-2 shadow-md ${added ? 'bg-emerald-600 text-white scale-[0.98]' : 'bg-[#0a7a2b] hover:bg-[#095e22] text-white hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]'} disabled:opacity-50`}>
                    {adding ? (
                      <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span> {t('pd_adding')}</>
                    ) : added ? (
                      <>✓ {t('pd_added')} • {qty} × ₹{price.toFixed(2)}</>
                    ) : (
                      <><span>🛒</span> {t('pd_add_to_cart')}</>
                    )}
                  </button>
                  <button ref={buyRef} onClick={()=>handleAdd(true)} disabled={adding || buying || plant.stock_qty===0} className="flex-1 relative overflow-hidden rounded-full py-3.5 font-black text-sm bg-[#0a2e1f] text-white hover:bg-black border border-[#0a2e1f] shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition flex items-center justify-center gap-2 disabled:opacity-50 group">
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition duration-700"></span>
                    {buying ? (
                      <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span> {t('pd_buying')}</>
                    ) : (
                      <><span className="text-amber-300">⚡</span> {t('pd_buy_now')}</>
                    )}
                  </button>
                </div>
                <p className="text-center text-xs text-gray-500 mt-2.5 flex items-center justify-center gap-2"><span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> {t('pd_in_stock_ships')}</p>

                {/* mobile sticky bar */}
                <div className="lg:hidden fixed bottom-[68px] inset-x-0 z-30 bg-white border-t shadow-[0_-8px_24px_rgba(0,0,0,0.08)] px-4 py-3 flex gap-3">
                  <div className="flex items-center bg-[#f6f7f4] border rounded-full p-1">
                    <button onClick={()=>setQty(q=>Math.max(1,q-1))} className="w-8 h-8 rounded-full bg-white border grid place-items-center">−</button>
                    <span className="w-8 text-center font-black text-sm">{qty}</span>
                    <button onClick={()=>setQty(q=>Math.min(plant.stock_qty||99, q+1))} className="w-8 h-8 rounded-full bg-white border grid place-items-center">+</button>
                  </div>
                  <button onClick={()=>handleAdd(false)} className="flex-1 bg-[#0a7a2b] text-white rounded-full font-black text-sm flex items-center justify-center gap-1">{adding?'...':`🛒 ${t('pd_add_to_cart')}`}</button>
                  <button onClick={()=>handleAdd(true)} className="flex-1 bg-[#0a2e1f] text-white rounded-full font-black text-sm flex items-center justify-center gap-1">{buying?'...':`⚡ ${t('pd_buy_now')}`}</button>
                </div>
              </div>
            )}

            {/* highlights */}
            <div className="mt-6 grid grid-cols-3 gap-2 text-center">
              {[
                {k:t('pd_height'), v:t('pd_height_val')},
                {k:t('pd_pot'), v:t('pd_pot_val')},
                {k:t('pd_pet_safe'), v:t('pd_check_tag')},
              ].map(s=>(
                <div key={s.k} className="bg-[#f6f7f4] rounded-2xl p-3 border">
                  <div className="text-[11px] tracking-widest uppercase font-bold text-gray-500">{s.k}</div>
                  <div className="text-sm font-black mt-0.5">{s.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PLANT DETAILS - COMPREHENSIVE (per requested schema) */}
        <div className="mt-6 bg-white rounded-[24px] border p-6 md:p-7">
          <div className="flex flex-wrap items-center gap-2 justify-between">
            <h3 className="text-lg font-black flex items-center gap-2">🌿 {t('pd_plant_details')} <span className="text-xs font-bold tracking-widest uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">{plant.sku || plant.id}</span></h3>
            <span className={`text-xs font-black px-3 py-1 rounded-full border ${plant.stock_status==='in_stock'?'bg-emerald-50 border-emerald-200 text-emerald-700': plant.stock_status==='low_stock'?'bg-amber-50 border-amber-200 text-amber-700':'bg-red-50 border-red-200 text-red-700'}`}>● {plant.stock_status?.replace('_',' ') || (plant.stock_qty>20?t('pd_in_stock'): 'low stock')} • {plant.stock_qty} pcs</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">{t('pd_id')}: <span className="font-mono font-bold">{plant.id}</span> • {t('pd_created')}: {new Date(plant.created_at).toLocaleDateString()} • {t('pd_updated')}: {new Date(plant.updated_at).toLocaleDateString()}</p>

          {/* short vs long */}
          <div className="mt-4 grid md:grid-cols-2 gap-4">
            <div className="bg-[#f8f7f2] rounded-2xl p-4 border">
              <h4 className="text-xs font-black tracking-widest uppercase text-emerald-700">{t('pd_short_description')}</h4>
              <p className="text-sm leading-6 text-gray-700 mt-2">{plant.short_description || plant.description}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border">
              <h4 className="text-xs font-black tracking-widest uppercase text-gray-600">{t('pd_long_description')}</h4>
              <p className="text-sm leading-6 text-gray-700 mt-2">{plant.long_description || plant.description}</p>
            </div>
          </div>

          <div className="mt-6 grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-xs font-black tracking-widest uppercase text-gray-500">{t('pd_core_specs')}</h4>
              <div className="mt-3 divide-y border rounded-2xl overflow-hidden">
                {[
                  [t('pd_id'), plant.id],
                  ['Name', plant.name],
                  [t('pd_price_retail')==='Price (Retail)'? 'Botanical Name' : 'ബൊട്ടാണിക്കൽ പേര്', plant.botanical_name || plant.botanical || '—'],
                  ['Category ID', plant.category_id + ' • ' + ({ '1':'Indoor', '2':'Outdoor', '3':'Succulents', '4':'Flowering', '5':'Seeds & Tools' }[plant.category_id] || '')],
                  [t('pd_sku_label'), plant.sku || '—'],
                  [t('pd_price_retail'), `₹${plant.price}`],
                  [t('pd_discount_price'), plant.discount_price ? `₹${plant.discount_price}` : '—'],
                  [t('pd_wholesale_price'), plant.wholesale_price ? `₹${plant.wholesale_price}` : '—'],
                  [t('pd_market_price'), marketPrice ? `₹${marketPrice}` : '—'],
                  [t('pd_stock_qty'), plant.stock_qty],
                  [t('pd_stock_status'), plant.stock_status],
                  [t('pd_pet_safe_label'), plant.pet_safe ? '✅ '+t('pd_yes') : '❌ '+t('pd_no')],
                  [t('pd_growth_rate'), plant.growth_rate],
                  [t('pd_mature_size'), plant.mature_size],
                  [t('pd_difficulty'), plant.difficulty_level || plant.care_level],
                  [t('pd_pot_included'), plant.pot_included ? t('pd_yes') : t('pd_no')],
                  [t('pd_pot_size'), plant.pot_size],
                  [t('pd_height_shipping'), plant.height_at_shipping],
                  [t('pd_weight'), plant.weight],
                ].map(([k,v])=>(
                  <div key={k} className="flex justify-between gap-4 px-4 py-2 text-sm">
                    <span className="text-gray-500 font-medium shrink-0">{k}</span>
                    <span className="font-bold text-gray-900 text-right break-all">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="border rounded-2xl overflow-hidden">
                <h4 className="text-xs font-black tracking-widest uppercase text-white bg-[#0a2e1f] px-4 py-2">{t('pd_care_requirements')}</h4>
                <div className="divide-y">
                  {[
                    [t('pd_sunlight'), plant.sunlight],
                    [t('pd_watering'), plant.watering_frequency],
                    [t('pd_soil'), plant.soil_type],
                    [t('pd_temp'), plant.temperature_range],
                    [t('pd_humidity'), plant.humidity_preference],
                    [t('pd_fertilizer'), plant.fertilizer_schedule],
                  ].map(([k,v])=>(
                    <div key={k} className="flex justify-between gap-4 px-4 py-2.5 text-sm">
                      <span className="text-gray-500">{k}</span>
                      <span className="font-bold text-right">{v || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* plant_images with display_order */}
              <div className="bg-[#f8f7f2] rounded-2xl p-4 border">
                <h4 className="text-xs font-black tracking-widest uppercase text-emerald-700">{t('pd_plant_images')}</h4>
                <div className="mt-3 flex gap-2 overflow-auto pb-1">
                  {(plant.images || []).map((u,i)=>(
                    <div key={i} className="shrink-0 text-center">
                      <img src={encodeURI(u)} alt={`img ${i}`} className="w-20 h-20 rounded-xl object-cover border bg-white"/>
                      <div className="text-[11px] font-bold mt-1">#{i} order {i}</div>
                      <div className="text-[10px] text-gray-500 truncate w-20">{u.split('/').pop()}</div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">{t('pd_table_note')}</p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <h4 className="text-xs font-black tracking-widest uppercase text-amber-800">{t('pd_shipping_wholesale')}</h4>
                <p className="text-xs leading-5 mt-1">{plant.shipping_extra}</p>
                <p className="text-xs leading-5 mt-2 font-bold text-amber-800">{plant.wholesale_note}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="bg-[#f6f7f4] border px-3 py-1.5 rounded-full text-xs font-bold">✓ {t('pd_sku_label')}: {plant.sku}</span>
            <span className="bg-[#f6f7f4] border px-3 py-1.5 rounded-full text-xs font-bold">✓ {t('pd_pot_label')}: {plant.pot_included?t('pd_included'):t('pd_not_included')} • {plant.pot_size}</span>
            <span className={`border px-3 py-1.5 rounded-full text-xs font-bold ${plant.pet_safe?'bg-emerald-50 border-emerald-200 text-emerald-700':'bg-red-50 border-red-200 text-red-700'}`}>{plant.pet_safe?'🐾 '+t('pd_pet_safe'):'⚠️ Not Pet Safe'}</span>
            <span className="bg-[#f6f7f4] border px-3 py-1.5 rounded-full text-xs font-bold">{t('pd_weight')}: {plant.weight}</span>
          </div>
        </div>

        {/* reviews */}
        <div className="mt-8 grid lg:grid-cols-[1fr_360px] gap-6">
          <div className="bg-white rounded-[24px] border p-6 md:p-7">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black">{t('pd_customer_reviews')}</h3>
              <span className="bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold px-3 py-1 rounded-full">★ {plant.rating} • {plant.reviews?.length||0} {t('pd_reviews_label')}</span>
            </div>
            <div className="mt-5 space-y-4">
              {plant.reviews?.length ? plant.reviews.map(r=>(
                <div key={r.id} className="border-b pb-4 last:border-0">
                  <div className="flex items-center gap-2 text-sm"><span className="w-8 h-8 rounded-full bg-emerald-100 grid place-items-center font-bold text-emerald-700">{r.user_name?.[0] || r.user_id?.[0]}</span><strong>{r.user_name || r.user_id}</strong> <span className="text-amber-500">{'★'.repeat(r.rating)}</span><span className="text-xs text-gray-400 ml-auto">{new Date(r.created_at).toLocaleDateString()}</span></div>
                  <p className="text-sm text-gray-600 mt-2 leading-6">{r.comment}</p>
                  {r.review_image_url && <img src={encodeURI(r.review_image_url)} alt="review" className="mt-2 w-32 h-20 object-cover rounded-xl border"/>}
                  <p className="text-[11px] text-gray-400 mt-1 font-mono">plant_reviews: {r.id} • plant_id {r.plant_id} • user_id {r.user_id} {r.review_image_url ? `• image ${r.review_image_url}` : '• no image'}</p>
                </div>
              )) : <p className="text-sm text-gray-500">{t('pd_no_reviews')}</p>}
            </div>
            {user ? (
              <form onSubmit={submitReview} className="mt-6 bg-[#f6f7f4] border rounded-2xl p-4 flex flex-col gap-3">
                <div className="text-xs font-bold uppercase tracking-widest">{t('pd_write_review')}</div>
                <select value={review.rating} onChange={e=>setReview({...review,rating:+e.target.value})} className="border rounded-xl px-3 py-2.5 text-sm bg-white"><option value={5}>{t('pd_excellent')}</option><option value={4}>{t('pd_good')}</option><option value={3}>{t('pd_average')}</option><option value={2}>{t('pd_poor')}</option><option value={1}>{t('pd_bad')}</option></select>
                <textarea placeholder={t('pd_share_experience')} value={review.comment} onChange={e=>setReview({...review,comment:e.target.value})} className="border rounded-xl px-3 py-3 text-sm min-h-[80px]" required/>
                <button className="bg-[#0a2e1f] text-white py-2.5 rounded-full font-bold text-sm">{t('pd_submit_review')}</button>
              </form>
            ) : <p className="text-sm text-gray-500 mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">{t('pd_login_to_review')} <Link to="/login" className="font-bold text-emerald-700 underline">{t('pd_login')}</Link> </p>}
          </div>

          <div className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-[24px] p-6">
              <h4 className="font-black">{t('pd_need_help')}</h4>
              <p className="text-sm text-gray-600 mt-1 leading-5">{t('pd_need_help_desc')}</p>
              <a href="#" className="inline-block mt-3 bg-emerald-600 text-white px-5 py-2.5 rounded-full text-sm font-bold">{t('pd_chat_whatsapp')}</a>
            </div>
            <div className="bg-white border rounded-[24px] p-6">
              <h4 className="font-black text-sm">{t('pd_delivery_returns')}</h4>
              <ul className="mt-2 text-sm text-gray-600 space-y-1 leading-5">
                <li>• {t('pd_delivery_2_5')}</li>
                <li>• {t('pd_secure_payments')}</li>
              </ul>
            </div>
          </div>
        </div>

        {plant.related?.length>0 && (
          <div className="mt-10"><h3 className="text-xl font-black mb-4">{t('pd_you_may_also_like')}</h3><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{plant.related.map(p=><PlantCard key={p.id} plant={p}/>)}</div></div>
        )}
      </div>

      {/* fly animation */}
      {fly && (
        <img src={encodeURI(plant.images?.[0]||'')} alt="fly" className="fixed w-10 h-10 rounded-full object-cover shadow-xl pointer-events-none z-[100] border-2 border-white"
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
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#0a2e1f] text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-3 z-50 animate-[slideUp_0.3s_ease]">
          <span className="w-7 h-7 rounded-full bg-emerald-500 grid place-items-center">✓</span>
          <span className="text-sm font-bold">{plant.name} × {qty} added to cart</span>
          <Link to="/cart" className="bg-white text-black px-4 py-1.5 rounded-full text-xs font-black">View Cart</Link>
        </div>
      )}
      <style>{`@keyframes slideUp { from { transform: translate(-50%, 20px); opacity:0 } to { transform: translate(-50%,0); opacity:1 } }`}</style>
    </div>
  )
}
