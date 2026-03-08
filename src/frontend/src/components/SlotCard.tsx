import { Badge } from "@/components/ui/badge";
import { ChevronRight, Hash, MapPin, Phone } from "lucide-react";
import { motion } from "motion/react";
import type { ParkingSlot } from "../backend.d";

interface SlotCardProps {
  slot: ParkingSlot;
  index: number;
  onClick: (slot: ParkingSlot) => void;
}

export function SlotCard({ slot, index, onClick }: SlotCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04, ease: "easeOut" }}
      data-ocid={`slot.card.${index + 1}`}
    >
      <button
        type="button"
        className="group w-full text-left cursor-pointer rounded-2xl border border-border bg-card shadow-card hover:shadow-card-hover transition-all duration-200 relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        onClick={() => onClick(slot)}
        aria-label={`View ${slot.apartmentName} slot ${slot.slotNumber}`}
      >
        {/* Top accent — green for available, transparent for taken */}
        <div
          className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
          style={{
            background: slot.isAvailable
              ? "oklch(0.58 0.14 155)"
              : "transparent",
          }}
        />

        <div className="px-5 pt-5 pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-foreground truncate leading-tight text-base group-hover:text-primary transition-colors duration-150">
                {slot.apartmentName}
              </h3>
              <div className="flex items-center gap-1.5 mt-1">
                <Hash className="w-3 h-3 text-muted-foreground shrink-0" />
                <span className="text-sm text-muted-foreground">
                  Slot {slot.slotNumber}
                </span>
              </div>
            </div>

            <div className="shrink-0 mt-0.5">
              {slot.isAvailable ? (
                <Badge className="bg-success/10 text-success border-success/25 text-xs font-semibold px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-success mr-1.5 inline-block" />
                  Available
                </Badge>
              ) : (
                <Badge className="bg-secondary text-muted-foreground border-border text-xs font-medium px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 mr-1.5 inline-block" />
                  Taken
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="px-5 pb-5 space-y-2.5">
          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
            <span className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {slot.address}
            </span>
          </div>

          {slot.description && (
            <p className="text-sm text-muted-foreground line-clamp-1 leading-relaxed pl-5 italic">
              "{slot.description}"
            </p>
          )}

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-primary font-medium truncate max-w-[170px]">
                {slot.contactInfo}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200" />
          </div>
        </div>
      </button>
    </motion.div>
  );
}
