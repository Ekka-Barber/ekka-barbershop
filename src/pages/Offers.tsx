
import { useNavigate } from 'react-router-dom';
import { OffersHeader } from "@/components/offers/OffersHeader";
import { OffersList } from "@/components/offers/OffersList";
import { OffersLayout } from "@/components/offers/OffersLayout";
import { useOffers } from "@/hooks/useOffers";
import { useEffect } from 'react';
import { trackViewContent } from "@/utils/tiktokTracking";

const Offers = () => {
  const navigate = useNavigate();
  const { offersFiles, isLoading, error } = useOffers();
  
  useEffect(() => {
    trackViewContent('Offers');
  }, []);

  if (error) {
    console.error('Query error:', error);
  }

  return (
    <OffersLayout>
      <OffersHeader onBackClick={() => navigate('/customer')} />
      <OffersList isLoading={isLoading} offersFiles={offersFiles} />
    </OffersLayout>
  );
};

export default Offers;
