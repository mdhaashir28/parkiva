# ApartmentPark

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- **Parking slot listings**: Users can post a free parking space with details (apartment name, address/location coordinates, slot number, description, contact info).
- **Interactive map view**: Drivers can browse all available parking slots on an OpenStreetMap-based map (Leaflet). Each slot shows as a map marker.
- **List view**: An alternative list/card layout showing all available slots with key info.
- **Post a slot form**: Form for apartment residents to post their free parking space (name, slot number, description, address, lat/lng, contact).
- **Mark as taken / available toggle**: Slot owners can mark their space as taken or free again (identified by a simple owner code/PIN they set when posting).
- **Slot detail popup**: Clicking a map marker or list card opens a detail popup/modal with full info and contact.
- **Filter bar**: Filter slots by availability status (available / all).
- **Sample content**: Pre-seed a few demo slots on first load.

### Modify
- None (new project).

### Remove
- None.

## Implementation Plan
1. Backend (Motoko):
   - Data type: `ParkingSlot` with fields: id, apartmentName, slotNumber, description, address, lat, lng, contactInfo, ownerPin (hashed), isAvailable, createdAt.
   - CRUD: `addSlot`, `getSlots` (all / available only), `toggleAvailability` (requires PIN match), `deleteSlot` (requires PIN).
   - Stable storage for persistence.

2. Frontend:
   - Two-tab layout: Map View and List View.
   - Map tab: Leaflet map centered on a default location, markers for each available slot, click marker to open detail modal.
   - List tab: Cards grid for all/available slots, filter toggle.
   - "Post a Space" button opens a modal form.
   - Detail modal: Shows slot info + contact, owner can toggle availability or delete with PIN.
   - Responsive layout for mobile and desktop.
