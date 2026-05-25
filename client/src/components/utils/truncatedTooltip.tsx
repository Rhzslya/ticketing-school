"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

interface TruncatedTooltipProps {
  text: string;
  className?: string;
}

export function TruncatedTooltip({ text, className }: TruncatedTooltipProps) {
  const [isTruncated, setIsTruncated] = useState(false);
  const textRef = useRef<HTMLSpanElement>(null);

  const checkTruncation = () => {
    const element = textRef.current;
    if (element) {
      const isOverflowing = element.scrollWidth > element.clientWidth;
      setIsTruncated(isOverflowing);
    }
  };

  useEffect(() => {
    checkTruncation();

    window.addEventListener("resize", checkTruncation);
    return () => window.removeEventListener("resize", checkTruncation);
  }, [text]);

  const TextElement = (
    <span
      ref={textRef}
      className={cn("truncate cursor-default block", className)}
    >
      {text}
    </span>
  );

  if (!isTruncated) {
    return TextElement;
  }

  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>{TextElement}</TooltipTrigger>
      <TooltipContent className="max-w-75 wrap-break-word">
        <p>{text}</p>
      </TooltipContent>
    </Tooltip>
  );
}
