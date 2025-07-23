
import { MessageCircle, Clock, Users, FileText, Heart } from 'lucide-react';
const botIcon = '/lovable-uploads/5717a54e-e75d-4e85-9b28-5833401e8b64.png';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface WelcomeCardProps {
  onStartChat: () => void;
}

const WelcomeCard = ({ onStartChat }: WelcomeCardProps) => {
  const services = [
    {
      icon: <Users className="h-6 w-6 text-nova-bacabal-purple" />,
      title: "Agendamento de Consultas",
      description: "Agende suas consultas médicas"
    },
    {
      icon: <FileText className="h-6 w-6 text-nova-bacabal-cyan" />,
      title: "Resultados de Exames",
      description: "Consulte seus resultados"
    },
    {
      icon: <Heart className="h-6 w-6 text-nova-bacabal-green" />,
      title: "Programas de Saúde",
      description: "Informações sobre programas municipais"
    },
    {
      icon: <Clock className="h-6 w-6 text-nova-bacabal-orange" />,
      title: "Farmácias de Plantão",
      description: "Consulte as farmácias em funcionamento hoje"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-gradient-orange mb-4">
          Bem-vindo ao Atendimento Digital
        </h2>
        <p className="text-lg text-muted-foreground mb-8">
          Estamos aqui para ajudar você com informações sobre saúde pública em Bacabal
        </p>
        <Button 
          onClick={onStartChat}
          size="lg"
          className="bg-gradient-orange hover:bg-gradient-orange-dark text-white px-10 py-4 text-lg rounded-full shadow-orange-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
        >
          <img src={botIcon} alt="Chat" className="mr-3 h-6 w-6" />
          Iniciar Atendimento
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((service, index) => (
          <Card key={index} className="hover:shadow-orange-lg transition-all duration-200 cursor-pointer border-2 hover:border-nova-bacabal-orange/30 bg-white rounded-xl group">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-3">
                <div className="p-3 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-nova-bacabal-orange/10 group-hover:to-nova-bacabal-orange/5 transition-all duration-200">
                  {service.icon}
                </div>
              </div>
              <CardTitle className="text-lg text-gray-800 group-hover:text-nova-bacabal-orange transition-colors">{service.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-muted-foreground">
                {service.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 bg-gradient-orange-subtle rounded-2xl p-6 border border-nova-bacabal-orange/20 shadow-orange">
        <h3 className="text-xl font-semibold text-nova-bacabal-orange mb-3">
          Horário de Atendimento Digital
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium text-nova-bacabal-orange">Segunda a Sexta:</p>
            <p className="text-muted-foreground">7:00 às 17:00</p>
          </div>
          <div>
            <p className="font-medium text-nova-bacabal-green">Emergências:</p>
            <p className="text-muted-foreground">24 horas - Ligue 192 (SAMU)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeCard;
