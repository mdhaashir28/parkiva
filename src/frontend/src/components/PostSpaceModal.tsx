import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useAddSlot } from "@/hooks/useQueries";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Hash,
  Loader2,
  Lock,
  MapPin,
  Phone,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface PostSpaceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormData {
  apartmentName: string;
  slotNumber: string;
  address: string;
  description: string;
  contactInfo: string;
  lat: string;
  lng: string;
  ownerPin: string;
}

const initialForm: FormData = {
  apartmentName: "",
  slotNumber: "",
  address: "",
  description: "",
  contactInfo: "",
  lat: "",
  lng: "",
  ownerPin: "",
};

export function PostSpaceModal({ open, onOpenChange }: PostSpaceModalProps) {
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const addSlot = useAddSlot();

  const updateField = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};
    if (!form.apartmentName.trim())
      newErrors.apartmentName = "Please enter your building name";
    if (!form.slotNumber.trim())
      newErrors.slotNumber = "Please enter a slot number";
    if (!form.address.trim()) newErrors.address = "Please enter the address";
    if (!form.contactInfo.trim())
      newErrors.contactInfo = "Please add a way to reach you";
    if (!form.lat.trim()) newErrors.lat = "Required";
    else if (Number.isNaN(Number.parseFloat(form.lat)))
      newErrors.lat = "Enter a valid number";
    if (!form.lng.trim()) newErrors.lng = "Required";
    else if (Number.isNaN(Number.parseFloat(form.lng)))
      newErrors.lng = "Enter a valid number";
    if (!form.ownerPin.trim()) newErrors.ownerPin = "Please create a PIN";
    else if (form.ownerPin.length < 4)
      newErrors.ownerPin = "Make it at least 4 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await addSlot.mutateAsync({
        apartmentName: form.apartmentName.trim(),
        slotNumber: form.slotNumber.trim(),
        description: form.description.trim(),
        address: form.address.trim(),
        lat: Number.parseFloat(form.lat),
        lng: Number.parseFloat(form.lng),
        contactInfo: form.contactInfo.trim(),
        ownerPin: form.ownerPin.trim(),
      });
      setSubmitStatus("success");
      toast.success("Your space is now listed! Drivers nearby can find it.");
      setTimeout(() => {
        setForm(initialForm);
        setSubmitStatus("idle");
        onOpenChange(false);
      }, 1800);
    } catch {
      setSubmitStatus("error");
      toast.error("Something went wrong. Please give it another try.");
      setTimeout(() => setSubmitStatus("idle"), 3000);
    }
  };

  const handleClose = () => {
    if (!addSlot.isPending) {
      setForm(initialForm);
      setErrors({});
      setSubmitStatus("idle");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-lg w-full max-h-[90vh] overflow-y-auto bg-card border-border rounded-2xl shadow-modal"
        data-ocid="post_space.modal"
      >
        <DialogHeader className="pb-1">
          <DialogTitle className="text-xl font-bold flex items-center gap-2.5 text-foreground">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-primary" />
            </div>
            Share your parking space
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm leading-relaxed">
            Help your neighbours find parking — it only takes a minute.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-1">
          {/* Building info */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              About your space
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label
                htmlFor="apartmentName"
                className="text-sm font-medium text-foreground flex items-center gap-1.5"
              >
                <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                Building name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="apartmentName"
                value={form.apartmentName}
                onChange={(e) => updateField("apartmentName", e.target.value)}
                placeholder="e.g. Maple Court"
                className="rounded-xl bg-input border-border focus-visible:ring-primary/30 text-sm"
                data-ocid="post_space.apartment_name.input"
              />
              {errors.apartmentName && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="post_space.apartment_name.error"
                >
                  {errors.apartmentName}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="slotNumber"
                className="text-sm font-medium text-foreground flex items-center gap-1.5"
              >
                <Hash className="w-3.5 h-3.5 text-muted-foreground" />
                Slot number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="slotNumber"
                value={form.slotNumber}
                onChange={(e) => updateField("slotNumber", e.target.value)}
                placeholder="e.g. B-12 or Ground Left"
                className="rounded-xl bg-input border-border focus-visible:ring-primary/30 text-sm"
                data-ocid="post_space.slot_number.input"
              />
              {errors.slotNumber && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="post_space.slot_number.error"
                >
                  {errors.slotNumber}
                </p>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <Label
              htmlFor="address"
              className="text-sm font-medium text-foreground flex items-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
              Street address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="address"
              value={form.address}
              onChange={(e) => updateField("address", e.target.value)}
              placeholder="123 Main Street, Brooklyn, NY 11201"
              className="rounded-xl bg-input border-border focus-visible:ring-primary/30 text-sm"
              data-ocid="post_space.address.input"
            />
            {errors.address && (
              <p
                className="text-xs text-destructive"
                data-ocid="post_space.address.error"
              >
                {errors.address}
              </p>
            )}
          </div>

          {/* Coordinates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label
                htmlFor="lat"
                className="text-sm font-medium text-foreground"
              >
                Latitude <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lat"
                type="number"
                step="any"
                value={form.lat}
                onChange={(e) => updateField("lat", e.target.value)}
                placeholder="40.7128"
                className="rounded-xl bg-input border-border focus-visible:ring-primary/30 text-sm font-mono"
                data-ocid="post_space.lat.input"
              />
              {errors.lat && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="post_space.lat.error"
                >
                  {errors.lat}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="lng"
                className="text-sm font-medium text-foreground"
              >
                Longitude <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lng"
                type="number"
                step="any"
                value={form.lng}
                onChange={(e) => updateField("lng", e.target.value)}
                placeholder="-74.0060"
                className="rounded-xl bg-input border-border focus-visible:ring-primary/30 text-sm font-mono"
                data-ocid="post_space.lng.input"
              />
              {errors.lng && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="post_space.lng.error"
                >
                  {errors.lng}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label
              htmlFor="description"
              className="text-sm font-medium text-foreground"
            >
              Anything helpful to know?{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="e.g. Covered spot near the lift, height clearance 2.1m, free on weekends…"
              className="rounded-xl bg-input border-border focus-visible:ring-primary/30 resize-none min-h-[80px] text-sm"
              data-ocid="post_space.description.textarea"
            />
          </div>

          <Separator className="bg-border" />

          {/* Contact */}
          <div className="space-y-1.5">
            <Label
              htmlFor="contactInfo"
              className="text-sm font-medium text-foreground flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5 text-muted-foreground" />
              How can someone reach you?{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="contactInfo"
              value={form.contactInfo}
              onChange={(e) => updateField("contactInfo", e.target.value)}
              placeholder="Phone number or email — whichever you prefer"
              className="rounded-xl bg-input border-border focus-visible:ring-primary/30 text-sm"
              data-ocid="post_space.contact.input"
            />
            {errors.contactInfo && (
              <p
                className="text-xs text-destructive"
                data-ocid="post_space.contact.error"
              >
                {errors.contactInfo}
              </p>
            )}
          </div>

          {/* PIN */}
          <div className="space-y-1.5 rounded-2xl bg-secondary p-4">
            <Label
              htmlFor="ownerPin"
              className="text-sm font-medium text-foreground flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5 text-muted-foreground" />
              Create a PIN <span className="text-destructive">*</span>
            </Label>
            <Input
              id="ownerPin"
              type="password"
              value={form.ownerPin}
              onChange={(e) => updateField("ownerPin", e.target.value)}
              placeholder="Choose something memorable"
              className="rounded-xl bg-card border-border focus-visible:ring-primary/30 text-sm"
              data-ocid="post_space.pin.input"
            />
            {errors.ownerPin && (
              <p
                className="text-xs text-destructive"
                data-ocid="post_space.pin.error"
              >
                {errors.ownerPin}
              </p>
            )}
            <p className="text-xs text-muted-foreground leading-relaxed">
              Create a 4-digit PIN — you'll need this to update or remove your
              listing later.
            </p>
          </div>

          {/* Status feedback */}
          {submitStatus === "success" && (
            <div
              className="flex items-start gap-3 p-4 rounded-2xl bg-success/8 border border-success/20"
              data-ocid="post_space.success_state"
            >
              <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-success">
                  You're all set!
                </p>
                <p className="text-xs text-success/80 mt-0.5">
                  Your space is now listed — drivers nearby can find it.
                </p>
              </div>
            </div>
          )}
          {submitStatus === "error" && (
            <div
              className="flex items-center gap-2 p-3 rounded-2xl bg-destructive/8 border border-destructive/20"
              data-ocid="post_space.error_state"
            >
              <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
              <span className="text-sm text-destructive">
                Something went wrong. Please try again.
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-border hover:bg-secondary rounded-xl text-muted-foreground"
              onClick={handleClose}
              disabled={addSlot.isPending}
              data-ocid="post_space.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary text-primary-foreground font-semibold hover:bg-primary/90 rounded-xl shadow-sm"
              disabled={addSlot.isPending || submitStatus === "success"}
              data-ocid="post_space.submit_button"
            >
              {addSlot.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Listing your space…
                </>
              ) : (
                "Share My Space"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
