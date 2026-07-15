import React, { useState, useEffect, Suspense, lazy } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Map as MapIcon } from "lucide-react";
import type { RailNode } from "@/types";

const NodesMap = lazy(() => import("./NodesMap"));

interface NodesMapDialogProps {
  nodes: RailNode[];
  onNodeClick: (node: RailNode) => void;
}

export function NodesMapDialog({ nodes, onNodeClick }: NodesMapDialogProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
          {isMounted && (
            <Suspense fallback={<div className="flex items-center justify-center w-full h-full">Loading map...</div>}>
              <NodesMap nodes={nodes} onNodeClick={onNodeClick} />
            </Suspense>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
