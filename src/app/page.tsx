import { UploadForm } from '@/features/upload/components/UploadForm';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { Activity, ArrowRight, FileSpreadsheet, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
                <Activity className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground tracking-tight">X-Dance Dashboard</span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/uploads"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                Upload history <ArrowRight className="h-3 w-3" />
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 mb-4">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-primary">AI-Powered Automation</span>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-3 tracking-tight">
              From raw exports to<br />
              <span className="text-primary">instant insights</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Upload your two GetGrib Excel files. Claude normalizes the messy columns, computes your KPIs, and builds your dashboard — automatically.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-10">
            {[
              { icon: FileSpreadsheet, title: 'Upload 2 files', desc: 'Membership list + attendance log' },
              { icon: Sparkles, title: 'AI normalizes', desc: 'Dutch columns auto-mapped to schema' },
              { icon: Activity, title: 'Dashboard ready', desc: 'KPIs, charts, and filters' },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-xl border bg-card p-4 text-center hover:bg-muted/30 transition-colors"
              >
                <div className="mx-auto mb-2 h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <p className="text-sm font-semibold text-foreground mb-0.5">{title}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border bg-card p-8 shadow-sm">
            <UploadForm />
          </div>
        </main>
      </div>
  );
}
