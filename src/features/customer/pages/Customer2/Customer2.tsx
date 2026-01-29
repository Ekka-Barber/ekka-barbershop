import { useQuery } from '@tanstack/react-query';
import { Suspense, lazy, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { useDialogState } from '@shared/hooks/useDialogState';
import { useMarketingDialog } from '@shared/hooks/useMarketingDialog';
import { usePDFFetch } from '@shared/hooks/usePDFFetch';
import { useUIElements } from '@shared/hooks/useUIElements';
import { supabase } from '@shared/lib/supabase/client';
import { Branch } from '@shared/types/branch';
import { LanguageSwitcher } from '@shared/ui/components/common/LanguageSwitcher';
import { lazyWithRetry } from '@shared/utils/lazyWithRetry';

import { Customer2PdfPreview } from './Customer2PdfPreview';
import './Customer2.css';

import { useLanguage } from '@/contexts/LanguageContext';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BranchDialog = lazyWithRetry(() => import('@features/customer/components/BranchDialog').then((mod) => ({ default: mod.BranchDialog as any })) as Promise<{ default: any }>);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LocationDialog = lazyWithRetry(() => import('@features/customer/components/LocationDialog').then((mod) => ({ default: mod.LocationDialog as any })) as Promise<{ default: any }>);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BookingsDialog = lazyWithRetry(() => import('@features/customer/components/BookingsDialog').then((mod) => ({ default: mod.default as any })) as Promise<{ default: any }>);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const EidBookingsDialog = lazyWithRetry(() => import('@features/customer/components/EidBookingsDialog').then((mod) => ({ default: mod.default as any })) as Promise<{ default: any }>);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LazyMarketingDialog = lazyWithRetry(() => import('@shared/ui/components/common/LazyMarketingDialog').then((mod) => ({ default: mod.LazyMarketingDialog as any })) as Promise<{ default: any }>);
const LoyaltySection = lazy(() => import('@features/customer/components/sections/LoyaltySection'));
const BookingsSection = lazy(() => import('@features/customer/components/sections/BookingsSection'));
const EidBookingsSection = lazy(() => import('@features/customer/components/sections/EidBookingsSection'));
const GoogleReviewsWrapper = lazy(() => import('@features/customer/components/sections/GoogleReviewsWrapper'));

const Customer2 = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { visibleElements, isLoadingUiElements } = useUIElements();

  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('branches')
        .select('id, name, name_ar, address, address_ar, is_main, whatsapp_number, google_maps_url, google_place_id');
      if (error) throw error;

      return data as Branch[];
    }
  });

  const {
    branchDialogOpen,
    setBranchDialogOpen,
    bookingsDialogOpen,
    setBookingsDialogOpen,
    eidBookingsDialogOpen,
    setEidBookingsDialogOpen,
    locationDialogOpen,
    setLocationDialogOpen,
    handleBranchSelect,
    handleBranchSelectForBookings,
    handleEidBranchSelect,
    handleLocationClick,
    handleLocationDialog
  } = useDialogState(branches);

  const {
    dialogState: marketingDialogState,
    openMarketingDialog,
    closeMarketingDialog,
    menuContent,
    offersContent,
    menuLoading,
    offersLoading
  } = useMarketingDialog();

  const { pdfFiles: offersFiles } = usePDFFetch('offers', {
    includeBranchInfo: true,
    language
  });

  const featuredOffer = offersFiles?.[0];
  const branchSpotlight = useMemo(() => branches?.[0], [branches]);

  const handleElementAction = (element: typeof visibleElements[number]) => {
    if (element.action?.startsWith('http')) {
      window.open(element.action, '_blank');
      return;
    }

    if (element.action === 'openBranchDialog') {
      setBranchDialogOpen(true);
      return;
    }

    if (element.action === 'openLocationDialog') {
      handleLocationDialog();
      return;
    }

    if (element.action === 'openBookingsDialog') {
      setBookingsDialogOpen(true);
      return;
    }

    if (element.action === 'openEidBookingsDialog') {
      setEidBookingsDialogOpen(true);
      return;
    }

    if (element.action === '/menu') {
      openMarketingDialog('menu', 0);
      return;
    }

    if (element.action === '/offers') {
      openMarketingDialog('offers', 0);
      return;
    }

    if (element.action) {
      navigate(element.action);
    }
  };

  const buttonElements = visibleElements.filter((element) => element.type === 'button');
  const sectionElements = visibleElements.filter((element) => element.type === 'section');

  const renderSection = (element: typeof visibleElements[number]) => {
    if (element.name === 'bookings') {
      return (
        <BookingsSection
          element={element}
          isVisible={true}
          onOpenBookingsDialog={() => setBookingsDialogOpen(true)}
        />
      );
    }

    if (element.name === 'eid_bookings') {
      return (
        <EidBookingsSection
          element={element}
          isVisible={true}
          onOpenEidDialog={() => setEidBookingsDialogOpen(true)}
        />
      );
    }

    if (element.name === 'loyalty_program') {
      return <LoyaltySection element={element} isVisible={true} />;
    }

    if (element.name === 'google_reviews') {
      return <GoogleReviewsWrapper isVisible={true} />;
    }

    return null;
  };

  return (
    <div className="customer2-root" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="customer2-scroll">
        <div className="customer2-shell">
          <header className="customer2-hero">
            <div className="customer2-language">
              <LanguageSwitcher />
            </div>
            <div className="customer2-brand">
              <div className="customer2-logo">
                <img
                  src="/logo_Header/logo12.svg"
                  alt={t('customer2.hero.logo.alt') || 'Ekka Barbershop logo'}
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src =
                      '/lovable-uploads/7eb81221-fbf5-4b1d-8327-eb0e707236d8.png';
                  }}
                />
              </div>
              <div>
                <h1 className="customer2-hero-title">{t('customer2.hero.title')}</h1>
                <p className="customer2-hero-subtitle">{t('customer2.hero.subtitle')}</p>
              </div>
            </div>
            <div className="customer2-hero-tagline">{t('customer2.hero.tagline')}</div>
            <div className="customer2-cta-row">
              <button className="customer2-cta primary" onClick={() => setBranchDialogOpen(true)}>
                {t('customer2.hero.primary')}
              </button>
              <button className="customer2-cta secondary" onClick={() => openMarketingDialog('menu', 0)}>
                {t('customer2.hero.secondary')}
              </button>
            </div>
          </header>

          <section className="customer2-section">
            <div className="customer2-section-header">
              <div>
                <h2 className="customer2-section-title">{t('customer2.actions.title')}</h2>
                <p className="customer2-section-subtitle">{t('customer2.actions.subtitle')}</p>
              </div>
            </div>
            {isLoadingUiElements ? (
              <div className="customer2-linktree">
                {[1, 2, 3].map((item) => (
                  <div className="customer2-link" key={`skeleton-${item}`}>
                    <div className="customer2-link-content">
                      <div className="customer2-link-title">...</div>
                      <div className="customer2-link-desc">...</div>
                    </div>
                    <span className="customer2-link-chip">...</span>
                  </div>
                ))}
              </div>
            ) : buttonElements.length > 0 ? (
              <div className="customer2-linktree">
                {buttonElements.map((element) => (
                  <button
                    type="button"
                    key={element.id}
                    className="customer2-link"
                    onClick={() => handleElementAction(element)}
                  >
                    <span className="customer2-link-content">
                      <span className="customer2-link-title">
                        {language === 'ar' ? element.display_name_ar : element.display_name}
                      </span>
                      <span className="customer2-link-desc">
                        {language === 'ar'
                          ? element.description_ar || t('customer2.actions.default')
                          : element.description || t('customer2.actions.default')}
                      </span>
                    </span>
                    <span className="customer2-link-chip">{t('customer2.actions.tap')}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="customer2-highlight">
                <h3>{t('customer2.actions.empty')}</h3>
                <p>{t('customer2.actions.empty.subtitle')}</p>
              </div>
            )}
          </section>

          {sectionElements.length > 0 && (
            <section className="customer2-section">
              <div className="customer2-section-header">
                <div>
                  <h2 className="customer2-section-title">{t('customer2.sections.title')}</h2>
                  <p className="customer2-section-subtitle">{t('customer2.sections.subtitle')}</p>
                </div>
              </div>
              <div className="customer2-feature-stack">
                <Suspense fallback={<div className="customer2-highlight">{t('loading.component')}</div>}>
                  {sectionElements.map((element) => (
                    <div key={element.id}>
                      {renderSection(element)}
                    </div>
                  ))}
                </Suspense>
              </div>
            </section>
          )}

          <section className="customer2-preview">
            <div className="customer2-section-header">
              <div>
                <h2 className="customer2-section-title">{t('customer2.preview.title')}</h2>
                <p className="customer2-section-subtitle">{t('customer2.preview.subtitle')}</p>
              </div>
            </div>
            <div className="customer2-preview-frame">
              <Customer2PdfPreview url={featuredOffer?.url} />
            </div>
            <div className="customer2-preview-footer">
              <button
                className="customer2-secondary-button"
                onClick={() => openMarketingDialog('offers', 0)}
              >
                {t('customer2.preview.open')}
              </button>
              <button
                className="customer2-secondary-button dark"
                onClick={() => openMarketingDialog('menu', 0)}
              >
                {t('customer2.preview.menu')}
              </button>
            </div>
          </section>

          <section className="customer2-section">
            <div className="customer2-section-header">
              <div>
                <h2 className="customer2-section-title">{t('customer2.branch.title')}</h2>
                <p className="customer2-section-subtitle">{t('customer2.branch.subtitle')}</p>
              </div>
            </div>
            <div className="customer2-grid">
              <div className="customer2-grid-card">
                <strong>{t('customer2.branch.card')}</strong>
                <span>{branchSpotlight ? (language === 'ar' ? branchSpotlight.name_ar : branchSpotlight.name) : t('customer2.branch.value')}</span>
              </div>
              <div className="customer2-grid-card">
                <strong>{t('customer2.branch.hours')}</strong>
                <span>{t('customer2.branch.hours.value')}</span>
              </div>
              <div className="customer2-grid-card">
                <strong>{t('customer2.branch.location')}</strong>
                <span>{branchSpotlight ? (language === 'ar' ? branchSpotlight.address_ar : branchSpotlight.address) : t('customer2.branch.location.value')}</span>
              </div>
              <div className="customer2-grid-card">
                <strong>{t('customer2.branch.cta')}</strong>
                <span>{t('customer2.branch.cta.subtitle')}</span>
              </div>
            </div>
          </section>

          <section className="customer2-highlight">
            <h3>{t('customer2.highlight.title')}</h3>
            <p>{t('customer2.highlight.subtitle')}</p>
          </section>

          <footer className="customer2-footer">
            {t('customer2.footer')}{' '}
            <a href="/customer" onClick={(event) => { event.preventDefault(); navigate('/customer'); }}>
              {t('customer2.footer.link')}
            </a>
          </footer>
        </div>
      </div>

      <Suspense fallback={null}>
        <BranchDialog
          open={branchDialogOpen}
          onOpenChange={setBranchDialogOpen}
          onBranchSelect={handleBranchSelect}
          branches={branches || []}
        />
      </Suspense>

      <Suspense fallback={null}>
        <LocationDialog
          open={locationDialogOpen}
          onOpenChange={setLocationDialogOpen}
          onLocationClick={handleLocationClick}
          branches={branches || []}
        />
      </Suspense>

      <Suspense fallback={null}>
        <BookingsDialog
          open={bookingsDialogOpen}
          onOpenChange={setBookingsDialogOpen}
          onBranchSelect={handleBranchSelectForBookings}
          branches={branches || []}
        />
      </Suspense>

      <Suspense fallback={null}>
        <EidBookingsDialog
          open={eidBookingsDialogOpen}
          onOpenChange={setEidBookingsDialogOpen}
          onBranchSelect={handleEidBranchSelect}
          branches={branches || []}
        />
      </Suspense>

      <Suspense fallback={null}>
        <LazyMarketingDialog
          open={marketingDialogState.open}
          onOpenChange={closeMarketingDialog}
          contentType={marketingDialogState.contentType}
          initialContent={marketingDialogState.contentType === 'menu'
            ? menuContent
            : offersContent}
          initialIndex={marketingDialogState.currentIndex}
          isLoading={marketingDialogState.contentType === 'menu' ? menuLoading : offersLoading}
        />
      </Suspense>
    </div>
  );
};

export default Customer2;
