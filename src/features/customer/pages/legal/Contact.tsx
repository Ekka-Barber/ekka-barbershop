import { useQuery } from '@tanstack/react-query';
import { Phone, MapPin, Clock, Mail, ExternalLink } from 'lucide-react';
import React from 'react';

import { LegalPageLayout } from '@features/customer/components/legal/LegalPageLayout';

import { motion } from '@shared/lib/motion';
import { supabase } from '@shared/lib/supabase/client';
import type { Branch } from '@shared/types/domains';
import { trackWhatsAppClick, trackLocationClick } from '@shared/utils/gadsTracking';

import { useLanguage } from '@/contexts/LanguageContext';

const Contact: React.FC = () => {
  const { t, language } = useLanguage();


  // Fetch branches from database
  const { data: branches, isLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('branches')
        .select('id, name, name_ar, address, address_ar, whatsapp_number, google_maps_url')
        .order('is_main', { ascending: false });
      if (error) throw error;
      return data as Branch[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleWhatsAppClick = (phoneNumber: string, branchName?: string) => {
    trackWhatsAppClick(branchName ?? 'unknown');
    const message = encodeURIComponent("Hello, I'd like to book an appointment");
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  const handleMapsClick = (mapsUrl: string, branchName?: string) => {
    trackLocationClick(branchName ?? 'unknown');
    window.open(mapsUrl, '_blank');
  };

  return (
    <LegalPageLayout title={t('legal.contact.title')}>
      <div className="space-y-8">
        {/* Business Information */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('legal.contact.business.title')}
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              {t('legal.contact.business.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Business Details */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {t('legal.contact.business.info.title')}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-brand-gold-400" />
                  <span className="text-gray-700">ekka.barber@gmail.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-brand-gold-400" />
                  <div className="text-gray-700">
                    <p className="font-medium">{t('legal.contact.business.hours.title')}</p>
                    <p className="text-sm">{t('legal.contact.business.hours.saturdayThursday')}</p>
                    <p className="text-sm">{t('legal.contact.business.hours.friday')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Website Nature */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {t('legal.contact.website.title')}
              </h3>
              <p className="text-blue-800 leading-relaxed">
                {t('legal.contact.website.description')}
              </p>
            </div>
          </div>
        </section>

        {/* Branches */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            {t('legal.contact.branches.title')}
          </h2>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-gold-400 mx-auto"></div>
              <p className="text-gray-600 mt-2">{t('loading')}</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {branches?.map((branch, index) => {
                const displayName = language === 'ar' && branch.name_ar ? branch.name_ar : branch.name;
                const displayAddress = language === 'ar' && branch.address_ar ? branch.address_ar : branch.address;
                const hasWhatsApp = branch.whatsapp_number != null;
                const hasMaps = branch.google_maps_url != null;
                
                return (
                  <motion.div
                    key={branch.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {displayName}
                          {branch.name === 'Al-Waslyia' && (
                            <span className="ml-2 text-sm bg-brand-gold-400 text-white px-2 py-1 rounded">
                              {t('legal.contact.branches.mainBranch')}
                            </span>
                          )}
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">
                              {displayAddress || '-'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Phone className="w-5 h-5 text-gray-500 flex-shrink-0" />
                            <span className="text-gray-700">{branch.whatsapp_number || '-'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        {hasWhatsApp ? (
                          <button
                            onClick={() => handleWhatsAppClick(branch.whatsapp_number!, branch.name)}
                            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                          >
                            <Phone className="w-4 h-4" />
                            <span>{t('legal.contact.branches.bookWhatsapp')}</span>
                          </button>
                        ) : (
                          <button
                            disabled
                            className="flex items-center gap-2 bg-green-500/30 text-white/70 px-4 py-2 rounded-lg cursor-not-allowed"
                            title={t('whatsapp.missing')}
                          >
                            <Phone className="w-4 h-4" />
                            <span>{t('legal.contact.branches.bookWhatsapp')}</span>
                          </button>
                        )}
                        {hasMaps ? (
                          <button
                            onClick={() => handleMapsClick(branch.google_maps_url!, branch.name)}
                            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>{t('legal.contact.branches.viewMap')}</span>
                          </button>
                        ) : (
                          <button
                            disabled
                            className="flex items-center gap-2 bg-gray-100/50 text-gray-500 px-4 py-2 rounded-lg cursor-not-allowed"
                            title="Map not available"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>{t('legal.contact.branches.viewMap')}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* Additional Information */}
        <section className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t('legal.contact.additional.title')}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {t('legal.contact.additional.booking.title')}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {t('legal.contact.additional.booking.content')}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {t('legal.contact.additional.support.title')}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {t('legal.contact.additional.support.content')}
              </p>
            </div>
          </div>
        </section>
      </div>
    </LegalPageLayout>
  );
};

export default Contact;
