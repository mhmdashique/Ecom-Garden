import { useEffect, useState } from 'react';

const CATEGORIES = [
  { id:'1', name:'Indoor Plants' },
  { id:'2', name:'Outdoor Plants' },
  { id:'3', name:'Succulents' },
  { id:'4', name:'Flowering Plants' },
  { id:'5', name:'Seeds & Tools' },
];

const emptyForm = {
  name:'', botanical_name:'', sku:'', category_id:'1',
  price:'', discount_price:'', wholesale_price:'', market_price:'', rating:'4.5',
  stock_qty:'', stock_status:'in_stock',
  short_description:'', long_description:'', care_instructions:'',
  sunlight:'Indirect', watering_frequency:'', soil_type:'', temperature_range:'', humidity_preference:'', fertilizer_schedule:'',
  growth_rate:'medium', mature_size:'', difficulty_level:'easy',
  pet_safe:false, pot_included:true, pot_size:'', height_at_shipping:'', weight:'',
  images:[],
};

export default function PlantEditDrawer({ open, initial, onClose, onSave, dark }){
  const [form,setForm]=useState(emptyForm);
  const [error,setError]=useState('');
  const [dragOver,setDragOver]=useState(false);
  const [saving,setSaving]=useState(false);

  useEffect(()=>{
    if(!open) return;
    if(initial){
      setForm({
        name: initial.name||'',
        botanical_name: initial.botanical_name||initial.botanical||'',
        sku: initial.sku||'',
        category_id: initial.category_id||'1',
        price: initial.price??'',
        discount_price: initial.discount_price??'',
        wholesale_price: initial.wholesale_price??'',
        market_price: initial.market_price??'',
        rating: initial.rating??'4.5',
        stock_qty: initial.stock_qty??'',
        stock_status: initial.stock_status||'in_stock',
        short_description: initial.short_description||'',
        long_description: initial.long_description||initial.description||'',
        care_instructions: initial.care_instructions||'',
        sunlight: initial.sunlight||'Indirect',
        watering_frequency: initial.watering_frequency||'',
        soil_type: initial.soil_type||'',
        temperature_range: initial.temperature_range||'',
        humidity_preference: initial.humidity_preference||'',
        fertilizer_schedule: initial.fertilizer_schedule||'',
        growth_rate: initial.growth_rate||'medium',
        mature_size: initial.mature_size||'',
        difficulty_level: initial.difficulty_level||'easy',
        pet_safe: !!initial.pet_safe,
        pot_included: initial.pot_included!==false,
        pot_size: initial.pot_size||'',
        height_at_shipping: initial.height_at_shipping||'',
        weight: initial.weight||'',
        images: Array.isArray(initial.images)? initial.images : (initial.images? [initial.images]:[]),
      });
    } else {
      setForm(emptyForm);
    }
    setError('');
  },[open, initial]);

  const handleChange=(k,v)=> setForm(f=>({...f,[k]:v}));

  const addImageUrl=(url)=>{
    if(!url) return;
    setForm(f=>({...f, images:[...f.images, url]}));
  };
  const removeImage=(idx)=> setForm(f=>({...f, images: f.images.filter((_,i)=>i!==idx)}));

  const handleDrop=(e)=>{
    e.preventDefault(); setDragOver(false);
    const file=e.dataTransfer.files[0];
    if(file){ const r=new FileReader(); r.onload=()=> addImageUrl(r.result); r.readAsDataURL(file); }
  };
  const handleFile=(e)=>{
    const file=e.target.files[0];
    if(file){ const r=new FileReader(); r.onload=()=> addImageUrl(r.result); r.readAsDataURL(file); }
  };

  const submit=async(e)=>{
    e.preventDefault();
    setError('');
    if(!form.name.trim()) return setError('Name is required');
    if(form.price===''|| isNaN(+form.price)) return setError('Price required');
    if(form.stock_qty===''|| isNaN(+form.stock_qty)) return setError('Stock qty required');
    setSaving(true);
    try{
      const payload={
        name: form.name.trim(),
        botanical_name: form.botanical_name.trim()||null,
        sku: form.sku.trim()||null,
        category_id: form.category_id,
        price: +form.price,
        discount_price: form.discount_price===''? null : +form.discount_price,
        wholesale_price: form.wholesale_price===''? null : +form.wholesale_price,
        market_price: form.market_price===''? null : +form.market_price,
        rating: form.rating===''? null : +form.rating,
        stock_qty: parseInt(form.stock_qty,10),
        stock_status: form.stock_status,
        short_description: form.short_description.trim()||null,
        long_description: form.long_description.trim()||null,
        care_instructions: form.care_instructions.trim()||null,
        sunlight: form.sunlight,
        watering_frequency: form.watering_frequency.trim()||null,
        soil_type: form.soil_type.trim()||null,
        temperature_range: form.temperature_range.trim()||null,
        humidity_preference: form.humidity_preference.trim()||null,
        fertilizer_schedule: form.fertilizer_schedule.trim()||null,
        growth_rate: form.growth_rate,
        mature_size: form.mature_size.trim()||null,
        difficulty_level: form.difficulty_level,
        pet_safe: !!form.pet_safe,
        pot_included: !!form.pot_included,
        pot_size: form.pot_size.trim()||null,
        height_at_shipping: form.height_at_shipping.trim()||null,
        weight: form.weight.trim()||null,
        images: form.images.filter(Boolean),
      };
      await onSave(payload);
    }catch(err){ setError(err.response?.data?.error||err.message||'Save failed'); }
    finally{ setSaving(false); }
  };

  if(!open) return null;
  const inputCls = dark ? "bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20" : "bg-[#f6f7f4] border-gray-200 text-gray-900 focus:bg-white";
  const labelCls = dark ? "text-white/80" : "text-gray-700";
  const cardCls = dark ? "bg-[#1e1e1e] text-white border-white/10" : "bg-white text-gray-900 border-gray-200";

  return (
    <div className="fixed inset-0 z-[60] flex">
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`w-full max-w-[640px] h-full overflow-auto shadow-2xl border-l flex flex-col ${cardCls}`}>
        <div className={`sticky top-0 z-10 border-b p-5 flex justify-between items-start ${dark?'bg-[#1e1e1e] border-white/10':'bg-white'}`}>
          <div>
            <h3 className="text-lg font-black">{initial? 'Edit Plant':'Add Plant'}</h3>
            <p className="text-xs opacity-60">{initial? initial.sku||initial.id : 'Create a new plant — all fields map to Postgres'}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full border grid place-items-center">✕</button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-6">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-xl text-sm">{error}</div>}

          {/* Basic */}
          <div className={`rounded-2xl border p-4 space-y-3 ${dark?'bg-white/5 border-white/10':'bg-[#fcfcfa]'}`}>
            <h4 className="font-black text-sm">Basic Info</h4>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <label className={`text-xs font-bold ${labelCls}`}>Plant Name *</label>
                <input value={form.name} onChange={e=>handleChange('name',e.target.value)} placeholder="e.g. Aloe Vera" className={`mt-1 w-full border rounded-xl px-3 py-2.5 text-sm outline-none ${inputCls}`} required />
              </div>
              <div>
                <label className={`text-xs font-bold ${labelCls}`}>Botanical Name</label>
                <input value={form.botanical_name} onChange={e=>handleChange('botanical_name',e.target.value)} placeholder="Aloe barbadensis" className={`mt-1 w-full border rounded-xl px-3 py-2.5 text-sm outline-none ${inputCls}`} />
              </div>
              <div>
                <label className={`text-xs font-bold ${labelCls}`}>SKU</label>
                <input value={form.sku} onChange={e=>handleChange('sku',e.target.value)} placeholder="GN-ALOE-001" className={`mt-1 w-full border rounded-xl px-3 py-2.5 text-sm outline-none ${inputCls}`} />
              </div>
              <div>
                <label className={`text-xs font-bold ${labelCls}`}>Category</label>
                <select value={form.category_id} onChange={e=>handleChange('category_id',e.target.value)} className={`mt-1 w-full border rounded-xl px-3 py-2.5 text-sm ${inputCls}`}>
                  {CATEGORIES.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className={`text-xs font-bold ${labelCls}`}>Sunlight</label>
                <select value={form.sunlight} onChange={e=>handleChange('sunlight',e.target.value)} className={`mt-1 w-full border rounded-xl px-3 py-2.5 text-sm ${inputCls}`}>
                  <option>Full</option><option>Indirect</option><option>Bright</option><option>Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Pricing & stock */}
          <div className={`rounded-2xl border p-4 space-y-3 ${dark?'bg-white/5 border-white/10':'bg-[#fcfcfa]'}`}>
            <h4 className="font-black text-sm">Pricing & Inventory</h4>
            <div className="grid md:grid-cols-3 gap-3">
              <div><label className={`text-xs font-bold ${labelCls}`}>Price ₹ *</label><input type="number" value={form.price} onChange={e=>handleChange('price',e.target.value)} className={`mt-1 w-full border rounded-xl px-3 py-2.5 text-sm outline-none ${inputCls}`} required/></div>
              <div><label className={`text-xs font-bold ${labelCls}`}>Discount ₹</label><input type="number" value={form.discount_price} onChange={e=>handleChange('discount_price',e.target.value)} className={`mt-1 w-full border rounded-xl px-3 py-2.5 text-sm outline-none ${inputCls}`} /></div>
              <div><label className={`text-xs font-bold ${labelCls}`}>Rating</label><input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={e=>handleChange('rating',e.target.value)} className={`mt-1 w-full border rounded-xl px-3 py-2.5 text-sm outline-none ${inputCls}`} /></div>
              <div><label className={`text-xs font-bold ${labelCls}`}>Wholesale ₹</label><input type="number" value={form.wholesale_price} onChange={e=>handleChange('wholesale_price',e.target.value)} className={`mt-1 w-full border rounded-xl px-3 py-2.5 text-sm outline-none ${inputCls}`} /></div>
              <div><label className={`text-xs font-bold ${labelCls}`}>Market ₹</label><input type="number" value={form.market_price} onChange={e=>handleChange('market_price',e.target.value)} className={`mt-1 w-full border rounded-xl px-3 py-2.5 text-sm outline-none ${inputCls}`} /></div>
              <div><label className={`text-xs font-bold ${labelCls}`}>Stock Qty *</label><input type="number" value={form.stock_qty} onChange={e=>handleChange('stock_qty',e.target.value)} className={`mt-1 w-full border rounded-xl px-3 py-2.5 text-sm outline-none ${inputCls}`} required/></div>
              <div><label className={`text-xs font-bold ${labelCls}`}>Stock Status</label>
                <select value={form.stock_status} onChange={e=>handleChange('stock_status',e.target.value)} className={`mt-1 w-full border rounded-xl px-3 py-2.5 text-sm ${inputCls}`}>
                  <option value="in_stock">in_stock</option><option value="low_stock">low_stock</option><option value="out_of_stock">out_of_stock</option>
                </select>
              </div>
              <div><label className={`text-xs font-bold ${labelCls}`}>Weight</label><input value={form.weight} onChange={e=>handleChange('weight',e.target.value)} placeholder="400-600 g" className={`mt-1 w-full border rounded-xl px-3 py-2.5 text-sm outline-none ${inputCls}`} /></div>
              <div><label className={`text-xs font-bold ${labelCls}`}>Height at shipping</label><input value={form.height_at_shipping} onChange={e=>handleChange('height_at_shipping',e.target.value)} placeholder="12-15 cm" className={`mt-1 w-full border rounded-xl px-3 py-2.5 text-sm outline-none ${inputCls}`} /></div>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.pet_safe} onChange={e=>handleChange('pet_safe',e.target.checked)} /> Pet safe</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.pot_included} onChange={e=>handleChange('pot_included',e.target.checked)} /> Pot included</label>
              <div><label className={`text-xs font-bold ${labelCls}`}>Pot Size</label><input value={form.pot_size} onChange={e=>handleChange('pot_size',e.target.value)} placeholder="5 inch" className={`mt-1 w-full border rounded-xl px-3 py-2.5 text-sm outline-none ${inputCls}`} /></div>
              <div><label className={`text-xs font-bold ${labelCls}`}>Mature Size</label><input value={form.mature_size} onChange={e=>handleChange('mature_size',e.target.value)} placeholder="30-40 cm" className={`mt-1 w-full border rounded-xl px-3 py-2.5 text-sm outline-none ${inputCls}`} /></div>
            </div>
          </div>

          {/* Descriptions */}
          <div className={`rounded-2xl border p-4 space-y-3 ${dark?'bg-white/5 border-white/10':'bg-[#fcfcfa]'}`}>
            <h4 className="font-black text-sm">Descriptions & Care</h4>
            <div><label className={`text-xs font-bold ${labelCls}`}>Short Description</label><textarea value={form.short_description} onChange={e=>handleChange('short_description',e.target.value)} rows={2} className={`mt-1 w-full border rounded-xl px-3 py-2.5 text-sm outline-none ${inputCls}`} /></div>
            <div><label className={`text-xs font-bold ${labelCls}`}>Long Description</label><textarea value={form.long_description} onChange={e=>handleChange('long_description',e.target.value)} rows={3} className={`mt-1 w-full border rounded-xl px-3 py-2.5 text-sm outline-none ${inputCls}`} /></div>
            <div><label className={`text-xs font-bold ${labelCls}`}>Care Instructions</label><textarea value={form.care_instructions} onChange={e=>handleChange('care_instructions',e.target.value)} rows={2} className={`mt-1 w-full border rounded-xl px-3 py-2.5 text-sm outline-none ${inputCls}`} /></div>
            <div className="grid md:grid-cols-2 gap-3">
              <div><label className={`text-xs font-bold ${labelCls}`}>Watering</label><input value={form.watering_frequency} onChange={e=>handleChange('watering_frequency',e.target.value)} placeholder="Weekly" className={`mt-1 w-full border rounded-xl px-3 py-2.5 text-sm outline-none ${inputCls}`} /></div>
              <div><label className={`text-xs font-bold ${labelCls}`}>Soil Type</label><input value={form.soil_type} onChange={e=>handleChange('soil_type',e.target.value)} placeholder="Sandy, pH 6-7" className={`mt-1 w-full border rounded-xl px-3 py-2.5 text-sm outline-none ${inputCls}`} /></div>
              <div><label className={`text-xs font-bold ${labelCls}`}>Temperature</label><input value={form.temperature_range} onChange={e=>handleChange('temperature_range',e.target.value)} placeholder="18-30°C" className={`mt-1 w-full border rounded-xl px-3 py-2.5 text-sm outline-none ${inputCls}`} /></div>
              <div><label className={`text-xs font-bold ${labelCls}`}>Humidity</label><input value={form.humidity_preference} onChange={e=>handleChange('humidity_preference',e.target.value)} placeholder="40-60%" className={`mt-1 w-full border rounded-xl px-3 py-2.5 text-sm outline-none ${inputCls}`} /></div>
              <div><label className={`text-xs font-bold ${labelCls}`}>Fertilizer</label><input value={form.fertilizer_schedule} onChange={e=>handleChange('fertilizer_schedule',e.target.value)} placeholder="Every 2 months" className={`mt-1 w-full border rounded-xl px-3 py-2.5 text-sm outline-none ${inputCls}`} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className={`text-xs font-bold ${labelCls}`}>Growth Rate</label><select value={form.growth_rate} onChange={e=>handleChange('growth_rate',e.target.value)} className={`mt-1 w-full border rounded-xl px-3 py-2.5 text-sm ${inputCls}`}><option value="slow">slow</option><option value="medium">medium</option><option value="fast">fast</option></select></div>
                <div><label className={`text-xs font-bold ${labelCls}`}>Difficulty</label><select value={form.difficulty_level} onChange={e=>handleChange('difficulty_level',e.target.value)} className={`mt-1 w-full border rounded-xl px-3 py-2.5 text-sm ${inputCls}`}><option value="easy">easy</option><option value="medium">medium</option><option value="hard">hard</option></select></div>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className={`rounded-2xl border p-4 space-y-3 ${dark?'bg-white/5 border-white/10':'bg-[#fcfcfa]'}`}>
            <h4 className="font-black text-sm">Images ({form.images.length})</h4>
            <div onDragOver={e=>{e.preventDefault(); setDragOver(true);}} onDragLeave={()=>setDragOver(false)} onDrop={handleDrop} className={`border-2 border-dashed rounded-xl p-4 text-center ${dragOver?'border-emerald-500 bg-emerald-50':'border-gray-200'} ${dark?'bg-white/5':''}`}>
              <div className="flex gap-2 justify-center">
                <input id="plant-file" type="file" accept="image/*" onChange={handleFile} className="hidden" />
                <label htmlFor="plant-file" className="bg-white border px-4 py-2 rounded-full text-xs font-bold cursor-pointer">Upload image</label>
                <span className="text-xs opacity-60 self-center">or drag & drop, or paste URL below</span>
              </div>
              <div className="mt-3 flex gap-2">
                <input id="img-url" placeholder="https://... image URL" className={`flex-1 border rounded-full px-3 py-2 text-sm ${inputCls}`} onKeyDown={e=>{ if(e.key==='Enter'){ e.preventDefault(); const inp=e.target; if(inp.value.trim()){ addImageUrl(inp.value.trim()); inp.value=''; } } }} />
                <button type="button" onClick={()=>{ const inp=document.getElementById('img-url'); if(inp.value.trim()){ addImageUrl(inp.value.trim()); inp.value=''; } }} className="bg-emerald-600 text-white px-4 py-2 rounded-full text-xs font-bold">Add URL</button>
              </div>
            </div>
            {form.images.length>0 && (
              <div className="grid grid-cols-3 gap-2">
                {form.images.map((url,i)=>(
                  <div key={i} className="relative group border rounded-xl overflow-hidden bg-white">
                    <img src={url} alt={`img-${i}`} className="w-full h-24 object-cover" />
                    <button type="button" onClick={()=>removeImage(i)} className="absolute top-1 right-1 bg-red-600 text-white w-6 h-6 rounded-full grid place-items-center text-xs opacity-90">✕</button>
                    <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] px-1 py-0.5 truncate">{i===0?'Cover':`#${i+1}`}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 sticky bottom-0 pt-3 bg-inherit">
            <button type="button" onClick={onClose} className="flex-1 border-2 py-3 rounded-full font-bold bg-white">Cancel</button>
            <button disabled={saving} type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-full font-black disabled:opacity-60">{saving?'Saving...': initial?'Update Plant':'Add Plant'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
