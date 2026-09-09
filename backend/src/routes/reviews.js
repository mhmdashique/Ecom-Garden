import express from 'express';
import { db, genId } from '../utils/memoryStore.js';
import { auth, adminOnly } from '../middleware/auth.js';
const router = express.Router();

router.get('/', (req,res)=>{
  const { plant_id } = req.query;
  let r=[...db.plant_reviews];
  if(plant_id) r=r.filter(x=>x.plant_id===plant_id);
  res.json(r);
});
router.post('/', auth, (req,res)=>{
  const { plant_id, rating, comment, review_image_url } = req.body;
  const review={ id: genId(), plant_id, user_id:req.user.id, user_name:req.user.name, rating, comment, review_image_url: review_image_url || null, created_at:new Date().toISOString()};
  // push to both plant_reviews and legacy reviews (getter handles)
  db.plant_reviews.push(review);
  res.status(201).json(review);
});
router.delete('/:id', auth, adminOnly, (req,res)=>{
  const idx=db.plant_reviews.findIndex(c=>c.id===req.params.id);
  if(idx===-1) return res.status(404).json({error:'Not found'});
  db.plant_reviews.splice(idx,1);
  res.json({message:'deleted'});
});
export default router;
