"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type ChannelFilter = "all" | "telegram" | "whatsapp" | "sms";
export type SourceFilter = "all" | "drop" | "profile" | "direct";
export type StatusFilter = "active" | "unsubscribed";

interface AudienceFiltersProps {
  channelFilter: ChannelFilter;
  sourceFilter: SourceFilter;
  statusFilter: StatusFilter;
  onChannelChange: (value: ChannelFilter) => void;
  onSourceChange: (value: SourceFilter) => void;
  onStatusChange: (value: StatusFilter) => void;
}

export function AudienceFilters({
  channelFilter,
  sourceFilter,
  statusFilter,
  onChannelChange,
  onSourceChange,
  onStatusChange,
}: AudienceFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {/* Channel Filter */}
      <div className="w-full sm:w-auto">
        <Select value={channelFilter} onValueChange={onChannelChange}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Channel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Channels</SelectItem>
            <SelectItem value="telegram">Telegram</SelectItem>
            <SelectItem value="whatsapp">WhatsApp</SelectItem>
            <SelectItem value="sms">SMS</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Source Filter */}
      <div className="w-full sm:w-auto">
        <Select value={sourceFilter} onValueChange={onSourceChange}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="drop">Drop Page</SelectItem>
            <SelectItem value="profile">Creator Profile</SelectItem>
            <SelectItem value="direct">Direct Link</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Status Filter */}
      <div className="w-full sm:w-auto">
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
