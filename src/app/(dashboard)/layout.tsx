'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Upload, History, Settings,
  BarChart2,
} from 'lucide-react';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { TopBar } from '@/components/shared/TopBar';

const NAV_WORKSPACE = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/lessons', icon: BarChart2, label: 'Lesson Analysis' },
  { href: '/', icon: Upload, label: 'Upload' },
  { href: '/uploads', icon: History, label: 'History' },
];

const NAV_ACCOUNT = [
  { href: '#', icon: Settings, label: 'Settings' },
];

function NavItem({ href, icon: Icon, label, active }: {
  href: string; icon: React.ElementType; label: string; active: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13.5px] transition-all duration-150 select-none"
      style={{
        color: active ? 'var(--fg-strong)' : 'var(--muted-foreground)',
        background: active ? 'var(--card)' : 'transparent',
        boxShadow: active ? 'var(--shadow-sm, 0 1px 2px rgba(15,17,33,.04),0 0 0 .5px rgba(15,17,33,.05))' : 'none',
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.color = 'var(--fg-strong)'; } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted-foreground)'; } }}
    >
      <Icon style={{ width: 15, height: 15, opacity: 0.85 }} />
      <span>{label}</span>
    </Link>
  );
}

function Sidebar() {
  const pathname = usePathname();
  return (
    <aside
      className="hidden md:flex flex-col flex-shrink-0 border-r"
      style={{ width: 248, padding: '22px 16px 18px', gap: 26, background: 'var(--background)' }}
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-2">
        <div
          className="flex items-center justify-center rounded-lg text-white font-semibold text-sm"
          style={{
            width: 28, height: 28, letterSpacing: '-0.04em',
            background: 'linear-gradient(135deg, #111 0%, #333 100%)',
            boxShadow: 'inset 0 0 0 .5px rgba(255,255,255,.15)',
          }}
        >
          X
        </div>
        <div>
          <div className="text-[15px] font-[590] tracking-[-0.02em]" style={{ color: 'var(--fg-strong)' }}>
            X-Dance
          </div>
          <div className="text-[11px]" style={{ color: 'var(--fg-faint)' }}>
            Studio analytics
          </div>
        </div>
      </div>

      {/* Workspace nav */}
      <div className="flex flex-col gap-0.5">
        <div
          className="text-[11px] font-medium uppercase tracking-[0.08em] px-2.5 mb-1.5"
          style={{ color: 'var(--fg-faint)' }}
        >
          Workspace
        </div>
        {NAV_WORKSPACE.map(item => (
          <NavItem key={item.href} {...item} active={pathname === item.href} />
        ))}
      </div>

      {/* Account nav */}
      <div className="flex flex-col gap-0.5">
        <div
          className="text-[11px] font-medium uppercase tracking-[0.08em] px-2.5 mb-1.5"
          style={{ color: 'var(--fg-faint)' }}
        >
          Account
        </div>
        {NAV_ACCOUNT.map(item => (
          <NavItem key={item.label} {...item} active={false} />
        ))}
      </div>

      {/* Footer */}
      <div
        className="mt-auto flex items-center gap-2.5 pt-3"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <div
          className="flex items-center justify-center rounded-full text-white text-xs font-semibold flex-shrink-0"
          style={{
            width: 30, height: 30,
            background: 'linear-gradient(135deg, #c7d2fe, #a5b4fc)',
            boxShadow: 'inset 0 0 0 .5px rgba(0,0,0,.1)',
          }}
        >
          HA
        </div>
        <div className="text-xs flex-1 min-w-0">
          <div className="font-[550]" style={{ color: 'var(--fg-strong)' }}>Hani Andary</div>
          <div style={{ color: 'var(--fg-faint)' }}>Amsterdam, NL</div>
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
        {/* Mobile header */}
        <header className="md:hidden h-14 border-b flex items-center justify-between px-5">
          <div className="flex items-center gap-2.5">
            <div
              className="flex items-center justify-center rounded-lg text-white font-semibold text-sm"
              style={{ width: 26, height: 26, background: 'linear-gradient(135deg, #111, #333)' }}
            >
              X
            </div>
            <span className="font-semibold text-sm tracking-tight">X-Dance</span>
          </div>
          <ThemeToggle />
        </header>
        {/* Scrollable area with sticky TopBar inside */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <TopBar />
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
