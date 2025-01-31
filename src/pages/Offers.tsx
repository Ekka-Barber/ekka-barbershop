import { Link } from "react-router-dom";

const Offers = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <Link to="/customer">
          <img 
            src="/lovable-uploads/8289fb1d-c6e6-4528-980c-6b52313ca898.png"
            alt="Ekka Barbershop Logo" 
            className="h-32 mx-auto mb-6 cursor-pointer hover:opacity-90 transition-opacity"
          />
        </Link>
        <h1 className="text-3xl font-bold text-[#222222] mb-4">Offers</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Example offer card */}
          <div className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-xl font-semibold">Offer Title 1</h2>
            <p className="text-gray-600">Description of offer 1.</p>
          </div>
          <div className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-xl font-semibold">Offer Title 2</h2>
            <p className="text-gray-600">Description of offer 2.</p>
          </div>
          <div className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-xl font-semibold">Offer Title 3</h2>
            <p className="text-gray-600">Description of offer 3.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Offers;
