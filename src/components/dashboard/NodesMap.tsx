import React, { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { RailNode } from "@/types";

const STATUS_DOT: Record<string, string> = {
  normal: "bg-success",
  warning: "bg-warning",
  critical: "bg-critical animate-pulse",
  offline: "bg-muted-foreground/50",
};

interface NodesMapProps {
  nodes: RailNode[];
  onNodeClick: (node: RailNode) => void;
}

export default function NodesMap({ nodes, onNodeClick }: NodesMapProps) {
  const center = useMemo(() => {
    if (nodes.length === 0) return [10.8505, 76.2711] as [number, number]; // Default to Kerala
    const lats = nodes.map((n) => n.gps.lat);
    const lngs = nodes.map((n) => n.gps.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    return [(minLat + maxLat) / 2, (minLng + maxLng) / 2] as [number, number];
  }, [nodes]);

  const createIcon = (status: string) => {
    const colorClass = STATUS_DOT[status] || STATUS_DOT.offline;
    return L.divIcon({
      className: "bg-transparent border-none",
      html: `<div class="size-4 rounded-full ring-4 ring-background shadow-lg ${colorClass}"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
  };

  return (
    <MapContainer 
      center={center} 
      zoom={8} 
      minZoom={7}
      maxBounds={[[8.0, 74.5], [13.0, 78.0]]}
      maxBoundsViscosity={1.0}
      className="w-full h-full z-0" 
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      <TileLayer
        attribution='&copy; <a href="https://www.openrailwaymap.org/">OpenRailwayMap</a> contributors'
        url="https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png"
      />
      {nodes.map((node) => (
        <Marker
          key={node.id}
          position={[node.gps.lat, node.gps.lng]}
          icon={createIcon(node.status)}
          eventHandlers={{
            click: () => onNodeClick(node),
          }}
        >
          <Tooltip>
            <div className="text-sm font-semibold">{node.id}</div>
            <div className="text-xs text-muted-foreground capitalize">Status: {node.status}</div>
          </Tooltip>
        </Marker>
      ))}
    </MapContainer>
  );
}
