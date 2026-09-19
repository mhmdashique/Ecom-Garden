import { useState, useMemo } from 'react';
import { getDisplayPrice, selectVariantAndPrice, calculateTotal, PRICING_MODE } from '../utils/variantPricing';

export default function VariantPricingWidget({ product, onAddToCart, mode = PRICING_MODE.CUSTOMER_PICKS }) {
  const initial = product.variants.find(v=>!v.disabled) || product.variants[0];
  const [variantId, setVariantId] = useState(initial?.id);
  const [chosenPrice, setChosenPrice] = useState(initial?.priceMin);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState('');

  const variant = useMemo(() => product.variants.find(v => v.id === variantId), [product, variantId]);

  const getWholesalePrice = (base, q) => {
    let d = 0;
    if (q >= 100) d = 0.20;
    else if (q >= 50) d = 0.15;
    else if (q >= 25) d = 0.10;
    else if (q >= 10) d = 0.05;
    return Math.round(base * (1 - d));
  };
  const tierInfo = (q) => {
    if(q>=100) return { pct:20, next:null, label:'20% wholesale' };
    if(q>=50) return { pct:15, next:{ need:100, pct:20 }, label:'15% wholesale' };
    if(q>=25) return { pct:10, next:{ need:50, pct:15 }, label:'10% wholesale' };
    if(q>=10) return { pct:5, next:{ need:25, pct:10 }, label:'5% wholesale' };
    return { pct:0, next:{ need:10, pct:5 }, label:'Retail' };
  };
  const isWholesale = qty >= 10;
  const unitPrice = getWholesalePrice(Number(chosenPrice), qty);
  const totalPrice = calculateTotal(unitPrice, qty);
  const baseTotal = calculateTotal(Number(chosenPrice), qty);
  const wholesaleSaving = isWholesale ? baseTotal - totalPrice : 0;
  const tier = tierInfo(qty);

  const handleVariantChange = (id) => {
    const v = product.variants.find(x => x.id === id);
    setVariantId(id);
    setChosenPrice(v.priceMin);
    setError('');
  };

  const handleAdd = () => {
    try {
      const selection = selectVariantAndPrice(product, variantId, Number(chosenPrice));
      const finalUnit = getWholesalePrice(selection.unitPrice, qty);
      const total = calculateTotal(finalUnit, qty);
      setError('');
      const autoWholesale = qty >= 10;
      onAddToCart?.({ ...selection, unitPrice: finalUnit, basePrice: selection.unitPrice, quantity: qty, total, isWholesale: autoWholesale, wholesaleSaving: autoWholesale ? baseTotal - total : 0, productId: product.productId || product.id });
    } catch (e) {
      setError(e.message);
    }
  };

  if (!variant) return null;

  return (
    <div className="rounded-[22px] border border-white/60 bg-white/70 backdrop-blur-xl shadow-[0_8px_30px_rgba(10,46,31,0.06)] p-4 md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-outfit text-[15px] font-black tracking-tight text-[#0a2e1f] flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-[#0a2e1f] text-white text-xs">🌿</span>
            {product.name} — Variants
          </h4>
          <p className="mt-1 text-xs leading-4 text-gray-500">Independent SKUs — 3 fixed prices. “Cutting + Cover” is a bundle.</p>
        </div>
        <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-black ${isWholesale ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
          {tier.label} {isWholesale && `• -${tier.pct}%`}
        </span>
      </div>

      <div className="mt-4 grid gap-2.5">
        {product.variants.map(v => {
          const isDisabled = v.disabled;
          const active = variantId===v.id && !isDisabled;
          return (
          <button
            key={v.id}
            type="button"
            onClick={() => !isDisabled && handleVariantChange(v.id)}
            disabled={isDisabled}
            aria-pressed={active}
            aria-disabled={isDisabled}
            className={`text-left flex justify-between items-center rounded-2xl border-2 p-3.5 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0a2e1f] ${isDisabled ? 'border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed' : active ? 'border-[#0a2e1f] bg-[#0a2e1f] text-white shadow-md' : 'border-white bg-white hover:border-emerald-200 hover:shadow-sm'}`}
          >
            <div className="min-w-0">
              <div className={`flex items-center gap-2 font-bold text-sm ${isDisabled ? 'text-gray-400' : active ? 'text-white' : 'text-[#0a2e1f]'}`}>
                <span className={`grid h-6 w-6 place-items-center rounded-full border text-xs ${active ? 'bg-white text-[#0a2e1f] border-white' : 'bg-[#f6f7f4] border-gray-200'}`}>{active ? '✓' : '○'}</span>
                <span className="truncate">{v.label}</span>
                {isDisabled && <span className="rounded-full bg-red-100 text-red-600 px-2 py-0.5 text-xs font-black">Not Available</span>}
              </div>
              <div className={`mt-0.5 text-xs truncate ${active ? 'text-white/70' : 'text-gray-500'}`}>{v.id}{v.note ? ` • ${v.note}` : ''}</div>
            </div>
            <div className={`ml-3 shrink-0 rounded-full px-3 py-1.5 text-sm font-black ${isDisabled ? 'bg-gray-200 text-gray-400' : active ? 'bg-white text-[#0a2e1f]' : 'bg-[#f6f7f4] text-emerald-700 border'}`}>{isDisabled ? '—' : getDisplayPrice(v)}</div>
          </button>
        )})}
      </div>



      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center justify-between gap-3 rounded-full border bg-[#f6f7f4] p-1 sm:w-auto">
          <button type="button" aria-label="Decrease quantity" onClick={()=>setQty(q=>Math.max(1,q-1))} className="grid h-9 w-9 place-items-center rounded-full bg-white border hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0a2e1f]">−</button>
          <span className="w-10 text-center font-black" aria-live="polite">{qty}</span>
          <button type="button" aria-label="Increase quantity" onClick={()=>setQty(q=>q+1)} className="grid h-9 w-9 place-items-center rounded-full bg-white border hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0a2e1f]">+</button>
        </div>
        <div className="flex-1">
          <button type="button" onClick={handleAdd} className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#0a2e1f] px-5 py-3 text-sm font-black text-white shadow-md hover:bg-black hover:shadow-lg active:scale-[0.98] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0a2e1f]">
            🛒 Add — ₹{totalPrice} <span className="opacity-60 font-bold">• ₹{unitPrice}/unit</span>
          </button>
          <div className="mt-1.5 text-center text-xs">
            {isWholesale ? (
              <span><span className="text-gray-400 line-through">₹{baseTotal}</span> <span className="font-black text-emerald-700">Wholesale ₹{totalPrice} {wholesaleSaving>0 && `(save ₹${wholesaleSaving})`}</span></span>
            ) : (
              <span className="text-gray-500">Total: ₹{totalPrice} • ₹{unitPrice}/unit</span>
            )}
          </div>
        </div>
      </div>
      {error && <div role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{error}</div>}
    </div>
  );
}
