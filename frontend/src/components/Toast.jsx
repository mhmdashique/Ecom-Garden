import { createContext, useContext, useState, useCallback } from 'react';

const Ctx = createContext(null);
let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = 'success') => {
    const id = ++idCounter;
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  }, []);

  const success = useCallback((m) => toast(m, 'success'), [toast]);
  const error = useCallback((m) => toast(m, 'error'), [toast]);
  const info = useCallback((m) => toast(m, 'info'), [toast]);

  return (
    <Ctx.Provider value={{ toast, success, error, info }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto min-w-[280px] max-w-[380px] rounded-2xl px-4 py-3 shadow-2xl border flex items-start gap-3 animate-[slideIn_0.35s_ease] backdrop-blur
              ${t.type === 'success' ? 'bg-[#0a2e1f] text-white border-[#0a2e1f]' : t.type === 'error' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-900 border-gray-200'}`}
          >
            <span className={`w-8 h-8 rounded-full grid place-items-center shrink-0 text-sm font-black ${t.type === 'success' ? 'bg-emerald-500 text-white' : t.type === 'error' ? 'bg-white text-red-600' : 'bg-gray-900 text-white'}`}>
              {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : '•'}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold leading-5">{t.message}</div>
              <div className="text-xs opacity-70">{t.type === 'success' ? 'Success' : t.type === 'error' ? 'Error' : 'Info'}</div>
            </div>
            <button onClick={() => setToasts(x => x.filter(v => v.id !== t.id))} className="text-white/60 hover:text-white shrink-0">✕</button>
          </div>
        ))}
      </div>
      <style>{`@keyframes slideIn { from { transform: translateX(16px); opacity:0 } to { transform: translateX(0); opacity:1 } }`}</style>
    </Ctx.Provider>
  );
}

export const useToast = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error('useToast must be inside ToastProvider');
  return v;
};
