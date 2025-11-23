import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { LegalPageLayout } from '@/components/legal/LegalPageLayout';
import clsx from 'clsx';

const TermsOfService: React.FC = () => {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <LegalPageLayout
      title={t('legal.terms.title')}
      lastUpdated={t('legal.terms.lastUpdated')}
    >
      <div className="space-y-6">
        {/* Introduction */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t('legal.terms.sections.introduction.title')}
          </h2>
          <p className="text-gray-700 leading-relaxed">
            {t('legal.terms.sections.introduction.content')}
          </p>
        </section>

        {/* Website Nature */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t('legal.terms.sections.websiteNature.title')}
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            {t('legal.terms.sections.websiteNature.content')}
          </p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-800 font-medium">
              {t('legal.terms.sections.websiteNature.important')}
            </p>
          </div>
        </section>

        {/* Booking Terms */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t('legal.terms.sections.booking.title')}
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            {t('legal.terms.sections.booking.intro')}
          </p>
          <ul className={clsx(
            "list-disc text-gray-700 leading-relaxed space-y-2",
            isRTL ? "mr-6" : "ml-6"
          )}>
            <li>{t('legal.terms.sections.booking.points.freshaTerms')}</li>
            <li>{t('legal.terms.sections.booking.points.branchPolicy')}</li>
            <li>{t('legal.terms.sections.booking.points.whatsappBooking')}</li>
          </ul>
        </section>

        {/* Third Party Services */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t('legal.terms.sections.thirdParty.title')}
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            {t('legal.terms.sections.thirdParty.intro')}
          </p>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">
                {t('legal.terms.sections.thirdParty.fresha.title')}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {t('legal.terms.sections.thirdParty.fresha.content')}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">
                {t('legal.terms.sections.thirdParty.analytics.title')}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {t('legal.terms.sections.thirdParty.analytics.content')}
              </p>
            </div>
          </div>
        </section>

        {/* User Responsibilities */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t('legal.terms.sections.responsibilities.title')}
          </h2>
          <ul className={clsx(
            "list-disc text-gray-700 leading-relaxed space-y-2",
            isRTL ? "mr-6" : "ml-6"
          )}>
            <li>{t('legal.terms.sections.responsibilities.points.accurateInfo')}</li>
            <li>{t('legal.terms.sections.responsibilities.points.respectful')}</li>
            <li>{t('legal.terms.sections.responsibilities.points.compliance')}</li>
          </ul>
        </section>

        {/* Limitation of Liability */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t('legal.terms.sections.liability.title')}
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            {t('legal.terms.sections.liability.intro')}
          </p>
          <ul className={clsx(
            "list-disc text-gray-700 leading-relaxed space-y-2",
            isRTL ? "mr-6" : "ml-6"
          )}>
            <li>{t('legal.terms.sections.liability.points.technicalIssues')}</li>
            <li>{t('legal.terms.sections.liability.points.thirdParty')}</li>
            <li>{t('legal.terms.sections.liability.points.content')}</li>
          </ul>
        </section>

        {/* Contact Information */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t('legal.terms.sections.contact.title')}
          </h2>
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="space-y-3">
              <p className="font-semibold text-gray-900">
                {t('legal.terms.sections.contact.businessName')}
              </p>
              <p className="text-gray-700">
                {t('legal.terms.sections.contact.questions')}
              </p>
              <p className="text-gray-700">
                {t('legal.terms.sections.contact.email')}: ekka.barber@gmail.com
              </p>
            </div>
          </div>
        </section>
      </div>
    </LegalPageLayout>
  );
};

export default TermsOfService;
