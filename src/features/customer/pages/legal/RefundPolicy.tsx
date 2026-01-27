import React from 'react';

import { LegalPageLayout } from '@features/customer/components/legal/LegalPageLayout';

import { useLanguage } from '@/contexts/LanguageContext';

const RefundPolicy: React.FC = () => {
  const { t } = useLanguage();

  return (
    <LegalPageLayout
      title={t('legal.refund.title')}
      lastUpdated={t('legal.refund.lastUpdated')}
    >
      <div className="space-y-6">
        {/* Introduction */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t('legal.refund.sections.introduction.title')}
          </h2>
          <p className="text-gray-700 leading-relaxed">
            {t('legal.refund.sections.introduction.content')}
          </p>
        </section>

        {/* Main Refund Policy */}
        <section className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            {t('legal.refund.sections.policy.title')}
          </h2>

          <div className="space-y-4">
            <div className="bg-white p-4 rounded border-r-4 border-red-500">
              <p className="text-red-800 font-medium mb-2">
                {t('legal.refund.sections.policy.important')}
              </p>
              <p className="text-gray-700">
                {t('legal.refund.sections.policy.importantNote')}
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-gray-700 leading-relaxed">
                <strong>{t('legal.refund.sections.policy.points.1')}</strong>
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>{t('legal.refund.sections.policy.points.2')}</strong>
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>{t('legal.refund.sections.policy.points.3')}</strong>
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>{t('legal.refund.sections.policy.points.4')}</strong>
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>{t('legal.refund.sections.policy.points.5')}</strong>
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>{t('legal.refund.sections.policy.points.6')}</strong>
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>{t('legal.refund.sections.policy.points.7')}</strong>
              </p>
            </div>
          </div>
        </section>

        {/* Short Version for UI */}
        <section className="bg-blue-50 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t('legal.refund.sections.shortVersion.title')}
          </h2>
          <p className="text-blue-800 leading-relaxed font-medium">
            {t('legal.refund.sections.shortVersion.content')}
          </p>
        </section>

        {/* Contact Information */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t('legal.refund.sections.contact.title')}
          </h2>
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="space-y-3">
              <p className="font-semibold text-gray-900">
                {t('legal.refund.sections.contact.businessName')}
              </p>
              <p className="text-gray-700">
                {t('legal.refund.sections.contact.questions')}
              </p>
              <p className="text-gray-700">
                {t('legal.refund.sections.contact.email')}: ekka.barber@gmail.com
              </p>
              <p className="text-gray-700">
                {t('legal.refund.sections.contact.whatsapp')}
              </p>
            </div>
          </div>
        </section>
      </div>
    </LegalPageLayout>
  );
};

export default RefundPolicy;
