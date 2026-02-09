
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Shield, Lock, AlertCircle, CheckCircle } from "lucide-react";
import AestheticBranding from "../components/AestheticBranding";
import { ChatInput } from "../components/ChatInput";
import { getApiClient, generateProcessingId } from "../utils/api";
import { useSession } from "../contexts/SessionContext";
import ChatLayout from "../components/ChatLayout";

// --- Types ---

type MessageType = 'user' | 'system';

interface Message {
    id: string;
    type: MessageType;
    content?: string; // For text messages
    file?: File; // For user file uploads
    pdfUrl?: string; // For system PDF response
    pdfMetadata?: {
        pages: number;
        processingTime: number;
        tokenCount: number;
    };
    pdfBytes?: ArrayBuffer; // Store raw bytes if needed for detailed inspection
    isLoading?: boolean;
    isError?: boolean;
    timestamp: number;
    stage?: 'scanning' | 'tokenizing' | 'final' | 'error';
}

// --- Components ---

const UserBubble = ({ message }: { message: Message }) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col items-end max-w-[80%] self-end"
        >
            <div className="flex items-center gap-2 mb-1 pr-2">
                <span className="text-[10px] uppercase tracking-widest text-[#555] font-bold">Original Input</span>
                <span className="text-[10px] text-text-muted">{new Date(message.timestamp).toLocaleTimeString()}</span>
            </div>

            <div className="bg-white/60 backdrop-blur-md border border-white/40 rounded-2xl rounded-tr-sm p-4 shadow-sm text-sm text-[#333] leading-relaxed relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-1 h-full bg-[#333]/10" />

                {message.file ? (
                    <div className="flex items-center gap-3 pl-4">
                        <div className="w-10 h-10 rounded-lg bg-[#333]/5 flex items-center justify-center">
                            <FileText size={20} className="text-[#333]" />
                        </div>
                        <div>
                            <div className="font-medium text-[#111]">{message.file.name}</div>
                            <div className="text-xs text-[#666]">{(message.file.size / 1024).toFixed(1)} KB • PDF Document</div>
                        </div>
                    </div>
                ) : (
                    <p className="whitespace-pre-wrap font-mono">{message.content}</p>
                )}
            </div>
        </motion.div>
    );
};

