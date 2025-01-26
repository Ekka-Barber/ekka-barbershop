import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

const Customer = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-sm mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-blue-900 text-center mb-8">
          Welcome
        </h1>
        
        <div className="grid grid-cols-1 gap-4">
          <Button 
            className="h-16 text-lg bg-blue-900 hover:bg-blue-800"
            onClick={() => navigate('/menu')}
          >
            View Menu
          </Button>
          
          <Button 
            className="h-16 text-lg bg-blue-900 hover:bg-blue-800"
            onClick={() => navigate('/offers')}
          >
            Special Offers
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Customer;