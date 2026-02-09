import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AiCommentary from "../components/processing/AiCommentary";
import EncryptionCore from "../components/processing/EncryptionCore";
import UserInputBox from "../components/processing/UserInputBox";
import ApiOutputBox from "../components/processing/ApiOutputBox";
import AestheticBranding from "../components/AestheticBranding";

type Stage =
    | "boot"
    | "core"
    | "split"
    | "commentary"
    | "printing"
    | "merge"
    | "encrypted-view"
    | "trial-cta";

const SanitisationPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state || {}; // Retrieve passed data

    // Default mock data if no real data is present
    const defaultOriginal = `Original Payload:\nJohn Doe <john.doe@example.com> requested access effectively immediately.\nSocial Security: 000-12-3456\nLocation: 40.7128° N, 74.0060° W`;
    const defaultSanitized = `Sanitized Output:\n[PERSON] <[EMAIL]> requested access effectively immediately.\nSocial Security: [SSN]\nLocation: [COORDINATES]`;

    const originalContent = state.originalText
        ? `${state.originalFileName ? `File: ${state.originalFileName}\n\n` : ''}${state.originalText}`
        : (state.originalFileName ? `File: ${state.originalFileName}\n[Binary PDF Content Hidden]` : defaultOriginal);

    const sanitizedContent = state.sanitizedText
        ? `${state.sanitizedPdf ? `[PDF PROCESSED]: ${state.sanitizedPdf}\n\n[TEXT PROCESSED (JSON)]:\n` : ''}${state.sanitizedText}`
        : (state.sanitizedPdf ? `Processed PDF: ${state.sanitizedPdf}\n[Secure Redaction Complete]` : defaultSanitized);

    const [stage, setStage] = useState<Stage>("boot");

    useEffect(() => {
        const t1 = setTimeout(() => setStage("core"), 400);
        const t2 = setTimeout(() => setStage("split"), 1000);
        const t3 = setTimeout(() => setStage("commentary"), 1600);
        const t4 = setTimeout(() => setStage("printing"), 2300);

        // NEW FLOW
        const t5 = setTimeout(() => setStage("merge"), 4200);
        const t6 = setTimeout(() => setStage("encrypted-view"), 5200);
        const t7 = setTimeout(() => setStage("trial-cta"), 6800);

        return () => {
            [t1, t2, t3, t4, t5, t6, t7].forEach(clearTimeout);
        };
    }, []);

    // Helper to get commentary text
    const getCommentaryText = (s: Stage) => {
        switch (s) {
            case "boot": return "Initializing secure environment...";
            case "core": return "Loading encryption modules...";
            case "split": return "Analyzing payload structure...";
            case "commentary": return "Detecting sensitive entities...";
            case "printing": return "Sanitising PII data...";
            case "merge": return "Rebuilding secure document container...";
            case "encrypted-view": return "Verifying integrity hash...";
            case "trial-cta": return "System ready. awaiting simulation start.";
            default: return "Processing...";
        }
    };

    // Helper to check if commentary should be visible
    const showCommentary = ["commentary", "printing", "merge", "encrypted-view", "trial-cta"].includes(stage);

    return (
        <div className="w-full h-screen flex flex-col relative overflow-hidden">

            {/* BRANDING LOGO */}
            <div className="p-6 z-50">
                <AestheticBranding />
            </div>

            {/* MAIN WORKSPACE */}
            <div className="flex-1 p-6 pt-0">
                <div
                    className={`relative bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl transition-all duration-1000 overflow-hidden w-full h-full ${stage === "boot" || stage === "core"
                        ? "flex items-center justify-center rounded-3xl"
                        : "rounded-3xl"
                        }`}
                >
                    {/* 1) CORE LOADER (Initial Center) */}
                    <div className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ${stage === "boot" || stage === "core" ? "opacity-100 scale-100" : "opacity-0 scale-50 pointer-events-none"
                        }`}>
                        <EncryptionCore />
                    </div>

                    {/* DYNAMIC PANELS (Split -> Merge) */}
                    {(stage === "printing" || stage === "split" || stage === "commentary" || stage === "merge") && (
                        <div className={`absolute inset-0 flex items-center justify-center px-12 transition-all duration-700 ${stage === "merge" ? "gap-0" : "gap-32"
                            } ${(stage === "split" || stage === "commentary" || stage === "printing" || stage === "merge")
                                ? 'opacity-100 translate-y-0'
                                : 'opacity-0 translate-y-10'
                            }`}>

                            {/* LEFT PANEL (User Input) - Collapses on merge */}
                            <div className={`h-[420px] transition-all duration-700 overflow-hidden ${stage === "merge" ? "w-[0%] opacity-0 p-0" : "w-[45%] max-w-[700px] pt-20"
                                }`}>
                                <div className="w-full h-full">
                                    <UserInputBox
                                        text={originalContent}
                                        start={stage === "printing" || stage === "merge"}
                                    />
                                </div>
                            </div>

                            {/* CENTER DIVIDER / VISUALIZER */}
                            <div className={`transition-all duration-700 flex flex-col items-center justify-center ${stage === "merge" ? "w-[100%] scale-110" : "w-[10%]"
                                }`}>
                                <EncryptionCore />
                            </div>

                            {/* RIGHT PANEL (API Output) - Expands on merge (conceptually) */}
                            <div className={`h-[420px] transition-all duration-700 overflow-hidden ${stage === "merge" ? "w-[70%] max-w-[1000px] pt-0 flex items-center" : "w-[45%] max-w-[700px] pt-20"
                                }`}>
                                <div className="w-full h-full">
                                    <ApiOutputBox
                                        text={sanitizedContent}
                                        start={stage === "printing" || stage === "merge"}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ENCRYPTED VIEW (Final Output) */}
                    {(stage === "encrypted-view" || stage === "trial-cta") && (
                        <div className={`absolute inset-0 flex items-center justify-center px-20 transition-all duration-1000 ${stage === 'trial-cta' ? 'blur-sm scale-95 opacity-50' : 'opacity-100'}`}>
                            <div className="w-full max-w-[900px] h-[460px] rounded-2xl bg-white/80 border border-[#e0dbd0] p-10 shadow-sm backdrop-blur-sm flex flex-col justify-center">
                                <div className="text-[11px] text-[#7a746b] tracking-widest mb-6 font-bold uppercase">
                                    Encrypted System Output
                                </div>
                                <div className="text-[14px] text-[#1a1a1a] leading-relaxed whitespace-pre-wrap font-mono opacity-80">
                                    {`> ENCRYPTION_PROTOCOL_INITIATED\n> SECURE_HASH: 7a9c2b4d8e1f5g6h\n> TIMESTAMP: ${new Date().toISOString()}\n> ORIGIN: VAULT_SECURE_GATEWAY\n\n> PAYLOAD_STATUS: SANITISED & ENCRYPTED\n> [PERSON] <[EMAIL]> ACCESS_REQUEST\n> SENSITIVE_FIELDS: [REDACTED]\n> GEO_COORDINATES: [MASKED]\n\n> SESSION_TOKEN: x8k9-m2p4-q5r7-v1w3\n> INTEGRITY_CHECK: PASSED`}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CENTER CTA */}
                    {stage === "trial-cta" && (
                        <div className="absolute inset-0 flex items-center justify-center z-50 animate-in zoom-in-95 duration-700 fade-in">
                            <button
                                onClick={() => navigate("/trial-room")}
                                className="px-12 py-5 rounded-2xl bg-[#111] text-white text-sm tracking-widest shadow-2xl hover:scale-105 transition-all hover:bg-black group border border-[#333]"
                            >
                                START TRIAL SIMULATION
                                <span className="ml-3 opacity-50 group-hover:opacity-100 transition-opacity">→</span>
                            </button>
                        </div>
                    )}

                    {/* COMMENTARY */}
                    {showCommentary && (
                        <div className="z-20 relative">
                            <AiCommentary text={getCommentaryText(stage)} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SanitisationPage;