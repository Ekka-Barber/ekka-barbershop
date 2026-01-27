import clsx from 'clsx';
import { ArrowLeft } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

import { motion } from '@shared/lib/motion';
import { LanguageSwitcher } from '@shared/ui/components/common/LanguageSwitcher';

import { useLanguage } from '@/contexts/LanguageContext';

interface LegalPageLayoutProps {
  title: string;
  children: React.ReactNode;
  lastUpdated?: string;
}

export const LegalPageLayout: React.FC<LegalPageLayoutProps> = ({
  title,
  children,
  lastUpdated
}) => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              to="/customer"
              className="flex items-center gap-2 text-gray-600 hover:text-[#e9b353] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Ekka</span>
            </Link>
             <LanguageSwitcher className="static top-auto right-auto" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8"
        >
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {title}
            </h1>
            {lastUpdated && (
              <p className="text-sm text-gray-500">
                {lastUpdated}
              </p>
            )}
          </div>

          {/* Content */}
          <div
            className={clsx(
              "prose prose-lg max-w-none",
              isRTL ? "prose-rtl" : "prose-ltr"
            )}
          >
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
