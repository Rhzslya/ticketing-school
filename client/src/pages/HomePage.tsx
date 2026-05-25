import { Button } from "@/components/ui/button";
import {
  Search,
  TicketPlus,
  BookOpen,
  MessageSquare,
  Monitor,
  Wifi,
  Wrench,
  HelpCircle,
  Terminal,
  Zap,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { TicketCategory } from "@/enum/ticket";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { QUICK_TEMPLATES } from "@/components/utils/quick-templates";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { GUIDEBOOK_DATA } from "@/utils/guide-book";

const HomePage = () => {
  const navigate = useNavigate();
  const [trackingInput, setTrackingInput] = useState("");
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isGuidebookModalOpen, setIsGuidebookModalOpen] = useState(false);

  const handleTrackTicket = () => {
    if (!trackingInput.trim()) return;
    navigate(`/tickets/track/${trackingInput.trim()}`);
  };

  const handleSelectTemplate = (template: (typeof QUICK_TEMPLATES)[0]) => {
    setIsTemplateModalOpen(false);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { icon, ...serializableData } = template;

    setTimeout(() => {
      navigate("/tickets/create", { state: { prefillData: serializableData } });
    }, 150);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-800 font-sans pb-20">
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

      <section className="max-w-5xl mx-auto px-4 -mt-16 relative z-10">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded shadow-sm border border-slate-100 pt-10 px-6 pb-8 text-center relative flex flex-col items-center">
            <div className="absolute -top-8 w-16 h-16 bg-white border-2 border-slate-100 rounded-full flex items-center justify-center text-blue-500 shadow-sm">
              <MessageSquare className="size-7" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-800">
              Quick Report
            </h3>
            <p className="text-slate-500 text-sm mb-6 flex-1">
              Use predefined templates for common issues to save time.
            </p>

            <Dialog
              open={isTemplateModalOpen}
              onOpenChange={setIsTemplateModalOpen}
            >
              <DialogTrigger asChild>
                <Button className="bg-[#5191d1] hover:bg-[#3d7bbc] text-white w-full cursor-pointer">
                  View Templates
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl bg-white p-0 overflow-hidden rounded-2xl">
                <DialogHeader className="p-6 pb-4 border-b border-slate-100 bg-slate-50">
                  <DialogTitle className="text-xl text-slate-800">
                    Quick Report Templates
                  </DialogTitle>
                  <DialogDescription>
                    Select the issue that best matches your current problem. We
                    will automatically prefill the form for you.
                  </DialogDescription>
                </DialogHeader>

                <div className="p-4 max-h-[60vh] overflow-y-auto grid gap-3 bg-slate-50/50">
                  {QUICK_TEMPLATES.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => handleSelectTemplate(template)}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-white border border-slate-200 hover:border-primary hover:shadow-md cursor-pointer transition-all text-left"
                    >
                      <div className="flex-1 pr-4">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="p-1.5 rounded-md bg-slate-100 text-slate-600 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            {template.icon}
                          </span>
                          <h4 className="font-semibold text-slate-800 group-hover:text-primary transition-colors">
                            {template.title}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed ml-9">
                          {template.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 mt-3 sm:mt-0 ml-9 sm:ml-0">
                        <Badge
                          variant="outline"
                          className="text-[10px] bg-slate-50 text-slate-500 border-slate-200"
                        >
                          {template.category}
                        </Badge>
                        <ChevronRight className="size-5 text-slate-300 group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="bg-white rounded shadow-sm border border-slate-100 pt-10 px-6 pb-8 text-center relative flex flex-col items-center">
            <div className="absolute -top-8 w-16 h-16 bg-white border-2 border-slate-100 rounded-full flex items-center justify-center text-red-500 shadow-sm">
              <BookOpen className="size-7" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-800">Guidebook</h3>
            <p className="text-slate-500 text-sm mb-6 flex-1">
              Read our self-troubleshooting guides before submitting a ticket.
            </p>

            <Dialog
              open={isGuidebookModalOpen}
              onOpenChange={setIsGuidebookModalOpen}
            >
              <DialogTrigger asChild>
                <Button className="bg-[#e74c3c] hover:bg-[#c0392b] text-white w-full cursor-pointer">
                  Open Guide
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl bg-white p-0 overflow-hidden rounded-2xl">
                <DialogHeader className="p-6 pb-4 border-b border-slate-100 bg-slate-50">
                  <DialogTitle className="text-xl text-slate-800">
                    Troubleshooting Guide
                  </DialogTitle>
                  <DialogDescription>
                    Try these self-troubleshooting steps for common issues
                    before contacting a technician.
                  </DialogDescription>
                </DialogHeader>

                <div className="p-6 max-h-[60vh] overflow-y-auto">
                  <Accordion type="single" collapsible className="w-full">
                    {GUIDEBOOK_DATA.map((guide) => (
                      <AccordionItem
                        key={guide.id}
                        value={guide.id}
                        className="border-b border-slate-200"
                      >
                        <AccordionTrigger className="text-left text-sm font-semibold text-slate-800 hover:text-primary hover:no-underline py-4">
                          <div className="flex flex-col gap-1">
                            <Badge
                              variant="secondary"
                              className="w-fit text-[10px] bg-slate-100 text-slate-500 hover:bg-slate-200"
                            >
                              {guide.category}
                            </Badge>
                            <span>{guide.question}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-slate-600 leading-relaxed bg-slate-50/50 p-4 rounded-b-lg whitespace-pre-line">
                          {guide.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                  <p className="text-sm text-slate-500 mb-3">
                    Issue not resolved yet?
                  </p>
                  <Button
                    variant="outline"
                    className="text-primary bg-white cursor-pointer duration-300"
                    onClick={() => {
                      setIsGuidebookModalOpen(false);
                      setTimeout(() => navigate("/tickets/create"), 150);
                    }}
                  >
                    <TicketPlus className="mr-2 size-4" /> Create Ticket Now
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="bg-white rounded shadow-sm border border-slate-100 pt-10 px-6 pb-8 text-center relative flex flex-col items-center">
            <div className="absolute -top-8 w-16 h-16 bg-white border-2 border-slate-100 rounded-full flex items-center justify-center text-yellow-500 shadow-sm">
              <TicketPlus className="size-7" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-800">
              New Ticket
            </h3>
            <p className="text-slate-500 text-sm mb-6 flex-1">
              Can't find a solution? Create a report so our technicians can
              help.
            </p>
            <Button
              className="bg-[#f1c40f] hover:bg-[#f39c12] text-white w-full cursor-pointer"
              onClick={() => navigate("/tickets/create")}
            >
              Create Ticket
            </Button>
          </div>
        </div>
      </section>

      {/* Categories */}
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
    </div>
  );
};

export default HomePage;
