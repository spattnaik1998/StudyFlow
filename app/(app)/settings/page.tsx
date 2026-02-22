"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { User, Clock, Settings, LogOut } from "lucide-react";

interface Profile {
  full_name: string;
  email: string;
  avatar_url?: string;
}

interface UserPreferences {
  work_duration_mins: number;
  short_break_mins: number;
  long_break_mins: number;
  sessions_before_long_break: number;
  auto_start_breaks: boolean;
  energy_pattern: "morning" | "afternoon" | "evening" | "night";
  work_hours_start: string;
  work_hours_end: string;
  theme: "light" | "dark" | "system";
}

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const queryClient = useQueryClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        // Fetch preferences
        const { data: prefData } = await supabase
          .from("user_preferences")
          .select("*")
          .eq("user_id", user.id)
          .single();

        setProfile(
          profileData || {
            full_name: user.user_metadata?.full_name || "",
            email: user.email || "",
            avatar_url: undefined,
          }
        );
        setPreferences(
          prefData || {
            work_duration_mins: 25,
            short_break_mins: 5,
            long_break_mins: 15,
            sessions_before_long_break: 4,
            auto_start_breaks: false,
            energy_pattern: "afternoon",
            work_hours_start: "09:00",
            work_hours_end: "17:00",
            theme: "system",
          }
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleProfileSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .update({ full_name: profile.full_name })
        .eq("id", user.id);

      if (!error) {
        queryClient.invalidateQueries({ queryKey: ["profile"] });
        router.refresh();
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const handlePreferencesSave = async () => {
    if (!preferences) return;
    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from("user_preferences")
        .upsert({
          user_id: user.id,
          ...preferences,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);
    } catch (error) {
      console.error("Error saving preferences:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-600">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Configure your StudyFlow preferences</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="focus">Focus</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-6">
          <Card className="p-6 max-w-2xl">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Profile Information
                </h3>
              </div>

              {/* Avatar Section */}
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold">
                    {profile?.full_name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-gray-600">Profile Avatar</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Avatar upload coming soon
                  </p>
                </div>
              </div>

              {/* Display Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Name
                </label>
                <Input
                  type="text"
                  placeholder="Your name"
                  value={profile?.full_name || ""}
                  className="border-white/20 bg-white/5"
                  onChange={(e) =>
                    setProfile(
                      profile ? { ...profile, full_name: e.target.value } : null
                    )
                  }
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  value={profile?.email || ""}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed from this page
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button onClick={handleProfileSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                {saveSuccess && (
                  <span className="text-sm text-green-500">✓ Saved!</span>
                )}
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Focus Tab */}
        <TabsContent value="focus" className="mt-6">
          <Card className="p-6 max-w-2xl">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Pomodoro Settings
                </h3>
              </div>

              {/* Work Duration */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium text-gray-700">
                    Work Duration
                  </label>
                  <span className="text-lg font-semibold text-indigo-600">
                    {preferences?.work_duration_mins} min
                  </span>
                </div>
                <Slider
                  min={15}
                  max={60}
                  step={5}
                  value={[preferences?.work_duration_mins || 25]}
                  onValueChange={(value) =>
                    setPreferences(
                      preferences
                        ? { ...preferences, work_duration_mins: value[0] }
                        : null
                    )
                  }
                />
              </div>

              {/* Short Break */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium text-gray-700">
                    Short Break
                  </label>
                  <span className="text-lg font-semibold text-green-600">
                    {preferences?.short_break_mins} min
                  </span>
                </div>
                <Slider
                  min={5}
                  max={15}
                  step={1}
                  value={[preferences?.short_break_mins || 5]}
                  onValueChange={(value) =>
                    setPreferences(
                      preferences
                        ? { ...preferences, short_break_mins: value[0] }
                        : null
                    )
                  }
                />
              </div>

              {/* Long Break */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium text-gray-700">
                    Long Break
                  </label>
                  <span className="text-lg font-semibold text-purple-600">
                    {preferences?.long_break_mins} min
                  </span>
                </div>
                <Slider
                  min={15}
                  max={30}
                  step={5}
                  value={[preferences?.long_break_mins || 15]}
                  onValueChange={(value) =>
                    setPreferences(
                      preferences
                        ? { ...preferences, long_break_mins: value[0] }
                        : null
                    )
                  }
                />
              </div>

              {/* Sessions Before Long Break */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sessions Before Long Break
                </label>
                <Select
                  value={
                    preferences?.sessions_before_long_break?.toString() || "4"
                  }
                  onValueChange={(value) =>
                    setPreferences(
                      preferences
                        ? {
                            ...preferences,
                            sessions_before_long_break: parseInt(value),
                          }
                        : null
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2, 3, 4, 5, 6].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} sessions
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Auto-start Breaks */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="autoStartBreaks"
                  checked={preferences?.auto_start_breaks || false}
                  onChange={(e) =>
                    setPreferences(
                      preferences
                        ? { ...preferences, auto_start_breaks: e.target.checked }
                        : null
                    )
                  }
                  className="rounded"
                />
                <label
                  htmlFor="autoStartBreaks"
                  className="text-sm font-medium text-gray-700 cursor-pointer"
                >
                  Automatically start breaks
                </label>
              </div>

              <Button onClick={handlePreferencesSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="mt-6">
          <Card className="p-6 max-w-2xl">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Preferences
                </h3>
              </div>

              {/* Energy Pattern */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Energy Pattern
                </label>
                <Select
                  value={preferences?.energy_pattern || "afternoon"}
                  onValueChange={(value) =>
                    setPreferences(
                      preferences
                        ? {
                            ...preferences,
                            energy_pattern: value as
                              | "morning"
                              | "afternoon"
                              | "evening"
                              | "night",
                          }
                        : null
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">🌅 Morning person</SelectItem>
                    <SelectItem value="afternoon">☀️ Afternoon peak</SelectItem>
                    <SelectItem value="evening">🌆 Evening focused</SelectItem>
                    <SelectItem value="night">🌙 Night owl</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Work Hours Start */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Work Hours Start
                </label>
                <Input
                  type="time"
                  value={preferences?.work_hours_start || "09:00"}
                  onChange={(e) =>
                    setPreferences(
                      preferences
                        ? { ...preferences, work_hours_start: e.target.value }
                        : null
                    )
                  }
                />
              </div>

              {/* Work Hours End */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Work Hours End
                </label>
                <Input
                  type="time"
                  value={preferences?.work_hours_end || "17:00"}
                  onChange={(e) =>
                    setPreferences(
                      preferences
                        ? { ...preferences, work_hours_end: e.target.value }
                        : null
                    )
                  }
                />
              </div>

              {/* Theme */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Theme
                </label>
                <Select
                  value={preferences?.theme || "system"}
                  onValueChange={(value) =>
                    setPreferences(
                      preferences
                        ? {
                            ...preferences,
                            theme: value as "light" | "dark" | "system",
                          }
                        : null
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">☀️ Light</SelectItem>
                    <SelectItem value="dark">🌙 Dark</SelectItem>
                    <SelectItem value="system">⚙️ System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handlePreferencesSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account" className="mt-6">
          <Card className="p-6 max-w-2xl">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Account Management
                </h3>
              </div>

              {/* Change Password */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">
                  Change Password
                </h4>
                <p className="text-sm text-blue-800 mb-3">
                  To change your password, you&apos;ll receive an email with reset
                  instructions
                </p>
                <Button variant="outline" className="bg-white">
                  Send Reset Email
                </Button>
              </div>

              {/* Logout */}
              <div className="pt-4 border-t">
                <h4 className="font-medium text-gray-900 mb-3">Sign Out</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Sign out from all devices and clear your session
                </p>
                <Button
                  variant="destructive"
                  onClick={handleLogout}
                  className="gap-2"
                >
                  <LogOut size={16} />
                  Sign Out
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
