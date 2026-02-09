
import { useState, useRef } from 'react';
import { Send, Paperclip, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatInputProps {
    onSend: (message: string, file?: File) => void;
    isProcessing?: boolean;
}

export function ChatInput({ onSend, isProcessing }: ChatInputProps) {
    const [input, setInput] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSend = () => {
        if (!input.trim() && !selectedFile) return;
        onSend(input, selectedFile || undefined);
        setInput('');
        setSelectedFile(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const clearFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative group"
            >
                {/* Glow Effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500" />

                <div className="relative flex flex-col bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-2 transition-all focus-within:ring-1 focus-within:ring-primary/20 focus-within:bg-white">

                    {/* File Badge */}
                    <AnimatePresence>
                        {selectedFile && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                animate={{ opacity: 1, height: 'auto', marginBottom: 8 }}
                                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg w-fit mx-2 mt-2"
                            >
                                <Paperclip size={14} className="text-primary" />
                                <span className="text-xs font-medium text-primary truncate max-w-[200px]">
                                    {selectedFile.name}
                                </span>
                                <button
                                    onClick={clearFile}
                                    className="p-1 hover:bg-primary/20 rounded-full transition-colors"
                                >
                                    <X size={12} className="text-primary" />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex items-end gap-2">
                        {/* Attachment Button */}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-3 text-text-muted hover:text-primary transition-colors rounded-xl hover:bg-panel-hover/50"
                            disabled={isProcessing}
                        >
                            <Paperclip size={20} />
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            className="hidden"
                            accept=".pdf"
                        />

                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={isProcessing ? "Processing..." : "Type or upload a PDF to sanitise..."}
                            disabled={isProcessing}
                            className="flex-1 max-h-32 min-h-[48px] py-3 px-3 bg-transparent border-none text-text placeholder:text-text-muted/50 focus:ring-0 resize-none font-ui text-base leading-relaxed disabled:opacity-50"
                            rows={1}
                        />

                        <button
                            onClick={handleSend}
                            disabled={(!input.trim() && !selectedFile) || isProcessing}
                            className="p-3 bg-primary text-white rounded-xl hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg active:scale-95 m-1"
                        >
                            {isProcessing ? (
                                <div className="w-[18px] h-[18px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Send size={18} />
                            )}
                        </button>
                    </div>
                </div>

                <div className="mt-2 text-center text-[10px] text-text-muted uppercase tracking-widest font-mono opacity-60">
                    Encrypted Session • VaultSim v2.0
                </div>
            </motion.div>
        </div>
    );
}
