import { useEffect, useState } from 'react';
import api from '../api';
import PlantCard from '../components/PlantCard';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function Shop(){
  const { t } = useLanguage();
  const [plants,setPlants]=useState([]);
  const [total,setTotal]=useState(0);
  const [searchParams]=useSearchParams();
  const [filters,setFilters]=useState({ search:'', category: searchParams.get('category')||'', sort:'newest', minPrice:'', maxPrice:'', sunlight:'' });
  const [page,setPage]=useState(1);

  const fetchPlants=()=>{
    const q=new URLSearchParams({...filters,page,limit:12});
    if(!filters.category) q.delete('category');
    api.get(`/plants?${q.toString()}`).then(r=>{setPlants(r.data.plants);setTotal(r.data.total)}).catch(()=>{});
  };
  useEffect(fetchPlants,[filters,page]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-4">{t('shop_title')}</h1>
      <div className="flex flex-wrap gap-2 mb-6 bg-gray-50 p-4 rounded-xl">
        <input placeholder={t('shop_search')} value={filters.search} onChange={e=>setFilters({...filters,search:e.target.value})} className="border px-3 py-2 rounded flex-1 min-w-[180px]"/>
        <select value={filters.category} onChange={e=>setFilters({...filters,category:e.target.value})} className="border px-3 py-2 rounded">
          <option value="">{t('shop_all_categories')}</option><option>{t('shop_cat_indoor')}</option><option>{t('shop_cat_outdoor')}</option><option>{t('shop_cat_succulents')}</option><option>{t('shop_cat_flowering')}</option><option>{t('shop_cat_seeds')}</option>
        </select>
        <select value={filters.sort} onChange={e=>setFilters({...filters,sort:e.target.value})} className="border px-3 py-2 rounded">
          <option value="newest">{t('shop_newest')}</option><option value="price_asc">{t('shop_price_asc')}</option><option value="price_desc">{t('shop_price_desc')}</option><option value="popular">{t('shop_popular_sort')}</option>
        </select>
        <select value={filters.sunlight} onChange={e=>setFilters({...filters,sunlight:e.target.value})} className="border px-3 py-2 rounded">
          <option value="">{t('shop_sunlight_any')}</option><option>Full</option><option>Indirect</option><option>Bright</option><option>Low</option>
        </select>
        <input type="number" placeholder={t('shop_min_price')} value={filters.minPrice} onChange={e=>setFilters({...filters,minPrice:e.target.value})} className="border px-3 py-2 rounded w-24"/>
        <input type="number" placeholder={t('shop_max_price')} value={filters.maxPrice} onChange={e=>setFilters({...filters,maxPrice:e.target.value})} className="border px-3 py-2 rounded w-24"/>
      </div>
      <p className="text-sm text-gray-500 mb-3">{total} {t('shop_plants_found')}</p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {plants.map(p=><PlantCard key={p.id} plant={p}/>)}
      </div>
      <div className="flex justify-center gap-2 mt-6">
        <button disabled={page===1} onClick={()=>setPage(p=>p-1)} className="border px-4 py-2 rounded disabled:opacity-50">{t('shop_prev')}</button>
        <span className="px-4 py-2">{t('shop_page')} {page}</span>
        <button onClick={()=>setPage(p=>p+1)} className="border px-4 py-2 rounded">{t('shop_next')}</button>
      </div>
    </div>
  )
}
