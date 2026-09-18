import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface AISimulationProps {
    customQuery?: string;
    customResponse?: string;
}

const AISimulation = ({ customQuery, customResponse }: AISimulationProps) => {
    const [text, setText] = useState("");
    const [isTyping, setIsTyping] = useState(true);
    const fullText = customQuery || "How do I implement Clause 8.1 for ISO 27001 in a cloud-based SaaS environment?";
    const [response, setResponse] = useState("");
    const [showResponse, setShowResponse] = useState(false);

    useEffect(() => {
        let i = 0;
        if (isTyping) {
            const interval = setInterval(() => {
                setText(fullText.slice(0, i));
                i++;
                if (i > fullText.length) {
                    clearInterval(interval);
                    setTimeout(() => {
                        setIsTyping(false);
                        setShowResponse(true);
                    }, 1000);
                }
            }, 50);
            return () => clearInterval(interval);
        }
    }, [isTyping, fullText]);

    useEffect(() => {
        if (showResponse) {
            const resp = customResponse || "To implement Clause 8.1 (Operational Planning and Control) for ISO 27001 in a SaaS environment, you should focus on:\n\n1. Establishing criteria for security processes.\n2. Implementing control of the processes in accordance with the criteria.\n3. Keeping documented information to have confidence that processes have been carried out as planned.";
            let j = 0;
            const interval = setInterval(() => {
                setResponse(resp.slice(0, j));
                j++;
                if (j > resp.length) clearInterval(interval);
            }, 20);
            return () => clearInterval(interval);
        }
    }, [showResponse, customResponse]);

    return (
        <div className="w-full max-w-2xl bg-[#433ad9]/10 border border-white/10 rounded-2xl shadow-2xl overflow-hidden font-inter">
            <div className="bg-white/5 px-4 py-3 border-b border-white/5 flex items-center justify-between">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                </div>
                <div className="text-[10px] sm:text-[11px] text-gray-500 font-medium uppercase tracking-widest">Neural Interaction Layer</div>
            </div>
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 min-h-[280px] sm:min-h-[320px]">
                <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#00f0ff]/10 border border-[#00f0ff]/20 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(0,240,255,0.1)]">
                        <Image src="/Icon.png" alt="User" width={14} height={14} className="sm:w-4 sm:h-4 text-[#00f0ff]" />
                    </div>
                    <div className="bg-[#00f0ff]/5 rounded-2xl p-3 sm:p-4 text-xs sm:text-sm text-cyan-50/90 leading-relaxed border border-[#00f0ff]/20">
                        {text}
                        {isTyping && <span className="inline-block w-1 h-3 sm:h-4 ml-1 bg-[#00f0ff] animate-pulse" />}
                    </div>
                </div>

                {showResponse && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-3 sm:gap-4"
                    >
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#00f0ff]/10 border border-[#00f0ff]/20 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(0,240,255,0.1)]">
                            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00f0ff]" />
                        </div>
                        <div className="bg-[#00f0ff]/5 rounded-2xl p-3 sm:p-4 text-xs sm:text-sm text-cyan-50/90 leading-relaxed border border-[#00f0ff]/20 whitespace-pre-wrap">
                            {response}
                            {!response.endsWith(".") && <span className="inline-block w-1 h-3 sm:h-4 ml-1 bg-[#00f0ff] animate-pulse" />}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default AISimulation;
