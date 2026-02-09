"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PhoneInput, validateEthiopianPhone } from "@/components/shared/phone-input";
import { Loader2, Upload, X, AlertCircle } from "lucide-react";

// Types
interface Creator {
  id: string;
  name: string;
  slug: string;
  avatarUrl: string;
  acceptingBookings: boolean;
}

interface FormData {
  name: string;
  phone: string;
  email: string;
  bookingType: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  city: string;
  venueAddress: string;
  budgetRange: string;
  description: string;
  consent: boolean;
}

interface FormErrors {
  name?: string;
  phone?: string;
  email?: string;
  bookingType?: string;
  eventDate?: string;
  startTime?: string;
  endTime?: string;
  city?: string;
  description?: string;
  consent?: string;
  attachments?: string;
}

interface BookingRequestFormProps {
  creator: Creator;
}

const BOOKING_TYPES = [
  { value: "live_performance", label: "Live Performance" },
  { value: "mc_hosting", label: "MC/Hosting" },
  { value: "brand_content", label: "Brand Content" },
  { value: "custom", label: "Custom" },
];

const BUDGET_RANGES = [
  { value: "under_5000", label: "Under 5,000 ETB" },
  { value: "5000_15000", label: "5,000 - 15,000 ETB" },
  { value: "15000_50000", label: "15,000 - 50,000 ETB" },
  { value: "50000_100000", label: "50,000 - 100,000 ETB" },
  { value: "over_100000", label: "100,000+ ETB" },
];

