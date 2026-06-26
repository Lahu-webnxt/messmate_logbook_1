import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Moon, Sun, User, Lock, Bell, LogOut, Save, Building2, Mail } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — MessMate" }] }),
  component: SettingsPage,
});

type Profile = { name: string; email: string; phone: string; messName: string };
type Prefs = {
  lunchAlerts: boolean;
  dinnerAlerts: boolean;
  lowStock: boolean;
  weeklyReport: boolean;
};

const defaultProfile: Profile = {
  name: "Admin User",
  email: "admin@messmate.app",
  phone: "",
  messName: "MessMate Kitchen",
};
const defaultPrefs: Prefs = {
  lunchAlerts: true,
  dinnerAlerts: true,
  lowStock: true,
  weeklyReport: false,
};

function SettingsPage() {
  const router = useRouter();
  const [dark, setDark] = useState(false);
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [prefs, setPrefs] = useState<Prefs>(defaultPrefs);
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const v = localStorage.getItem("theme") === "dark";
    setDark(v);
    document.documentElement.classList.toggle("dark", v);
    try {
      const p = localStorage.getItem("messmate.profile");
      if (p) setProfile({ ...defaultProfile, ...JSON.parse(p) });
      const pr = localStorage.getItem("messmate.prefs");
      if (pr) setPrefs({ ...defaultPrefs, ...JSON.parse(pr) });
    } catch (e) {
      console.error(e);
    }
  }, []);

  const toggleTheme = (v: boolean) => {
    setDark(v);
    document.documentElement.classList.toggle("dark", v);
    localStorage.setItem("theme", v ? "dark" : "light");
  };

  const saveProfile = () => {
    if (!profile.name.trim()) return toast.error("Name is required");
    localStorage.setItem("messmate.profile", JSON.stringify(profile));
    toast.success("Profile updated");
  };

  const savePrefs = (next: Prefs) => {
    setPrefs(next);
    localStorage.setItem("messmate.prefs", JSON.stringify(next));
  };

  const changePassword = () => {
    if (!pw.current || !pw.next) return toast.error("Fill current and new password");
    if (pw.next.length < 6) return toast.error("Password must be at least 6 characters");
    if (pw.next !== pw.confirm) return toast.error("Passwords do not match");
    toast.success("Password updated");
    setPw({ current: "", next: "", confirm: "" });
  };

  const logout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("messmate.profile");
    localStorage.removeItem("messmate.prefs");
    toast.success("Logged out successfully.");
    router.navigate({ to: "/login" });
  };

  return (
    <div className="p-4 sm:p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your profile, security and preferences
        </p>
      </header>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="flex w-full flex-wrap justify-start gap-1 bg-muted/60 p-1">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Lock className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Sun className="h-4 w-4" />
            Appearance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-5">
          <div className="grid max-w-2xl gap-5 rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
            <h2 className="text-base font-semibold">Profile information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" icon={User}>
                <Input
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </Field>
              <Field label="Mess name" icon={Building2}>
                <Input
                  value={profile.messName}
                  onChange={(e) => setProfile({ ...profile, messName: e.target.value })}
                />
              </Field>
              <Field label="Email" icon={Mail}>
                <Input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
              </Field>
              <Field label="Phone">
                <Input
                  value={profile.phone}
                  inputMode="numeric"
                  maxLength={10}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                    })
                  }
                />
              </Field>
            </div>
            <div className="flex justify-end">
              <Button onClick={saveProfile} className="gap-2">
                <Save className="h-4 w-4" /> Save changes
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="security" className="mt-5">
          <div className="grid max-w-xl gap-5 rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
            <h2 className="text-base font-semibold">Change password</h2>
            <Field label="Current password">
              <Input
                type="password"
                value={pw.current}
                onChange={(e) => setPw({ ...pw, current: e.target.value })}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="New password">
                <Input
                  type="password"
                  value={pw.next}
                  onChange={(e) => setPw({ ...pw, next: e.target.value })}
                />
              </Field>
              <Field label="Confirm new password">
                <Input
                  type="password"
                  value={pw.confirm}
                  onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
                />
              </Field>
            </div>
            <div className="flex justify-end">
              <Button onClick={changePassword} className="gap-2">
                <Lock className="h-4 w-4" /> Update password
              </Button>
            </div>
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900/50 dark:bg-rose-950/30">
              <h3 className="text-sm font-semibold text-rose-700 dark:text-rose-300">Sign out</h3>
              <p className="mt-1 text-xs text-rose-600/80 dark:text-rose-300/70">
                End your current session on this device.
              </p>
              <Button variant="destructive" className="mt-3 gap-2" onClick={logout}>
                <LogOut className="h-4 w-4" /> Logout
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="mt-5">
          <div className="grid max-w-2xl gap-3 rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
            <h2 className="text-base font-semibold">Notification preferences</h2>
            <PrefRow
              title="Lunch reminders"
              desc="Daily reminder before lunch service."
              checked={prefs.lunchAlerts}
              onChange={(v) => savePrefs({ ...prefs, lunchAlerts: v })}
            />
            <PrefRow
              title="Dinner reminders"
              desc="Daily reminder before dinner service."
              checked={prefs.dinnerAlerts}
              onChange={(v) => savePrefs({ ...prefs, dinnerAlerts: v })}
            />
            <PrefRow
              title="Low stock alerts"
              desc="Notify when an inventory item drops below the minimum."
              checked={prefs.lowStock}
              onChange={(v) => savePrefs({ ...prefs, lowStock: v })}
            />
            <PrefRow
              title="Weekly summary"
              desc="Get a weekly digest of attendance and meals consumed."
              checked={prefs.weeklyReport}
              onChange={(v) => savePrefs({ ...prefs, weeklyReport: v })}
            />
          </div>
        </TabsContent>

        <TabsContent value="appearance" className="mt-5">
          <div className="grid max-w-xl gap-3 rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                {dark ? (
                  <Moon className="h-5 w-5 shrink-0" />
                ) : (
                  <Sun className="h-5 w-5 shrink-0" />
                )}
                <div className="min-w-0">
                  <Label className="text-base">Dark mode</Label>
                  <p className="text-xs text-muted-foreground">
                    Switch the entire app to a darker theme.
                  </p>
                </div>
              </div>
              <Switch checked={dark} onCheckedChange={toggleTheme} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </Label>
      {children}
    </div>
  );
}

function PrefRow({
  title,
  desc,
  checked,
  onChange,
}: {
  title: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border p-3">
      <div className="min-w-0">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
