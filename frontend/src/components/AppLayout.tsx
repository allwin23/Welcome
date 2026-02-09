import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import Navbar from './NavBar';
import AestheticBranding from './AestheticBranding';

interface AppLayoutProps {
    children: ReactNode;
    showSidebar?: boolean;
}

export function AppLayout({ children, showSidebar = true }: AppLayoutProps) {
    return (
        <div className="flex flex-col h-full w-full bg-[#f5f0e9] overflow-hidden">

            {/* TOP HEADER SECTION */}
            <div className="flex items-start justify-between px-6 pt-6 pb-4 z-50 flex-shrink-0">
                <div className="w-[200px]">
                    <AestheticBranding />
                </div>

                <div className="flex-1 flex justify-center">
                    <Navbar width="w-full max-w-2xl" />
                </div>

                <div className="w-[200px]" /> {/* Spacer for centering navbar */}
            </div>

            {/* MAIN CONTENT ROW */}
            <div className="flex-1 flex overflow-hidden relative z-0">

                {/* Left Sidebar Column */}
                {showSidebar && (
                    <div className="w-[300px] h-full flex flex-col p-4 flex-shrink-0 z-40">
                        <Sidebar className="h-full w-full" />
                    </div>
                )}

                {/* Right Content Column */}
                <main className="flex-1 h-full p-4 relative min-w-0">
                    {/* Glass Workspace Container */}
                    <div className="w-full h-full rounded-3xl relative overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.18)]">

                        {/* Glass Visuals */}
                        <div className="absolute inset-0 bg-white/10 backdrop-blur-[4px] z-0" />
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-[#ece6dc]/20 z-0" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_60%,rgba(0,0,0,0.05))] z-0" />

                        {/* Content Wrapper */}
                        <div className="relative z-10 w-full h-full">
                            {children}
                        </div>
                    </div>
                </main>

            </div>
        </div>
    );
}
