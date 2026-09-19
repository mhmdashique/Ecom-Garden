import { useEffect, useState, useMemo } from 'react';
import api from '../api';
import PlantCard from '../components/PlantCard';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const CATEGORIES = [
  { key: '', labelKey: 'shop_all_categories', labelFallback: 'All', icon: '🌿' },
  { key: 'Indoor', labelKey: 'shop_cat_indoor', labelFallback: 'Indoor', icon: '🪴' },
  { key: 'Outdoor', labelKey: 'shop_cat_outdoor', labelFallback: 'Outdoor', icon: '🌳' },
  { key: 'Succulents', labelKey: 'shop_cat_succulents', labelFallback: 'Succulents', icon: '🌵' },
  { key: 'Flowering', labelKey: 'shop_cat_flowering', labelFallback: 'Flowering', icon: '🌸' },
  { key: 'Seeds', labelKey: 'shop_cat_seeds', labelFallback: 'Seeds', icon: '🌱' },
];

function SkeletonCard(){
  return (
    <div className="overflow-hidden rounded-[22px] border border-white/60 bg-white/70 backdrop-blur p-3 animate-pulse">
      <div className="aspect-[4/3] rounded-[16px] bg-[#e8f0e3]" />
      <div className="mt-3 h-4 rounded bg-gray-200" />
      <div className="mt-2 h-3 w-2/3 rounded bg-gray-100" />
      <div className="mt-4 flex justify-between">
        <div className="h-5 w-16 rounded bg-gray-200" />
        <div className="h-7 w-20 rounded-full bg-gray-200" />
      </div>
    </div>
  )
}

