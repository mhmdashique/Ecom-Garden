import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from './Toast';
import { useState } from 'react';
import { getDisplayPrice } from '../utils/variantPricing';
export default function PlantCard({plant}){
  const {add}=useCart();
  const {success}=useToast();
  const [fly,setFly]=useState(false);
  const img = encodeURI(plant.images?.[0] || '');
  const price = plant.discount_price || plant.price;
  const hasVariants = Array.isArray(plant.variants) && plant.variants.length===3;
  const potVariant = hasVariants ? plant.variants.find(v=>v.id==='plastic-pot' && !v.disabled) || plant.variants.find(v=>!v.disabled) : null;
  const availableCount = hasVariants ? plant.variants.filter(v=>!v.disabled).length : 0;
  const displayPrice = hasVariants && potVariant ? `₹${potVariant.priceMin.toFixed(2)}` : `₹${price.toFixed(2)}`;
  return (
    <div className="border rounded-xl overflow-hidden bg-white hover:shadow-lg transition">
      <Link to={`/plant/${plant.id}`} className="relative block bg-[#f6f7f4] overflow-hidden">
        <img src={img} alt={plant.name} className="h-48 w-full object-cover" loading="lazy" />
        {hasVariants && <span className="absolute top-2.5 left-2.5 bg-emerald-600 text-white text-[10px] font-black px-2 py-1 rounded-full">{availableCount} variants • Fixed</span>}
        <span className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur text-[11px] font-bold px-2 py-1 rounded-full border text-gray-700">{plant.stock_qty} left</span>
      </Link>
      <div className="p-3">
        <Link to={`/plant/${plant.id}`} className="font-semibold line-clamp-1 hover:text-emerald-700 text-sm leading-tight">{plant.name}</Link>
        <p className="text-xs text-gray-500 mt-0.5">{plant.sunlight} • Stock: {plant.stock_qty} {hasVariants && <span className="text-emerald-600 font-bold">• {availableCount} options</span>}</p>
        <div className="flex items-center justify-between mt-2.5 gap-2">
          <div className="flex flex-col">
            <span className="font-black text-green-700 text-sm flex items-center gap-1.5">{displayPrice} {hasVariants && <span className="text-[10px] bg-[#f8f7f2] border px-1.5 py-0.5 rounded-full text-gray-600 font-bold">Fixed</span>}</span>
            {hasVariants ? <span className="text-[11px] text-gray-500">With Plastic Pot • Fixed</span> : plant.discount_price && <span className="text-xs line-through text-gray-400">₹{plant.price.toFixed(2)}</span>}
          </div>
          <button onClick={(e)=>{
            e.preventDefault();
            if(hasVariants && potVariant){
              add({...plant, price: potVariant.priceMin, discount_price: null, selectedVariant: potVariant.label, variantId: potVariant.id, variants: undefined},1);
              success(`${plant.name} (${potVariant.label} • ${getDisplayPrice(potVariant)}) added`);
            } else {
              add({...plant, price},1);
              success(`${plant.name} added to cart`);
            }
            setFly(true); setTimeout(()=>setFly(false),600);
          }} className={`bg-green-600 hover:bg-green-700 text-white text-xs px-3.5 py-1.5 rounded-full font-bold transition shrink-0 ${fly?'animate-[cartBump_0.5s_ease] scale-105':''}`}>Add to Cart</button>
        </div>
      </div>
    </div>
  )
}
