import express from 'express';
import { db, genId } from '../utils/memoryStore.js';
import { auth } from '../middleware/auth.js';
const router = express.Router();

router.get('/', auth, (req,res)=>{
  res.json(db.cart_items.filter(c=>c.user_id===req.user.id));
});
router.post('/', auth, (req,res)=>{
  const { plant_id, quantity } = req.body;
  let item = db.cart_items.find(c=>c.user_id===req.user.id && c.plant_id===plant_id);
  if(item) item.quantity+=quantity||1;
  else {
    item={ id: genId(), user_id:req.user.id, plant_id, quantity: quantity||1 };
    db.cart_items.push(item);
  }
  res.json(item);
});
router.put('/:id', auth, (req,res)=>{
  const item=db.cart_items.find(c=>c.id===req.params.id);
  if(!item) return res.status(404).json({error:'Not found'});
  item.quantity=req.body.quantity;
  res.json(item);
});
router.delete('/:id', auth, (req,res)=>{
  const idx=db.cart_items.findIndex(c=>c.id===req.params.id);
  if(idx===-1) return res.status(404).json({error:'Not found'});
  db.cart_items.splice(idx,1);
  res.json({message:'removed'});
});

export default router;
