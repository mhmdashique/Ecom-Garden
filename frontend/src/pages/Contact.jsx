import { useState } from 'react';
import api from '../api';
import { useToast } from '../components/Toast';
import { useLanguage } from '../context/LanguageContext';

export default function Contact(){
  const [form,setForm]=useState({name:'',email:'',subject:'',message:''});
  const [sent,setSent]=useState(false);
  const [sending,setSending]=useState(false);
  const {success, error: toastError}=useToast();
  const {t}=useLanguage();
  const submit=async(e)=>{
    e.preventDefault();
    setSending(true);
    try{
      await api.post('/contact', form);
      setSent(true); setForm({name:'',email:'',subject:'',message:''});
      success('Message sent — we will reply in 2 hours');
      setTimeout(()=>setSent(false), 4000);
    }catch{ toastError('Failed to send — please try again'); }
    finally{ setSending(false); }
  };
  return (
    <div className="bg-[#fcfcfa]">
      {/* hero */}
      <section className="bg-[#0a2e1f] text-white relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 lg:px-12 py-10 md:py-14 grid md:grid-cols-2 gap-8 items-center relative">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1.5 text-xs font-black tracking-widest uppercase text-emerald-300">{t('contact_badge')}</div>
            <h1 className="mt-4 text-[32px] md:text-[42px] font-black leading-[0.9] tracking-tight">{t('contact_hero_title1')} <span className="font-serif italic font-normal text-emerald-300">{t('contact_hero_title2')}</span></h1>
            <p className="mt-3 text-sm md:text-[15px] leading-6 text-white/70 max-w-[520px]">{t('contact_hero_desc')}</p>
            <div className="mt-6 flex flex-wrap gap-2 text-xs font-bold">
              <span className="bg-white text-[#0a2e1f] px-3 py-2 rounded-full">{t('contact_phone_display')}</span>
              <span className="bg-white/10 border border-white/20 px-3 py-2 rounded-full">{t('contact_email_display')}</span>
              <span className="bg-emerald-600 px-3 py-2 rounded-full">{t('contact_whatsapp_display')}</span>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="bg-white rounded-[24px] p-4 shadow-xl">
              <div className="flex items-center gap-3">
                <img src="https://i.pravatar.cc/100?img=12" alt="team" className="w-10 h-10 rounded-full object-cover"/>
                <div><div className="font-black text-sm">{t('contact_care_expert')}</div><div className="text-xs text-gray-500">{t('contact_replies_in')}</div></div>
                <span className="ml-auto w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              </div>
              <div className="mt-3 bg-[#f6f7f4] rounded-2xl p-3 text-sm">{t('contact_help')}</div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-[1280px] mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-10 grid lg:grid-cols-[1.15fr_0.85fr] gap-6 md:gap-8">
        {/* form */}
        <form onSubmit={submit} className="bg-white rounded-[24px] border shadow-sm p-6 md:p-7">
          <h2 className="text-xl font-black">{t('contact_send_title')}</h2>
          <p className="text-sm text-gray-500 mt-1">{t('contact_send_desc')}</p>
          {sent && (
            <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex gap-3 items-start">
              <span className="w-8 h-8 rounded-full bg-emerald-500 text-white grid place-items-center shrink-0 text-base">✓</span>
              <div>
                <div className="font-black text-emerald-800 text-sm">Message sent successfully!</div>
                <div className="text-emerald-700 text-xs mt-0.5">Thank you for contacting us — we've sent a confirmation to your email and will reply within 2 hours.</div>
              </div>
            </div>
          )}

          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-black tracking-widest uppercase text-gray-600">{t('your_name')}</label>
              <input placeholder={t('contact_name_placeholder')} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="mt-1 w-full bg-[#f6f7f4] border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50" required/>
            </div>
            <div>
              <label className="text-xs font-black tracking-widest uppercase text-gray-600">{t('email')}</label>
              <input placeholder={t('contact_email_placeholder')} type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="mt-1 w-full bg-[#f6f7f4] border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50" required/>
            </div>
          </div>
          <div className="mt-4">
            <label className="text-xs font-black tracking-widest uppercase text-gray-600">{t('subject')}</label>
            <select value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})} className="mt-1 w-full bg-[#f6f7f4] border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-emerald-300" required>
              <option value="">{t('contact_select_topic')}</option>
              <option>{t('contact_retail')}</option>
              <option>{t('contact_wholesale')}</option>
              <option>{t('contact_care_support')}</option>
              <option>{t('contact_greenhouse_visit')}</option>
              <option>{t('contact_other')}</option>
            </select>
          </div>
          <div className="mt-4">
            <label className="text-xs font-black tracking-widest uppercase text-gray-600">{t('message')}</label>
            <textarea placeholder={t('contact_message_placeholder')} value={form.message} onChange={e=>setForm({...form,message:e.target.value})} className="mt-1 w-full bg-[#f6f7f4] border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-emerald-300 min-h-[120px]" required/>
            <div className="text-xs text-gray-400 mt-1">{form.message.length}/500</div>
          </div>

          <button disabled={sending} className="mt-6 w-full bg-[#0a2e1f] text-white py-3.5 rounded-full font-black text-sm hover:bg-black transition disabled:opacity-60 flex items-center justify-center gap-2">
            {sending ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span> {t('contact_sending')}</> : <>{t('contact_send_btn')}</>}
          </button>
          <p className="text-center text-xs text-gray-500 mt-2">{t('contact_avg_reply')}</p>

          <div className="mt-6 grid grid-cols-3 gap-2 text-center text-xs">
            <span className="bg-[#f6f7f4] border rounded-xl py-2 font-bold">{t('contact_private')}</span>
            <span className="bg-[#f6f7f4] border rounded-xl py-2 font-bold">{t('contact_no_spam')}</span>
            <span className="bg-[#f6f7f4] border rounded-xl py-2 font-bold">{t('contact_whatsapp_badge')}</span>
          </div>
        </form>

        {/* info side */}
        <div className="space-y-4">
          <div className="bg-white rounded-[24px] border p-6 shadow-sm">
            <h3 className="font-black">{t('visit_greenhouse')}</h3>
            <div className="mt-3 space-y-3 text-sm">
              <div className="flex gap-3">
                <span className="w-8 h-8 rounded-full bg-emerald-100 grid place-items-center shrink-0">📍</span>
                <div><div className="font-bold">{t('contact_greenhouse_name')}</div><div className="text-gray-600">{t('contact_greenhouse_address')}</div></div>
              </div>
              <div className="flex gap-3">
                <span className="w-8 h-8 rounded-full bg-amber-100 grid place-items-center shrink-0">☎</span>
                <div><div className="font-bold">{t('contact_call')}</div><div className="text-gray-600">{t('contact_call_desc')}</div></div>
              </div>
              <div className="flex gap-3">
                <span className="w-8 h-8 rounded-full bg-blue-100 grid place-items-center shrink-0">✉</span>
                <div><div className="font-bold">{t('contact_hello_email')}</div><div className="text-gray-600">{t('contact_hello_desc')}</div></div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <a href="https://instagram.com" target="_blank" className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white grid place-items-center">◎</a>
              <a href="https://facebook.com" target="_blank" className="w-9 h-9 rounded-xl bg-[#1877F2] text-white grid place-items-center text-sm font-black">f</a>
              <a href="https://wa.me/919876543210" target="_blank" className="flex-1 bg-[#25D366] text-white rounded-full flex items-center justify-center gap-2 text-sm font-black">{t('contact_whatsapp_us')}</a>
            </div>
          </div>



          <div className="bg-white rounded-[24px] border overflow-hidden shadow-sm">
            <div className="p-4 flex items-center justify-between">
              <h4 className="font-black text-sm">{t('find_us_map')}</h4>
              <span className="text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded-full font-bold">{t('contact_poovachal')}</span>
            </div>
            <iframe title="map" src="https://maps.google.com/maps?q=H34Q%2B9FP%2C%20Poovachal%2C%20Kerala%20695575&t=&z=16&ie=UTF8&iwloc=&output=embed" className="w-full h-[240px] border-t" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
            <div className="p-3 flex gap-2 text-xs">
              <a href="https://maps.google.com/?q=H34Q%2B9FP%2C%20Poovachal%2C%20Kerala%20695575" target="_blank" className="flex-1 bg-[#0a2e1f] text-white text-center py-2.5 rounded-full font-black">{t('contact_open_maps')}</a>
              <span className="bg-[#f6f7f4] border px-3 py-2 rounded-full font-bold">9am-7pm</span>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
            <span className="text-xl">⏰</span>
            <div className="text-sm"><div className="font-black">{t('contact_hours_title')}</div><div className="text-gray-600 leading-5">{t('contact_hours_desc')}</div></div>
          </div>
        </div>
      </div>
    </div>
  )
}
