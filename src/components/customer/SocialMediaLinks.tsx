
import { Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';
import { useLanguage } from "@/contexts/LanguageContext";
import { trackButtonClick } from "@/utils/tiktokTracking";
import { trackSocialClick } from "@/utils/clickTracking";
import { motion } from 'framer-motion';

interface SocialMediaLink {
  name: string;
  url: string;
  icon: JSX.Element;
  color: string;
}

export const SocialMediaLinks = () => {
  const { language } = useLanguage();

  const socialLinks: SocialMediaLink[] = [
    {
      name: 'Facebook',
      url: 'https://www.facebook.com/EkkaBarberShop',
      icon: <Facebook className="h-5 w-5" />,
      color: 'bg-[#1877F2] hover:bg-[#0e66d0]'
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/ekkabarber',
      icon: <Instagram className="h-5 w-5" />,
      color: 'bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] hover:from-[#733399] hover:via-[#E3181A] hover:to-[#E29D3D]'
    },
    {
      name: 'Twitter',
      url: 'https://twitter.com/ekkabarber',
      icon: <Twitter className="h-5 w-5" />,
      color: 'bg-[#1DA1F2] hover:bg-[#0c85d0]'
    },
    {
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/company/ekka-barbershop',
      icon: <Linkedin className="h-5 w-5" />,
      color: 'bg-[#0A66C2] hover:bg-[#08528C]'
    }
  ];

  const handleSocialClick = (name: string, url: string) => {
    // Track with TikTok
    trackButtonClick({
      buttonId: `social_${name.toLowerCase()}`,
      buttonName: `Social ${name}`
    });
    
    // Track with our own analytics
    trackSocialClick(name.toLowerCase(), url);
  };

  return (
    <motion.div 
      className="w-full max-w-xs mx-auto my-6 section-animation"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <motion.div 
        className="text-center mb-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <h3 className="text-sm font-medium text-gray-500">
          {language === 'ar' ? 'تابعنا على وسائل التواصل الاجتماعي' : 'Follow us on social media'}
        </h3>
      </motion.div>
      
      <div className="flex justify-center items-center gap-4">
        {socialLinks.map((link, index) => (
          <motion.a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${link.color} text-white p-2 rounded-full flex items-center justify-center transition-all`}
            onClick={() => handleSocialClick(link.name, link.url)}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              delay: 0.4 + (index * 0.1),
              type: "spring",
              stiffness: 300,
              damping: 15
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {link.icon}
            <span className="sr-only">{link.name}</span>
          </motion.a>
        ))}
      </div>
    </motion.div>
  );
};
