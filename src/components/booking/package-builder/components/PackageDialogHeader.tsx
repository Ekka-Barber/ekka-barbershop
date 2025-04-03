
interface PackageDialogHeaderProps {
  language: string;
}

export const PackageDialogHeader = ({ language }: PackageDialogHeaderProps) => {
  return (
    <div className="space-y-1.5">
      <h2 className="text-lg font-semibold leading-none tracking-tight text-center">
        {language === 'ar' ? "بناء باقة الخدمة" : "Build Service Package"}
      </h2>
      <p className="text-sm text-muted-foreground text-center">
        {language === 'ar' 
          ? "اختر خدمات إضافية للحصول على خصم" 
          : "Select add-on services to get a discount"}
      </p>
    </div>
  );
};
