import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileHeader } from './MobileHeader';

export const DashboardLayout = () => {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-brand-soft-bg p-0 lg:p-5 lg:gap-5 overflow-hidden">
      <MobileHeader />
      <Sidebar />
      <main className="flex-1 overflow-y-auto lg:soft-card !border-none lg:!shadow-[14px_17px_40px_4px_rgba(112,144,176,0.08)] bg-white/70 backdrop-blur-xl lg:bg-white/90">
        <Outlet />
      </main>
    </div>
  );
};
