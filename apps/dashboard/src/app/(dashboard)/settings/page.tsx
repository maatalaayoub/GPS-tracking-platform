export const dynamic = 'force-dynamic';

import { PageHeader } from '@/components/shared/page-header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { createClient } from '@/lib/supabase/server';

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account and platform configuration"
      />

      <div className="grid max-w-2xl gap-6">
        {/* Account */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Email</span>
              <span className="text-sm font-medium">{user?.email ?? '—'}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">User ID</span>
              <code className="text-muted-foreground text-xs">
                {user?.id ?? '—'}
              </code>
            </div>
          </CardContent>
        </Card>

        {/* Platform */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Platform</CardTitle>
            <CardDescription>
              GPS Platform configuration overview
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'TCP Ingest Port', value: '5000' },
              { label: 'Socket.IO Port', value: '4000' },
              { label: 'Protocol', value: 'Generic JSON (newline-delimited)' },
              { label: 'Database', value: 'Supabase PostgreSQL' },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">{label}</span>
                  <span className="text-sm font-medium">{value}</span>
                </div>
                <Separator className="mt-4" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
