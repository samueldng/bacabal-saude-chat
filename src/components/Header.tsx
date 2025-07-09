
import { Phone, MapPin } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b-4 border-gradient-orange">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <img 
                src="/lovable-uploads/fdb5c86c-8e42-40d1-9764-5e62391414c8.png" 
                alt="Nova Bacabal - Secretaria de Saúde" 
                className="h-16 w-auto"
              />
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-6 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2 hover:text-nova-bacabal-orange transition-colors cursor-pointer">
              <Phone className="h-4 w-4" />
              <span>0800 123 4567</span>
            </div>
            <div className="flex items-center space-x-2 hover:text-nova-bacabal-cyan transition-colors cursor-pointer">
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
