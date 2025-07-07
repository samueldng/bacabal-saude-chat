
import { Heart, Phone, MapPin } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b-4 border-nova-bacabal-orange">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-nova-bacabal-purple p-3 rounded-full shadow-md">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-nova-bacabal-purple">Nova Bacabal</h1>
              <p className="text-sm text-muted-foreground font-medium">Secretaria Municipal de Saúde</p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-6 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2 hover:text-nova-bacabal-orange transition-colors">
              <Phone className="h-4 w-4" />
              <span>0800 123 4567</span>
            </div>
            <div className="flex items-center space-x-2 hover:text-nova-bacabal-cyan transition-colors">
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
