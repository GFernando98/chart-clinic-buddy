import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sun, Moon, Menu, Globe } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function TopBar() {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  const currentLanguage = i18n.language;

  const toggleLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-4 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-foreground" />
      </div>

      <div className="flex items-center gap-2">
        {/* Language Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="w-9 h-9">
              <Globe className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              onClick={() => toggleLanguage('es')}
              className={currentLanguage === 'es' ? 'bg-accent' : ''}
            >
              🇪🇸 Español
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => toggleLanguage('en')}
              className={currentLanguage === 'en' ? 'bg-accent' : ''}
            >
              🇺🇸 English
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="w-9 h-9"
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4" />
          ) : (
            <Sun className="w-4 h-4" />
          )}
        </Button>

        {/* User Info */}
        {user && (
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l">
            <div className="text-right">
              <p className="text-sm font-medium">{user.fullName}</p>
            </div>
            <Badge variant="secondary" className="text-xs">
              {t(`roles.${user.roles[0].toLowerCase()}`)}
            </Badge>
          </div>
        )}
      </div>
    </header>
  );
}
