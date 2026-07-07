import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, ChevronLeft, ChevronRight } from "lucide-react";
import detectionImg from "@/assets/detection-rock.jpg";

export function ImageCarousel({ alerts, index, onIndexChange, isPaused }: { alerts: any[]; index?: number; onIndexChange?: (i: number) => void; isPaused?: boolean }) {
  const [internalIndex, setInternalIndex] = useState(0);
  const currentIndex = index ?? internalIndex;
  const setIndex = (updater: (prev: number) => number) => {
    if (onIndexChange) onIndexChange(updater(currentIndex));
    else setInternalIndex(updater);
  };
  const [key, setKey] = useState(0);

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % alerts.length);
    setKey((k) => k + 1);
  };

  const handlePrev = () => {
    setIndex((prev) => (prev - 1 + alerts.length) % alerts.length);
    setKey((k) => k + 1);
  };


  if (!alerts || alerts.length === 0) {
    return (
      <div className="glass-card rounded-xl p-5 border-border flex flex-col items-center justify-center text-muted-foreground h-full min-h-[300px]">
        <Eye className="size-10 opacity-20 mb-3" />
        <p className="text-sm font-medium">No live detections</p>
      </div>
    );
  }

  const alert = alerts[currentIndex];
  const hasMultiple = alerts.length > 1;

  const toneConfig = {
    critical: {
      svgStroke: "var(--color-critical)",
      badgeBg: "bg-critical/90",
      badgeText: "text-critical-foreground",
      border: "border-critical/30",
    },
    warning: {
      svgStroke: "var(--color-warning)",
      badgeBg: "bg-warning/90",
      badgeText: "text-warning-foreground",
      border: "border-warning/30",
    },
  };
  const style = toneConfig[alert.severity as keyof typeof toneConfig] || toneConfig.critical;

  return (
    <div className={`relative glass-card rounded-xl overflow-hidden h-full min-h-[360px] flex flex-col group ${style.border}`}>
      {hasMultiple && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
          <rect
            x="1" y="1" width="calc(100% - 2px)" height="calc(100% - 2px)"
            rx="11" ry="11"
            fill="none"
            stroke={style.svgStroke}
            strokeWidth="2"
            opacity="0.15"
          />
          <rect
            key={currentIndex}
            x="1" y="1" width="calc(100% - 2px)" height="calc(100% - 2px)"
            rx="11" ry="11"
            fill="none"
            stroke={style.svgStroke}
            strokeWidth="2"
            pathLength="100"
            className="carousel-progress"
            style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
          />
        </svg>
      )}

      {hasMultiple && (
        <div className="absolute top-4 right-4 flex items-center gap-1 z-20">
          <div className="text-xs text-muted-foreground mr-2 font-medium bg-background/50 backdrop-blur-sm px-2 py-0.5 rounded">
            {currentIndex + 1} / {alerts.length}
          </div>
          <button onClick={handlePrev} className="p-1 rounded-md bg-background/50 hover:bg-background/80 backdrop-blur-sm transition-colors text-foreground">
            <ChevronLeft className="size-4" />
          </button>
          <button onClick={handleNext} className="p-1 rounded-md bg-background/50 hover:bg-background/80 backdrop-blur-sm transition-colors text-foreground">
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}

      <div className="p-5 flex-1 flex flex-col relative z-10 h-full">
        <div className="flex items-center justify-between mb-3 h-6">
          <div className="text-sm font-semibold">Detection Image</div>
          <span className="text-xs text-muted-foreground flex items-center gap-1"><Eye className="size-3" /> Live</span>
        </div>
        
        <div className="flex-1 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex flex-col"
            >
              <div className="relative rounded-lg overflow-hidden border border-border flex-1 bg-black/20">
                <img src={alert.imageUrl || detectionImg} alt={`Detected ${alert.objectCategory}`} className="w-full h-full object-cover absolute inset-0" />
                <div className={`absolute top-3 left-3 px-2 py-0.5 rounded text-xs font-bold ${style.badgeBg} ${style.badgeText}`}>{alert.objectCategory} {alert.confidence}%</div>
              </div>
              <div className="grid grid-cols-4 gap-2 mt-4 text-xs">
                <Detail label="Object" value={alert.objectCategory || "—"} />
                <Detail label="Confidence" value={`${alert.confidence}%`} />
                <Detail label="Node" value={alert.node || "—"} />
                <Detail label="Track" value={alert.line?.split(" ")[0] || "—"} />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div><div className="text-muted-foreground">{label}</div><div className="font-semibold text-foreground">{value}</div></div>;
}
