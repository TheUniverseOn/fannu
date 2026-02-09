"use client";

import { MessageCircle } from "lucide-react";
import { SUPPORT_WHATSAPP } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface SupportFooterProps {
  className?: string;
  fixed?: boolean;
}

/**
 * Support footer with WhatsApp link
 * Can be fixed to bottom or inline
 */
export function SupportFooter({ className, fixed = true }: SupportFooterProps) {
  const whatsappUrl = `https://wa.me/${SUPPORT_WHATSAPP.replace(/[^0-9]/g, "")}`;

  return (
    <div
      className={cn(
        "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        "border-t py-3 px-4",
        fixed && "fixed bottom-0 left-0 right-0",
        className
      )}
    >
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <span>Need help?</span>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
        >
          <MessageCircle className="h-4 w-4" />
          Contact support
        </a>
      </div>
    </div>
  );
}
