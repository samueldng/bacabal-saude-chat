
import ChatInterface from '../components/ChatInterface';
import { ChatProvider } from '../contexts/ChatContext';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-nova-bacabal-cyan/5 via-white to-nova-bacabal-purple/5">
      <ChatProvider>
        <ChatInterface />
      </ChatProvider>
    </div>
  );
};

export default Index;
