import { ChatInput } from '../components/ChatInput';
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSession } from '../contexts/SessionContext';
import { useSecurity } from '../contexts/SecurityContext'; // Assuming this exists or needed
import { getApiClient } from '../utils/api';
import ChatLayout from '../components/ChatLayout';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/NavBar';

export default function Chat() {
    const navigate = useNavigate();
    const { session, initializeSession } = useSession();
    const { addSecurityEvent } = useSecurity(); // Assuming used for logging

    // Local state for UI
    const [processId, setProcessId] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Initialize Session on Mount if not active
    useEffect(() => {
        if (!session.isActive) {
            initializeSession().catch(err => {
                console.error("[Chat] Session initialization failed:", err);
            });
        }
    }, [session.isActive, initializeSession]);

    // Handle Generation (API Calls)
    const handleGenerate = async (text: string, file?: File) => {
        if (!text.trim() && !file) return;
        setIsProcessing(true);

        try {
            // Using session context to handle file/text processing if available
            // If strictly using API client manually as per previous code:

            // For now, simulate the session creation/processing
            console.log("Processing input:", text, file);

            // Example delay to show processing state
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Navigate or update state
            navigate('/sanitisation');

        } catch (error) {
            console.error("Processing failed:", error);
            // addSecurityEvent logic if needed
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="w-full h-full p-8 grid grid-cols-[auto_1fr] grid-rows-[auto_1fr] gap-6 relative overflow-hidden text-[#0a0a0a]">

            {/* Top Left - Empty (Spacer) */}
            <div className="w-[280px] hidden md:block"></div>

            {/* Top Right - Navbar (Aligned with ChatLayout) */}
            <div className="flex items-center justify-end h-16">
                <div className="w-full">
                    <Navbar width="w-full" />
                </div>
            </div>

            {/* Bottom Left - Sidebar (Aligned with ChatLayout) */}
            <div className="hidden md:flex flex-col h-full w-[280px]">
                <div className="h-full w-full shadow-2xl rounded-[1.5rem] overflow-hidden relative">
                    <Sidebar className="h-full w-full" />
                </div>
            </div>

            {/* Bottom Right - Chat Layout (Main Content) */}
            <div className="relative h-full w-full min-h-0">
                <ChatLayout>
                    <div className="relative w-full h-full flex flex-col justify-end pb-8">

                        {/* Transition Overlay */}
                        {isProcessing && (
                            <div className="absolute inset-0 bg-white/40 backdrop-blur-md z-[60] transition-opacity duration-700 animate-in fade-in rounded-[2.5rem]" />
                        )}

                        {/* Content (Chat Input) */}
                        <div className={`transition-all duration-700 relative z-50 px-8 ${isProcessing ? "scale-[0.98] opacity-60 pointer-events-none" : "w-full"}`}>
                            <div className="w-full flex justify-center">
                                <ChatInput onSend={handleGenerate} isProcessing={isProcessing} />
                            </div>
                        </div>

                    </div>
                </ChatLayout>
            </div>

        </div>
    );
}
