import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ParkingSlot {
    id: bigint;
    lat: number;
    lng: number;
    contactInfo: string;
    createdAt: bigint;
    isAvailable: boolean;
    description: string;
    ownerPin: string;
    address: string;
    slotNumber: string;
    apartmentName: string;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addSlot(apartmentName: string, slotNumber: string, description: string, address: string, lat: number, lng: number, contactInfo: string, ownerPin: string): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteSlot(slotId: bigint, ownerPin: string): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getSingleSlot(slotId: bigint): Promise<ParkingSlot | null>;
    getSlotCount(): Promise<bigint>;
    getSlots(onlyAvailable: boolean): Promise<Array<ParkingSlot>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    seedDemoSlots(): Promise<void>;
    toggleSlotAvailability(slotId: bigint, ownerPin: string): Promise<void>;
}
