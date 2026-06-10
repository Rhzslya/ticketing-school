import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export const HeroSearch = () => {
  const navigate = useNavigate();
  const [trackingInput, setTrackingInput] = useState("");

  const handleTrackTicket = () => {
    if (!trackingInput.trim()) return;
    navigate(`/tickets/track/${trackingInput.trim()}`);
  };

  return (
    <section className="bg-primary text-white pt-24 pb-32 px-4 text-center">
      <h1 className="text-4xl md:text-5xl font-light mb-4 tracking-wide">
        HOW CAN WE HELP YOU TODAY?
      </h1>
      <p className="text-blue-100 mb-10 text-lg">
        Integrated helpdesk system for school facilities and digital
        infrastructure.
      </p>

      <div className="max-w-3xl mx-auto flex items-center bg-white rounded shadow-lg overflow-hidden h-14">
        <Input
          placeholder="Enter your ticket ID (e.g., TKT-1234)..."
          className="flex-1 border-none bg-transparent h-full px-6 text-lg text-slate-800 focus-visible:ring-0 placeholder:text-slate-400"
          value={trackingInput}
          onChange={(e) => setTrackingInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleTrackTicket()}
        />
        <button
          className="w-16 h-full flex items-center justify-center bg-white text-slate-400 hover:text-slate-600 transition-colors border-l cursor-pointer"
          onClick={handleTrackTicket}
        >
          <Search className="size-6" />
        </button>
      </div>
    </section>
  );
};
