import { Priority, Status, TicketCategory } from "@/enum/ticket";

export const getStatusStyle = (status?: Status) => {
  switch (status) {
    case Status.SUBMITTED:
      return "bg-slate-50 text-slate-600 border-slate-200";
    case Status.ONGOING:
      return "bg-blue-50 text-blue-600 border-blue-200";
    case Status.DONE:
      return "bg-emerald-50 text-emerald-600 border-emerald-200";
    case Status.REJECTED:
      return "bg-red-50 text-red-600 border-red-200";
    default:
      return "bg-gray-50 text-gray-600 border-gray-200";
  }
};

export const getPriorityStyle = (priority?: Priority) => {
  switch (priority) {
    case Priority.HIGH:
      return "text-red-600 bg-red-50 border-red-100";
    case Priority.MEDIUM:
      return "text-orange-600 bg-orange-50 border-orange-100";
    case Priority.LOW:
      return "text-teal-600 bg-teal-50 border-teal-100";
    default:
      return "text-slate-600 bg-slate-50 border-slate-100";
  }
};

export const getCategoryTheme = (category?: string) => {
  switch (category) {
    case TicketCategory.NETWORK:
      return { text: "text-[#2ecc71]", bg: "bg-[#2ecc71]/10" };
    case TicketCategory.HARDWARE:
      return { text: "text-[#3498db]", bg: "bg-[#3498db]/10" };
    case TicketCategory.SOFTWARE:
      return { text: "text-[#9b59b6]", bg: "bg-[#9b59b6]/10" };
    case TicketCategory.ELECTRICAL:
      return { text: "text-[#f1c40f]", bg: "bg-[#f1c40f]/10" };
    case TicketCategory.FACILITIES:
      return { text: "text-[#e67e22]", bg: "bg-[#e67e22]/10" };
    default:
      return { text: "text-[#e74c3c]", bg: "bg-[#e74c3c]/10" };
  }
};

export const getCategoryLabel = (category?: TicketCategory) => {
  switch (category) {
    case TicketCategory.NETWORK:
      return "Network & Internet";
    case TicketCategory.HARDWARE:
      return "Hardware";
    case TicketCategory.SOFTWARE:
      return "Software";
    case TicketCategory.ELECTRICAL:
      return "Electrical";
    case TicketCategory.FACILITIES:
      return "Facilities";
    case TicketCategory.OTHERS:
      return "Others";
    default:
      return category;
  }
};
