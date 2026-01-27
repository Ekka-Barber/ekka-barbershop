import clsx from 'clsx';
import React from 'react';

import { LegalPageLayout } from '@features/customer/components/legal/LegalPageLayout';

import { useLanguage } from '@/contexts/LanguageContext';

const PrivacyPolicy: React.FC = () => {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <LegalPageLayout
      title={t('legal.privacy.title')}
      lastUpdated={t('legal.privacy.lastUpdated')}
    >
      <div className="space-y-6">
        {/* Introduction */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t('legal.privacy.sections.introduction.title')}
          </h2>
          <p className="text-gray-700 leading-relaxed">
            {t('legal.privacy.sections.introduction.content')}
          </p>
        </section>

        {/* Data Collection */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t('legal.privacy.sections.dataCollection.title')}
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            {t('legal.privacy.sections.dataCollection.intro')}
          </p>
          <ul className={clsx(
            "list-disc text-gray-700 leading-relaxed space-y-2",
            isRTL ? "mr-6" : "ml-6"
          )}>
            <li>{t('legal.privacy.sections.dataCollection.points.noPersonalData')}</li>
            <li>{t('legal.privacy.sections.dataCollection.points.thirdPartyBooking')}</li>
            <li>{t('legal.privacy.sections.dataCollection.points.analytics')}</li>
          </ul>
        </section>

        {/* Third Party Services */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t('legal.privacy.sections.thirdParty.title')}
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            {t('legal.privacy.sections.thirdParty.intro')}
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">
              {t('legal.privacy.sections.thirdParty.fresha.title')}
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {t('legal.privacy.sections.thirdParty.fresha.content')}
            </p>
          </div>
        </section>

        {/* Analytics and Tracking */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t('legal.privacy.sections.analytics.title')}
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            {t('legal.privacy.sections.analytics.intro')}
          </p>
          <ul className={clsx(
            "list-disc text-gray-700 leading-relaxed space-y-2",
            isRTL ? "mr-6" : "ml-6"
          )}>
            <li>{t('legal.privacy.sections.analytics.points.googleAnalytics')}</li>
            <li>{t('legal.privacy.sections.analytics.points.googleAds')}</li>
            <li>{t('legal.privacy.sections.analytics.points.facebookPixel')}</li>
            <li>{t('legal.privacy.sections.analytics.points.tiktokPixel')}</li>
          </ul>
          <div className="bg-blue-50 p-4 rounded-lg mt-4">
            <p className="text-blue-800 leading-relaxed">
              {t('legal.privacy.sections.analytics.note')}
            </p>
          </div>
        </section>

        {/* Data Security */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t('legal.privacy.sections.security.title')}
          </h2>
          <p className="text-gray-700 leading-relaxed">
            {t('legal.privacy.sections.security.content')}
          </p>
        </section>

        {/* Contact Information */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t('legal.privacy.sections.contact.title')}
          </h2>
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="space-y-3">
              <p className="font-semibold text-gray-900">
                {t('legal.privacy.sections.contact.businessName')}
              </p>
              <p className="text-gray-700">
                {t('legal.privacy.sections.contact.email')}: ekka.barber@gmail.com
              </p>
              <p className="text-gray-700">
                {t('legal.privacy.sections.contact.questions')}
              </p>
            </div>
          </div>
        </section>
      </div>
    </LegalPageLayout>
  );
};

export default PrivacyPolicy;
