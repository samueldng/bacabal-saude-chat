
import { Heart, Phone, MapPin } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b-4 border-blue-600">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">SEMUS Bacabal</h1>
              <p className="text-sm text-gray-600">Secretaria Municipal de Saúde</p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4" />
              <span>0800 123 4567</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>Bacabal - MA</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
