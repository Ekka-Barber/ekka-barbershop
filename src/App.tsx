
import {
  RouterProvider,
  Route,
  Routes,
} from "react-router-dom";
import Offers from "./pages/Offers";
import "./App.css";
import { LanguageProvider } from "./contexts/LanguageContext";
import Admin from './pages/Admin';

function App() {
  return (
    <LanguageProvider>
      <Routes>
        <Route path="/offers" element={<Offers />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/:page" element={<Admin />} />
      </Routes>
    </LanguageProvider>
  );
}

export default App;
