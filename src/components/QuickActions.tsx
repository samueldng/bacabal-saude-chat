
import { Calendar, FileText, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuickActionsProps {
  onActionClick: (action: string) => void;
}

const QuickActions = ({ onActionClick }: QuickActionsProps) => {
  const quickActions = [
    {
      icon: <Calendar className="h-4 w-4" />,
      label: 'Agendar',
      action: 'Quero agendar uma consulta',
      color: 'text-nova-bacabal-purple'
    },
    {
      icon: <FileText className="h-4 w-4" />,
      label: 'Exames',
      action: 'Consultar resultados de exames',
      color: 'text-nova-bacabal-cyan'
    },
    {
      icon: <MapPin className="h-4 w-4" />,
      label: 'Unidades',
      action: 'Localizar unidades de saúde',
      color: 'text-nova-bacabal-green'
    },
    {
      icon: <Phone className="h-4 w-4" />,
      label: 'Farmácias',
      action: 'Farmácias de plantão hoje',
      color: 'text-nova-bacabal-orange'
    }
  ];

  return (
    <div className="p-4 border-t border-nova-bacabal-orange/10 bg-gradient-orange-subtle rounded-t-xl">
      <p className="text-xs font-medium text-nova-bacabal-orange mb-3">Ações rápidas:</p>
      <div className="flex flex-wrap gap-2">
        {quickActions.map((action, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onActionClick(action.action)}
            className={`flex items-center space-x-2 text-xs border-nova-bacabal-orange/20 hover:border-nova-bacabal-orange/40 hover:bg-gradient-orange hover:text-white transition-all duration-200 rounded-full ${action.color} hover:shadow-orange`}
          >
            {action.icon}
            <span>{action.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
