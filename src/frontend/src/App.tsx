import { ParkingMap } from "@/components/ParkingMap";
import { PostSpaceModal } from "@/components/PostSpaceModal";
import { SlotCard } from "@/components/SlotCard";
import { SlotDetailModal } from "@/components/SlotDetailModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useGetSlotCount,
  useGetSlots,
  useSeedDemoSlots,
} from "@/hooks/useQueries";
import { Car, List, Map as MapIcon, Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import type { ParkingSlot } from "./backend.d";
import { useActor } from "./hooks/useActor";

export default function App() {
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [seeded, setSeeded] = useState(false);

  const { actor, isFetching: actorFetching } = useActor();
  const slotCountQuery = useGetSlotCount();
  const slotsQuery = useGetSlots(onlyAvailable);
  const seedDemoSlots = useSeedDemoSlots();

  // Seed demo data on first load if no slots exist
  useEffect(() => {
    if (
      !seeded &&
      !actorFetching &&
      actor &&
      slotCountQuery.data !== undefined &&
      slotCountQuery.data === BigInt(0) &&
      !seedDemoSlots.isPending
    ) {
      setSeeded(true);
      seedDemoSlots.mutate();
    }
  }, [seeded, actorFetching, actor, slotCountQuery.data, seedDemoSlots]);

  const handleViewDetails = useCallback((slot: ParkingSlot) => {
    setSelectedSlot(slot);
    setDetailModalOpen(true);
  }, []);

  const handleDetailModalClose = (open: boolean) => {
    setDetailModalOpen(open);
    if (!open) {
      setTimeout(() => setSelectedSlot(null), 300);
    }
  };

  const slots = slotsQuery.data ?? [];
  const isLoading =
    slotsQuery.isLoading || seedDemoSlots.isPending || actorFetching;
  const availableCount = slots.filter((s) => s.isAvailable).length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <img
                src="/assets/generated/parkiva-logo-transparent.dim_200x200.png"
                alt="Parkiva logo"
                className="w-9 h-9 object-contain"
              />
              <div>
                <span className="font-bold text-xl tracking-tight text-foreground leading-none">
                  Parkiva
                </span>
                <p className="hidden sm:block text-xs text-muted-foreground leading-none mt-0.5">
                  Find or share a parking spot in your building
                </p>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {availableCount > 0 && !isLoading && (
                <Badge className="hidden sm:inline-flex bg-success/10 text-success border-success/25 text-xs font-medium">
                  {availableCount} open{" "}
                  {availableCount === 1 ? "spot" : "spots"}
                </Badge>
              )}
              <Button
                onClick={() => setPostModalOpen(true)}
                className="bg-primary text-primary-foreground font-semibold hover:bg-primary/90 gap-1.5 rounded-xl shadow-sm"
                size="sm"
                data-ocid="header.post_space_button"
              >
                <Plus className="w-4 h-4" />
                <span>Share My Space</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        <Tabs defaultValue="map" className="flex-1 flex flex-col">
          {/* Sticky tab/filter bar */}
          <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex items-center justify-between py-3">
                {/* Tabs */}
                <TabsList className="bg-secondary rounded-xl p-1 h-9 gap-0.5">
                  <TabsTrigger
                    value="map"
                    className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm text-muted-foreground rounded-lg h-7 px-3 text-sm font-medium gap-1.5 transition-all"
                    data-ocid="map_view.tab"
                  >
                    <MapIcon className="w-3.5 h-3.5" />
                    Map
                  </TabsTrigger>
                  <TabsTrigger
                    value="list"
                    className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm text-muted-foreground rounded-lg h-7 px-3 text-sm font-medium gap-1.5 transition-all"
                    data-ocid="list_view.tab"
                  >
                    <List className="w-3.5 h-3.5" />
                    List
                    {!isLoading && slots.length > 0 && (
                      <span className="ml-0.5 text-xs text-muted-foreground">
                        {slots.length}
                      </span>
                    )}
                  </TabsTrigger>
                </TabsList>

                {/* Filter toggle */}
                <div
                  className="flex items-center gap-2"
                  data-ocid="slots.filter.toggle"
                >
                  <Switch
                    id="availableFilter"
                    checked={onlyAvailable}
                    onCheckedChange={setOnlyAvailable}
                    className="data-[state=checked]:bg-success scale-90"
                  />
                  <Label
                    htmlFor="availableFilter"
                    className="text-xs font-medium text-muted-foreground cursor-pointer select-none whitespace-nowrap"
                  >
                    {onlyAvailable ? "Available only" : "Show all"}
                  </Label>
                </div>
              </div>
            </div>
          </div>

          {/* Map View */}
          <TabsContent
            value="map"
            className="flex-1 m-0 data-[state=inactive]:hidden"
          >
            <div className="relative" style={{ height: "calc(100vh - 120px)" }}>
              {isLoading ? (
                <div className="absolute inset-0 bg-secondary flex flex-col items-center justify-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
                    <MapIcon className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Loading spots nearby…
                  </p>
                </div>
              ) : (
                <ParkingMap slots={slots} onViewDetails={handleViewDetails} />
              )}

              {/* Legend overlay */}
              {!isLoading && (
                <div className="absolute bottom-6 left-4 z-[1000] bg-white/92 backdrop-blur-sm border border-border rounded-2xl p-3 shadow-card space-y-1.5">
                  <p className="text-xs font-semibold text-foreground">
                    Spaces
                  </p>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: "oklch(0.58 0.14 155)" }}
                    />
                    <span className="text-xs text-muted-foreground">
                      Available
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: "oklch(0.72 0.01 80)" }}
                    />
                    <span className="text-xs text-muted-foreground">Taken</span>
                  </div>
                </div>
              )}

              {/* Slot count badge */}
              {!isLoading && slots.length > 0 && (
                <div className="absolute top-4 right-4 z-[1000]">
                  <Badge className="bg-white/92 backdrop-blur-sm text-foreground border-border text-xs shadow-card font-medium">
                    <Car className="w-3 h-3 mr-1.5 text-muted-foreground" />
                    {slots.length} {slots.length === 1 ? "space" : "spaces"}{" "}
                    listed
                  </Badge>
                </div>
              )}
            </div>
          </TabsContent>

          {/* List View */}
          <TabsContent
            value="list"
            className="flex-1 m-0 data-[state=inactive]:hidden"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
              {isLoading ? (
                <div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                  data-ocid="slots.loading_state"
                >
                  {["s1", "s2", "s3", "s4", "s5", "s6"].map((key) => (
                    <div
                      key={key}
                      className="space-y-3 p-5 rounded-2xl border border-border bg-card shadow-card"
                    >
                      <Skeleton className="h-5 w-3/4 bg-secondary rounded-lg" />
                      <Skeleton className="h-4 w-1/2 bg-secondary rounded-lg" />
                      <Skeleton className="h-4 w-full bg-secondary rounded-lg" />
                      <Skeleton className="h-4 w-2/3 bg-secondary rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : slots.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center justify-center py-24 gap-5 text-center"
                  data-ocid="slots.empty_state"
                >
                  <div className="w-20 h-20 rounded-3xl bg-primary/8 flex items-center justify-center">
                    <Car className="w-9 h-9 text-primary/60" />
                  </div>
                  <div className="space-y-2 max-w-sm">
                    <h3 className="text-lg font-semibold text-foreground">
                      {onlyAvailable
                        ? "No open spots right now"
                        : "No parking spaces listed yet"}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {onlyAvailable
                        ? "Try switching to show all spaces, or check back soon — new spots get listed throughout the day."
                        : "No parking spaces listed yet. Be the first to share yours!"}
                    </p>
                  </div>
                  {!onlyAvailable && (
                    <Button
                      onClick={() => setPostModalOpen(true)}
                      className="bg-primary text-primary-foreground font-semibold hover:bg-primary/90 gap-2 rounded-xl mt-1"
                    >
                      <Plus className="w-4 h-4" />
                      Share My Space
                    </Button>
                  )}
                </motion.div>
              ) : (
                <div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                  data-ocid="slots.list"
                >
                  <AnimatePresence>
                    {slots.map((slot, index) => (
                      <SlotCard
                        key={slot.id.toString()}
                        slot={slot}
                        index={index}
                        onClick={handleViewDetails}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <p className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Parkiva. Built with{" "}
            <span style={{ color: "oklch(0.65 0.18 25)" }}>♥</span> using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-colors font-medium"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>

      {/* Modals */}
      <PostSpaceModal open={postModalOpen} onOpenChange={setPostModalOpen} />
      <SlotDetailModal
        slot={selectedSlot}
        open={detailModalOpen}
        onOpenChange={handleDetailModalClose}
      />
    </div>
  );
}
