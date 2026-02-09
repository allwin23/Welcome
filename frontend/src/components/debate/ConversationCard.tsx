
import { motion } from 'framer-motion';

interface ConversationCardProps {
    title?: string;
    subtitle?: string;
    content: string;
    type?: 'user' | 'system' | 'ai';
}

export function ConversationCard({ title = "Vault", subtitle, content, type = 'ai' }: ConversationCardProps) {
    const isUser = type === 'user';

    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`
                relative overflow-hidden
                w-full mb-6 p-6 
                rounded-2xl border 
                backdrop-blur-xl shadow-xl
                transition-all duration-500
                ${isUser
                    ? 'bg-primary/5 border-primary/10 text-text ml-auto max-w-[90%]'
                    : 'bg-white/80 border-white/20 text-text mr-auto max-w-full'
                }
            `}
        >
            {/* Glossy Overlay for 'Glass' feel */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />

            {/* Header */}
            {!isUser && (
                <div className="relative flex justify-between items-center mb-3 pb-2 border-b border-black/5">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                        <span className="font-heading font-bold text-primary tracking-wide text-sm uppercase">
                            {title}
                        </span>
                    </div>
                    {subtitle && (
                        <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest">
                            {subtitle}
                        </span>
                    )}
                </div>
            )}

            {/* Content */}
            <div className={`relative font-primary text-lg leading-relaxed ${isUser ? 'italic text-right text-text/80' : 'text-text'}`}>
                {content}
            </div>
        </motion.div>
    );
}
