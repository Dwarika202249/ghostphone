import { useState } from 'react';
import { useDeviceStore } from '@/store/useDeviceStore';
import { authenticatedClient } from '@/lib/api';
import { ShieldAlert, ShieldCheck, Loader2 } from 'lucide-react';

export default function ActionPanel() {
    const { id, apiKey, isStolen, setStolenStatus } = useDeviceStore();
    const [loading, setLoading] = useState(false);

    const toggleStolen = async () => {
        if (!id || !apiKey) return;
        setLoading(true);
        try {
            const client = authenticatedClient(id, apiKey);
            const res = await client.post(`/devices/${id}/status`, {
                is_stolen: !isStolen
            });
            setStolenStatus(res.data.is_stolen);
        } catch (error) {
            console.error("Failed to update status", error);
            alert("Failed to update device status. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full shadow-2xl">
            <h2 className="text-xl font-bold font-mono text-zinc-100 mb-2">Command & Control</h2>
            <p className="text-sm text-zinc-400 mb-6">Manage the active tracking mode for the selected GhostPhone.</p>

            <button
                onClick={toggleStolen}
                disabled={loading}
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-md font-semibold transition-all duration-300 ${isStolen
                        ? 'bg-red-600/10 text-red-500 hover:bg-red-600/20 shadow-[0_0_15px_rgba(220,38,38,0.2)] border border-red-500/50'
                        : 'bg-emerald-600/10 text-emerald-500 hover:bg-emerald-600/20 border border-emerald-500/50'
                    }`}
            >
                {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : isStolen ? (
                    <><ShieldAlert className="w-5 h-5" /> RECOVER DEVICE (CANCEL STOLEN MODE)</>
                ) : (
                    <><ShieldCheck className="w-5 h-5" /> MARK AS STOLEN (HIGH PING MODE)</>
                )}
            </button>
        </div>
    );
}
