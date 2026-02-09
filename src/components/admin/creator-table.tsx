"use client";

import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type CreatorStatus = "pending_approval" | "active" | "suspended";

export interface Creator {
  id: string;
  name: string;
  slug: string;
  avatar: string | null;
  phone: string;
  email: string;
  status: CreatorStatus;
  bookingEnabled: boolean;
  bookingApproved: boolean;
  createdAt: Date;
}

interface CreatorTableProps {
  creators: Creator[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onSuspend: (id: string) => void;
  onReactivate: (id: string) => void;
  onToggleBooking: (id: string, enabled: boolean) => void;
  className?: string;
}

const statusConfig: Record<
  CreatorStatus,
  { label: string; bgColor: string; textColor: string }
> = {
  pending_approval: {
    label: "Pending Approval",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-700",
  },
  active: {
    label: "Active",
    bgColor: "bg-green-100",
    textColor: "text-green-700",
  },
  suspended: {
    label: "Suspended",
    bgColor: "bg-red-100",
    textColor: "text-red-700",
  },
};

function maskPhone(phone: string): string {
  if (phone.length < 8) return phone;
  const lastFour = phone.slice(-4);
  const countryCode = phone.slice(0, 4);
  return `${countryCode} XXX ${lastFour}`;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function CreatorTable({
  creators,
  onApprove,
  onReject,
  onSuspend,
  onReactivate,
  onToggleBooking,
  className,
}: CreatorTableProps) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full min-w-[1000px]">
        <thead>
          <tr className="border-b text-left text-sm font-medium text-muted-foreground">
            <th className="pb-3 pr-4">Creator</th>
            <th className="pb-3 pr-4">Slug</th>
            <th className="pb-3 pr-4">Phone</th>
            <th className="pb-3 pr-4">Email</th>
            <th className="pb-3 pr-4">Status</th>
            <th className="pb-3 pr-4">Booking Enabled</th>
            <th className="pb-3 pr-4">Booking Approved</th>
            <th className="pb-3 pr-4">Created</th>
            <th className="pb-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {creators.map((creator) => {
            const status = statusConfig[creator.status];

            return (
              <tr key={creator.id} className="text-sm">
                {/* Avatar + Name */}
                <td className="py-4 pr-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted">
                      {creator.avatar ? (
                        <img
                          src={creator.avatar}
                          alt={creator.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm font-medium text-muted-foreground">
                          {getInitials(creator.name)}
                        </div>
                      )}
                    </div>
                    <span className="font-medium">{creator.name}</span>
                  </div>
                </td>

                {/* Slug */}
                <td className="py-4 pr-4">
                  <span className="font-mono text-muted-foreground">
                    /c/{creator.slug}
                  </span>
                </td>

                {/* Phone (masked) */}
                <td className="py-4 pr-4 font-mono text-muted-foreground">
                  {maskPhone(creator.phone)}
                </td>

                {/* Email */}
                <td className="py-4 pr-4 text-muted-foreground">
                  {creator.email}
                </td>

                {/* Status Badge */}
                <td className="py-4 pr-4">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                      status.bgColor,
                      status.textColor
                    )}
                  >
                    {status.label}
                  </span>
                </td>

                {/* Booking Enabled */}
                <td className="py-4 pr-4">
                  <span
                    className={cn(
                      "text-sm",
                      creator.bookingEnabled
                        ? "text-green-600 font-medium"
                        : "text-muted-foreground"
                    )}
                  >
                    {creator.bookingEnabled ? "Yes" : "No"}
                  </span>
                </td>

                {/* Booking Approved */}
                <td className="py-4 pr-4">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                      creator.bookingApproved
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    )}
                  >
                    {creator.bookingApproved ? "Yes" : "No"}
                  </span>
                </td>

                {/* Created Date */}
                <td className="py-4 pr-4 text-muted-foreground">
                  {formatDate(creator.createdAt)}
                </td>

                {/* Actions */}
                <td className="py-4">
                  <div className="flex items-center gap-2">
                    {creator.status === "pending_approval" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => onApprove(creator.id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => onReject(creator.id)}
                        >
                          Reject
                        </Button>
                      </>
                    )}

                    {creator.status === "active" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onSuspend(creator.id)}
                          className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          Suspend
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            onToggleBooking(creator.id, !creator.bookingEnabled)
                          }
                        >
                          {creator.bookingEnabled
                            ? "Disable Booking"
                            : "Enable Booking"}
                        </Button>
                      </>
                    )}

                    {creator.status === "suspended" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onReactivate(creator.id)}
                        className="border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700"
                      >
                        Reactivate
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
