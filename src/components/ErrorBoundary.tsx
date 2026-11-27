import { Component, type ReactNode } from 'react';
import { clearLocal } from '../lib/localStore';

/** Last line of defence: never leave a blank screen during the trip. */
export class ErrorBoundary extends Component<{ children: ReactNode }, { error?: Error }> {
  state: { error?: Error } = {};
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="mx-auto max-w-md px-6 pt-16 text-center">
        <h1 className="text-[26px]">Algo deu errado</h1>
        <p className="mt-2 text-[14px] text-ink-2">O roteiro continua salvo. Tente de novo; se repetir, desfaça as alterações feitas neste celular (as reservas publicadas e os gastos sincronizados não são afetados).</p>
        <div className="mt-6 space-y-2">
          <button onClick={() => location.assign('/')} className="tap w-full rounded-full bg-ink py-3 font-semibold text-paper">Tentar de novo</button>
          <button onClick={() => { clearLocal(); location.assign('/'); }} className="tap w-full rounded-full bg-paper-2 py-3 font-semibold text-ink">Desfazer alterações deste celular</button>
        </div>
        <p className="mt-4 text-[11px] text-ink-3">{this.state.error.message}</p>
      </div>
    );
  }
}