const MAX_FILES = 3;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function BookingRequestForm({ creator }: BookingRequestFormProps) {
  const router = useRouter();

  // Form state
  const [formData, setFormData] = React.useState<FormData>({
    name: "",
    phone: "",
    email: "",
    bookingType: "",
    eventDate: "",
    startTime: "",
    endTime: "",
    city: "",
    venueAddress: "",
    budgetRange: "",
    description: "",
    consent: false,
  });

  const [errors, setErrors] = React.useState<FormErrors>({});
  const [attachments, setAttachments] = React.useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const formRef = React.useRef<HTMLFormElement>(null);

  // Update field
  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    // Clear submit error on any change
    if (submitError) {
      setSubmitError(null);
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation (required, min 2 chars)
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Phone validation (required, valid Ethiopian number)
    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!validateEthiopianPhone(formData.phone)) {
      newErrors.phone = "Please enter a valid Ethiopian phone number";
    }

    // Email validation (optional, but must be valid if provided)
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Booking type validation (required)
    if (!formData.bookingType) {
      newErrors.bookingType = "Please select a booking type";
    }

    // Event date validation (required, must be future)
    if (!formData.eventDate) {
      newErrors.eventDate = "Event date is required";
    } else {
      const eventDate = new Date(formData.eventDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (eventDate < today) {
        newErrors.eventDate = "Event date must be in the future";
      }
    }

    // Start time validation (required)
    if (!formData.startTime) {
      newErrors.startTime = "Start time is required";
    }

    // End time validation (required, must be after start time)
    if (!formData.endTime) {
      newErrors.endTime = "End time is required";
    } else if (formData.startTime && formData.endTime <= formData.startTime) {
      newErrors.endTime = "End time must be after start time";
    }

    // City validation (required)
    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    // Description validation (required, min 20 chars)
    if (!formData.description.trim()) {
      newErrors.description = "Please describe what you need";
    } else if (formData.description.trim().length < 20) {
      newErrors.description = "Please provide at least 20 characters";
    }

    // Consent validation (required)
    if (!formData.consent) {
      newErrors.consent = "You must agree to the terms to submit a request";
    }

    setErrors(newErrors);

    // Scroll to first error
    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = Object.keys(newErrors)[0];
      const element = document.querySelector(`[data-field="${firstErrorField}"]`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }

    return Object.keys(newErrors).length === 0;
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Check max files
    if (attachments.length + files.length > MAX_FILES) {
      setErrors((prev) => ({
        ...prev,
        attachments: `Maximum ${MAX_FILES} files allowed`,
      }));
      return;
    }

    // Validate file sizes
    const validFiles = files.filter((file) => {
      if (file.size > MAX_FILE_SIZE) {
        setErrors((prev) => ({
          ...prev,
          attachments: `File "${file.name}" exceeds 10MB limit`,
        }));
        return false;
      }
      return true;
    });

    setAttachments((prev) => [...prev, ...validFiles]);
    setErrors((prev) => ({ ...prev, attachments: undefined }));

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Remove attachment
  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
    setErrors((prev) => ({ ...prev, attachments: undefined }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Generate a mock booking ID
      const bookingId = `bk_${Date.now().toString(36)}`;

      // In a real app, this would be an API call:
      // const response = await fetch('/api/bookings', {
      //   method: 'POST',
      //   body: JSON.stringify({ ...formData, creatorId: creator.id }),
      // });

      // Redirect to success page
      router.push(`/booking/${bookingId}/submitted`);
    } catch (_error) {
      void _error;
      setSubmitError(
        "Something went wrong. Please try again or contact support if the issue persists."
      );
      setIsSubmitting(false);
    }
  };

  // Not accepting bookings state
  if (!creator.acceptingBookings) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <AlertCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Not Accepting Bookings
        </h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          {creator.name} is not currently accepting new booking requests.
          Check back later or visit their profile for updates.
        </p>
        <Button
          variant="outline"
          onClick={() => router.push(`/c/${creator.slug}`)}
        >
          View Profile
        </Button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
      {/* Submit Error Toast */}
      {submitError && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-destructive">
              Submission Failed
            </p>
            <p className="text-sm text-destructive/80 mt-1">{submitError}</p>
          </div>
        </div>
      )}

      {/* Personal Information */}
      <section className="space-y-4">
        <h2 className="font-display text-headline font-bold text-foreground">
          Your Information
        </h2>

        {/* Name */}
        <div className="space-y-2" data-field="name">
          <Label htmlFor="name">
            Your Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={(e) => updateField("name", e.target.value)}
            disabled={isSubmitting}
            className={cn(errors.name && "border-destructive focus-visible:ring-destructive")}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2" data-field="phone">
          <Label htmlFor="phone">
            Phone Number <span className="text-destructive">*</span>
          </Label>
          <PhoneInput
            value={formData.phone}
            onChange={(value) => updateField("phone", value)}
            error={errors.phone}
            disabled={isSubmitting}
          />
        </div>

        {/* Email */}
        <div className="space-y-2" data-field="email">
          <Label htmlFor="email">Email (Optional)</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={(e) => updateField("email", e.target.value)}
            disabled={isSubmitting}
            className={cn(errors.email && "border-destructive focus-visible:ring-destructive")}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email}</p>
          )}
        </div>
      </section>

      {/* Event Details */}
      <section className="space-y-4">
        <h2 className="font-display text-headline font-bold text-foreground">Event Details</h2>

        {/* Booking Type */}
        <div className="space-y-2" data-field="bookingType">
          <Label htmlFor="bookingType">
            Booking Type <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.bookingType}
            onValueChange={(value) => updateField("bookingType", value)}
            disabled={isSubmitting}
          >
            <SelectTrigger
              id="bookingType"
              className={cn(
                errors.bookingType && "border-destructive focus:ring-destructive"
              )}
            >
              <SelectValue placeholder="Select booking type" />
            </SelectTrigger>
            <SelectContent>
              {BOOKING_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.bookingType && (
            <p className="text-sm text-destructive">{errors.bookingType}</p>
          )}
        </div>

        {/* Event Date */}
        <div className="space-y-2" data-field="eventDate">
          <Label htmlFor="eventDate">
            Event Date <span className="text-destructive">*</span>
          </Label>
          <Input
            id="eventDate"
            type="date"
            value={formData.eventDate}
            onChange={(e) => updateField("eventDate", e.target.value)}
            disabled={isSubmitting}
            min={new Date().toISOString().split("T")[0]}
            className={cn(
              errors.eventDate && "border-destructive focus-visible:ring-destructive"
            )}
          />
          {errors.eventDate && (
            <p className="text-sm text-destructive">{errors.eventDate}</p>
          )}
        </div>

        {/* Time Range */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2" data-field="startTime">
            <Label htmlFor="startTime">
              Start Time <span className="text-destructive">*</span>
            </Label>
            <Input
              id="startTime"
              type="time"
              value={formData.startTime}
              onChange={(e) => updateField("startTime", e.target.value)}
              disabled={isSubmitting}
              className={cn(
                errors.startTime && "border-destructive focus-visible:ring-destructive"
              )}
            />
            {errors.startTime && (
              <p className="text-sm text-destructive">{errors.startTime}</p>
            )}
          </div>

          <div className="space-y-2" data-field="endTime">
            <Label htmlFor="endTime">
              End Time <span className="text-destructive">*</span>
            </Label>
            <Input
              id="endTime"
              type="time"
              value={formData.endTime}
              onChange={(e) => updateField("endTime", e.target.value)}
              disabled={isSubmitting}
              className={cn(
                errors.endTime && "border-destructive focus-visible:ring-destructive"
              )}
            />
            {errors.endTime && (
              <p className="text-sm text-destructive">{errors.endTime}</p>
            )}
          </div>
        </div>

        {/* City */}
        <div className="space-y-2" data-field="city">
          <Label htmlFor="city">
            City <span className="text-destructive">*</span>
          </Label>
          <Input
            id="city"
            type="text"
            placeholder="e.g., Addis Ababa"
            value={formData.city}
            onChange={(e) => updateField("city", e.target.value)}
            disabled={isSubmitting}
            className={cn(
              errors.city && "border-destructive focus-visible:ring-destructive"
            )}
          />
          {errors.city && (
            <p className="text-sm text-destructive">{errors.city}</p>
          )}
        </div>

        {/* Venue/Address */}
        <div className="space-y-2" data-field="venueAddress">
          <Label htmlFor="venueAddress">Venue / Address (Optional)</Label>
          <Input
            id="venueAddress"
            type="text"
            placeholder="Venue name or address"
            value={formData.venueAddress}
            onChange={(e) => updateField("venueAddress", e.target.value)}
            disabled={isSubmitting}
          />
        </div>
      </section>

      {/* Budget & Requirements */}
      <section className="space-y-4">
        <h2 className="font-display text-headline font-bold text-foreground">
          Budget & Requirements
        </h2>

        {/* Budget Range */}
        <div className="space-y-2" data-field="budgetRange">
          <Label htmlFor="budgetRange">Budget Range</Label>
          <Select
            value={formData.budgetRange}
            onValueChange={(value) => updateField("budgetRange", value)}
            disabled={isSubmitting}
          >
            <SelectTrigger id="budgetRange">
              <SelectValue placeholder="Select budget range (optional)" />
            </SelectTrigger>
            <SelectContent>
              {BUDGET_RANGES.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Description */}
        <div className="space-y-2" data-field="description">
          <Label htmlFor="description">
            What You Need <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="description"
            placeholder="Describe your event, requirements, and any special requests..."
            value={formData.description}
            onChange={(e) => updateField("description", e.target.value)}
            disabled={isSubmitting}
            rows={5}
            className={cn(
              errors.description && "border-destructive focus-visible:ring-destructive"
            )}
          />
          <div className="flex justify-between">
            {errors.description ? (
              <p className="text-sm text-destructive">{errors.description}</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                {formData.description.length < 20
                  ? `${20 - formData.description.length} more characters needed`
                  : ""}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              {formData.description.length} characters
            </p>
          </div>
        </div>

        {/* Attachments */}
        <div className="space-y-2" data-field="attachments">
          <Label>Attachments (Optional)</Label>
          <p className="text-sm text-muted-foreground mb-2">
            Upload event details, mood boards, or reference materials. Max 3 files, 10MB each.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            multiple
            accept="image/*,.pdf,.doc,.docx"
            disabled={isSubmitting || attachments.length >= MAX_FILES}
          />

          {/* File list */}
          {attachments.length > 0 && (
            <div className="space-y-2 mb-3">
              {attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-md border bg-muted/50 px-3 py-2"
                >
                  <span className="text-sm truncate max-w-[200px]">
                    {file.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    disabled={isSubmitting}
                    className="text-muted-foreground hover:text-foreground p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {attachments.length < MAX_FILES && (
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSubmitting}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload File
            </Button>
          )}

          {errors.attachments && (
            <p className="text-sm text-destructive">{errors.attachments}</p>
          )}
        </div>
      </section>

      {/* Consent */}
      <section className="space-y-4">
        <div className="flex items-start space-x-3" data-field="consent">
          <Checkbox
            id="consent"
            checked={formData.consent}
            onCheckedChange={(checked) => updateField("consent", checked as boolean)}
            disabled={isSubmitting}
            className={cn(errors.consent && "border-destructive")}
          />
          <div className="grid gap-1.5 leading-none">
            <label
              htmlFor="consent"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              I agree to the terms and conditions{" "}
              <span className="text-destructive">*</span>
            </label>
            <p className="text-sm text-muted-foreground">
              By submitting this request, you agree to our terms of service and
              acknowledge that the creator may contact you regarding your booking.
            </p>
          </div>
        </div>
        {errors.consent && (
          <p className="text-sm text-destructive ml-7">{errors.consent}</p>
        )}
      </section>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Request"
        )}
      </Button>
    </form>
  );
}
