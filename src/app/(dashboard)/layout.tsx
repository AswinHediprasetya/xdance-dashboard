import { Activity, LayoutDashboard, Upload, History } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/shared/ThemeToggle';

function Sidebar() {
  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/', icon: Upload, label: 'Upload' },
    { href: '/uploads', icon: History, label: 'History' },
  ];

  return (
    <aside className="w-56 flex-shrink-0 border-r bg-card/50 hidden md:flex flex-col">
      <div className="h-14 flex items-center gap-2.5 px-4 border-b">
        <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
          <Activity className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-semibold text-foreground tracking-tight">X-Dance</span>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">X-Dance Studio</p>
          <p className="text-xs text-muted-foreground">Hani Andary</p>
        </div>
        <ThemeToggle />
      </div>
    </aside>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 border-b bg-card/50 flex items-center justify-between px-6 md:hidden">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
              <Activity className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">X-Dance Dashboard</span>
          </div>
          <ThemeToggle />
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
