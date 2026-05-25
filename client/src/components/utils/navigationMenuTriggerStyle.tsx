import { cva } from "class-variance-authority";

export const navigationMenuTriggerStyle = cva(
  "cursor-pointer group inline-flex h-9 w-max items-center justify-center rounded-none bg-transparent px-4 py-2 text-sm font-bold relative " +
    "text-muted transition-colors duration-400 " +
    "hover:text-popover-foreground focus:text-popover-foreground data-[active]:text-popover-foreground data-[state=open]:text-popover-foreground " +
    "hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent " +
    "disabled:pointer-events-none disabled:opacity-50 focus:outline-none",
);
