import { useEffect } from 'react';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import type { CandidateInfo, NavItemId } from '../types/assessment';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

interface AppLayoutProps {
  candidate: CandidateInfo;
  activeNav: NavItemId;
  onNavSelect: (id: NavItemId) => void;
  onBack: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onExport: () => void;
  onShare: () => void;
  sidebarOpen: boolean;
  onOpenSidebar: () => void;
  onCloseSidebar: () => void;
  onOpenSwitcher?: () => void;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  onOpenShortcuts?: () => void;
  children: ReactNode;
}

export function AppLayout({
  candidate,
  activeNav,
  onNavSelect,
  onBack,
  theme,
  onToggleTheme,
  onExport,
  onShare,
  sidebarOpen,
  onOpenSidebar,
  onCloseSidebar,
  onOpenSwitcher,
  sidebarCollapsed = false,
  onToggleSidebar,
  onOpenShortcuts,
  children,
}: AppLayoutProps) {
  useEffect(() => {
    if (!sidebarOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseSidebar();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [sidebarOpen, onCloseSidebar]);

  return (
    <div className="flex h-dvh w-screen overflow-hidden bg-canvas">
      {/* Desktop Sidebar with collapsible rail animation */}
      <aside
        className={`hidden shrink-0 transition-all duration-200 lg:block ${
          sidebarCollapsed ? 'w-[56px]' : 'w-[240px]'
        }`}
      >
        <Sidebar
          candidate={candidate}
          activeNav={activeNav}
          onNavSelect={onNavSelect}
          onBack={onBack}
          collapsed={sidebarCollapsed}
          onToggleCollapse={onToggleSidebar}
        />
      </aside>

      {/* Mobile Drawer */}
      {sidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation overlay"
            onClick={onCloseSidebar}
            className="absolute inset-0 bg-ink/30 backdrop-blur-[1px]"
          />
          <div className="absolute inset-y-0 left-0 w-[264px] proof-fade-in">
            <Sidebar
              candidate={candidate}
              activeNav={activeNav}
              onNavSelect={(id) => {
                onNavSelect(id);
                onCloseSidebar();
              }}
              onBack={() => {
                onBack();
                onCloseSidebar();
              }}
              onCloseDrawer={onCloseSidebar}
              drawer
            />
          </div>
          <button
            type="button"
            onClick={onCloseSidebar}
            aria-label="Close navigation"
            className="absolute left-[272px] top-3 flex h-8 w-8 items-center justify-center rounded-[6px] bg-surface text-muted shadow-card"
          >
            <X size={15} aria-hidden="true" />
          </button>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar
          candidate={candidate}
          activeNav={activeNav}
          theme={theme}
          onToggleTheme={onToggleTheme}
          onExport={onExport}
          onShare={onShare}
          onOpenMenu={onOpenSidebar}
          onOpenSwitcher={onOpenSwitcher}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={onToggleSidebar}
          onOpenShortcuts={onOpenShortcuts}
        />
        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto xl:overflow-hidden">
          <div className="flex w-full min-h-0 flex-1 flex-col px-3 py-2.5 sm:px-4 sm:py-3">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
