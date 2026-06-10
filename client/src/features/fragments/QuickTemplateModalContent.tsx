import { Badge } from "@/components/ui/badge";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QUICK_TEMPLATES } from "@/components/utils/quick-templates";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface QuickTemplateModalContentProps {
  closeModal: () => void;
}

const QuickTemplateModalContent = ({
  closeModal,
}: QuickTemplateModalContentProps) => {
  const navigate = useNavigate();

  const handleSelectTemplate = (template: (typeof QUICK_TEMPLATES)[0]) => {
    closeModal();

    const serializableData = {
      id: template.id,
      title: template.title,
      description: template.description,
      category: template.category,
      priority: template.priority,
    };

    setTimeout(() => {
      navigate("/tickets/create", { state: { prefillData: serializableData } });
    }, 150);
  };

  return (
    <DialogContent className="sm:max-w-2xl bg-white p-0 overflow-hidden rounded-2xl">
      <DialogHeader className="p-6 pb-4 border-b border-slate-100 bg-slate-50">
        <DialogTitle className="text-xl text-slate-800">
          Quick Report Templates
        </DialogTitle>
        <DialogDescription>
          Select the issue that best matches your current problem. We will
          automatically prefill the form for you.
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
  );
};

export default QuickTemplateModalContent;
