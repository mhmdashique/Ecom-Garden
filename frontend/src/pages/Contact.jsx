import { useState } from 'react';
import api from '../api';
import { useToast } from '../components/Toast';
import { useLanguage } from '../context/LanguageContext';

// floating label input primitive
function FloatingInput({ label, id, type='text', value, onChange, placeholder, required, error, autoComplete, maxLength, ...rest }) {
  const hasError = !!error;
  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder=" "
        required={required}
        autoComplete={autoComplete}
        maxLength={maxLength}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${id}-error` : undefined}
        className={`peer w-full bg-white/70 backdrop-blur border rounded-2xl px-4 pt-6 pb-2.5 text-[14px] text-[#1c1917] placeholder-transparent outline-none transition
          ${hasError ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-50' : 'border-[#e7e5e4] focus:bg-white focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50'}
          shadow-sm`}
        {...rest}
      />
      <label
        htmlFor={id}
        className={`absolute left-4 transition-all duration-150 pointer-events-none
          peer-placeholder-shown:top-[14px] peer-placeholder-shown:text-sm peer-placeholder-shown:text-[#8a857e]
          peer-focus:top-[7px] peer-focus:text-[11px] peer-focus:font-black peer-focus:tracking-widest peer-focus:uppercase
          ${value ? 'top-[7px] text-[11px] font-black tracking-widest uppercase text-emerald-800' : 'top-[14px] text-sm text-[#8a857e]'}
          peer-focus:text-emerald-700`}
      >
        {label}
      </label>
      {hasError && <p id={`${id}-error`} className="mt-1.5 text-xs font-semibold text-red-600">{error}</p>}
      {placeholder && !hasError && !value && (
        <span className="pointer-events-none absolute left-4 top-[28px] text-xs text-[#a8a29e] opacity-0 peer-placeholder-shown:opacity-0">{placeholder}</span>
      )}
    </div>
  );
}

function FloatingTextarea({ label, id, value, onChange, required, error, maxLength=500 }) {
  return (
    <div className="relative">
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        placeholder=" "
        required={required}
        maxLength={maxLength}
        rows={4}
        aria-invalid={!!error}
        className={`peer w-full bg-white/70 backdrop-blur border rounded-2xl px-4 pt-6 pb-3 text-[14px] leading-5 placeholder-transparent outline-none resize-none transition
          ${error ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-50' : 'border-[#e7e5e4] focus:bg-white focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50'} shadow-sm`}
      />
      <label
        htmlFor={id}
        className={`absolute left-4 transition-all duration-150 pointer-events-none bg-transparent
          ${value ? 'top-[7px] text-[11px] font-black tracking-widest uppercase text-emerald-800' : 'peer-placeholder-shown:top-[14px] peer-placeholder-shown:text-sm peer-placeholder-shown:text-[#8a857e] top-[7px] text-[11px] font-black tracking-widest uppercase text-emerald-800'}
          peer-focus:top-[7px] peer-focus:text-[11px] peer-focus:font-black peer-focus:tracking-widest peer-focus:uppercase peer-focus:text-emerald-700`}
      >
        {label}
      </label>
      <div className="mt-1.5 flex justify-between items-center">
        <span>{error && <span className="text-xs font-semibold text-red-600">{error}</span>}</span>
        <span className="text-[11px] font-bold tracking-wide text-[#a8a29e]">{value.length}/{maxLength}</span>
      </div>
    </div>
  );
}

function FloatingSelect({ label, id, value, onChange, required, error, children }) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={onChange}
        required={required}
        aria-invalid={!!error}
        className={`peer w-full bg-white/70 backdrop-blur border rounded-2xl px-4 pt-6 pb-2.5 text-[14px] outline-none appearance-none transition
          ${error ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-50' : 'border-[#e7e5e4] focus:bg-white focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50'} shadow-sm`}
      >
        {children}
      </select>
      <label htmlFor={id} className={`absolute left-4 top-[7px] text-[11px] font-black tracking-widest uppercase ${error ? 'text-red-600' : 'text-emerald-800'} pointer-events-none`}>
        {label}
      </label>
      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#a8a29e]">⌄</span>
      {error && <p className="mt-1.5 text-xs font-semibold text-red-600">{error}</p>}
    </div>
  );
}

export default function Contact(){
  const [form,setForm]=useState({name:'',email:'',subject:'',message:''});
  const [errors,setErrors]=useState({});
  const [sent,setSent]=useState(false);
  const [sending,setSending]=useState(false);
  const {success, error: toastError}=useToast();
  const {t}=useLanguage();

  const validate=()=>{
    const e={};
    if(!form.name.trim()) e.name='Name is required';
    else if(form.name.trim().length<2) e.name='At least 2 characters';
    if(!form.email.trim()) e.email='Email is required';
    else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email='Enter a valid email';
    if(!form.subject) e.subject='Choose a topic';
    if(!form.message.trim()) e.message='Message is required';
    else if(form.message.trim().length<10) e.message='Please write at least 10 characters';
    return e;
  };

  const submit=async(e)=>{
    e.preventDefault();
    const v=validate();
    setErrors(v);
    if(Object.keys(v).length) return;
    setSending(true);
    try{
      await api.post('/contact', form);
      setSent(true); setForm({name:'',email:'',subject:'',message:''});
      setErrors({});
      success('Message sent — we will reply in 2 hours');
      setTimeout(()=>setSent(false), 5000);
    }catch{ toastError('Failed to send — please try again'); }
    finally{ setSending(false); }
  };

  return (
    <div className="bg-[#fdfbf7] min-h-screen relative overflow-hidden">
      {/* soft earthy glows */}
      <div className="pointer-events-none absolute -top-32 -right-32 w-[520px] h-[520px] bg-[#e8f0e3] rounded-full blur-[90px] opacity-70" />
      <div className="pointer-events-none absolute top-[520px] -left-32 w-[420px] h-[420px] bg-emerald-100/60 rounded-full blur-[80px] opacity-60" />

      {/* trust header */}
      <div className="relative bg-[#0a2e1f] text-white/90 border-b border-white/10">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 lg:px-12 py-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px] font-bold tracking-widest uppercase">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 bg-white text-[#0a2e1f] rounded-full px-2.5 py-1 text-[11px] font-black tracking-widest uppercase">● Live • 2hr reply</span>
            <span className="hidden md:inline text-white/70 font-semibold tracking-normal normal-case text-xs">Trusted by 12,000+ plant parents • 4.9★ (2,340 reviews)</span>
          </div>
          <div className="flex items-center gap-2 text-white/80 text-xs font-semibold tracking-normal normal-case">
            <span className="hidden sm:inline">Kerala’s climate-zoned greenhouse</span>
            <span className="w-1 h-1 bg-white/30 rounded-full hidden sm:inline-block" />
            <span>Est. 2022</span>
            <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="ml-2 bg-[#25D366] text-white rounded-full px-3 py-1.5 font-black text-xs hover:brightness-110 transition">WhatsApp — +91 98765 43210</a>
          </div>
        </div>
      </div>

      {/* hero */}
      <section className="relative bg-[#0a2e1f] text-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-20 -right-20 w-[420px] h-[420px] bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[260px] bg-gradient-to-t from-black/20 to-transparent" />
        </div>
        <div className="relative max-w-[1280px] mx-auto px-4 md:px-8 lg:px-12 py-10 md:py-12 grid lg:grid-cols-[1.2fr_0.8fr] gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3 py-1.5 text-xs font-black tracking-widest uppercase text-emerald-200 backdrop-blur">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /> {t('contact_badge') || 'We care for every leaf'}
            </div>
            <h1 className="mt-4 text-[34px] md:text-[44px] font-black leading-[0.9] tracking-tight" style={{fontFamily:'Outfit, sans-serif'}}>
              {t('contact_hero_title1') || 'Let’s grow'} <span className="font-serif italic font-normal text-emerald-300">{t('contact_hero_title2') || 'together'}</span>
            </h1>
            <p className="mt-3 text-sm md:text-[15px] leading-6 text-white/70 max-w-[560px]">{t('contact_hero_desc') || 'Questions, care advice or wholesale enquiries — our growers reply within 2 hours, 9am–7pm IST.'}</p>
            <div className="mt-6 flex flex-wrap gap-2 text-xs font-bold">
              <a href="tel:+919876543210" className="bg-white text-[#0a2e1f] px-3.5 py-2.5 rounded-full hover:bg-amber-50 transition">{t('contact_phone_display') || '+91 98765 43210'}</a>
              <a href="mailto:hello@greennest.in" className="bg-white/10 border border-white/20 backdrop-blur px-3.5 py-2.5 rounded-full hover:bg-white/15 transition">{t('contact_email_display') || 'hello@greennest.in'}</a>
              <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="bg-emerald-600 border border-emerald-500 px-3.5 py-2.5 rounded-full hover:bg-emerald-500 transition">{t('contact_whatsapp_display') || 'WhatsApp us'}</a>
            </div>
            <div className="mt-6 flex items-center gap-3 text-xs text-white/70">
              <div className="flex -space-x-2">
                <img src="https://i.pravatar.cc/100?img=5" alt="" className="w-7 h-7 rounded-full border-2 border-[#0a2e1f] object-cover" />
                <img src="https://i.pravatar.cc/100?img=12" alt="" className="w-7 h-7 rounded-full border-2 border-[#0a2e1f] object-cover" />
                <img src="https://i.pravatar.cc/100?img=32" alt="" className="w-7 h-7 rounded-full border-2 border-[#0a2e1f] object-cover" />
              </div>
              <span className="font-semibold">Plant care team • Avg. reply 47 minutes • No bots</span>
            </div>
          </div>

          {/* glass testimonial card */}
          <div className="hidden lg:block">
            <div className="relative bg-white/10 backdrop-blur-xl border border-white/15 rounded-[28px] p-6 shadow-2xl">
              <div className="flex items-center gap-3">
                <img src="https://i.pravatar.cc/100?img=12" alt="team" className="w-10 h-10 rounded-full object-cover border-2 border-white/20"/>
                <div>
                  <div className="font-black text-sm">{t('contact_care_expert') || 'Care Expert — Ananya'}</div>
                  <div className="text-xs text-white/70">{t('contact_replies_in') || 'Replies in ~2 hours • 9am–7pm'}</div>
                </div>
                <span className="ml-auto w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse border-2 border-white/30" />
              </div>
              <div className="mt-4 bg-white rounded-2xl p-4 text-sm leading-6 text-[#1c1917] shadow-lg">
                <span className="font-black text-[#0a2e1f]">Hi!</span> {t('contact_help') || 'Tell us about your space, light and experience — we’ll match you with plants that truly thrive.'}
                <div className="mt-3 flex gap-2">
                  <span className="text-xs bg-[#f6f7f4] border border-[#e7e5e4] rounded-full px-2.5 py-1 font-bold">Snake Plant</span>
                  <span className="text-xs bg-[#f6f7f4] border border-[#e7e5e4] rounded-full px-2.5 py-1 font-bold">Monstera</span>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-white/70">
                <span className="w-6 h-6 rounded-full bg-emerald-500 grid place-items-center text-white">✓</span> Endorsed by 4.9★ growers
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* main split */}
      <div className="relative max-w-[1280px] mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-10 grid lg:grid-cols-[1.05fr_1.15fr] gap-6 md:gap-8">
        {/* left: info cards */}
        <div className="space-y-4">
          {/* address with map */}
          <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-[24px] shadow-card overflow-hidden">
            <div className="p-6">
              <div className="inline-flex items-center gap-2 bg-[#f6f7f4] border border-[#e7e5e4] rounded-full px-3 py-1 text-[11px] font-black tracking-widest uppercase text-[#0a2e1f]">
                <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full" /> Visit our greenhouse
              </div>
              <h3 className="mt-3 text-[19px] font-black tracking-tight" style={{fontFamily:'Outfit, sans-serif'}}>{t('visit_greenhouse') || 'Poovachal Greenhouse'}</h3>
              <p className="text-sm text-[#57534e] mt-1 leading-6">{t('contact_greenhouse_address') || 'H34Q+9FP, Poovachal, Kerala 695575 — mist houses, mother-plant blocks & cafe.'}</p>

              <div className="mt-5 space-y-3 text-sm">
                <div className="flex gap-3 items-start bg-[#fdfbf7] border border-[#e7e5e4] rounded-2xl p-3">
                  <span className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 grid place-items-center shrink-0 text-sm">📍</span>
                  <div>
                    <div className="font-black text-[#1c1917]">{t('contact_greenhouse_name') || 'GreenNest Nursery'}</div>
                    <div className="text-[#57534e] leading-5">Open for guided walks • Free care diagnosis</div>
                    <button onClick={()=>window.open('https://maps.google.com/?q=H34Q%2B9FP%2C%20Poovachal%2C%20Kerala%20695575','_blank')} className="mt-2 text-xs font-black text-emerald-700 hover:text-emerald-800">Open in Google Maps →</button>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <a href="tel:+919876543210" className="flex gap-3 items-center bg-white border border-[#e7e5e4] rounded-2xl p-3 hover:border-emerald-200 hover:bg-emerald-50/50 transition">
                    <span className="w-9 h-9 rounded-xl bg-amber-100 grid place-items-center shrink-0">☎</span>
                    <div>
                      <div className="font-black text-xs tracking-widest uppercase text-[#57534e]">Call</div>
                      <div className="font-bold text-sm">+91 98765 43210</div>
                    </div>
                  </a>
                  <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="flex gap-3 items-center bg-[#25D366] text-white rounded-2xl p-3 hover:brightness-110 transition shadow-sm">
                    <span className="w-9 h-9 rounded-xl bg-white/20 grid place-items-center shrink-0">✦</span>
                    <div>
                      <div className="font-black text-xs tracking-widest uppercase opacity-90">WhatsApp</div>
                      <div className="font-black text-sm">Fastest reply</div>
                    </div>
                  </a>
                </div>
                <a href="mailto:hello@greennest.in" className="flex gap-3 items-center bg-white border border-[#e7e5e4] rounded-2xl p-3 hover:border-emerald-200 transition">
                  <span className="w-9 h-9 rounded-xl bg-sky-100 grid place-items-center shrink-0 text-sm">✉</span>
                  <div>
                    <div className="font-bold">{t('contact_hello_email') || 'hello@greennest.in'}</div>
                    <div className="text-xs text-[#57534e]">{t('contact_hello_desc') || 'We reply within 2 hours • no spam, ever'}</div>
                  </div>
                </a>
              </div>

              <div className="mt-4 flex gap-2">
                <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white grid place-items-center shadow-sm">◎</a>
                <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className="w-9 h-9 rounded-xl bg-[#1877F2] text-white grid place-items-center text-sm font-black shadow-sm">f</a>
                <span className="flex-1 bg-[#f6f7f4] border border-[#e7e5e4] rounded-full grid place-items-center text-xs font-bold text-[#57534e]">DM @greennest.in</span>
              </div>
            </div>

            {/* map */}
            <div className="px-3 pb-3">
              <div className="rounded-[20px] overflow-hidden border border-[#e7e5e4] shadow-sm">
                <div className="flex items-center justify-between px-4 py-2.5 bg-[#fcfcfa] border-b border-[#e7e5e4]">
                  <h4 className="font-black text-sm tracking-tight">{t('find_us_map') || 'Find us on the map'}</h4>
                  <span className="text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded-full font-bold">{t('contact_poovachal') || 'Poovachal • KL'}</span>
                </div>
                <iframe title="GreenNest Greenhouse Map" src="https://maps.google.com/maps?q=H34Q%2B9FP%2C%20Poovachal%2C%20Kerala%20695575&t=&z=16&ie=UTF8&iwloc=&output=embed" className="w-full h-[240px] border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
                <div className="p-2.5 flex gap-2 bg-white">
                  <a href="https://maps.google.com/?q=H34Q%2B9FP%2C%20Poovachal%2C%20Kerala%20695575" target="_blank" rel="noreferrer" className="flex-1 bg-[#0a2e1f] text-white text-center py-2.5 rounded-full font-black text-xs hover:bg-black transition">{t('contact_open_maps') || 'Open in Google Maps'}</a>
                  <span className="bg-[#f6f7f4] border border-[#e7e5e4] px-3.5 py-2.5 rounded-full font-black text-xs">9am – 7pm</span>
                </div>
              </div>
            </div>
          </div>

          {/* hours */}
          <div className="bg-amber-50/80 backdrop-blur border border-amber-200 rounded-[24px] p-4 flex gap-3 shadow-sm">
            <span className="w-9 h-9 rounded-xl bg-white border border-amber-200 grid place-items-center shrink-0">⏰</span>
            <div className="text-sm">
              <div className="font-black" style={{fontFamily:'Outfit, sans-serif'}}>{t('contact_hours_title') || 'Grower hours'}</div>
              <div className="text-[#57534e] leading-5 mt-1">{t('contact_hours_desc') || 'Mon–Sun 9am–7pm IST. Walk-ins welcome — guided tour at 10am & 4pm. Message on WhatsApp for after-hours care help.'}</div>
              <div className="mt-2 flex flex-wrap gap-1.5 text-xs font-bold">
                <span className="bg-white border border-amber-200 rounded-full px-2.5 py-1">Mon–Sun 9–7</span>
                <span className="bg-[#0a2e1f] text-white rounded-full px-2.5 py-1">Tours 10am · 4pm</span>
              </div>
            </div>
          </div>
        </div>

        {/* right: form glass */}
        <form onSubmit={submit} noValidate className="bg-white/85 backdrop-blur-xl border border-white/60 rounded-[24px] shadow-card p-6 md:p-7 h-fit lg:sticky lg:top-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[22px] font-black tracking-tight" style={{fontFamily:'Outfit, sans-serif'}}>{t('contact_send_title') || 'Send a message'}</h2>
              <p className="text-sm text-[#57534e] mt-1 leading-6">{t('contact_send_desc') || 'We read every note — growers reply within 2 hours in season.'}</p>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full px-3 py-1.5 text-xs font-black"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Avg 47m</span>
          </div>

          {sent && (
            <div className="mt-5 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex gap-3 items-start animate-[slideIn_0.3s_ease]">
              <span className="w-8 h-8 rounded-full bg-emerald-600 text-white grid place-items-center shrink-0 text-sm font-black">✓</span>
              <div>
                <div className="font-black text-emerald-900 text-sm">Message sent — thank you!</div>
                <div className="text-emerald-700 text-xs mt-1 leading-5">We’ve confirmed to your email. Our growers will reply within 2 hours between 9am–7pm. Need faster help? WhatsApp us.</div>
              </div>
            </div>
          )}

          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <FloatingInput
              id="contact-name"
              label={t('your_name') || 'Your name'}
              value={form.name}
              onChange={e=>setForm({...form,name:e.target.value})}
              required
              error={errors.name}
              autoComplete="name"
              placeholder={t('contact_name_placeholder') || 'Priya Sharma'}
            />
            <FloatingInput
              id="contact-email"
              label={t('email') || 'Email address'}
              type="email"
              value={form.email}
              onChange={e=>setForm({...form,email:e.target.value})}
              required
              error={errors.email}
              autoComplete="email"
              placeholder={t('contact_email_placeholder') || 'you@email.com'}
            />
          </div>

          <div className="mt-4">
            <FloatingSelect
              id="contact-subject"
              label={t('subject') || 'Topic'}
              value={form.subject}
              onChange={e=>setForm({...form,subject:e.target.value})}
              required
              error={errors.subject}
            >
              <option value="">{t('contact_select_topic') || 'Select a topic'}</option>
              <option>{t('contact_retail') || 'Retail — plant advice'}</option>
              <option>{t('contact_wholesale') || 'Wholesale & trade'}</option>
              <option>{t('contact_care_support') || 'Care support — sick plant'}</option>
              <option>{t('contact_greenhouse_visit') || 'Greenhouse visit'}</option>
              <option>{t('contact_other') || 'Other'}</option>
            </FloatingSelect>
          </div>

          <div className="mt-4">
            <FloatingTextarea
              id="contact-message"
              label={t('message') || 'How can we help?'}
              value={form.message}
              onChange={e=>setForm({...form,message:e.target.value})}
              required
              error={errors.message}
            />
          </div>

          <button disabled={sending} className="mt-6 w-full bg-[#0a2e1f] text-white py-3.5 rounded-full font-black text-sm hover:bg-black transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200">
            {sending ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" aria-hidden="true" /> {t('contact_sending') || 'Sending…'} </> : <>{t('contact_send_btn') || 'Send message'} <span aria-hidden="true">→</span></>}
          </button>
          <p className="text-center text-xs font-medium text-[#a8a29e] mt-2.5">{t('contact_avg_reply') || 'Avg. reply 47 minutes • No bots — real growers'}</p>

          <div className="mt-6 grid grid-cols-3 gap-2 text-center text-xs">
            <span className="bg-[#f6f7f4] border border-[#e7e5e4] rounded-xl py-2.5 font-bold text-[#57534e] flex items-center justify-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-full" /> {t('contact_private') || 'Private'}</span>
            <span className="bg-[#f6f7f4] border border-[#e7e5e4] rounded-xl py-2.5 font-bold text-[#57534e]">{t('contact_no_spam') || 'No spam'}</span>
            <span className="bg-amber-50 border border-amber-200 rounded-xl py-2.5 font-bold text-amber-900">{t('contact_whatsapp_badge') || 'WhatsApp OK'}</span>
          </div>

          <p className="mt-4 text-center text-[11px] leading-4 text-[#a8a29e]">By sending, you agree to our care replies via email/WhatsApp. <a href="#" className="underline decoration-dotted underline-offset-4 hover:text-[#57534e]">Privacy</a> • We never share your details.</p>
        </form>
      </div>

      {/* proof bar */}
      <div className="relative max-w-[1280px] mx-auto px-4 md:px-8 lg:px-12 pb-10">
        <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-[24px] shadow-card p-4 md:p-5 flex flex-wrap gap-3 md:gap-6 items-center justify-between">
          <div className="flex flex-wrap gap-4 md:gap-8 text-center">
            <div><div className="font-black text-lg leading-none" style={{fontFamily:'Outfit, sans-serif'}}>50k+</div><div className="text-xs font-bold tracking-widest uppercase text-[#a8a29e]">Plants nurtured</div></div>
            <div className="w-px bg-[#e7e5e4] hidden md:block" />
            <div><div className="font-black text-lg leading-none">4.9★</div><div className="text-xs font-bold tracking-widest uppercase text-[#a8a29e]">2,340 reviews</div></div>
            <div className="w-px bg-[#e7e5e4] hidden md:block" />
            <div><div className="font-black text-lg leading-none">2hr</div><div className="text-xs font-bold tracking-widest uppercase text-[#a8a29e]">Avg reply</div></div>
            <div className="w-px bg-[#e7e5e4] hidden md:block" />
            <div><div className="font-black text-lg leading-none">Est. 2022</div><div className="text-xs font-bold tracking-widest uppercase text-[#a8a29e]">Poovachal, KL</div></div>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#57534e]">
            <span className="hidden sm:inline">Seed → Sapling → Home, with you.</span>
            <span className="bg-[#0a2e1f] text-white rounded-full px-3 py-1.5">Climate-zoned • Hand-packed</span>
          </div>
        </div>
      </div>
    </div>
  )
}
