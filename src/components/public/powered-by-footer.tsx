"use client";

import { SUPPORT_WHATSAPP } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface PoweredByFooterProps {
  className?: string;
}

/**
 * Footer component - FanNu Dark Theme Design
 */
export function PoweredByFooter({ className }: PoweredByFooterProps) {
  const whatsappUrl = `https://wa.me/${SUPPORT_WHATSAPP.replace(/[^0-9]/g, "")}`;

  return (
    <footer
      className={cn(
        "flex flex-col items-center gap-3 px-6 py-6 pb-10",
        className
      )}
    >
      <span className="text-subhead font-medium text-muted-foreground">
        Powered by FanNu
      </span>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-subhead text-primary hover:underline transition-colors"
      >
        Need help? Contact support
      </a>
    </footer>
  );
}
