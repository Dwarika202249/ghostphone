'use client';
import { useDeviceStore } from '@/store/useDeviceStore';
import { Terminal, Activity, Wifi, Battery } from 'lucide-react';
import { useEffect, useRef } from 'react';

export default function TelemetryFeed() {
    const { liveFeed } = useDeviceStore();
    const feedEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new feed item
    useEffect(() => {
        feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [liveFeed]);

    return (
        <div className="bg-[#0a0a0a] border border-zinc-800 rounded-lg flex flex-col h-100 overflow-hidden shadow-2xl relative">
            <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-3 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-500" />
                    <h2 className="text-sm font-bold font-mono text-zinc-100 uppercase tracking-wider">Live Telemetry Ingestion</h2>
                </div>
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-2 custom-scrollbar">
                {liveFeed.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-zinc-600 italic">
                        Waiting for telemetry payload...
                    </div>
                ) : (
                    liveFeed.map((log, i) => (
                        <div key={i} className="flex flex-col border-b border-zinc-800/50 pb-2 mb-2 last:border-0 last:pb-0 last:mb-0 animate-in slide-in-from-left duration-300">
                            <div className="text-emerald-500/80 mb-1">[{new Date(log.time).toISOString()}]</div>
                            <div className="text-zinc-300 grid grid-cols-2 gap-x-4 gap-y-1">
                                <span className="flex items-center gap-2"><Activity className="w-3 h-3 text-blue-400" /> LOC: {log.lat.toFixed(5)}, {log.lng.toFixed(5)}</span>
                                <span className="flex items-center gap-2"><Battery className="w-3 h-3 text-yellow-400" /> BAT: {log.battery}%</span>
                                <span className="flex items-center gap-2"><Wifi className="w-3 h-3 text-purple-400" /> NET: {log.network_type}</span>
                            </div>
                        </div>
                    ))
                )}
                <div ref={feedEndRef} />
            </div>
        </div>
    );
}
