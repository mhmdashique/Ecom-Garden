import { useToast } from './Toast';
import { useLanguage } from '../context/LanguageContext';
export default function Footer(){
  const {success}=useToast();
  const {t}=useLanguage();
  return (
    <footer className="bg-green-900 text-green-100 mt-12">
      <div className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-4 gap-8 text-sm">
        <div><h4 className="font-bold text-white mb-2">Verdant</h4><p>{t('footer_brand_desc')}</p></div>
        <div><h4 className="font-semibold text-white mb-2">{t('footer_quick_links')}</h4><p>{t('footer_shop_link')}<br/>{t('footer_about_link')}<br/>{t('footer_contact_link')}</p></div>
        <div><h4 className="font-semibold text-white mb-2">{t('footer_contact_title')}</h4><p>{t('footer_contact_address_line1')}<br/>{t('footer_phone')}<br/>{t('footer_email')}</p></div>
        <div><h4 className="font-semibold text-white mb-2">{t('footer_newsletter')}</h4><form onSubmit={e=>{e.preventDefault(); success(t('footer_subscribed'));}} className="flex"><input placeholder={t('footer_newsletter_placeholder')} className="flex-1 px-2 py-2 rounded-l text-black" /><button className="bg-yellow-400 text-black px-3 rounded-r">{t('footer_join')}</button></form></div>
      </div>
      <div className="text-center py-4 border-t border-green-800 text-xs">{t('footer_rights')}</div>
    </footer>
  )
}
