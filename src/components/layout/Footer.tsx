import { useTranslation } from "react-i18next";
import React, { useState } from "react";

export default function Footer() {
  const { t } = useTranslation();
  const [openTerms, setOpenTerms] = useState(false);
  const [openPrivacy, setOpenPrivacy] = useState(false);
  
  return (
    <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="container-xl py-10 md:py-14">
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <div className="text-lg font-bold mb-2 text-gray-900 dark:text-gray-100">Hello Korea</div>
            <p className="text-sm text-gray-600 dark:text-gray-300">{t('footerDescription')}</p>
          </div>
          <div>
            <div className="font-semibold mb-2 text-gray-900 dark:text-gray-100">{t('footerGuide')}</div>
            <ul className="space-y-1 text-sm">
              <li>
                <button
                  type="button"
                  className="hover:underline text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
                  onClick={() => setOpenTerms(true)}
                >
                  {t('footerTerms')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="hover:underline text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
                  onClick={() => setOpenPrivacy(true)}
                >
                  {t('footerPrivacy')}
                </button>
              </li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-2 text-gray-900 dark:text-gray-100">{t('footerCustomer')}</div>
            <p className="text-sm text-gray-600 dark:text-gray-300">{t('footerHours')}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">{t('footerEmail')}</p>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700">
        <div className="container-xl py-4">
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">© {new Date().getFullYear()} HelloKorea</div>
        </div>
      </div>
      {/* 이용약관 모달 */}
      {openTerms && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="terms-title">
          <div className="bg-white dark:bg-gray-800 w-full max-w-3xl rounded-xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 id="terms-title" className="text-lg font-bold text-gray-900 dark:text-gray-100">{t('footerTermsTitle')}</h3>
              <button aria-label="close" className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => setOpenTerms(false)}>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="px-6 py-5 max-h-[70vh] overflow-y-auto text-sm leading-6 text-gray-700 dark:text-gray-300">
              <div className="space-y-4" dangerouslySetInnerHTML={{ __html: t('footerTermsContent') as string }} />
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button className="btn btn-sm btn-primary" onClick={() => setOpenTerms(false)}>{t('close')}</button>
            </div>
          </div>
        </div>
      )}

      {/* 개인정보처리방침 모달 */}
      {openPrivacy && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="privacy-title">
          <div className="bg-white dark:bg-gray-800 w-full max-w-3xl rounded-xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 id="privacy-title" className="text-lg font-bold text-gray-900 dark:text-gray-100">{t('footerPrivacyTitle')}</h3>
              <button aria-label="close" className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => setOpenPrivacy(false)}>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="px-6 py-5 max-h-[70vh] overflow-y-auto text-sm leading-6 text-gray-700 dark:text-gray-300">
              <div className="space-y-4" dangerouslySetInnerHTML={{ __html: t('footerPrivacyContent') as string }} />
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button className="btn btn-sm btn-primary" onClick={() => setOpenPrivacy(false)}>{t('close')}</button>
            </div>
          </div>
        </div>
      )}

    </footer>
  );
}
