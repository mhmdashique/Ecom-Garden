import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from './Toast';
import { useState, useEffect } from 'react';
import { getDisplayPrice } from '../utils/variantPricing';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function PlantCard({ plant }){
  const { add } = useCart();
  const { success, error: toastError } = useToast();
  const { user } = useAuth();
  const nav = useNavigate();
  const [fly, setFly] = useState(false);
  const [wish, setWish] = useState(false);

  const requireLogin = (e) => {
    if (!user) {
      if (e) e.preventDefault();
      toastError('Please login to explore plants and add to cart');
      nav('/login');
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (!user || !plant?.id) return;
    let cancelled = false;
    api.get('/wishlist').then(r=>{
      if(cancelled) return;
      const ids = new Set((r.data||[]).map(w=>String(w.plant_id)));
      if(ids.has(String(plant.id))) setWish(true);
    }).catch(()=>{});
    return ()=>{ cancelled=true; };
  }, [user, plant?.id]);

  const toggleWish = async (e) => {
    e.preventDefault();
    if (!user) { toastError('Please login to use wishlist'); return; }
    try {
      if (!wish) {
        await api.post('/wishlist', { plant_id: plant.id });
        setWish(true);
        success('Added to wishlist');
      } else {
        try { await api.delete(`/wishlist/by-plant/${plant.id}`); }
        catch {
          const { data } = await api.get('/wishlist');
          const entry = (data||[]).find(w=>String(w.plant_id)===String(plant.id));
          if (entry) await api.delete(`/wishlist/${entry.id}`);
        }
        setWish(false);
        success('Removed from wishlist');
      }
    } catch (err) {
      toastError(err.response?.data?.error || 'Wishlist failed');
    }
  };
  const img = encodeURI(plant.images?.[0] || '');
  const price = plant.discount_price || plant.price;
  const hasVariants = Array.isArray(plant.variants) && plant.variants.length === 3;
  const potVariant = hasVariants ? (plant.variants.find(v=>v.id==='plastic-pot' && !v.disabled) || plant.variants.find(v=>!v.disabled)) : null;
  const availableCount = hasVariants ? plant.variants.filter(v=>!v.disabled).length : 0;
  const displayPrice = hasVariants && potVariant ? `₹${potVariant.priceMin.toFixed(2)}` : `₹${price.toFixed(2)}`;
  const onSale = !hasVariants && !!plant.discount_price;
  const lowStock = plant.stock_qty > 0 && plant.stock_qty <= 10;
  const outOfStock = plant.stock_qty === 0;

  const handleAdd = (e) => {
    e.preventDefault();
    if (!requireLogin(e)) return;
    if(outOfStock) return;
    if(hasVariants && potVariant){
      add({ ...plant, price: potVariant.priceMin, discount_price: null, selectedVariant: potVariant.label, variantId: potVariant.id, variants: undefined }, 1);
      success(`${plant.name} (${potVariant.label} • ${getDisplayPrice(potVariant)}) added`);
    } else {
      add({ ...plant, price }, 1);
      success(`${plant.name} added to cart`);
    }
    setFly(true);
    setTimeout(()=>setFly(false), 600);
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-[22px] border border-white/60 bg-white/80 backdrop-blur-xl shadow-[0_8px_30px_rgba(10,46,31,0.07)] hover:shadow-[0_20px_60px_rgba(10,46,31,0.14)] hover:-translate-y-1.5 transition-all duration-300">
      {/* image */}
      <Link to={`/plant/${plant.id}`} onClick={requireLogin} className="relative block overflow-hidden bg-[#f0f4ec]">
        <div className="aspect-[4/3] w-full overflow-hidden">
          <img
            src={img}
            alt={plant.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-[700ms] group-hover:scale-[1.08]"
          />
        </div>
        {/* gradient wash */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />

        {/* top badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {hasVariants ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0a2e1f] px-2.5 py-1 text-[11px] font-black tracking-wide text-white shadow-md">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> {availableCount} variants
            </span>
          ) : onSale ? (
            <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-black tracking-wide text-emerald-700 shadow-md border border-emerald-100">
              SALE • Save ₹{(plant.price - plant.discount_price).toFixed(0)}
            </span>
          ) : null}
        </div>

        <div className="absolute right-3 top-3 flex flex-col items-end gap-2">
          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold shadow-sm backdrop-blur-md ${outOfStock ? 'bg-red-50 border-red-200 text-red-700' : lowStock ? 'bg-amber-50/90 border-amber-200 text-amber-700' : 'bg-white/90 border-white/60 text-emerald-800'}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${outOfStock ? 'bg-red-500' : lowStock ? 'bg-amber-500' : 'bg-emerald-500'}`} />
            {outOfStock ? 'Out of stock' : `${plant.stock_qty} left`}
          </span>
        </div>

        {/* wishlist heart */}
        <button
          type="button"
          aria-label={wish ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={wish}
          onClick={toggleWish}
          className={`absolute bottom-3 right-3 grid h-8 w-8 place-items-center rounded-full border backdrop-blur-md transition ${wish ? 'bg-[#0a2e1f] text-white border-[#0a2e1f] shadow-md' : 'bg-white/90 text-gray-600 border-white/60 hover:bg-white hover:text-[#0a2e1f]'}`}
        >
          <span aria-hidden className={`text-[14px] leading-none transition ${wish ? 'scale-110' : ''}`}>{wish ? '♥' : '♡'}</span>
        </button>

        {/* quick view hint */}
        <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-[#0a2e1f] opacity-0 shadow-sm backdrop-blur group-hover:opacity-100 transition">
          View → 
        </span>
      </Link>

      {/* body */}
      <div className="flex flex-1 flex-col p-3.5">
        <Link to={`/plant/${plant.id}`} onClick={requireLogin} className="line-clamp-1 font-outfit text-[15px] font-bold leading-tight text-[#0a2e1f] hover:text-emerald-700">
          {plant.name}
        </Link>
        {plant.botanical && <p className="line-clamp-1 text-xs italic text-gray-500">{plant.botanical}</p>}
        <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
          <span className="inline-flex h-5 items-center rounded-full bg-[#f6f7f4] px-2 font-semibold text-gray-600 border">{plant.sunlight || 'Indoor'}</span>
          <span className="hidden sm:inline">• {plant.care_level || 'Easy care'}</span>
          {hasVariants && <span className="text-emerald-700 font-bold">• {availableCount} options</span>}
        </p>

        <div className="mt-3 flex items-end justify-between gap-2">
          <div className="flex flex-col">
            <span className="flex items-center gap-1.5 font-black text-emerald-700">
              {displayPrice}
              {hasVariants && <span className="rounded-full border bg-[#fdfbf7] px-1.5 py-0.5 text-[10px] font-bold text-gray-600">Fixed</span>}
            </span>
            <span className="min-h-[14px] text-xs">
              {hasVariants ? (
                <span className="text-gray-500">With Plastic Pot</span>
              ) : onSale ? (
                <span className="text-gray-400 line-through">₹{plant.price.toFixed(2)}</span>
              ) : (
                <span className="text-gray-400">incl. taxes</span>
              )}
            </span>
          </div>
          <button
            onClick={handleAdd}
            disabled={outOfStock}
            aria-label={outOfStock ? 'Out of stock' : `Add ${plant.name} to cart`}
            className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs font-black shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0a2e1f] ${outOfStock ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#0a2e1f] text-white hover:bg-black hover:shadow-md active:scale-[0.98]'} ${fly ? 'animate-[cartBump_0.5s_ease] scale-105' : ''}`}
          >
            <span aria-hidden>🛒</span> {outOfStock ? 'Sold out' : 'Add'}
          </button>
        </div>
      </div>
      <style>{`@keyframes cartBump{0%{transform:scale(1)}30%{transform:scale(1.06)}60%{transform:scale(0.98)}100%{transform:scale(1)}}`}</style>
    </div>
  )
}
