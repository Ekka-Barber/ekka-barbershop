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
  const {
    language
  } = useLanguage();
  const socialLinks: SocialMediaLink[] = [{
    name: 'Facebook',
    url: 'https://www.facebook.com/EkkaBarberShop',
    icon: <Facebook className="h-5 w-5" />,
    color: 'bg-[#1877F2] hover:bg-[#0e66d0]'
  }, {
    name: 'Instagram',
    url: 'https://www.instagram.com/ekkabarber',
    icon: <Instagram className="h-5 w-5" />,
    color: 'bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] hover:from-[#733399] hover:via-[#E3181A] hover:to-[#E29D3D]'
  }, {
    name: 'Twitter',
    url: 'https://twitter.com/ekkabarber',
    icon: <Twitter className="h-5 w-5" />,
    color: 'bg-[#1DA1F2] hover:bg-[#0c85d0]'
  }, {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/company/ekka-barbershop',
    icon: <Linkedin className="h-5 w-5" />,
    color: 'bg-[#0A66C2] hover:bg-[#08528C]'
  }];
  const handleSocialClick = (name: string, url: string) => {
    // Track with TikTok
    trackButtonClick({
      buttonId: `social_${name.toLowerCase()}`,
      buttonName: `Social ${name}`
    });

    // Track with our own analytics
    trackSocialClick(name.toLowerCase(), url);
  };
  return;
};