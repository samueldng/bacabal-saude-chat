
import { MessageCircle, Clock, Users, FileText, Heart } from 'lucide-react';
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
      title: "Horários de Funcionamento",
      description: "Consulte horários das unidades"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-nova-bacabal-purple mb-4">
          Bem-vindo ao Atendimento Digital
        </h2>
        <p className="text-lg text-muted-foreground mb-6">
          Estamos aqui para ajudar você com informações sobre saúde pública em Bacabal
        </p>
        <Button 
          onClick={onStartChat}
          size="lg"
          className="bg-nova-bacabal-orange hover:bg-nova-bacabal-orange/90 text-white px-8 py-3 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <MessageCircle className="mr-2 h-5 w-5" />
          Iniciar Atendimento
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((service, index) => (
          <Card key={index} className="hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-nova-bacabal-orange/20 bg-white">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-2">
                {service.icon}
              </div>
              <CardTitle className="text-lg text-nova-bacabal-purple">{service.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-muted-foreground">
                {service.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 bg-gradient-to-r from-nova-bacabal-cyan/10 to-nova-bacabal-purple/10 rounded-xl p-6 border border-nova-bacabal-cyan/20">
        <h3 className="text-xl font-semibold text-nova-bacabal-purple mb-3">
          Horário de Atendimento Digital
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium text-nova-bacabal-purple">Segunda a Sexta:</p>
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
