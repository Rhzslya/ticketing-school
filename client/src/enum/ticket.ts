export const TicketCategory = {
  NETWORK: "NETWORK",
  HARDWARE: "HARDWARE",
  SOFTWARE: "SOFTWARE",
  ELECTRICAL: "ELECTRICAL",
  FACILITIES: "FACILITIES",
  OTHERS: "OTHERS",
};

export type TicketCategory =
  (typeof TicketCategory)[keyof typeof TicketCategory];

export const Priority = {
  HIGH: "HIGH",
  MEDIUM: "MEDIUM",
  LOW: "LOW",
};

export type Priority = (typeof Priority)[keyof typeof Priority];

export const Status = {
  SUBMITTED: "SUBMITTED",
  ONGOING: "ONGOING",
  DONE: "DONE",
  REJECTED: "REJECTED",
};

export type Status = (typeof Status)[keyof typeof Status];
