import { useState } from 'react';
import { Button } from './ui/button';
import { 
  Clock, 
  Bookmark,
  Zap,
  Phone,
  HelpCircle,
  Menu,
  X
} from 'lucide-react';

type ViewType = 
  | 'home' 
  | 'timeline' 
  | 'highlights'
  | 'summary'
  | 'contact'
  | 'help';

interface NavigationProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onShowLogin: () => void;
}

export function Navigation({ currentView, onViewChange, onShowLogin }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationItems = [
    { id: 'timeline' as ViewType, label: 'Timeline', icon: Clock },
    { id: 'highlights' as ViewType, label: 'Highlights', icon: Bookmark },
    { id: 'summary' as ViewType, label: 'Summary', icon: Zap },
  ];

  const bottomItems = [
    { id: 'contact' as ViewType, label: 'Contact', icon: Phone },
    { id: 'help' as ViewType, label: 'Help', icon: HelpCircle },
  ];

  const handleNavClick = (view: ViewType) => {
    onViewChange(view);
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/95">
      <div className="max-w-[1135px] mx-auto px-[80px]">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button 
            onClick={() => handleNavClick('home')}
            className="text-primary font-semibold text-xl hover:text-primary/80 transition-colors"
          >
            Noted
          </button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    currentView === item.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="text-sm whitespace-nowrap">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Desktop Right Side */}
          <div className="hidden lg:flex items-center space-x-4">
            {bottomItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    currentView === item.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="text-sm">{item.label}</span>
                </button>
              );
            })}
            
            <Button
              onClick={onShowLogin}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Login
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden text-foreground p-2 hover:bg-accent rounded-lg transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border">
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center space-x-3 w-full px-3 py-2 rounded-lg transition-colors ${
                      currentView === item.id
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
              
              <div className="border-t border-border pt-2 mt-2">
                {bottomItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`flex items-center space-x-3 w-full px-3 py-2 rounded-lg transition-colors ${
                        currentView === item.id
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
                
                <Button
                  onClick={() => {
                    onShowLogin();
                    setIsMenuOpen(false);
                  }}
                  className="w-full mt-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Login
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}