import { useState, useEffect } from 'react';
import { Navigation } from './components/navigation';
import { HomePage } from './components/home-page';
import { ConversationTimeline } from './components/conversation-timeline';
import { Highlights } from './components/highlights';
import { QuickSummary } from './components/quick-summary';
import { ContactPage } from './components/contact-page';
import { HelpPage } from './components/help-page';
import { Footer } from './components/footer';
import { LoginModal } from './components/login-modal';
import { Button } from './components/ui/button';

type ViewType = 
  | 'home' 
  | 'timeline' 
  | 'highlights'
  | 'summary'
  | 'contact'
  | 'help';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [showLogin, setShowLogin] = useState(false);

  // Enable dark theme
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
  };

  const handleBackToHome = () => {
    setCurrentView('home');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return <HomePage onViewChange={handleViewChange} />;
      case 'timeline':
        return <ConversationTimeline />;
      case 'highlights':
        return <Highlights />;
      case 'summary':
        return <QuickSummary />;
      case 'contact':
        return <ContactPage />;
      case 'help':
        return <HelpPage />;
      default:
        return <HomePage onViewChange={handleViewChange} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        currentView={currentView}
        onViewChange={handleViewChange}
        onShowLogin={() => setShowLogin(true)}
      />
      
      <main className="max-w-[1135px] mx-auto px-[80px] py-[80px]">
        {currentView !== 'home' && (
          <div className="text-center mb-8">
            <Button 
              variant="outline" 
              onClick={handleBackToHome}
              className="mb-4"
            >
              ← Back to Home
            </Button>
          </div>
        )}
        
        {renderCurrentView()}
      </main>
      
      <Footer />
      
      {/* Login Modal */}
      <LoginModal 
        isOpen={showLogin} 
        onClose={() => setShowLogin(false)} 
      />
    </div>
  );
}