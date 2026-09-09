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
  const isWholesale = qty >= 10;
  const unitPrice = getWholesalePrice(Number(chosenPrice), qty);
  const totalPrice = calculateTotal(unitPrice, qty);
  const baseTotal = calculateTotal(Number(chosenPrice), qty);
  const wholesaleSaving = isWholesale ? baseTotal - totalPrice : 0;

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
    <div className="border rounded-2xl p-4 bg-[#f8f7f2]">
      <h4 className="font-black text-sm flex items-center gap-2">🌿 {product.name} — Variant Pricing</h4>
      <p className="text-xs text-gray-500 mt-1">Independent SKUs — no derived math. "Cutting + Cover" is a bundle, not auto-calc.</p>

      <div className="mt-4 grid gap-2">
        {product.variants.map(v => {
          const isDisabled = v.disabled;
          return (
          <button
            key={v.id}
            onClick={() => !isDisabled && handleVariantChange(v.id)}
            disabled={isDisabled}
            className={`text-left p-3 rounded-xl border-2 flex justify-between items-center ${isDisabled ? 'border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed' : variantId===v.id ? 'border-emerald-600 bg-emerald-50' : 'border-gray-200 bg-white hover:border-emerald-300'}`}
          >
            <div>
              <div className={`font-bold text-sm ${isDisabled?'text-gray-400':''}`}>{v.label} {isDisabled && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full ml-1">Not Available</span>}</div>
              <div className="text-xs text-gray-500">{v.id} {v.note ? `• ${v.note}` : ''}</div>
            </div>
            <div className={`font-black text-sm ${isDisabled?'text-gray-400':'text-emerald-700'}`}>{isDisabled ? '—' : getDisplayPrice(v)}</div>
          </button>
        )})}
      </div>

      <div className="mt-2 bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-xs flex gap-2">
        <span className="text-amber-600">💡</span>
        <span><span className="font-black">Note:</span> Wholesale business amount will be reduced with the quantity.</span>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <div className="flex items-center gap-2 bg-white border rounded-full p-1">
          <button onClick={()=>setQty(q=>Math.max(1,q-1))} className="w-8 h-8 rounded-full bg-white border grid place-items-center hover:bg-gray-50">−</button>
          <span className="w-8 text-center font-black text-sm">{qty}</span>
          <button onClick={()=>setQty(q=>q+1)} className="w-8 h-8 rounded-full bg-white border grid place-items-center hover:bg-gray-50">+</button>
        </div>
        <div className="flex-1">
          <button onClick={handleAdd} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-full font-black text-sm shadow-md flex items-center justify-center gap-2">🛒 Add to Cart — ₹{totalPrice}</button>
          {isWholesale && <div className="text-[11px] text-center mt-1"><span className="text-gray-500 line-through">₹{baseTotal}</span> <span className="text-emerald-700 font-black">Wholesale ₹{totalPrice} {wholesaleSaving>0 && `(save ₹${wholesaleSaving})`}</span></div>}
          {!isWholesale && <div className="text-[11px] text-center mt-1 text-gray-500">Total: ₹{totalPrice}</div>}
        </div>
      </div>
      {error && <div className="mt-2 text-xs bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg">{error}</div>}
    </div>
  );
}
