"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Upload,
  X,
  Calendar,
  Clock,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";

type DropType = "EVENT" | "MERCH" | "CONTENT" | "CUSTOM";
type PublishMode = "now" | "schedule";

interface DropFormData {
  coverImage: File | null;
  coverPreview: string | null;
  title: string;
  description: string;
  type: DropType;
  price: string;
  currency: string;
  totalSlots: string;
  vipRequired: boolean;
  publishMode: PublishMode;
  scheduledDate: string;
  scheduledTime: string;
  endDate: string;
  endTime: string;
}

const DROP_TYPES: { value: DropType; label: string; description: string }[] = [
  { value: "EVENT", label: "Event", description: "Concerts, meetups, live shows" },
  { value: "MERCH", label: "Merch", description: "T-shirts, posters, collectibles" },
  { value: "CONTENT", label: "Content", description: "Videos, music, exclusive access" },
  { value: "CUSTOM", label: "Custom", description: "Anything else you want to offer" },
];

export default function CreateDropPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof DropFormData, string>>>({});

  const [formData, setFormData] = useState<DropFormData>({
    coverImage: null,
    coverPreview: null,
    title: "",
    description: "",
    type: "EVENT",
    price: "",
    currency: "ETB",
    totalSlots: "",
    vipRequired: false,
    publishMode: "now",
    scheduledDate: "",
    scheduledTime: "",
    endDate: "",
    endTime: "",
  });

  const updateField = <K extends keyof DropFormData>(
    field: K,
    value: DropFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFileChange = useCallback((file: File | null) => {
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({ ...prev, coverImage: "Please upload an image file" }));
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, coverImage: "Image must be less than 5MB" }));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          coverImage: file,
          coverPreview: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
      setErrors((prev) => ({ ...prev, coverImage: undefined }));
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      handleFileChange(file);
    },
    [handleFileChange]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const removeCoverImage = () => {
    updateField("coverImage", null);
    updateField("coverPreview", null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof DropFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (formData.publishMode === "schedule") {
      if (!formData.scheduledDate) {
        newErrors.scheduledDate = "Scheduled date is required";
      }
      if (!formData.scheduledTime) {
        newErrors.scheduledTime = "Scheduled time is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (action: "draft" | "publish" | "schedule") => {
    if (action !== "draft" && !validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // In a real app, you would send the data to your API here
    console.log("Submitting drop:", {
      ...formData,
      action,
      status: action === "draft" ? "DRAFT" : action === "schedule" ? "SCHEDULED" : "LIVE",
    });

    setIsSubmitting(false);
    router.push("/app/drops");
  };

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/app/drops"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create Drop
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Set up a new drop for your fans
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Cover Image Upload */}
        <div className="space-y-2">
          <Label htmlFor="cover-image">Cover Image</Label>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={cn(
              "relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600",
              formData.coverPreview && "border-solid",
              errors.coverImage && "border-red-500"
            )}
            onClick={() => !formData.coverPreview && fileInputRef.current?.click()}
          >
            {formData.coverPreview ? (
              <div className="relative h-[200px] w-full overflow-hidden rounded-lg">
                <Image
                  src={formData.coverPreview}
                  alt="Cover preview"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeCoverImage();
                  }}
                  className="absolute right-3 top-3 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 px-6 py-8 text-center">
                <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-3">
                  {isDragging ? (
                    <Upload className="h-6 w-6 text-primary" />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {isDragging ? "Drop image here" : "Drag and drop an image"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    or click to browse (max 5MB)
                  </p>
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
            />
          </div>
          {errors.coverImage && (
            <p className="text-sm text-red-500">{errors.coverImage}</p>
          )}
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">
            Title <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            placeholder="Enter drop title"
            value={formData.title}
            onChange={(e) => updateField("title", e.target.value)}
            className={cn(errors.title && "border-red-500")}
          />
          {errors.title && (
            <p className="text-sm text-red-500">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">
            Description <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="description"
            placeholder="Describe what this drop offers..."
            rows={4}
            value={formData.description}
            onChange={(e) => updateField("description", e.target.value)}
            className={cn(errors.description && "border-red-500")}
          />
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description}</p>
          )}
        </div>

        {/* Type */}
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => updateField("type", value as DropType)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select drop type" />
            </SelectTrigger>
            <SelectContent>
              {DROP_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div>
                    <span className="font-medium">{type.label}</span>
                    <span className="ml-2 text-muted-foreground text-xs">
                      {type.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price & Currency */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="price">Price (leave empty for free)</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="1"
              placeholder="0"
              value={formData.price}
              onChange={(e) => updateField("price", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select
              value={formData.currency}
              onValueChange={(value) => updateField("currency", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ETB">ETB (Ethiopian Birr)</SelectItem>
                <SelectItem value="USD">USD (US Dollar)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Total Slots */}
        <div className="space-y-2">
          <Label htmlFor="totalSlots">
            Total Slots (leave empty for unlimited)
          </Label>
          <Input
            id="totalSlots"
            type="number"
            min="1"
            step="1"
            placeholder="Unlimited"
            value={formData.totalSlots}
            onChange={(e) => updateField("totalSlots", e.target.value)}
          />
        </div>

        {/* VIP Required Toggle */}
        <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              VIP Only
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Only VIP subscribers can purchase this drop
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={formData.vipRequired}
            onClick={() => updateField("vipRequired", !formData.vipRequired)}
            className={cn(
              "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              formData.vipRequired ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                formData.vipRequired ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
        </div>

        {/* Schedule Options */}
        <div className="space-y-4">
          <Label>Publish</Label>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => updateField("publishMode", "now")}
              className={cn(
                "flex items-center gap-3 rounded-lg border p-4 text-left transition-colors",
                formData.publishMode === "now"
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  formData.publishMode === "now"
                    ? "bg-primary text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                )}
              >
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Publish Now
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Go live immediately
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => updateField("publishMode", "schedule")}
              className={cn(
                "flex items-center gap-3 rounded-lg border p-4 text-left transition-colors",
                formData.publishMode === "schedule"
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  formData.publishMode === "schedule"
                    ? "bg-primary text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                )}
              >
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Schedule for Later
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Set a future date
                </p>
              </div>
            </button>
          </div>

          {/* Scheduled Date/Time */}
          {formData.publishMode === "schedule" && (
            <div className="grid gap-4 sm:grid-cols-2 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
              <div className="space-y-2">
                <Label htmlFor="scheduledDate">
                  Start Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="scheduledDate"
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => updateField("scheduledDate", e.target.value)}
                  className={cn(errors.scheduledDate && "border-red-500")}
                />
                {errors.scheduledDate && (
                  <p className="text-sm text-red-500">{errors.scheduledDate}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduledTime">
                  Start Time <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="scheduledTime"
                  type="time"
                  value={formData.scheduledTime}
                  onChange={(e) => updateField("scheduledTime", e.target.value)}
                  className={cn(errors.scheduledTime && "border-red-500")}
                />
                {errors.scheduledTime && (
                  <p className="text-sm text-red-500">{errors.scheduledTime}</p>
                )}
              </div>
            </div>
          )}

          {/* End Date/Time (Optional) */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">
              End Date/Time (Optional)
            </Label>
            <div className="grid gap-4 sm:grid-cols-2 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => updateField("endDate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => updateField("endTime", e.target.value)}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Leave empty for no end date. The drop will remain available until manually ended.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 border-t border-gray-200 dark:border-gray-800 pt-6 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSubmit("draft")}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Save Draft
          </Button>
          {formData.publishMode === "schedule" ? (
            <Button
              type="button"
              onClick={() => handleSubmit("schedule")}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scheduling...
                </>
              ) : (
                "Schedule"
              )}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => handleSubmit("publish")}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                "Publish Now"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
