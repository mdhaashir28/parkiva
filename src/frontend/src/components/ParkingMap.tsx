import L from "leaflet";
import { useEffect, useRef } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import type { ParkingSlot } from "../backend.d";

// Fix default marker icons
// biome-ignore lint/performance/noDelete: required leaflet fix
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const createParkingIcon = (isAvailable: boolean) =>
  L.divIcon({
    className: "",
    html: `
      <div style="
        width: 34px;
        height: 34px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        background: ${isAvailable ? "oklch(0.58 0.14 155)" : "oklch(0.72 0.01 80)"};
        border: 2.5px solid ${isAvailable ? "oklch(0.75 0.16 155)" : "oklch(0.82 0.01 80)"};
        box-shadow: 0 3px 10px ${isAvailable ? "oklch(0.58 0.14 155 / 35%)" : "oklch(0 0 0 / 15%)"};
        display: flex;
        align-items: center;
        justify-content: center;
        ${isAvailable ? "animation: markerPulse 2.5s ease-in-out infinite;" : ""}
      ">
        <span style="
          transform: rotate(45deg);
          font-size: 13px;
          font-weight: 700;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          text-align: center;
          line-height: 30px;
        ">P</span>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -38],
  });

function FitBoundsOnSlots({ slots }: { slots: ParkingSlot[] }) {
  const map = useMap();
  const hasSet = useRef(false);

  useEffect(() => {
    if (slots.length > 0 && !hasSet.current) {
      hasSet.current = true;
      if (slots.length === 1) {
        map.setView([slots[0].lat, slots[0].lng], 15);
      } else {
        const bounds = L.latLngBounds(slots.map((s) => [s.lat, s.lng]));
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    }
  }, [slots, map]);

  return null;
}

interface ParkingMapProps {
  slots: ParkingSlot[];
  onViewDetails: (slot: ParkingSlot) => void;
}

export function ParkingMap({ slots, onViewDetails }: ParkingMapProps) {
  return (
    <div className="w-full h-full relative" data-ocid="map.canvas_target">
      <MapContainer
        center={[40.7128, -74.006]}
        zoom={13}
        style={{ width: "100%", height: "100%" }}
        className="rounded-none"
      >
        {/* Standard OpenStreetMap light tiles */}
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={19}
        />

        <FitBoundsOnSlots slots={slots} />

        {slots.map((slot) => (
          <Marker
            key={slot.id.toString()}
            position={[slot.lat, slot.lng]}
            icon={createParkingIcon(slot.isAvailable)}
          >
            <Popup minWidth={220} maxWidth={280}>
              <div style={{ fontFamily: "inherit", padding: "2px 0" }}>
                {/* Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "8px",
                    marginBottom: "6px",
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontWeight: "700",
                        fontSize: "14px",
                        lineHeight: "1.3",
                        color: "oklch(0.22 0.015 240)",
                        margin: 0,
                      }}
                    >
                      {slot.apartmentName}
                    </p>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "oklch(0.52 0.012 240)",
                        margin: "2px 0 0",
                      }}
                    >
                      Slot {slot.slotNumber}
                    </p>
                  </div>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "3px 9px",
                      borderRadius: "9999px",
                      fontSize: "11px",
                      fontWeight: "600",
                      background: slot.isAvailable
                        ? "oklch(0.58 0.14 155 / 12%)"
                        : "oklch(0.94 0.005 80)",
                      color: slot.isAvailable
                        ? "oklch(0.45 0.14 155)"
                        : "oklch(0.52 0.012 240)",
                      border: `1px solid ${slot.isAvailable ? "oklch(0.58 0.14 155 / 30%)" : "oklch(0.88 0.008 80)"}`,
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        width: "5px",
                        height: "5px",
                        borderRadius: "50%",
                        background: slot.isAvailable
                          ? "oklch(0.58 0.14 155)"
                          : "oklch(0.72 0.01 80)",
                        display: "inline-block",
                        flexShrink: 0,
                      }}
                    />
                    {slot.isAvailable ? "Available" : "Taken"}
                  </span>
                </div>

                {/* Address */}
                <p
                  style={{
                    fontSize: "12px",
                    color: "oklch(0.45 0.012 240)",
                    lineHeight: "1.5",
                    margin: "0 0 10px",
                  }}
                >
                  {slot.address}
                </p>

                {/* Button */}
                <button
                  type="button"
                  onClick={() => onViewDetails(slot)}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "7px 12px",
                    borderRadius: "10px",
                    background: "oklch(0.58 0.12 210)",
                    color: "white",
                    fontSize: "12px",
                    fontWeight: "600",
                    border: "none",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "oklch(0.52 0.12 210)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "oklch(0.58 0.12 210)";
                  }}
                >
                  View details →
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
