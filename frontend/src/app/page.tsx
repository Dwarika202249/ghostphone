'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useDeviceStore } from '@/store/useDeviceStore';
import { authenticatedClient } from '@/lib/api';
import TelemetryFeed from '@/components/TelemetryFeed';
import ActionPanel from '@/components/ActionPanel';
import { Activity, Shield, Smartphone, RefreshCw } from 'lucide-react';

// Dynamically import LiveMap with SSR disabled to prevent Leaflet 'window is not defined' error
const LiveMap = dynamic(() => import('@/components/LiveMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center text-zinc-500 font-mono animate-pulse">MAP INITIALIZING...</div>
});

export default function DashboardPage() {
  const { id, apiKey, setPath, addLiveFeedItem, path } = useDeviceStore();
  const [loading, setLoading] = useState(true);

  const fetchHistoricalPath = async () => {
    if (!id || !apiKey) return;
    try {
      setLoading(true);
      const client = authenticatedClient(id, apiKey);
      const res = await client.get(`/devices/${id}/path`);

      const newPath = res.data.path;
      setPath(newPath);

      // Seed live feed with latest coordinates if they exist
      if (newPath.length > 0) {
        addLiveFeedItem({
          ...newPath[newPath.length - 1],
          battery: 89, // Mocking these since we didn't fetch them in path
          network_type: 'Unknown',
          trigger_source: 'Startup Sync'
        });
      }
    } catch (e) {
      console.error("Failed to fetch path", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoricalPath();
    // Simulate real-time polling or websocket connection
    const interval = setInterval(() => {
      // In a real app we'd fetch new points here every few seconds or use WebSockets.
      // For now, this is static until we inject data.
    }, 10000);

    return () => clearInterval(interval);
  }, [id, apiKey]);

  return (
    <div className="flex flex-col h-screen max-h-screen p-4 md:p-6 gap-6 w-full max-w-400 mx-auto overflow-hidden">

      {/* HEADER */}
      <header className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center shadow-lg">
            <Shield className="text-emerald-500 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-linear-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">GHOSTPHONE C2</h1>
            <p className="font-mono text-xs text-zinc-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
              SYSTEM ONLINE
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-zinc-900/80 border border-zinc-800 px-4 py-2 rounded-lg flex items-center gap-3 font-mono text-xs shadow-inner">
            <Smartphone className="w-4 h-4 text-zinc-400" />
            <div className="flex flex-col">
              <span className="text-zinc-500">TARGET NODE</span>
              <span className="text-zinc-200">{id?.split('-')[0]}...</span>
            </div>
          </div>
          <button
            onClick={fetchHistoricalPath}
            title="Refresh device path"
            aria-label="Refresh device path"
            className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-emerald-400"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
          </button>
        </div>
      </header>

      {/* DASHBOARD GRID */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">

        {/* LEFT COLUMN: Map taking up 2/3 width on large screens */}
        <div className="lg:col-span-2 h-125 lg:h-full flex flex-col min-h-0 relative group">
          <LiveMap />
          <div className="absolute top-4 left-4 z-400 bg-black/80 backdrop-blur-md border border-zinc-800 p-3 rounded-lg font-mono text-xs shadow-2xl pointer-events-none">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-3 h-3 text-cyan-400" />
              <span className="text-zinc-300 font-bold">TELEMETRY LOCK</span>
            </div>
            <div className="flex justify-between gap-6 text-zinc-500">
              <span>WAYPOINTS</span>
              <span className="text-zinc-300">{path.length}</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Feed and Controls taking up 1/3 width */}
        <div className="flex flex-col gap-6 h-full min-h-0 overflow-y-auto pr-2 custom-scrollbar">
          <ActionPanel />
          <TelemetryFeed />
        </div>

      </div>
    </div>
  );
}
