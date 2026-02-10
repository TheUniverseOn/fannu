"use client";

import { useState } from "react";
import Image from "next/image";
import {
  LogOut,
  Save,
  Loader2,
  User,
  Calendar,
  Bell,
  Link as LinkIcon,
  Camera,
  Copy,
  Check,
  ExternalLink,
  Mail,
  Phone,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// Mock initial data
const mockCreator = {
  id: "creator-1",
  slug: "teddy-afro",
  displayName: "Teddy Afro",
  bio: "Ethiopian music legend. Join my VIP list for exclusive updates and early access to tickets!",
  phone: "+251911234567",
  email: "teddy@example.com",
  avatarUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop",
  bookingsEnabled: true,
  defaultDepositPercent: 30,
  depositRefundable: true,
  additionalTerms: "Please provide at least 2 weeks notice for booking cancellations.",
  notifyNewBooking: true,
  notifyNewVIP: true,
  notifyPayment: true,
  notifyByEmail: true,
  notifyBySMS: false,
};

type SettingsTab = "profile" | "booking" | "notifications" | "links";

const tabs: { key: SettingsTab; label: string; icon: React.ElementType }[] = [
  { key: "profile", label: "Profile", icon: User },
  { key: "booking", label: "Booking", icon: Calendar },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "links", label: "Links", icon: LinkIcon },
];

