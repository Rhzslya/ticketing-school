import { TicketCategory } from "@/enum/ticket";
import { Monitor, Wifi, Wrench, Zap } from "lucide-react";

export const QUICK_TEMPLATES = [
  {
    id: 1,
    category: TicketCategory.HARDWARE,
    title: "Classroom Projector Won't Turn On",
    description:
      "The projector in the classroom does not respond when turned on. Both power and VGA/HDMI cables are properly plugged in. Please inspect immediately as it is urgently needed for teaching and learning activities.",
    priority: "HIGH",
    icon: <Monitor className="size-4" />,
  },
  {
    id: 2,
    category: TicketCategory.NETWORK,
    title: "Room WiFi Connection Disconnected",
    description:
      "The WiFi connection in the room suddenly disconnected and cannot be detected on any device. The router hardware appears to be operating normally with status lights on.",
    priority: "MEDIUM",
    icon: <Wifi className="size-4" />,
  },
  {
    id: 3,
    category: TicketCategory.FACILITIES,
    title: "Room AC Leaking/Dripping Water",
    description:
      "The air conditioner in the room is dripping water heavily onto the floor. Requesting a technician to check and repair the drainage line.",
    priority: "MEDIUM",
    icon: <Wrench className="size-4" />,
  },
  {
    id: 4,
    category: TicketCategory.ELECTRICAL,
    title: "Power Outlets Completely Dead",
    description:
      "All power outlets on one side of the wall are completely dead with no electrical current. The room MCB switch appears normal and has not tripped.",
    priority: "HIGH",
    icon: <Zap className="size-4" />,
  },
];
