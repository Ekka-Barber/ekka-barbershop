import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  normalizeAccessCode,
  setManagerSession,
  setOwnerSession,
  validateAndDetectRole,
} from '@shared/lib/access-code/auth';
import { accessCodeStorage, sessionAuth } from '@shared/lib/access-code/storage';
import { Alert, AlertDescription } from '@shared/ui/components/alert';
import { Button } from '@shared/ui/components/button';
import { LanguageSwitcher } from '@shared/ui/components/common/LanguageSwitcher';
import { Input } from '@shared/ui/components/input';

import { useLanguage } from '@/contexts/LanguageContext';

const Login = () => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    const normalizedCode = normalizeAccessCode(accessCode);
    if (!normalizedCode) {
      setError(t('login.error.required'));
      return;
    }

    setIsLoading(true);

    try {
      const role = await validateAndDetectRole(normalizedCode);
      if (!role) {
        setError(t('login.error.invalid'));
        return;
      }

      if (role === 'owner') {
        await setOwnerSession(normalizedCode);
        accessCodeStorage.setOwnerAccessCode(normalizedCode);
        sessionAuth.setRole(role);
        sessionAuth.setAccessCode(normalizedCode);
        sessionAuth.clearBranchId();
        navigate('/owner');
        return;
      } else {
        await setManagerSession(normalizedCode);
        accessCodeStorage.setManagerAccessCode(normalizedCode);
        sessionAuth.setRole(role);
        sessionAuth.setAccessCode(normalizedCode);
        sessionAuth.clearBranchId();
        navigate('/manager');
      }
    } catch (loginError) {
      console.error('Login error:', loginError);
      setError(t('login.error.generic'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#fdf8ef] via-white to-[#f1e3d1] flex items-center justify-center px-4 py-12"
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="w-full max-w-md rounded-3xl border border-[#e8d6b5] bg-white/95 p-8 shadow-2xl backdrop-blur">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="logo-mark h-16 w-16">
            <img
              src="/logo_Header/logo12.svg"
              alt="Ekka Barbershop Logo"
              className="h-full w-full object-contain"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src =
                    '/lovable-uploads/7eb81221-fbf5-4b1d-8327-eb0e707236d8.png';
              }}
            />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-[#2b2620]">
              {t('login.title')}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t('login.subtitle')}
            </p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mt-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#3d352d]">
              {t('login.input.label')}
            </label>
            <Input
              type="password"
              value={accessCode}
              onChange={(event) => setAccessCode(event.target.value)}
              placeholder={t('login.input.placeholder')}
              autoComplete="one-time-code"
              required
              className="border-[#e6d6be] focus-visible:ring-[#e9b353]"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#e9b353] text-white hover:bg-[#e9b353]"
            disabled={isLoading}
          >
            {isLoading ? t('login.loading') : t('login.button')}
          </Button>
        </form>

        <LanguageSwitcher className="fixed top-0 right-0" />
      </div>
    </div>
  );
};

export default Login;
