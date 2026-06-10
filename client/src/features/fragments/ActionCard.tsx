import type { ReactNode } from "react";

interface ActionCardProps {
  icon: ReactNode;
  iconColorClass: string;
  title: string;
  description: string;
  actionElement: ReactNode;
}

export const ActionCard = ({
  icon,
  iconColorClass,
  title,
  description,
  actionElement,
}: ActionCardProps) => {
  return (
    <div className="bg-white rounded shadow-sm border border-slate-100 pt-10 px-6 pb-8 text-center relative flex flex-col items-center">
      <div
        className={`absolute -top-8 w-16 h-16 bg-white border-2 border-slate-100 rounded-full flex items-center justify-center shadow-sm ${iconColorClass}`}
      >
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-slate-800">{title}</h3>
      <p className="text-slate-500 text-sm mb-6 flex-1">{description}</p>
      {actionElement}
    </div>
  );
};
