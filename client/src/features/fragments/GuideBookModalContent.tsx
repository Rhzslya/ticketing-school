import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GUIDEBOOK_DATA } from "@/utils/guide-book";
import { TicketPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface GuidebookModalContentProps {
  closeModal: () => void;
}

const GuidebookModalContent = ({ closeModal }: GuidebookModalContentProps) => {
  const navigate = useNavigate();

  return (
    <DialogContent className="sm:max-w-2xl bg-white p-0 overflow-hidden rounded-2xl">
      <DialogHeader className="p-6 pb-4 border-b border-slate-100 bg-slate-50">
        <DialogTitle className="text-xl text-slate-800">
          Troubleshooting Guide
        </DialogTitle>
        <DialogDescription>
          Try these self-troubleshooting steps for common issues before
          contacting a technician.
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
        <p className="text-sm text-slate-500 mb-3">Issue not resolved yet?</p>
        <Button
          variant="outline"
          className="text-primary bg-white cursor-pointer duration-300"
          onClick={() => {
            closeModal();
            setTimeout(() => navigate("/tickets/create"), 150);
          }}
        >
          <TicketPlus className="mr-2 size-4" /> Create Ticket Now
        </Button>
      </div>
    </DialogContent>
  );
};

export default GuidebookModalContent;
