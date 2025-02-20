
import { OfferCard } from "./OfferCard";
import { useLanguage } from "@/contexts/LanguageContext";

interface OffersListProps {
  isLoading: boolean;
  offersFiles: any[] | null;
}

export const OffersList = ({ isLoading, offersFiles }: OffersListProps) => {
  const { t } = useLanguage();

  if (isLoading) {
    return <div className="text-center py-8 text-[#222222]">{t('loading.offers')}</div>;
  }

  if (!offersFiles || offersFiles.length === 0) {
    return <div className="text-center py-8 text-[#222222]">{t('no.offers')}</div>;
  }

  console.log('Rendering offers list with files:', offersFiles);

  return (
    <div className="space-y-8">
      {offersFiles.map((file) => (
        <OfferCard key={file.id} file={file} />
      ))}
    </div>
  );
};
