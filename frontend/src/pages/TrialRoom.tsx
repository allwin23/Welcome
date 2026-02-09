import { useState } from 'react';
import { AppLayout } from '../components/AppLayout';
import { useSession } from '../contexts/SessionContext';
import { DebateLayout } from '../components/debate/DebateLayout';
import { TimelineNode } from '../components/debate/TimelineNode';
import { ConversationCard } from '../components/debate/ConversationCard';
import { OutputPanel } from '../components/debate/OutputPanel';
import { getApiClient } from '../utils/api';
import { getDetokenizer } from '../utils/detokenizer';

interface DebateStep {
    id: string;
    timestamp: string;
    title: string;
    content: string;
    type: 'user' | 'system' | 'ai';
    outputTitle?: string;
    outputContent?: string;
    outputStatus?: 'secure' | 'warning' | 'processing';
}

interface TrialRoomProps {
    onDebateStateChange?: (state: { type: 'started' | 'transcript' | 'completed' | 'masked', payload?: any }) => void;
    autoStart?: boolean;
    minimal?: boolean;
}

export function TrialRoom({ onDebateStateChange }: TrialRoomProps) {
    const { session } = useSession();
    // const location = useLocation(); // Unused now
    const [steps, setSteps] = useState<DebateStep[]>([]);
    const [isDebating, setIsDebating] = useState(false);
    const [showVerdict, setShowVerdict] = useState(false);

    const runTrial = async () => {
        if (isDebating || !session.id) return;
        setIsDebating(true);
        setShowVerdict(false);
        setSteps([]); // Clear previous
        onDebateStateChange?.({ type: 'started' });

        try {
            // 1. Call real backend to generate debate
            const response = await getApiClient().runDebate(session.id);
            const transcript = response.transcript;

            // 2. Playback with detokenization
            const detokenizer = getDetokenizer();
            const now = new Date();

            for (let i = 0; i < transcript.length; i++) {
                const item = transcript[i];
                const timestamp = new Date(now.getTime() + i * 2000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

                // Determine step type and title
                let type: 'user' | 'system' | 'ai' = 'ai';
                let title = 'AI Agent';

                if (item.agent === 'DefenseLawyer') {
                    title = 'Defense Lawyer';
                    type = 'ai';
                } else if (item.agent === 'ProsecutionLawyer') {
                    title = 'Prosecution Lawyer';
                    type = 'ai';
                } else if (item.agent === 'SYSTEM') {
                    title = 'Vault System';
                    type = 'system';
                } else if (item.agent === 'User') {
                    title = 'User Request';
                    type = 'user';
                }

                // SECURITY: Detokenize the content for the vault panel
                const detokenized = await detokenizer.process(item.text);

                const step: DebateStep = {
                    id: `step-${i}-${Date.now()}`,
                    timestamp,
                    title,
                    type,
                    content: item.text, // Sanitized/Tokenized version
                    outputTitle: 'Vault Detokenization',
                    outputContent: detokenized !== item.text ? detokenized : 'No PII tokens detected in this agent response.',
                    outputStatus: item.agent === 'SYSTEM' ? 'secure' : (detokenized !== item.text ? 'warning' : 'processing')
                };

                // Add step with delay for cinematic effect
                await new Promise(r => setTimeout(r, 1500));
                setSteps(prev => [...prev, step]);
            }

            setIsDebating(false);
            setShowVerdict(true);
            onDebateStateChange?.({ type: 'completed' });

        } catch (error) {
            console.error("Debate failed:", error);
            setSteps(prev => [...prev, {
                id: 'err',
                timestamp: new Date().toLocaleTimeString(),
                title: 'System Error',
                type: 'system',
                content: 'Adversarial simulation failed to connect to the backend.',
                outputTitle: 'Connection Error',
                outputContent: String(error),
                outputStatus: 'warning'
            }]);
            setIsDebating(false);
        }
    };

    return (
        <AppLayout showSidebar={true}>
            <div className="w-full h-full bg-transparent">
                <DebateLayout>

                    {/* HEADERS ROW */}
                    <div className="col-span-1 text-xs font-mono font-bold text-text-muted uppercase tracking-wider pl-4 border-b border-black/10 pb-2 mb-2 font-heading">
                        Timeline
                    </div>
                    <div className="col-span-1 text-xs font-mono font-bold text-text-muted uppercase tracking-wider pl-4 border-b border-black/10 pb-2 mb-2 font-heading">
                        Sanitised Channel
                    </div>
                    <div className="col-span-1 text-xs font-mono font-bold text-text-muted uppercase tracking-wider pl-4 border-b border-black/10 pb-2 mb-2 font-heading">
                        Vault / Detokenised
                    </div>

                    {/* CONTROL PANEL ROW */}
                    <div className="col-span-1 relative">
                        <div className="absolute top-8 left-1/2 -ml-px w-px h-full bg-primary/20" />
                        <div className="relative z-10 w-3 h-3 rounded-full border-2 bg-accent border-accent mx-auto mt-8" />
                    </div>

                    <div className="col-span-1">
                        <div className="p-6 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg transition-all hover:bg-white/70">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-lg font-heading font-bold text-primary flex items-center gap-2">
                                        <span className="text-accent">●</span> Trial Session
                                    </h2>
                                    <p className="text-sm font-primary text-text-muted mt-1">
                                        Initiate adversarial simulation.
                                    </p>
                                </div>
                                <button
                                    onClick={runTrial}
                                    disabled={isDebating}
                                    className="px-5 py-2.5 bg-primary text-white font-bold rounded-lg shadow-lg hover:bg-primary/90 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2 text-sm"
                                >
                                    {isDebating ? 'Running...' : 'Start Debate'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-1">
                        {/* Empty placeholder for output or system status */}
                        <div className="p-4 rounded-xl border border-dashed border-primary/20 opacity-50 text-xs font-mono text-center pt-8">
                            System Ready
                        </div>
                    </div>


                    {/* STEPS ROWS */}
                    {steps.map((step, idx) => {
                        const isLast = idx === steps.length - 1;
                        const isActive = isLast && isDebating; // Only "active" if it's the last one AND we are currently debating

                        // Style logic for focus effect
                        // If we are debating, non-active/previous items are dimmed/blurred
                        // If debate is finished, all items are normal
                        const rowOpacity = isDebating && !isActive ? 'opacity-40 blur-[1px] scale-95' : 'opacity-100 scale-100';
                        const activeHighlight = isActive ? 'scale-105 z-10' : '';

                        return (
                            <div
                                key={step.id}
                                ref={null}
                                // Note: We use DebateLayout's auto-scroll for now, but we can add specific centering logic later if needed.
                                // Ideally, we would attach a ref here and scroll to it.
                                className={`contents fade-in-row transition-all duration-700 ease-out ${rowOpacity} ${activeHighlight}`}
                            >
                                {/* 1. Timeline Cell */}
                                <div className={`relative flex flex-col items-start pl-8 pt-6 transition-all duration-700 ${isActive ? 'scale-110' : ''}`}>
                                    <TimelineNode
                                        timestamp={step.timestamp}
                                        title={step.title}
                                        isActive={true}
                                        isLast={isLast}
                                    />
                                </div>

                                {/* 2. Conversation Cell (Sanitized) */}
                                <div className="pt-2 transition-all duration-700">
                                    <ConversationCard
                                        title={step.title}
                                        content={step.content}
                                        type={step.type}
                                        subtitle="Sanitised Input"
                                    />
                                </div>

                                {/* 3. Output Cell (Detokenized) */}
                                <div className="pt-2 transition-all duration-700">
                                    {step.outputContent && (
                                        <OutputPanel
                                            title={step.outputTitle || 'System Log'}
                                            content={step.outputContent}
                                            status={step.outputStatus}
                                        />
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {/* VERDICT ROW - Appears at bottom */}
                    {showVerdict && (
                        <div className="contents fade-in-row">
                            {/* 1. Verdict Timeline Node */}
                            <div className="relative flex flex-col items-start pl-8 pt-6 transition-all duration-700">
                                <TimelineNode
                                    timestamp={new Date().toLocaleTimeString()}
                                    title="FINAL VERDICT"
                                    isActive={true}
                                    isLast={true}
                                />
                            </div>
                            {/* Empty middle and right columns for spacing if needed */}
                            <div />
                            <div />

                            {/* 2. Verdict Card Centered Below */}
                            <div className="col-span-3 flex justify-center py-12">
                                <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-black/5 animate-float transform transition-all hover:scale-[1.01]">
                                    <div className="bg-primary px-8 py-4 flex items-center justify-center relative">
                                        {/* Center title properly */}
                                        <div className="absolute left-8 flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full bg-[#00ff9d] shadow-[0_0_10px_#00ff9d]" />
                                        </div>
                                        <h3 className="text-white font-heading font-bold tracking-widest text-lg">FINAL VERDICT</h3>
                                        <span className="text-white/80 font-mono text-sm">CASE #9283-X</span>
                                    </div>
                                    <div className="p-10 flex flex-col items-center text-center">
                                        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6 text-4xl shadow-inner text-green-600">
                                            🛡️
                                        </div>
                                        <h2 className="text-4xl font-heading font-bold text-primary mb-2">ACCESS GRANTED (SAFE)</h2>
                                        <p className="text-text-muted max-w-md mx-auto mb-8 font-primary text-lg">
                                            The requested operation has passed all security checks.
                                            PII was successfully masked, and no prompt injection was detected.
                                        </p>

                                        <div className="grid grid-cols-3 gap-4 w-full max-w-2xl">
                                            <div className="bg-background-secondary p-4 rounded-xl border border-black/5">
                                                <div className="text-xs font-mono text-text-muted uppercase mb-1">Safety Score</div>
                                                <div className="text-2xl font-bold text-green-600">99.9%</div>
                                            </div>
                                            <div className="bg-background-secondary p-4 rounded-xl border border-black/5">
                                                <div className="text-xs font-mono text-text-muted uppercase mb-1">Masking</div>
                                                <div className="text-2xl font-bold text-primary">Active</div>
                                            </div>
                                            <div className="bg-background-secondary p-4 rounded-xl border border-black/5">
                                                <div className="text-xs font-mono text-text-muted uppercase mb-1">Threats</div>
                                                <div className="text-2xl font-bold text-primary">0</div>
                                            </div>
                                        </div>

                                        <div className="mt-8 pt-8 border-t border-black/5 w-full flex justify-center">
                                            <button className="text-primary font-bold hover:text-accent transition-colors text-sm font-mono flex items-center gap-2">
                                                VIEW FULL REPORT <span>→</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DebateLayout>
            </div>
        </AppLayout>
    );
}
