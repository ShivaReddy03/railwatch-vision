import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/app/auth/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROLES } from "@/types";

export const Route = createFileRoute("/_app/settings")({ component: SettingsPage });

function SettingsPage() {
  const { user } = useAuth();
  const roleLabel = ROLES.find((r) => r.value === user?.role)?.label;

  return (
    <AppShell title="Settings" subtitle="Manage your preferences and access">
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="thresholds">Alert Thresholds</TabsTrigger>
          <TabsTrigger value="region">Region & Roles</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="glass-card rounded-xl p-6 space-y-4 max-w-2xl">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Name</Label><Input defaultValue={user?.name} /></div>
            <div><Label>Username</Label><Input defaultValue={user?.username} /></div>
            <div><Label>Role</Label><Input value={roleLabel} readOnly /></div>
            <div><Label>Region</Label><Input value={user?.region || "Nationwide"} readOnly /></div>
          </div>
          <Button>Save changes</Button>
        </TabsContent>

        <TabsContent value="notifications" className="glass-card rounded-xl p-6 space-y-4 max-w-2xl">
          {["Critical alerts", "Warning alerts", "Daily digest", "Maintenance updates", "Train delays"].map((l) => (
            <div key={l} className="flex items-center justify-between"><Label>{l}</Label><Switch defaultChecked /></div>
          ))}
        </TabsContent>

        <TabsContent value="thresholds" className="glass-card rounded-xl p-6 space-y-4 max-w-2xl">
          <div><Label>Detection Confidence Threshold (%)</Label><Input type="number" defaultValue={85} /></div>
          <div><Label>Risk Score Critical Threshold</Label><Input type="number" defaultValue={85} /></div>
          <div><Label>Auto-Acknowledge after (minutes)</Label><Input type="number" defaultValue={30} /></div>
          <Button>Save thresholds</Button>
        </TabsContent>

        <TabsContent value="region" className="glass-card rounded-xl p-6 max-w-2xl">
          <div className="text-sm text-muted-foreground">Role and region assignments are managed by your administrator.</div>
        </TabsContent>

        <TabsContent value="audit" className="glass-card rounded-xl p-6 max-w-3xl">
          <div className="space-y-2 text-sm">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex justify-between border-b border-border py-2">
                <span>User {user?.name} signed in</span>
                <span className="text-muted-foreground text-xs">{new Date(Date.now() - i * 3600000).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
