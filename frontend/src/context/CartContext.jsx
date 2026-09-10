import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api.js';
const Ctx = createContext();
export const CartProvider=({children})=>{
  const [cart,setCart]=useState(()=>{try{return JSON.parse(localStorage.getItem('cart')||'[]')}catch{return []}});
  useEffect(()=>localStorage.setItem('cart',JSON.stringify(cart)),[cart]);
  const add=(plant,qty=1)=>{
    setCart(prev=>{
      const ex=prev.find(p=>p.id===plant.id);
      if(ex) return prev.map(p=>p.id===plant.id?{...p,quantity:p.quantity+qty}:p);
      return [...prev,{...plant,quantity:qty}];
    });
  };
  const update=(id,qty)=> setCart(prev=> prev.map(p=>p.id===id?{...p,quantity:qty}:p).filter(p=>p.quantity>0));
  const remove=(id)=> setCart(prev=>prev.filter(p=>p.id!==id));
  const clear=()=>setCart([]);

  const syncToBackend = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await Promise.all(
        cart.map((item) =>
          api.post('/cart', { plant_id: item.id, quantity: item.quantity })
        )
      );
    } catch (e) {
      console.warn('Cart sync failed:', e.message);
    }
  };

  const loadFromBackend = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const { data } = await api.get('/cart');
      if (Array.isArray(data)) {
        const merged = data.map((c) => ({
          id: c.plant_id,
          quantity: c.quantity,
        }));
        setCart(merged);
      }
    } catch (e) {
      console.warn('Failed to load cart from backend:', e.message);
    }
  };

  const total=cart.reduce((s,c)=>s+ (c.discount_price||c.price)*c.quantity,0);
  return <Ctx.Provider value={{cart,add,update,remove,clear,total,syncToBackend,loadFromBackend}}>{children}</Ctx.Provider>
};
export const useCart=()=>useContext(Ctx);
