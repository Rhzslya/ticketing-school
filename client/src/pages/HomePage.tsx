import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { MessageSquare, BookOpen, TicketPlus } from "lucide-react";
import { HeroSearch } from "@/features/fragments/HeroSearch";
import { ActionCard } from "@/features/fragments/ActionCard";
import QuickTemplateModalContent from "@/features/fragments/QuickTemplateModalContent";
import GuidebookModalContent from "@/features/fragments/GuideBookModalContent";
import CategoryGrid from "@/features/fragments/CategoryGrid";

const HomePage = () => {
  const navigate = useNavigate();
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isGuidebookModalOpen, setIsGuidebookModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-800 font-sans pb-20">
      <HeroSearch />

      <section className="max-w-5xl mx-auto px-4 -mt-16 relative z-10">
        <div className="grid md:grid-cols-3 gap-6">
          <Dialog
            open={isTemplateModalOpen}
            onOpenChange={setIsTemplateModalOpen}
          >
            <ActionCard
              icon={<MessageSquare className="size-7" />}
              iconColorClass="text-blue-500"
              title="Quick Report"
              description="Use predefined templates for common issues to save time."
              actionElement={
                <DialogTrigger asChild>
                  <Button className="bg-[#5191d1] hover:bg-[#3d7bbc] text-white w-full cursor-pointer">
                    View Templates
                  </Button>
                </DialogTrigger>
              }
            />
            <QuickTemplateModalContent
              closeModal={() => setIsTemplateModalOpen(false)}
            />
          </Dialog>

          <Dialog
            open={isGuidebookModalOpen}
            onOpenChange={setIsGuidebookModalOpen}
          >
            <ActionCard
              icon={<BookOpen className="size-7" />}
              iconColorClass="text-red-500"
              title="Guidebook"
              description="Read our self-troubleshooting guides before submitting a ticket."
              actionElement={
                <DialogTrigger asChild>
                  <Button className="bg-[#e74c3c] hover:bg-[#c0392b] text-white w-full cursor-pointer">
                    Open Guide
                  </Button>
                </DialogTrigger>
              }
            />
            <GuidebookModalContent
              closeModal={() => setIsGuidebookModalOpen(false)}
            />
          </Dialog>

          <ActionCard
            icon={<TicketPlus className="size-7" />}
            iconColorClass="text-yellow-500"
            title="New Ticket"
            description="Can't find a solution? Create a report so our technicians can help."
            actionElement={
              <Button
                className="bg-[#f1c40f] hover:bg-[#f39c12] text-white w-full cursor-pointer"
                onClick={() => navigate("/tickets/create")}
              >
                Create Ticket
              </Button>
            }
          />
        </div>
      </section>

      <CategoryGrid />
    </div>
  );
};

export default HomePage;
