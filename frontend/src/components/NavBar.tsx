interface NavbarProps {
    width?: string;
    className?: string;
}

export default function Navbar({ width, className }: NavbarProps) {
    return (
        <header className={`w-full flex justify-center sticky top-0 z-50 pt-4 ${className || ''}`}>
            <nav
                className={`max-w-[1400px] h-[72px] flex items-center justify-between px-6 rounded-[18px] ${width || 'w-[96%]'}`}
                style={{
                    background:
                        "linear-gradient(120deg, rgba(255,255,255,0.12), rgba(255,255,255,0.02)), rgba(0,0,0,0.35)",
                    backdropFilter: "blur(18px) saturate(140%)",
                    WebkitBackdropFilter: "blur(18px) saturate(140%)",
                    border: "1px solid rgba(255,255,255,0.18)",
                    boxShadow:
                        "inset 0 0 0.5px rgba(255,255,255,0.3), 0 8px 40px rgba(0,0,0,0.35)",
                    fontFamily: "Space Mono",
                }}
            >
                {/* LEFT */}
                <div className="flex items-center gap-2 text-white">
                    <span className="text-xl opacity-90">✳</span>
                    <span className="text-[20px] tracking-wide">VaultSim</span>
                </div>

                {/* CENTER NAV */}
                <ul
                    className="flex gap-9 text-[14px] tracking-[0.15em]"
                    style={{ fontFamily: "Space Mono" }}
                >
                    <li className="text-white/70 hover:text-white cursor-pointer transition">
                        CASE
                    </li>
                    <li className="text-white/70 hover:text-white cursor-pointer transition">
                        SANITISATION
                    </li>
                    <li className="text-white/70 hover:text-white cursor-pointer transition">
                        TRIAL
                    </li>
                    <li className="text-white/70 hover:text-white cursor-pointer transition">
                        VERDICT
                    </li>
                    <li className="text-orange-500 cursor-pointer">AGENT</li>
                </ul>

                {/* RIGHT */}
                <div className="flex items-center gap-3">
                    {/* Language */}
                   

                    {/* Contact */}
                    <button
                        className="px-5 h-[40px] rounded-xl text-sm flex items-center gap-2"
                        style={{
                            background: "rgba(255,255,255,0.9)",
                            color: "#111",
                            fontFamily: "Space Mono",
                            letterSpacing: "0.05em",
                        }}
                    >
                        TRYY <span>→</span>
                    </button>
                </div>
            </nav>
        </header>
    );
}
