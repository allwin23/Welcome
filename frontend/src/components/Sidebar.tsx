import { useNavigate } from 'react-router-dom';
import { useSession } from '../contexts/SessionContext';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const navigate = useNavigate();
  const { session, initializeSession, clearSession } = useSession();

  return (
    <div className={`bg-black rounded-2xl px-5 py-6 text-white shadow-[0_25px_70px_rgba(0,0,0,0.35)] flex flex-col ${className || ''}`}>

      {/* top content */}
      <div>

        <h1 className="text-2xl mb-8" style={{ fontFamily: "Sunflower" }}>
          Chat
        </h1>

        <p
          className="text-[10px] tracking-[0.2em] mb-4 text-white/70"
          style={{ fontFamily: "Space Mono" }}
        >
          CHAT HISTORY
        </p>

        <div className="space-y-2">

          <div className="px-3 py-2 rounded-lg bg-white/10 text-sm">
            Session — Today
          </div>

          <div className="px-3 py-2 rounded-lg hover:bg-white/5 transition text-sm cursor-pointer">
            Legal Document Scan
          </div>

          <div className="px-3 py-2 rounded-lg hover:bg-white/5 transition text-sm cursor-pointer">
            Privacy Audit Run
          </div>

        </div>
      </div>

      {/* push CTA to bottom */}
      <div className="mt-auto">

        {/* Session Control Button */}
        <button
          onClick={() => session.isActive ? clearSession() : initializeSession()}
          className="w-full bg-[#f5f0e9] text-black py-3 rounded-lg text-sm font-medium hover:opacity-90 transition uppercase mb-8"
        >
          {session.isActive ? 'CLOSE SESSION' : 'CREATE SESSION'}
        </button>

        <div
          className="text-center mb-3 text-[10px] tracking-[0.2em] text-white/70"
          style={{ fontFamily: "Space Mono" }}
        >
          SESSION ID
        </div>

        <button
          onClick={() => navigate('/')}
          className="w-full bg-[#f5f0e9] text-black py-3 rounded-lg text-sm font-medium hover:opacity-90 transition uppercase"
        >
          {session.id ? session.id.slice(0, 8) + '...' : 'NO ACTIVE SESSION'}
        </button>

      </div>

    </div>
  );
}
