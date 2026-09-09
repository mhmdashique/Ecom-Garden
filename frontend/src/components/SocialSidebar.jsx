export default function SocialSidebar(){
  return (
    <div className="hidden md:flex fixed right-0 top-1/2 -translate-y-1/2 z-40 flex-col gap-2 bg-white border border-r-0 rounded-l-2xl shadow-xl p-2">
      <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 text-white grid place-items-center hover:scale-105 transition shadow" title="Instagram">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.5"/><circle cx="17.5" cy="6.5" r="1" fill="white" stroke="none"/></svg>
      </a>
      <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className="w-10 h-10 rounded-xl bg-[#1877F2] text-white grid place-items-center hover:scale-105 transition shadow" title="Facebook">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M14 8h3V3h-3c-2.76 0-5 2.24-5 5v3H6v4h3v5h4v-5h3l1-4h-4V8c0-.55.45-1 1-1z"/></svg>
      </a>
      <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" aria-label="WhatsApp" className="w-10 h-10 rounded-xl bg-[#25D366] text-white grid place-items-center hover:scale-105 transition shadow" title="WhatsApp">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M19.05 4.94A9.82 9.82 0 0 0 12.02 2C6.52 2 2.07 6.44 2.07 11.94c0 1.75.46 3.45 1.33 4.95L2 22l5.26-1.38a9.87 9.87 0 0 0 4.76 1.21h.01c5.5 0 9.95-4.44 9.95-9.94 0-2.66-1.04-5.15-2.93-7.05zm-7.03 14.6a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31A8.19 8.19 0 0 1 3.8 11.94c0-4.54 3.71-8.24 8.26-8.24 2.2 0 4.27.86 5.83 2.41a8.18 8.18 0 0 1 2.42 5.82c0 4.54-3.71 8.24-8.26 8.24zm4.53-6.17c-.25-.12-1.47-.73-1.7-.81-.23-.09-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.04-.38-1.98-1.22-.73-.65-1.22-1.45-1.37-1.7-.14-.25-.01-.38.11-.5.1-.1.25-.25.37-.37.12-.12.16-.21.25-.35.08-.14.04-.26-.02-.37-.06-.12-.56-1.34-.77-1.84-.2-.48-.41-.41-.56-.42h-.48c-.17 0-.43.06-.66.31-.23.25-.86.84-.86 2.05s.88 2.38 1 2.54c.12.17 1.73 2.64 4.2 3.71.59.25 1.05.4 1.41.51.59.19 1.13.16 1.55.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.29z"/></svg>
      </a>
      <div className="w-10 h-px bg-gray-200 my-1"></div>
      <a href="tel:+919876543210" aria-label="Call" className="w-10 h-10 rounded-xl bg-[#0a2e1f] text-white grid place-items-center hover:scale-105 transition shadow text-sm" title="Call us">☎</a>
    </div>
  )
}
