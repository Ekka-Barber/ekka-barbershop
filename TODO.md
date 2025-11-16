## TODO

- [x] Ensure safe-area CSS variables retain `env()` values instead of being overwritten with `0px` fallbacks in `src/index.css:88-99`, so AppLayout padding honors notched devices.
- [x] Update marketing dialog data flow so menu/offers files are fetched lazily: gate `usePDFFetch` calls in `src/hooks/useMarketingDialog.ts` behind an `enabled` flag, and show a loading state instead of rendering `null` when content arrays are empty.
- [x] Internationalize marketing metadata by including the current language in `usePDFFetch`’s React Query key, mapping `branchName` to `name_ar` for Arabic, and exposing both language variants (`src/hooks/usePDFFetch.ts`); wire these values into the dialog metadata.
- [x] Prevent the app from silently using production Supabase credentials by throwing if `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` are missing and documenting the requirement (`src/integrations/supabase/client.ts:5-11`).
- [x] Replace the insecure `?access=owner123` guard with a simple token-based check that reads from an env variable/local storage before showing the admin route (`src/App.tsx:37-107`), so the dashboard isn’t publicly accessible.
