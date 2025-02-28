
import { useLanguage } from "@/contexts/LanguageContext";
import { NavigateFunction } from "react-router-dom";

interface NoBranchMessageProps {
  navigate: NavigateFunction;
}

export const NoBranchMessage: React.FC<NoBranchMessageProps> = ({ navigate }) => {
  const { language } = useLanguage();
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">
          {language === "ar" ? "يرجى اختيار فرع أولاً" : "Please select a branch first"}
        </h2>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-[#C4A484] text-white rounded-md"
        >
          {language === "ar" ? "العودة للصفحة الرئيسية" : "Return to Home"}
        </button>
      </div>
    </div>
  );
};
