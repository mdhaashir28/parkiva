import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ParkingSlot } from "../backend.d";
import { useActor } from "./useActor";

export function useGetSlots(onlyAvailable: boolean) {
  const { actor, isFetching } = useActor();
  return useQuery<ParkingSlot[]>({
    queryKey: ["slots", onlyAvailable],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSlots(onlyAvailable);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetSlotCount() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["slotCount"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getSlotCount();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetSingleSlot(slotId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<ParkingSlot | null>({
    queryKey: ["slot", slotId?.toString()],
    queryFn: async () => {
      if (!actor || slotId === null) return null;
      return actor.getSingleSlot(slotId);
    },
    enabled: !!actor && !isFetching && slotId !== null,
  });
}

export function useAddSlot() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      apartmentName: string;
      slotNumber: string;
      description: string;
      address: string;
      lat: number;
      lng: number;
      contactInfo: string;
      ownerPin: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addSlot(
        params.apartmentName,
        params.slotNumber,
        params.description,
        params.address,
        params.lat,
        params.lng,
        params.contactInfo,
        params.ownerPin,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slots"] });
      queryClient.invalidateQueries({ queryKey: ["slotCount"] });
    },
  });
}

export function useToggleAvailability() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { slotId: bigint; ownerPin: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.toggleSlotAvailability(params.slotId, params.ownerPin);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slots"] });
      queryClient.invalidateQueries({ queryKey: ["slot"] });
    },
  });
}

export function useDeleteSlot() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { slotId: bigint; ownerPin: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteSlot(params.slotId, params.ownerPin);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slots"] });
      queryClient.invalidateQueries({ queryKey: ["slotCount"] });
    },
  });
}

export function useSeedDemoSlots() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.seedDemoSlots();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slots"] });
      queryClient.invalidateQueries({ queryKey: ["slotCount"] });
    },
  });
}
