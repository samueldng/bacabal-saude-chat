
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
      label: 'Contato',
      action: 'Falar com atendente humano',
      color: 'text-nova-bacabal-orange'
    }
  ];

  return (
    <div className="p-4 border-t bg-gradient-to-r from-nova-bacabal-cyan/5 to-nova-bacabal-purple/5">
      <p className="text-xs font-medium text-nova-bacabal-purple mb-2">Ações rápidas:</p>
      <div className="flex flex-wrap gap-2">
        {quickActions.map((action, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onActionClick(action.action)}
            className={`flex items-center space-x-1 text-xs border-gray-200 hover:border-nova-bacabal-orange/40 hover:bg-nova-bacabal-orange/5 transition-all duration-200 ${action.color}`}
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
