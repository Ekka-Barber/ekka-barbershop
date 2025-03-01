import {
  createBrowserRouter,
  RouterProvider,
  Route,
  createRoutesFromElements,
  Routes,
} from "react-router-dom";
import Root from "./pages/Root";
import Home from "./pages/Home";
import Services from "./pages/Services";
import Offers from "./pages/Offers";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Booking from "./pages/Booking";
import CustomerDetails from "./pages/CustomerDetails";
import Confirmation from "./pages/Confirmation";
import NotFound from "./pages/NotFound";
import "./App.css";
import { LanguageProvider } from "./contexts/LanguageContext";
import Admin from './pages/Admin';

function App() {
  return (
    <LanguageProvider>
      <Routes>
        <Route path="/" element={<Root />}>
          <Route index element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Route>
        <Route path="/booking" element={<Booking />} />
        <Route path="/customer-details" element={<CustomerDetails />} />
        <Route path="/confirmation" element={<Confirmation />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/:page" element={<Admin />} />
      </Routes>
    </LanguageProvider>
  );
}

export default App;
