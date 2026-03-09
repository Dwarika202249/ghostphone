'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useDeviceStore } from '@/store/useDeviceStore';
import L from 'leaflet';

// Fix for default Leaflet markers in Next.js
const defaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

export default function LiveMap() {
    const { path } = useDeviceStore();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return <div className="w-full h-full bg-zinc-900 animate-pulse rounded-lg border border-zinc-800"></div>;

    const positions: [number, number][] = path.map(p => [p.lat, p.lng]);
    const currentPosition = positions.length > 0 ? positions[positions.length - 1] : [37.7749, -122.4194]; // Default to SF

    return (
        <div className="w-full h-full rounded-lg overflow-hidden border border-zinc-800 shadow-2xl z-0 relative">
            <MapContainer
                center={currentPosition as L.LatLngExpression}
                zoom={14}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {positions.length > 1 && (
                    <Polyline
                        positions={positions}
                        pathOptions={{ color: '#10b981', weight: 3, opacity: 0.7, dashArray: '5, 10' }}
                    />
                )}

                {positions.length > 0 && (
                    <>
                        <Circle
                            center={currentPosition as L.LatLngExpression}
                            radius={150} // 150m accuracy circle
                            pathOptions={{ fillColor: '#3b82f6', fillOpacity: 0.2, color: '#3b82f6', weight: 1 }}
                        />
                        <Marker position={currentPosition as L.LatLngExpression}>
                            <Popup className="font-mono text-xs">
                                Current Location <br />
                                {currentPosition[0].toFixed(5)}, {currentPosition[1].toFixed(5)}
                            </Popup>
                        </Marker>
                    </>
                )}
            </MapContainer>
        </div>
    );
}
