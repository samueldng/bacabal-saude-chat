
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
      action: 'Quero agendar uma consulta'
    },
    {
      icon: <FileText className="h-4 w-4" />,
      label: 'Exames',
      action: 'Consultar resultados de exames'
    },
    {
      icon: <MapPin className="h-4 w-4" />,
      label: 'Unidades',
      action: 'Localizar unidades de saúde'
    },
    {
      icon: <Phone className="h-4 w-4" />,
      label: 'Contato',
      action: 'Falar com atendente humano'
    }
  ];

  return (
    <div className="p-4 border-t bg-gray-50">
      <p className="text-xs font-medium text-gray-600 mb-2">Ações rápidas:</p>
      <div className="flex flex-wrap gap-2">
        {quickActions.map((action, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onActionClick(action.action)}
            className="flex items-center space-x-1 text-xs"
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
