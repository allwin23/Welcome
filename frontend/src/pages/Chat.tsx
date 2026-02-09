

import { AppLayout } from '../components/AppLayout';
import { ChatInput } from '../components/ChatInput';
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSession } from '../contexts/SessionContext';
import { useSecurity } from '../contexts/SecurityContext';
import { getApiClient } from '../utils/api';

export default function Chat() {
    const navigate = useNavigate();
    const { session, initializeSession } = useSession();
    const { addSecurityEvent } = useSecurity();

    // Local state for UI
    const [processId, setProcessId] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Initialize Session on Mount if not active
    useEffect(() => {
        console.log(`[Chat] Mount effect - active: ${session.isActive}, id: ${session.id}`);
        if (!session.isActive) {
            initializeSession().catch(err => {
                console.error("[Chat] Session initialization failed:", err);
            });
        }
    }, [session.isActive, initializeSession, session.id]);


    // Handle Generation (API Calls)
    const handleGenerate = async (text: string, file?: File) => {
        if (!session.id || isProcessing) return;
        setIsProcessing(true);

        try {
            // Prepare results container
            let sanitizedText: string | null = null;
            let sanitizedPdf: string | null = null;
            // Generate a process ID upfront to track this batch of operations
            let newProcessId = processId || `proc-${crypto.randomUUID()}`;

            // Define API promises
            const promises: Promise<void>[] = [];

            // 1. TEXT ENDPOINT
            if (text.trim()) {
                const textPromise = getApiClient().sanitizeText(session.id, newProcessId, text)
                    .then(data => {
                        // Store the full JSON output for display as requested
                        sanitizedText = JSON.stringify(data, null, 2);
                    });
                promises.push(textPromise);
            }

            // 2. PDF ENDPOINT
            if (file) {
                const pdfPromise = getApiClient().sanitizePdf(session.id, newProcessId, file)
                    .then(data => {
                        // data is SanitizePdfResponse { pdf_bytes, ... }
                        // For now, we just indicate success in the UI message
                        sanitizedPdf = `PDF Sanitized (${data.pages} pages, ${(data.pdf_bytes.byteLength / 1024).toFixed(1)} KB)`;
                    });
                promises.push(pdfPromise);
            }

            // Wait for all active requests
            await Promise.all(promises);
            setProcessId(newProcessId);

            // Navigate to Sanitisation page with results
            setTimeout(() => {
                navigate("/sanitisation", {
                    state: {
                        originalText: text,
                        originalFileName: file?.name,
                        sanitizedText: sanitizedText,
                        sanitizedPdf: sanitizedPdf,
                        processId: newProcessId
                    }
                });
                // Note: navigation will unmount this component, but if it stays, we reset
                setIsProcessing(false);
            }, 500); // Slight delay for smoother transition

        } catch (error) {
            console.error("Sanitisation Error:", error);
            addSecurityEvent({
                type: 'api_error',
                message: "Failed to connect to sanitisation endpoints",
                details: { error: String(error) }
            });
            setIsProcessing(false);
            alert("Sanitisation failed. Please check your connection to the backend system.");
        }
    };

    return (
        <AppLayout showSidebar={true}>
            <div className="relative w-full h-full flex flex-col justify-end pb-8">

                {/* Transition Overlay */}
                {isProcessing && (
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-md z-[60] transition-opacity duration-700 animate-in fade-in rounded-3xl" />
                )}

                {/* Content (Chat Input) */}
                <div className={`transition-all duration-700 relative z-50 ${isProcessing ? "scale-[0.98] opacity-60 pointer-events-none" : "w-full"}`}>
                    <div className="w-full flex justify-center">
                        <ChatInput onSend={handleGenerate} isProcessing={isProcessing} />
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}
