'use client';

import { useRouter } from 'next/navigation';
import { Menu, LogOut } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ThemeToggle } from './theme-toggle';
import { useSidebar } from './sidebar-context';
import { createClient } from '@/lib/supabase/client';

interface HeaderProps {
  userEmail?: string | null;
}

export function Header({ userEmail }: HeaderProps) {
  const { toggle } = useSidebar();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="bg-card flex h-16 items-center justify-between border-b px-4 md:px-6">
      {/* Mobile menu toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={toggle}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      {/* Right actions */}
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />

        {userEmail && (
          <span className="text-muted-foreground hidden text-sm md:block">
            {userEmail}
          </span>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={handleSignOut}
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
          <span className="sr-only">Sign out</span>
        </Button>
      </div>
    </header>
  );
}
