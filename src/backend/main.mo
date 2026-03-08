import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User profile type
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // User profile management functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Parking slot type
  public type ParkingSlot = {
    id : Nat;
    apartmentName : Text;
    slotNumber : Text;
    description : Text;
    address : Text;
    lat : Float;
    lng : Float;
    contactInfo : Text;
    ownerPin : Text;
    isAvailable : Bool;
    createdAt : Int;
  };

  stable var stableSlots : [(Nat, ParkingSlot)] = [];
  stable var stableNextSlotId : Nat = 1;

  let slots = Map.empty<Nat, ParkingSlot>();
  var nextSlotId = stableNextSlotId;

  system func preupgrade() {
    stableSlots := slots.entries().toArray();
    stableNextSlotId := nextSlotId;
  };

  system func postupgrade() {
    for ((id, slot) in stableSlots.vals()) {
      slots.add(id, slot);
    };
    nextSlotId := stableNextSlotId;
    stableSlots := [];
  };

  // Anyone can add a parking slot (no authorization check needed)
  public shared ({ caller }) func addSlot(
    apartmentName : Text,
    slotNumber : Text,
    description : Text,
    address : Text,
    lat : Float,
    lng : Float,
    contactInfo : Text,
    ownerPin : Text
  ) : async Nat {
    let slotId = nextSlotId;
    let newSlot : ParkingSlot = {
      id = slotId;
      apartmentName;
      slotNumber;
      description;
      address;
      lat;
      lng;
      contactInfo;
      ownerPin;
      isAvailable = true;
      createdAt = Time.now();
    };

    slots.add(slotId, newSlot);
    nextSlotId += 1;
    slotId;
  };

  // Anyone can view slots (no authorization check needed)
  public query ({ caller }) func getSlots(onlyAvailable : Bool) : async [ParkingSlot] {
    slots.values().toArray().filter<ParkingSlot>(
      func(slot) {
        if (onlyAvailable) {
          slot.isAvailable;
        } else { true };
      }
    );
  };

  // Requires ownerPin verification (custom ownership check)
  public shared ({ caller }) func toggleSlotAvailability(slotId : Nat, ownerPin : Text) : async () {
    switch (slots.get(slotId)) {
      case (null) { Runtime.trap("Slot not found") };
      case (?slot) {
        if (slot.ownerPin != ownerPin) { Runtime.trap("Invalid owner pin") };
        let updatedSlot : ParkingSlot = { slot with isAvailable = not slot.isAvailable };
        slots.add(slotId, updatedSlot);
      };
    };
  };

  // Requires ownerPin verification (custom ownership check)
  public shared ({ caller }) func deleteSlot(slotId : Nat, ownerPin : Text) : async () {
    switch (slots.get(slotId)) {
      case (null) { Runtime.trap("Slot not found") };
      case (?slot) {
        if (slot.ownerPin != ownerPin) { Runtime.trap("Invalid owner pin") };
        slots.remove(slotId);
      };
    };
  };

  // Anyone can view a single slot (no authorization check needed)
  public query ({ caller }) func getSingleSlot(slotId : Nat) : async ?ParkingSlot {
    slots.get(slotId);
  };

  // Admin-only: Seeding demo data is a privileged operation
  public shared ({ caller }) func seedDemoSlots() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can seed demo slots");
    };

    if (nextSlotId != 1) {
      Runtime.trap("Cannot seed slots after existing slots have been added");
    };

    let demoSlots : [ParkingSlot] = [
      {
        id = 1;
        apartmentName = "Sunny Apartments";
        slotNumber = "A1";
        description = "Covered parking near entrance";
        address = "123 Sunny St";
        lat = 40.7128;
        lng = -74.0060;
        contactInfo = "991616740";
        ownerPin = "1234";
        isAvailable = true;
        createdAt = Time.now();
      },
      {
        id = 2;
        apartmentName = "Lakeview Towers";
        slotNumber = "B2";
        description = "Open parking, lakeside view";
        address = "456 Lakeview Ave";
        lat = 40.7150;
        lng = -74.0020;
        contactInfo = "991616740";
        ownerPin = "5678";
        isAvailable = true;
        createdAt = Time.now();
      },
      {
        id = 3;
        apartmentName = "Central Residences";
        slotNumber = "C3";
        description = "Underground parking with security";
        address = "789 Central Blvd";
        lat = 40.7100;
        lng = -74.0100;
        contactInfo = "991616740";
        ownerPin = "4321";
        isAvailable = true;
        createdAt = Time.now();
      }
    ];

    for (slot in demoSlots.vals()) {
      slots.add(slot.id, slot);
    };

    nextSlotId := 4;
  };

  // Anyone can view slot count (no authorization check needed)
  public query ({ caller }) func getSlotCount() : async Nat {
    slots.size();
  };
};
