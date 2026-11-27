import { NavLink } from 'react-router-dom';
import { BookOpen, CalendarDays, Compass, Ticket, Wallet } from 'lucide-react';

const TABS = [
  { to: '/', label: 'Visão geral', Icon: Compass, end: true },
  { to: '/day', label: 'Dia a dia', Icon: CalendarDays, end: false },
  { to: '/reservations', label: 'Reservas', Icon: Ticket, end: false },
  { to: '/expenses', label: 'Contas', Icon: Wallet, end: false },
  { to: '/vietna-101', label: 'Vietnã 101', Icon: BookOpen, end: false },
];

export function BottomNav() {
  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-line/70 bg-paper/90 backdrop-blur-xl" aria-label="Navegação principal">
      <div className="mx-auto flex max-w-xl">
        {TABS.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `tap flex min-w-0 flex-1 flex-col items-center gap-0.5 whitespace-nowrap pb-1.5 pt-2 text-[10px] min-[360px]:text-[10.5px] font-medium ${isActive ? 'text-lacquer' : 'text-ink-3'}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={22} strokeWidth={isActive ? 2.1 : 1.6} aria-hidden />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
