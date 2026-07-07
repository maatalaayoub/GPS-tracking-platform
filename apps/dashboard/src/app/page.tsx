import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  Globe,
  MapPin,
  Radio,
  Shield,
  Smartphone,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

const FEATURES = [
  {
    icon: <Radio className="h-6 w-6" />,
    title: 'Real-Time Tracking',
    description:
      'Live GPS positions via Socket.IO with sub-second updates on an interactive OpenStreetMap.',
  },
  {
    icon: <Globe className="h-6 w-6" />,
    title: 'OpenStreetMap',
    description:
      'No API keys needed. Beautiful, free maps with route replay and live device markers.',
  },
  {
    icon: <Smartphone className="h-6 w-6" />,
    title: 'Multi-Protocol Ingest',
    description:
      'A generic TCP decoder that accepts JSON payloads and scales to dedicated device protocols.',
  },
  {
    icon: <Activity className="h-6 w-6" />,
    title: 'History & Playback',
    description:
      'Filter positions by device and date range, then replay routes with speed control.',
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: 'Secure & Multi-Tenant',
    description:
      "Supabase Auth + Row Level Security keep each user's devices and data isolated.",
  },
  {
    icon: <MapPin className="h-6 w-6" />,
    title: 'Device Management',
    description:
      'Register, edit, activate, and delete trackers from a clean dashboard interface.',
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar */}
      <header className="border-b bg-white/80 backdrop-blur dark:bg-gray-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="bg-primary flex h-9 w-9 items-center justify-center rounded-lg">
              <Radio className="text-primary-foreground h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              GPS Platform
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
            >
              Sign in
            </Link>
            <Link
              href="/login?mode=signup"
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-24 text-center sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-100 via-white to-white dark:from-gray-900 dark:via-gray-950 dark:to-gray-950" />

        <div className="mx-auto max-w-4xl space-y-8">
          <div className="inline-flex items-center rounded-full border bg-white/50 px-3 py-1 text-sm font-medium backdrop-blur dark:bg-gray-900/50">
            <span className="mr-2 flex h-2 w-2 rounded-full bg-emerald-500" />
            Live tracking now available
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            Track your fleet in <span className="text-primary">real time</span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-gray-600 sm:text-xl dark:text-gray-400">
            A modern GPS tracking platform built with Next.js, Supabase, and
            OpenStreetMap. Monitor devices, replay routes, and manage your fleet
            from one clean dashboard.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/login?mode=signup"
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-11 items-center justify-center gap-2 rounded-md px-8 text-base font-medium"
            >
              Create free account
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-11 items-center justify-center rounded-md border px-8 text-base font-medium"
            >
              Sign in to dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50/50 px-4 py-24 sm:px-6 lg:px-8 dark:bg-gray-900/30">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to track assets
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600 dark:text-gray-400">
              From live maps to historical playback, the platform gives you full
              visibility over your GPS devices.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:bg-gray-950"
              >
                <div className="bg-primary/10 text-primary mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-24 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-2xl bg-gray-950 px-6 py-16 text-white dark:bg-white dark:text-gray-950">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to start tracking?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-gray-400 dark:text-gray-600">
            Create an account, connect your GPS tracker, and see your devices on
            the map in minutes.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/login?mode=signup"
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80 inline-flex h-11 items-center justify-center rounded-md px-8 text-base font-medium"
            >
              Create account
            </Link>
            <Link
              href="/login"
              className="inline-flex h-11 items-center justify-center rounded-md border border-gray-700 px-8 text-base font-medium text-white hover:bg-gray-800 dark:border-gray-300 dark:text-gray-950 dark:hover:bg-gray-100"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <Radio className="h-5 w-5" />
            <span className="font-semibold">GPS Platform</span>
          </div>
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} GPS Platform. Built for real-time
            tracking.
          </p>
        </div>
      </footer>
    </div>
  );
}
