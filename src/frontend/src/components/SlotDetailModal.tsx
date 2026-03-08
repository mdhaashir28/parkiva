import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useDeleteSlot, useToggleAvailability } from "@/hooks/useQueries";
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  Hash,
  Loader2,
  Lock,
  MapPin,
  Phone,
  Trash2,
  Unlock,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { ParkingSlot } from "../backend.d";

interface SlotDetailModalProps {
  slot: ParkingSlot | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}

export function SlotDetailModal({
  slot,
  open,
  onOpenChange,
  onDeleted,
}: SlotDetailModalProps) {
  const [pin, setPin] = useState("");
  const [pinUnlocked, setPinUnlocked] = useState(false);
  const [pinError, setPinError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const toggleAvailability = useToggleAvailability();
  const deleteSlot = useDeleteSlot();

  const handleClose = () => {
    setPin("");
    setPinUnlocked(false);
    setPinError("");
    setShowDeleteConfirm(false);
    onOpenChange(false);
  };

  const handlePinSubmit = () => {
    if (!slot) return;
    if (pin === slot.ownerPin) {
      setPinUnlocked(true);
      setPinError("");
    } else {
      setPinError("That PIN doesn't match. Double-check and try again.");
      setPinUnlocked(false);
    }
  };

  const handleToggleAvailability = async () => {
    if (!slot) return;
    try {
      await toggleAvailability.mutateAsync({ slotId: slot.id, ownerPin: pin });
      toast.success(
        slot.isAvailable
          ? "Space marked as taken — thanks for keeping it up to date!"
          : "Great, your space is available again!",
      );
      handleClose();
    } catch {
      toast.error("Couldn't update the space. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!slot) return;
    try {
      await deleteSlot.mutateAsync({ slotId: slot.id, ownerPin: pin });
      toast.success("Your listing has been removed.");
      setShowDeleteConfirm(false);
      handleClose();
      onDeleted?.();
    } catch {
      toast.error("Couldn't remove the listing. Please try again.");
    }
  };

  const formatDate = (timestamp: bigint) => {
    const ms = Number(timestamp) / 1_000_000;
    return new Date(ms).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!slot) return null;

  const isBusy = toggleAvailability.isPending || deleteSlot.isPending;

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent
          className="max-w-md w-full bg-card border-border rounded-2xl shadow-modal max-h-[90vh] overflow-y-auto"
          data-ocid="slot_detail.modal"
        >
          {/* Close button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="absolute top-4 right-4 h-8 w-8 p-0 hover:bg-secondary rounded-lg z-10"
            data-ocid="slot_detail.close_button"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </Button>

          <DialogHeader className="pb-1 pr-10">
            <DialogTitle className="text-xl font-bold text-foreground leading-snug">
              {slot.apartmentName}
            </DialogTitle>
          </DialogHeader>

          {/* Availability badge */}
          <div className="flex items-center gap-2 -mt-1">
            {slot.isAvailable ? (
              <Badge className="bg-success/10 text-success border-success/25 font-medium px-3 py-1 text-xs rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-success mr-2 inline-block" />
                Open — this space is available
              </Badge>
            ) : (
              <Badge className="bg-secondary text-muted-foreground border-border font-medium px-3 py-1 text-xs rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground mr-2 inline-block" />
                Currently taken
              </Badge>
            )}
          </div>

          <Separator className="bg-border" />

          {/* Details */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <Hash className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Slot </span>
                <span className="font-semibold text-foreground">
                  {slot.slotNumber}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <span className="text-sm text-foreground leading-relaxed">
                {slot.address}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <span className="text-sm text-foreground">
                {slot.apartmentName}
              </span>
            </div>

            {slot.description && (
              <div className="ml-10 text-sm text-muted-foreground leading-relaxed bg-secondary/60 rounded-xl p-3">
                {slot.description}
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <Phone className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <span className="text-sm text-primary font-medium">
                {slot.contactInfo}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <span className="text-sm text-muted-foreground">
                Listed on {formatDate(slot.createdAt)}
              </span>
            </div>
          </div>

          <Separator className="bg-border" />

          {/* Manage section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {pinUnlocked ? (
                <Unlock className="w-4 h-4 text-success" />
              ) : (
                <Lock className="w-4 h-4 text-muted-foreground" />
              )}
              <h3 className="text-sm font-semibold text-foreground">
                Manage your listing
              </h3>
            </div>

            {!pinUnlocked ? (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Enter your PIN to update availability or remove this listing.
                </p>
                <div className="flex gap-2">
                  <Input
                    id="slotPin"
                    type="password"
                    value={pin}
                    onChange={(e) => {
                      setPin(e.target.value);
                      if (pinError) setPinError("");
                    }}
                    placeholder="Your PIN"
                    className="rounded-xl bg-input border-border focus-visible:ring-primary/30 text-sm"
                    onKeyDown={(e) => e.key === "Enter" && handlePinSubmit()}
                    data-ocid="slot_detail.pin.input"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handlePinSubmit}
                    className="border-border hover:bg-secondary rounded-xl shrink-0 font-medium"
                  >
                    Unlock
                  </Button>
                </div>
                {pinError && (
                  <div
                    className="flex items-center gap-1.5 text-xs text-destructive"
                    data-ocid="slot_detail.pin.error_state"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {pinError}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2.5">
                <div
                  className="flex items-center gap-1.5 text-xs text-success bg-success/8 px-3 py-2 rounded-xl"
                  data-ocid="slot_detail.pin.success_state"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  Access granted — you can now update this listing
                </div>

                <Button
                  type="button"
                  className="w-full font-medium rounded-xl"
                  variant={slot.isAvailable ? "outline" : "default"}
                  onClick={handleToggleAvailability}
                  disabled={isBusy}
                  data-ocid="slot_detail.toggle_availability.button"
                >
                  {toggleAvailability.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving…
                    </>
                  ) : slot.isAvailable ? (
                    <>
                      <X className="w-4 h-4 mr-2" />
                      Mark as Taken
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Mark as Available
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  className="w-full font-medium rounded-xl"
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isBusy}
                  data-ocid="slot_detail.delete_button"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove this listing
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirm dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="bg-card border-border rounded-2xl shadow-modal">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground font-bold">
              Remove this parking space?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground leading-relaxed">
              You're about to remove slot{" "}
              <strong className="text-foreground">{slot.slotNumber}</strong> at{" "}
              <strong className="text-foreground">{slot.apartmentName}</strong>.
              Once it's gone, drivers won't be able to find it anymore.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-border hover:bg-secondary rounded-xl"
              onClick={() => setShowDeleteConfirm(false)}
              data-ocid="slot_detail.delete.cancel_button"
            >
              Keep it
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
              onClick={handleDelete}
              disabled={deleteSlot.isPending}
              data-ocid="slot_detail.delete.confirm_button"
            >
              {deleteSlot.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Removing…
                </>
              ) : (
                "Yes, remove it"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