const SystemBubble = ({ message }: { message: Message }) => {

    // Animation Rendering Logic
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col items-start max-w-[80%] self-start w-full"
        >
            <div className="flex items-center gap-2 mb-1 pl-2">
                <span className="text-[10px] text-text-muted">{new Date(message.timestamp).toLocaleTimeString()}</span>
                <span className="text-[10px] uppercase tracking-widest text-primary font-bold flex items-center gap-1">
                    <Shield size={10} /> Secure Output
                </span>
            </div>

            <div className="w-full relative group">
                {/* Border Gradient */}
                <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/30 to-accent/30 rounded-2xl opacity-50 blur-[1px] group-hover:opacity-70 transition duration-500" />

                <div className="relative bg-white/80 backdrop-blur-xl border border-white/40 rounded-2xl rounded-tl-sm p-6 shadow-xl overflow-hidden min-h-[120px] flex flex-col justify-center">

                    {/* Background Grid */}
                    <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />

                    {/* STATUS: LOADING / SCANNING */}
                    {message.isLoading && (
                        <div className="flex flex-col items-center justify-center gap-4 py-8">
                            {message.stage === 'scanning' && (
                                <>
                                    <div className="relative w-16 h-16 flex items-center justify-center">
                                        <div className="absolute inset-0 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
                                        <FileText className="text-primary opacity-50" size={24} />
                                    </div>
                                    <div className="text-xs font-mono text-primary animate-pulse tracking-widest">
                                        SCANNING DOCUMENT...
                                    </div>
                                </>
                            )}
                            {message.stage !== 'scanning' && (
                                <>
                                    <div className="flex gap-1 h-4 items-center">
                                        {[0, 1, 2].map((i) => (
                                            <motion.div
                                                key={i}
                                                className="w-1.5 h-1.5 bg-primary rounded-full"
                                                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                                                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                            />
                                        ))}
                                    </div>
                                    <div className="text-xs font-mono text-primary/70 tracking-widest">
                                        TOKENIZING PII...
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* STATUS: ERROR */}
                    {message.isError && (
                        <div className="flex items-center gap-3 text-red-500">
                            <AlertCircle size={20} />
                            <p className="font-mono text-sm">Sanitization failed. Secure connection dropped.</p>
                        </div>
                    )}

                    {/* STATUS: SUCCESS (TEXT) */}
                    {!message.isLoading && !message.isError && !message.pdfUrl && message.content && (
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4 border-b border-black/5 pb-2">
                                <div className="text-[10px] font-mono text-primary flex items-center gap-2">
                                    <Lock size={10} /> ENCRYPTED · TEXT
                                </div>
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 rounded-full bg-green-500/20" />
                                    <div className="w-2 h-2 rounded-full bg-primary/20" />
                                </div>
                            </div>
                            <p className="font-mono text-sm text-[#111] leading-relaxed whitespace-pre-wrap">
                                {message.content}
                            </p>
                        </div>
                    )}

                    {/* STATUS: SUCCESS (PDF) */}
                    {!message.isLoading && !message.isError && message.pdfUrl && (
                        <div className="relative z-10 w-full">
                            <div className="flex items-center justify-between mb-6 border-b border-black/5 pb-4">
                                <div className="text-[10px] font-mono text-primary flex items-center gap-2">
                                    <Lock size={10} /> ENCRYPTED · PDF DOCUMENT
                                </div>
                                <div className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider flex items-center gap-1">
                                    <CheckCircle size={10} /> SAFE
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                {/* Thumbnail / Icon */}
                                <div className="w-20 h-24 bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300 rounded-lg flex flex-col items-center justify-center shadow-lg relative overflow-hidden group-hover:scale-105 transition-transform">
                                    <div className="absolute top-0 right-0 w-0 h-0 border-t-[12px] border-r-[12px] border-t-white/50 border-r-white/50 bg-[#333]/10" />
                                    <FileText className="text-gray-400 mb-1" size={24} />
                                    <span className="text-[8px] font-bold text-gray-500">PDF</span>
                                    {/* Scan line animation */}
                                    <motion.div
                                        className="absolute inset-0 bg-green-400/10 h-[2px] w-full"
                                        animate={{ top: ['0%', '100%'], opacity: [0, 1, 0] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                    />
                                </div>

                                {/* Metadata & Action */}
                                <div className="flex-1 space-y-3">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-gray-50 p-2 rounded border border-gray-100">
                                            <div className="text-[9px] text-gray-500 uppercase tracking-wider">Redacted Tokens</div>
                                            <div className="text-sm font-bold text-primary">{message.pdfMetadata?.tokenCount || 0}</div>
                                        </div>
                                        <div className="bg-gray-50 p-2 rounded border border-gray-100">
                                            <div className="text-[9px] text-gray-500 uppercase tracking-wider">Pages Processed</div>
                                            <div className="text-sm font-bold text-primary">{message.pdfMetadata?.pages || 0}</div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 mt-2">
                                        <a
                                            href={message.pdfUrl}
                                            download="sanitized_secure_output.pdf"
                                            className="flex-1 bg-primary text-white text-xs font-bold py-2.5 rounded-lg text-center shadow-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                            DOWNLOAD SAFE COPY
                                        </a>
                                        <button className="px-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                                            <Shield size={14} className="text-gray-600" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};


// --- Main Page Component ---

const SanitisationPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { session } = useSession();
    const [messages, setMessages] = useState<Message[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const apiClient = getApiClient();
    const autoStartedRef = useRef(false);

    // Scroll to bottom effect
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Handle auto-start from Chat.tsx
    useEffect(() => {
        if (!autoStartedRef.current && location.state && (location.state.text || location.state.file)) {
            autoStartedRef.current = true;
            handleSend(location.state.text || '', location.state.file);
            window.history.replaceState({}, document.title);
        }
    }, [location.state]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleSend = async (text: string, file?: File) => {
        if (!session.id) {
            console.error("No active session");
            return;
        }

        setIsProcessing(true);
        const processingId = generateProcessingId();

        // Local Storage: Tracking
        localStorage.setItem("last_processing_id", processingId);

        // 1. Add User Message
        const tempUserMsgId = `user-${Date.now()}`;
        const userMsg: Message = {
            id: tempUserMsgId,
            type: 'user',
            content: text,
            file: file,
            timestamp: Date.now()
        };

        // 2. Add System Placeholder (Loading)
        const tempSystemMsgId = `system-${Date.now()}`;
        const systemMsg: Message = {
            id: tempSystemMsgId,
            type: 'system',
            isLoading: true,
            stage: file ? 'scanning' : 'tokenizing',
            timestamp: Date.now() + 100 // Slightly after
        };

        setMessages(prev => [...prev, userMsg, systemMsg]);

        // 3. Store Original Prompt Locally (Privacy First)
        if (text) {
            localStorage.setItem('original_prompt', text);
            localStorage.setItem('last_session_ts', Date.now().toString());
        }

        // Store session mapping
        const sessionMapping = {
            sessionId: session.id,
            timestamp: Date.now(),
            type: file ? 'pdf' : 'text'
        };
        const sessions = JSON.parse(localStorage.getItem('sanitization_sessions') || '{}');
        sessions[processingId] = sessionMapping;
        localStorage.setItem('sanitization_sessions', JSON.stringify(sessions));

        try {
            if (file) {
                // PDF FLOW
                const response = await apiClient.sanitizePdf(session.id, processingId, file);

                // Convert ArrayBuffer to Blob URL
                const blob = new Blob([response.pdf_bytes], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);

                // Vault (handled implicitly by api.ts but good for future ref)

                setMessages(prev => prev.map(msg => {
                    if (msg.id === tempSystemMsgId) {
                        return {
                            ...msg,
                            isLoading: false,
                            pdfUrl: url,
                            // Store metadata for display
                            pdfMetadata: {
                                pages: response.pages,
                                processingTime: response.processing_time_sec,
                                tokenCount: Object.keys(response.tokens).length
                            },
                            pdfBytes: response.pdf_bytes,
                            stage: 'final'
                        };
                    }
                    return msg;
                }));

            } else {
                // TEXT FLOW
                const response = await apiClient.sanitizeText(session.id, processingId, text);

                setMessages(prev => prev.map(msg => {
                    if (msg.id === tempSystemMsgId) {
                        return {
                            ...msg,
                            isLoading: false,
                            content: response.sanitized_text,
                            stage: 'final'
                        };
                    }
                    return msg;
                }));
            }
        } catch (error) {
            console.error("Sanitization API Error:", error);
            setMessages(prev => prev.map(msg => {
                if (msg.id === tempSystemMsgId) {
                    return {
                        ...msg,
                        isLoading: false,
                        isError: true,
                        stage: 'error'
                    };
                }
                return msg;
            }));
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="w-full h-screen flex flex-col relative overflow-hidden bg-background">

            {/* BRANDING HEADER */}
            <div className="p-6 z-50 absolute top-0 left-0 w-full flex justify-between items-start pointer-events-none">
                <div className="pointer-events-auto">
                    <AestheticBranding />
                </div>
                {messages.length > 0 && (
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => navigate('/trial-room')}
                        className="pointer-events-auto px-6 py-2 bg-black text-white rounded-xl text-xs font-bold tracking-widest hover:bg-primary/90 transition-colors shadow-xl border border-white/10"
                    >
                        ENTER TRIAL ROOM →
                    </motion.button>
                )}
            </div>

            {/* CHAT AREA */}
            <div className="flex-1 h-full w-full p-6 pt-24 pb-32">
                <ChatLayout>
                    <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 scrollbar-hide flex flex-col gap-6">
                        <AnimatePresence>
                            {messages.length === 0 && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center justify-center h-[50vh] text-center px-6 m-auto"
                                >
                                    <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mb-6 border border-primary/10">
                                        <Shield size={32} className="text-primary/60" />
                                    </div>
                                    <h2 className="text-2xl font-heading font-bold text-primary mb-2">Secure Sanitization Vault</h2>
                                    <p className="text-text-muted max-w-md text-sm leading-relaxed">
                                        Upload sensitive documents or paste confidential text. <br />
                                        Our AI Firewall automatically redacts PII before it leaves this secure environment.
                                    </p>
                                </motion.div>
                            )}
                            {messages.map((msg) => (
                                msg.type === 'user' ? (
                                    <UserBubble key={msg.id} message={msg} />
                                ) : (
                                    <SystemBubble key={msg.id} message={msg} />
                                )
                            ))}
                        </AnimatePresence>
                        <div ref={messagesEndRef} />
                    </div>

                    {/* INPUT AREA (Inside ChatLayout) */}
                    <div className="p-6 pt-2 bg-gradient-to-t from-white/80 to-transparent">
                        <ChatInput onSend={handleSend} isProcessing={isProcessing} />
                    </div>
                </ChatLayout>
            </div>

        </div>
    );
};

export default SanitisationPage;