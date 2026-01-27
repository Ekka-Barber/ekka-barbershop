import { BrowserRouter } from 'react-router-dom';

import { AppProviders } from './app/providers/AppProviders';
import { AppRouter } from './app/router/AppRouter';

const App = () => (
  <AppProviders>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppRouter />
    </BrowserRouter>
  </AppProviders>
);

export default App;
