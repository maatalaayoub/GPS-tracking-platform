'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Cpu,
  MapPin,
  History,
  Settings,
  Satellite,
  X,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useSidebar } from './sidebar-context';

const navItems = [
  { title: 'Dashboard', href: '/', icon: LayoutDashboard },
  { title: 'Devices', href: '/devices', icon: Cpu },
  { title: 'Live Tracking', href: '/tracking', icon: MapPin },
  { title: 'History', href: '/history', icon: History },
  { title: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { open, close } = useSidebar();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="bg-background/80 fixed inset-0 z-40 backdrop-blur-sm md:hidden"
          onClick={close}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          'bg-card fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r transition-transform duration-300 ease-in-out',
          'md:relative md:z-auto md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-6">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold"
            onClick={close}
          >
            <Satellite className="text-primary h-5 w-5" />
            <span className="text-sm font-bold tracking-tight">
              GPS Platform
            </span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={close}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Separator />

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={close}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {item.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <Separator />

        {/* Footer */}
        <div className="px-6 py-4">
          <p className="text-muted-foreground text-xs">GPS Platform v0.1.0</p>
        </div>
      </aside>
    </>
  );
}
