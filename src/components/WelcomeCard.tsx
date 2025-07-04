
import { MessageCircle, Clock, Users, FileText, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface WelcomeCardProps {
  onStartChat: () => void;
}

const WelcomeCard = ({ onStartChat }: WelcomeCardProps) => {
  const services = [
    {
      icon: <Users className="h-6 w-6 text-blue-600" />,
      title: "Agendamento de Consultas",
      description: "Agende suas consultas médicas"
    },
    {
      icon: <FileText className="h-6 w-6 text-green-600" />,
      title: "Resultados de Exames",
      description: "Consulte seus resultados"
    },
    {
      icon: <Heart className="h-6 w-6 text-red-500" />,
      title: "Programas de Saúde",
      description: "Informações sobre programas municipais"
    },
    {
      icon: <Clock className="h-6 w-6 text-orange-500" />,
      title: "Horários de Funcionamento",
      description: "Consulte horários das unidades"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Bem-vindo ao Atendimento Digital da SEMUS
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          Estamos aqui para ajudar você com informações sobre saúde pública em Bacabal
        </p>
        <Button 
          onClick={onStartChat}
          size="lg"
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg rounded-full"
        >
          <MessageCircle className="mr-2 h-5 w-5" />
          Iniciar Atendimento
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((service, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-2">
                {service.icon}
              </div>
              <CardTitle className="text-lg">{service.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                {service.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-blue-800 mb-3">
          Horário de Atendimento Digital
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium text-gray-700">Segunda a Sexta:</p>
            <p className="text-gray-600">7:00 às 17:00</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Emergências:</p>
            <p className="text-gray-600">24 horas - Ligue 192 (SAMU)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeCard;