// Components
function SettingsCard({
  title,
  description,
  children,
  danger,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <div className={cn(
      "rounded-xl border bg-card p-6",
      danger ? "border-destructive/30" : "border-border"
    )}>
      <div className="mb-4">
        <h3 className={cn(
          "font-semibold",
          danger ? "text-destructive" : "text-foreground"
        )}>
          {title}
        </h3>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <label className="flex items-start gap-4 cursor-pointer">
      <div className="relative mt-0.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className={cn(
          "h-6 w-11 rounded-full transition-colors",
          checked ? "bg-primary" : "bg-muted"
        )} />
        <div className={cn(
          "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform shadow-sm",
          checked && "translate-x-5"
        )} />
      </div>
      <div className="flex-1">
        <p className="font-medium text-foreground">{label}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </label>
  );
}

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input value={value} readOnly className="font-mono text-sm" />
        <Button variant="outline" size="icon" onClick={handleCopy}>
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </Button>
        <Button variant="outline" size="icon" asChild>
          <a href={value} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  // Profile state
  const [displayName, setDisplayName] = useState(mockCreator.displayName);
  const [bio, setBio] = useState(mockCreator.bio);
  const [email, setEmail] = useState(mockCreator.email);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(mockCreator.avatarUrl);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Booking state
  const [bookingsEnabled, setBookingsEnabled] = useState(mockCreator.bookingsEnabled);
  const [depositPercent, setDepositPercent] = useState(mockCreator.defaultDepositPercent);
  const [depositRefundable, setDepositRefundable] = useState(mockCreator.depositRefundable);
  const [additionalTerms, setAdditionalTerms] = useState(mockCreator.additionalTerms);
  const [bookingSaving, setBookingSaving] = useState(false);
  const [bookingSaved, setBookingSaved] = useState(false);

  // Notification state
  const [notifyNewBooking, setNotifyNewBooking] = useState(mockCreator.notifyNewBooking);
  const [notifyNewVIP, setNotifyNewVIP] = useState(mockCreator.notifyNewVIP);
  const [notifyPayment, setNotifyPayment] = useState(mockCreator.notifyPayment);
  const [notifyByEmail, setNotifyByEmail] = useState(mockCreator.notifyByEmail);
  const [notifyBySMS, setNotifyBySMS] = useState(mockCreator.notifyBySMS);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://fannu.et";

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarUrl(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setProfileSaving(false);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleSaveBooking = async () => {
    setBookingSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setBookingSaving(false);
    setBookingSaved(true);
    setTimeout(() => setBookingSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your profile, preferences, and account settings.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Avatar Card */}
          <SettingsCard title="Profile Photo" description="This will be displayed on your public profile.">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="h-24 w-24 rounded-full overflow-hidden bg-muted">
                  {avatarUrl ? (
                    <Image src={avatarUrl} alt={displayName} fill className="object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary to-pink-500 text-2xl font-bold text-white">
                      {displayName.split(" ").map(n => n[0]).join("")}
                    </div>
                  )}
                </div>
                <label className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors">
                  <Camera className="h-4 w-4" />
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="sr-only" />
                </label>
              </div>
              <p className="text-xs text-muted-foreground">JPG, PNG. Max 2MB</p>
            </div>
          </SettingsCard>

          {/* Profile Info Card */}
          <div className="lg:col-span-2">
            <SettingsCard title="Profile Information" description="Update your public profile details.">
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your stage name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={mockCreator.phone}
                      readOnly
                      disabled
                      className="pl-10 bg-muted"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Contact support to change your phone number.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell your fans about yourself..."
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">{bio.length}/500 characters</p>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <Button onClick={handleSaveProfile} disabled={profileSaving}>
                    {profileSaving ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
                    ) : (
                      <><Save className="mr-2 h-4 w-4" />Save Changes</>
                    )}
                  </Button>
                  {profileSaved && <span className="text-sm text-green-500">Saved!</span>}
                </div>
              </div>
            </SettingsCard>
          </div>
        </div>
      )}

      {/* Booking Tab */}
      {activeTab === "booking" && (
        <div className="space-y-6">
          <SettingsCard title="Booking Availability" description="Control whether clients can book you.">
            <Toggle
              checked={bookingsEnabled}
              onChange={setBookingsEnabled}
              label="Accept Booking Requests"
              description="When enabled, clients can submit booking requests through your profile."
            />
          </SettingsCard>

          <SettingsCard title="Deposit Settings" description="Configure your deposit requirements.">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Default Deposit Percentage</Label>
                  <span className="text-2xl font-bold text-primary">{depositPercent}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  step={5}
                  value={depositPercent}
                  onChange={(e) => setDepositPercent(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>10%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
              <Toggle
                checked={depositRefundable}
                onChange={setDepositRefundable}
                label="Refundable Deposit"
                description="Allow deposits to be refunded under your terms."
              />
            </div>
          </SettingsCard>

          <SettingsCard title="Default Terms" description="These terms will be included in all booking quotes.">
            <div className="space-y-4">
              <Textarea
                value={additionalTerms}
                onChange={(e) => setAdditionalTerms(e.target.value)}
                placeholder="Enter any default terms..."
                rows={4}
              />
              <div className="flex items-center gap-3">
                <Button onClick={handleSaveBooking} disabled={bookingSaving}>
                  {bookingSaving ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
                  ) : (
                    <><Save className="mr-2 h-4 w-4" />Save Booking Settings</>
                  )}
                </Button>
                {bookingSaved && <span className="text-sm text-green-500">Saved!</span>}
              </div>
            </div>
          </SettingsCard>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <div className="space-y-6">
          <SettingsCard title="Notification Events" description="Choose what you want to be notified about.">
            <div className="space-y-4">
              <Toggle
                checked={notifyNewBooking}
                onChange={setNotifyNewBooking}
                label="New Booking Request"
                description="Get notified when someone submits a booking request."
              />
              <Toggle
                checked={notifyNewVIP}
                onChange={setNotifyNewVIP}
                label="New VIP Subscriber"
                description="Get notified when someone joins your VIP list."
              />
              <Toggle
                checked={notifyPayment}
                onChange={setNotifyPayment}
                label="Payment Received"
                description="Get notified when you receive a payment."
              />
            </div>
          </SettingsCard>

          <SettingsCard title="Notification Channels" description="How you want to receive notifications.">
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-lg border border-border">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                  <Mail className="h-5 w-5 text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">Email</p>
                  <p className="text-sm text-muted-foreground">{mockCreator.email}</p>
                </div>
                <Toggle checked={notifyByEmail} onChange={setNotifyByEmail} label="" />
              </div>
              <div className="flex items-center gap-4 p-4 rounded-lg border border-border">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                  <Smartphone className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">SMS</p>
                  <p className="text-sm text-muted-foreground">{mockCreator.phone}</p>
                </div>
                <Toggle checked={notifyBySMS} onChange={setNotifyBySMS} label="" />
              </div>
            </div>
          </SettingsCard>
        </div>
      )}

      {/* Links Tab */}
      {activeTab === "links" && (
        <div className="space-y-6">
          <SettingsCard title="Your Public Links" description="Share these links with your fans and clients.">
            <div className="space-y-4">
              <CopyField label="Profile Page" value={`${baseUrl}/c/${mockCreator.slug}`} />
              <CopyField label="Booking Page" value={`${baseUrl}/book/${mockCreator.slug}`} />
            </div>
          </SettingsCard>

          <SettingsCard title="QR Code" description="Scan to visit your profile.">
            <div className="flex items-center gap-6">
              <div className="h-32 w-32 rounded-xl bg-white p-2 flex items-center justify-center">
                <div className="h-full w-full bg-muted rounded flex items-center justify-center text-muted-foreground text-xs">
                  QR Code
                </div>
              </div>
              <div className="space-y-2">
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download PNG
                </Button>
                <p className="text-xs text-muted-foreground">Print this for events and merch.</p>
              </div>
            </div>
          </SettingsCard>

          <SettingsCard title="Danger Zone" description="Irreversible actions." danger>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-foreground">Sign Out</p>
                <p className="text-sm text-muted-foreground">Sign out of your account on this device.</p>
              </div>
              <Button variant="destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </SettingsCard>
        </div>
      )}
    </div>
  );
}

function Download(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  );
}
