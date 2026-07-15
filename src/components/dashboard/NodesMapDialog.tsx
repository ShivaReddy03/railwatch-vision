import React, { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Map as MapIcon } from "lucide-react";
import type { RailNode } from "@/types";
import { cn } from "@/lib/utils";

const STATUS_DOT: Record<string, string> = {
  normal: "bg-success",
  warning: "bg-warning",
  critical: "bg-critical animate-pulse",
  offline: "bg-muted-foreground/50",
};

interface NodesMapDialogProps {
  nodes: RailNode[];
  onNodeClick: (node: RailNode) => void;
}

export function NodesMapDialog({ nodes, onNodeClick }: NodesMapDialogProps) {
  const center = useMemo(() => {
    if (nodes.length === 0) return [20.5937, 78.9629] as [number, number]; // Default to India center
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
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 ml-auto">
          <MapIcon className="size-4" />
          <span>View Map</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[90vw] w-[1200px] h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 border-b">
          <DialogTitle>Live Track Map</DialogTitle>
        </DialogHeader>
        <div className="flex-1 relative bg-muted/20">
          <MapContainer center={center} zoom={6} className="w-full h-full z-0" scrollWheelZoom={true}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
