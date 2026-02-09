"use client";

import * as React from "react";
import { Phone } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Ethiopian phone number input - FanNu Dark Theme Design
 */
export function PhoneInput({
  value,
  onChange,
  error,
  className,
  placeholder = "+251 9XX XXX XXXX",
  disabled = false,
}: PhoneInputProps) {
  const getLocalNumber = (fullNumber: string): string => {
    if (fullNumber.startsWith("+251")) {
      return fullNumber.slice(4);
    }
    if (fullNumber.startsWith("251")) {
      return fullNumber.slice(3);
    }
    if (fullNumber.startsWith("0")) {
      return fullNumber.slice(1);
    }
    return fullNumber;
  };

  const localNumber = getLocalNumber(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;
    input = input.replace(/\D/g, "");
    input = input.slice(0, 9);
    onChange(input ? `+251${input}` : "");
  };

  const formatDisplayValue = (num: string): string => {
    if (num.length <= 3) return num;
    if (num.length <= 6) return `${num.slice(0, 3)} ${num.slice(3)}`;
    return `${num.slice(0, 3)} ${num.slice(3, 6)} ${num.slice(6)}`;
  };

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div
        className={cn(
          "flex items-center h-12 rounded-xl border bg-card overflow-hidden transition-colors",
          error ? "border-error" : "border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <div className="flex items-center gap-2 px-4 text-muted-foreground border-r border-border">
          <Phone className="h-4 w-4" />
          <span className="text-body font-medium">+251</span>
        </div>
        <input
          type="tel"
          inputMode="numeric"
          value={formatDisplayValue(localNumber)}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "flex-1 h-full bg-transparent px-4 text-body text-foreground",
            "placeholder:text-muted-foreground",
            "focus:outline-none",
            "disabled:cursor-not-allowed"
          )}
        />
      </div>
      {error && (
        <p className="text-caption text-error">{error}</p>
      )}
    </div>
  );
}

/**
 * Validate an Ethiopian phone number
 */
export function validateEthiopianPhone(phone: string): boolean {
  let localNumber = phone;
  if (phone.startsWith("+251")) {
    localNumber = phone.slice(4);
  } else if (phone.startsWith("251")) {
    localNumber = phone.slice(3);
  } else if (phone.startsWith("0")) {
    localNumber = phone.slice(1);
  }

  return /^[79]\d{8}$/.test(localNumber);
}

/**
 * Format phone number for display
 */
export function formatEthiopianPhone(phone: string): string {
  let localNumber = phone;
  if (phone.startsWith("+251")) {
    localNumber = phone.slice(4);
  } else if (phone.startsWith("251")) {
    localNumber = phone.slice(3);
  } else if (phone.startsWith("0")) {
    localNumber = phone.slice(1);
  }

  if (localNumber.length !== 9) return phone;

  return `+251 ${localNumber.slice(0, 3)} ${localNumber.slice(3, 6)} ${localNumber.slice(6)}`;
}
