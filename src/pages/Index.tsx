
import { useState } from 'react';
import ChatInterface from '../components/ChatInterface';
import Header from '../components/Header';
import WelcomeCard from '../components/WelcomeCard';
import { ChatProvider } from '../contexts/ChatContext';

const Index = () => {
  const [chatStarted, setChatStarted] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-nova-bacabal-cyan/5 via-white to-nova-bacabal-purple/5">
      <ChatProvider>
        {!chatStarted ? (
          <>
            <Header />
            <div className="container mx-auto px-4 py-8">
              <WelcomeCard onStartChat={() => setChatStarted(true)} />
            </div>
          </>
        ) : (
          <ChatInterface />
        )}
      </ChatProvider>
    </div>
  );
};

export default Index;
