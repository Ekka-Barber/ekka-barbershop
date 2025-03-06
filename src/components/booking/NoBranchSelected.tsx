
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

export const NoBranchSelected = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  return (
    <div className="text-center py-12">
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {t('no.branch.selected')}
        </h2>
        <p className="text-gray-600 mb-6">
          {t('please.select.branch.to.continue')}
        </p>
        <Button 
          onClick={() => navigate('/customer')}
          className="bg-[#C4A36F] hover:bg-[#B39260] text-white"
        >
          {t('go.back.select.branch')}
        </Button>
      </div>
    </div>
  );
};