export default function Shop(){
  const { t } = useLanguage();
  const [plants,setPlants]=useState([]);
  const [total,setTotal]=useState(0);
  const [loading,setLoading]=useState(true);
  const [searchParams]=useSearchParams();
  const [filters,setFilters]=useState({ search:'', category: searchParams.get('category')||'', sort:'newest', minPrice:'', maxPrice:'', sunlight:'' });
  const [page,setPage]=useState(1);
  const [showFilters,setShowFilters]=useState(false);

  const FALLBACK_SHOP = [
    { id:'p1', name:'Aloe Vera', price:180, discount_price:229, stock_qty:85, sunlight:'Bright', rating:4.8, images:['/aloevera plant.png'] },
    { id:'p2', name:'Calathea Plant', price:180, discount_price:399, stock_qty:34, sunlight:'Indirect', rating:4.7, images:['/calathea plant.jpg'] },
    { id:'p3', name:'Chinese Evergreen', price:150, discount_price:259, stock_qty:48, sunlight:'Indirect', rating:4.6, images:['/chinese evergreen.png'] },
    { id:'p4', name:'Patharchatta', price:60, discount_price:149, stock_qty:62, sunlight:'Full', rating:4.5, images:['/paathi pull.jpg'] },
    { id:'p5', name:'Lucky Bamboo — 2 Layer', price:150, discount_price:349, stock_qty:110, sunlight:'Indirect', rating:4.9, images:['/lucky bamboo.jpg'] },
    { id:'p6', name:'Areca Palm', price:180, discount_price:349, stock_qty:27, sunlight:'Bright', rating:4.7, images:['/palm.jpg'] },
    { id:'p7', name:'Red Calathea', price:200, discount_price:599, stock_qty:19, sunlight:'Indirect', rating:4.8, images:['/red calathea.jpg'] },
  ];
  const fetchPlants=()=>{
    setLoading(true);
    const q=new URLSearchParams({...filters,page,limit:12});
    if(!filters.category) q.delete('category');
    ['search','minPrice','maxPrice','sunlight','sort'].forEach(k=>{
      if(!q.get(k)) q.delete(k);
    });
    if(!q.get('sort')) q.set('sort', filters.sort);
    api.get(`/plants?${q.toString()}`)
      .then(r=>{
        const raw = r.data.plants||[];
        const deduped = [...new Map(raw.map(p=>[String(p.id),p])).values()];
        // if backend returns empty (cold start / blank after reload) fall back to local catalog so page never blank
        const finalList = deduped.length ? deduped : FALLBACK_SHOP;
        setPlants(finalList);
        setTotal(typeof r.data.total === 'number' && r.data.total>0 ? r.data.total : finalList.length);
      })
      .catch((e)=>{
        console.warn('Shop fetch failed', e.message);
        // network error → show fallback so reload never blank
        setPlants(prev => prev.length ? prev : FALLBACK_SHOP);
        setTotal(prev => prev || FALLBACK_SHOP.length);
      })
      .finally(()=>setLoading(false));
  };
  useEffect(()=>{ fetchPlants(); },[filters,page]);

  // reset page on filter change
  useEffect(()=>{ setPage(1); },[filters.search,filters.category,filters.sort,filters.sunlight,filters.minPrice,filters.maxPrice]);

  const totalPages = Math.max(1, Math.ceil(total/12));
  const hasActiveFilters = filters.search || filters.category || filters.sunlight || filters.minPrice || filters.maxPrice;

  const categoryCounts = useMemo(()=>{
    const counts = {};
    plants.forEach(p=>{
      const cat = p.category || p.category_name || 'Indoor';
      // try to normalize: if plant has category_id map? fallback to string includes
      counts[cat] = (counts[cat]||0)+1;
    });
    return counts;
  },[plants]);

  const clearFilters = () => setFilters({ search:'', category:'', sort:'newest', minPrice:'', maxPrice:'', sunlight:'' });

  return (
    <div className="min-h-screen bg-[#fdfbf7]">
      {/* subtle earthy gradient header */}
      <div className="border-b bg-gradient-to-b from-[#eef4eb] via-[#f8f7f2] to-[#fdfbf7]">
        <div className="mx-auto max-w-[1280px] px-4 md:px-6 lg:px-8 py-6 md:py-8">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-3 py-1 text-xs font-bold tracking-widest text-emerald-700 backdrop-blur shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> GREEnNEST COLLECTION • 2-ACRE NURSERY • PEZHUMMOODU
              </p>
              <h1 className="mt-3 font-outfit text-[30px] md:text-[42px] font-black leading-none tracking-tight text-[#0a2e1f]">
                {t('shop_title')}<span className="text-emerald-700">.</span>
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-gray-600">Hand-picked, health-checked & live-packed. Filter by light, price and care — find your perfect green companion.</p>
            </div>
            <div className="hidden md:flex items-center gap-2 text-xs">
              <span className="rounded-full bg-white border px-3 py-1.5 font-bold text-gray-600 shadow-sm">{total} {t('shop_plants_found')}</span>
              <span className="rounded-full bg-[#0a2e1f] text-white px-3 py-1.5 font-black">Free delivery over ₹999</span>
            </div>
          </div>

          {/* glass hero filter bar */}
          <div className="mt-6 rounded-[24px] border border-white/60 bg-white/70 backdrop-blur-xl shadow-[0_12px_40px_rgba(10,46,31,0.08)] p-3 md:p-4">
            {/* top row: search + sort */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              {/* search with icon */}
              <label className="relative flex-1">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M20 20L16 16"/></svg>
                </span>
                <input
                  placeholder={t('shop_search')}
                  value={filters.search}
                  onChange={e=>setFilters({...filters,search:e.target.value})}
                  className="w-full rounded-full border bg-white py-2.5 pl-10 pr-4 text-sm outline-none placeholder:text-gray-400 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                />
                {filters.search && (
                  <button onClick={()=>setFilters({...filters,search:''})} aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 grid h-7 w-7 place-items-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200">✕</button>
                )}
              </label>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <select
                    value={filters.sort}
                    onChange={e=>setFilters({...filters,sort:e.target.value})}
                    aria-label="Sort"
                    className="appearance-none rounded-full border bg-white px-4 py-2.5 pr-8 text-sm font-semibold text-[#0a2e1f] outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                  >
                    <option value="newest">{t('shop_newest')}</option>
                    <option value="price_asc">{t('shop_price_asc')}</option>
                    <option value="price_desc">{t('shop_price_desc')}</option>
                    <option value="popular">{t('shop_popular_sort')}</option>
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">▾</span>
                </div>

                <button
                  onClick={()=>setShowFilters(v=>!v)}
                  aria-expanded={showFilters}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-bold transition ${showFilters ? 'bg-[#0a2e1f] text-white border-[#0a2e1f]' : 'bg-white hover:border-emerald-200'}`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M6 12h12M10 18h4"/></svg>
                  Filters {hasActiveFilters && <span className="rounded-full bg-emerald-500 px-1.5 py-0.5 text-xs text-white">{[filters.category,filters.sunlight,filters.minPrice,filters.maxPrice].filter(Boolean).length}</span>}
                </button>

                {hasActiveFilters && (
                  <button onClick={clearFilters} className="rounded-full bg-[#fdfbf7] border px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-white">Clear</button>
                )}
              </div>
            </div>

            {/* category pills with count */}
            <div className="mt-4 flex gap-2 overflow-auto pb-1 -mx-1 px-1">
              {CATEGORIES.map(cat=>{
                const active = filters.category === cat.key;
                const count = cat.key === '' ? total : (categoryCounts[cat.key] ?? 0);
                // fallback: for empty category counts, show • when active total
                return (
                  <button
                    key={cat.key || 'all'}
                    onClick={()=>setFilters({...filters,category:cat.key})}
                    aria-pressed={active}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold whitespace-nowrap transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0a2e1f] ${active ? 'bg-[#0a2e1f] text-white border-[#0a2e1f] shadow-md' : 'bg-white text-gray-700 hover:border-emerald-200 hover:shadow-sm'}`}
                  >
                    <span aria-hidden>{cat.icon}</span>
                    <span>{cat.key === '' ? t('shop_all_categories') : t(cat.labelKey) || cat.labelFallback}</span>
                    <span className={`rounded-full px-1.5 py-0.5 text-xs font-black ${active ? 'bg-white text-[#0a2e1f]' : 'bg-[#f6f7f4] text-gray-600 border'}`}>{count}</span>
                  </button>
                )
              })}
            </div>

            {/* expandable secondary filters */}
            {showFilters && (
              <div className="mt-4 grid gap-3 rounded-[18px] border bg-[#fdfbf7] p-3 md:grid-cols-4 md:p-4">
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-bold tracking-widest text-gray-500">SUNLIGHT</span>
                  <div className="relative">
                    <select value={filters.sunlight} onChange={e=>setFilters({...filters,sunlight:e.target.value})} className="w-full appearance-none rounded-xl border bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-300">
                      <option value="">{t('shop_sunlight_any')}</option>
                      <option>Full</option><option>Indirect</option><option>Bright</option><option>Low</option>
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">▾</span>
                  </div>
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-bold tracking-widest text-gray-500">MIN PRICE</span>
                  <input type="number" min="0" placeholder={t('shop_min_price')} value={filters.minPrice} onChange={e=>setFilters({...filters,minPrice:e.target.value})} className="rounded-xl border bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-300"/>
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-bold tracking-widest text-gray-500">MAX PRICE</span>
                  <input type="number" min="0" placeholder={t('shop_max_price')} value={filters.maxPrice} onChange={e=>setFilters({...filters,maxPrice:e.target.value})} className="rounded-xl border bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-300"/>
                </label>
                <div className="flex items-end">
                  <div className="flex w-full items-center justify-between rounded-xl border bg-white px-3 py-2.5 text-sm">
                    <span className="text-gray-600 font-medium">{total} {t('shop_plants_found')}</span>
                    <span className="text-xs font-bold text-emerald-700">Page {page}/{totalPages}</span>
                  </div>
                </div>
              </div>
            )}

            {/* active filter chips */}
            {hasActiveFilters && (
              <div className="mt-3 flex flex-wrap gap-2">
                {filters.category && <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">Category: {filters.category} <button onClick={()=>setFilters({...filters,category:''})} className="grid h-5 w-5 place-items-center rounded-full bg-white border">✕</button></span>}
                {filters.sunlight && <span className="inline-flex items-center gap-2 rounded-full bg-white border px-3 py-1 text-xs font-bold">☀️ {filters.sunlight} <button onClick={()=>setFilters({...filters,sunlight:''})} className="grid h-5 w-5 place-items-center rounded-full bg-gray-100">✕</button></span>}
                {(filters.minPrice || filters.maxPrice) && <span className="inline-flex items-center gap-2 rounded-full bg-white border px-3 py-1 text-xs font-bold">₹{filters.minPrice||0} – ₹{filters.maxPrice||'∞'} <button onClick={()=>setFilters({...filters,minPrice:'',maxPrice:''})} className="grid h-5 w-5 place-items-center rounded-full bg-gray-100">✕</button></span>}
                {filters.search && <span className="inline-flex items-center gap-2 rounded-full bg-white border px-3 py-1 text-xs font-bold">“{filters.search}” <button onClick={()=>setFilters({...filters,search:''})} className="grid h-5 w-5 place-items-center rounded-full bg-gray-100">✕</button></span>}
              </div>
            )}
          </div>

          {/* mobile total */}
          <p className="mt-3 text-xs font-bold tracking-wide text-gray-500 md:hidden">{total} {t('shop_plants_found')} • Page {page} of {totalPages}</p>
        </div>
      </div>

      {/* content */}
      <div className="mx-auto max-w-[1280px] px-4 md:px-6 lg:px-8 py-6">
        {/* skeleton */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({length:8}).map((_,i)=><SkeletonCard key={i}/>)}
          </div>
        ) : plants.length === 0 ? (
          /* empty state */
          <div className="mx-auto max-w-[560px] rounded-[24px] border border-white/60 bg-white/80 backdrop-blur-xl shadow-[0_12px_40px_rgba(10,46,31,0.08)] p-8 md:p-10 text-center">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#e8f0e3] text-3xl">🌿</div>
            <h3 className="mt-4 font-outfit text-xl font-black text-[#0a2e1f]">No plants found</h3>
            <p className="mt-2 text-sm leading-6 text-gray-600">We couldn’t find anything for your filters. Try clearing filters or searching “Aloe”, “Areca”, “Money Plant”.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <button onClick={clearFilters} className="rounded-full bg-[#0a2e1f] px-6 py-2.5 text-sm font-black text-white hover:bg-black">Clear all filters</button>
              <button onClick={()=>setFilters({...filters,search:''})} className="rounded-full border bg-white px-6 py-2.5 text-sm font-bold hover:border-emerald-200">Clear search</button>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-2 text-xs">
              <div className="rounded-2xl bg-[#fdfbf7] border p-3"><div className="font-black">12k+</div><div className="text-gray-500">Homes greened</div></div>
              <div className="rounded-2xl bg-[#fdfbf7] border p-3"><div className="font-black">48h</div><div className="text-gray-500">Nursery → door</div></div>
              <div className="rounded-2xl bg-[#fdfbf7] border p-3"><div className="font-black">4.9★</div><div className="text-gray-500">3,421 reviews</div></div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...new Map(plants.map(p=>[String(p.id),p])).values()].map(p=><PlantCard key={p.id} plant={p}/>)}
          </div>
        )}

        {/* pagination */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            disabled={page===1}
            onClick={()=>setPage(p=>Math.max(1,p-1))}
            className="inline-flex items-center gap-2 rounded-full border bg-white px-5 py-2.5 text-sm font-bold shadow-sm disabled:opacity-50 hover:border-emerald-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0a2e1f]"
          >
            ← {t('shop_prev')}
          </button>
          <span className="rounded-full border bg-white/70 backdrop-blur px-4 py-2 text-sm font-black text-[#0a2e1f] shadow-sm">
            {t('shop_page')} {page} <span className="font-normal text-gray-500">/ {totalPages}</span>
          </span>
          <button
            disabled={page>=totalPages}
            onClick={()=>setPage(p=>p+1)}
            className="inline-flex items-center gap-2 rounded-full border bg-white px-5 py-2.5 text-sm font-bold shadow-sm disabled:opacity-50 hover:border-emerald-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0a2e1f]"
          >
            {t('shop_next')} →
          </button>
        </div>
        <p className="mt-3 text-center text-xs text-gray-500">Showing {plants.length} of {total} • Free delivery over ₹999 • GST bill on request</p>
      </div>
    </div>
  )
}
