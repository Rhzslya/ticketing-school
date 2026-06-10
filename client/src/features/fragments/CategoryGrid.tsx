import { TicketCategory } from "@/enum/ticket";
import { HelpCircle, Monitor, Terminal, Wifi, Wrench, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CategoryGrid = () => {
  const navigate = useNavigate();
  return (
    <section id="topics" className="max-w-5xl mx-auto px-4 mt-24 text-center">
      <h2 className="text-2xl font-light text-slate-800 mb-12">
        Report by Category
      </h2>
      <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
        {[
          {
            id: TicketCategory.NETWORK,
            label: "Network",
            icon: <Wifi className="size-8" />,
            color: "bg-[#2ecc71]",
          },
          {
            id: TicketCategory.HARDWARE,
            label: "Hardware",
            icon: <Monitor className="size-8" />,
            color: "bg-[#3498db]",
          },
          {
            id: TicketCategory.SOFTWARE,
            label: "Software",
            icon: <Terminal className="size-8" />,
            color: "bg-[#9b59b6]",
          },
          {
            id: TicketCategory.ELECTRICAL,
            label: "Electrical",
            icon: <Zap className="size-8" />,
            color: "bg-[#f1c40f]",
          },
          {
            id: TicketCategory.FACILITIES,
            label: "Facilities",
            icon: <Wrench className="size-8" />,
            color: "bg-[#e67e22]",
          },
          {
            id: TicketCategory.OTHERS,
            label: "Others",
            icon: <HelpCircle className="size-8" />,
            color: "bg-[#e74c3c]",
          },
        ].map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center gap-4 cursor-pointer group w-24 sm:w-28"
            onClick={() => navigate(`/tickets/create?category=${item.id}`)}
          >
            <div
              className={`w-20 h-20 sm:w-24 sm:h-24 ${item.color} rounded-full flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform`}
            >
              {item.icon}
            </div>
            <span className="text-slate-600 font-medium group-hover:text-slate-900 text-sm sm:text-base">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CategoryGrid;
