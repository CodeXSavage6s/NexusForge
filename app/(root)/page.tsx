'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Check,
  Clock3,
  FileText,
  FolderKanban,
  Menu,
  Users,
  X,
  Zap,
  Building2,
  Crown,
} from 'lucide-react';
import { useState } from 'react';

import ThemeToggle from '@/components/theme-toggle';

const workflow = [
  {
    icon: Building2,
    title: 'Create your workspace',
    text: 'Set up your freelance workspace and keep everything under one roof.',
  },
  {
    icon: Users,
    title: 'Add clients',
    text: 'Keep every client, contact, and project relationship organized.',
  },
  {
    icon: FolderKanban,
    title: 'Create projects',
    text: 'Turn client work into projects with deadlines, budgets, and progress.',
  },
  {
    icon: Check,
    title: 'Manage tasks',
    text: 'Know what needs to be done and what is coming next.',
  },
  {
    icon: Clock3,
    title: 'Track your time',
    text: 'Track the time you spend on work without leaving your workspace.',
  },
  {
    icon: FileText,
    title: 'Invoice & get paid',
    text: 'Create invoices, record payments, and keep your cash flow visible.',
  },
];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">

      {/* NAVBAR */}
      <header className="fixed inset-x-0 top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
        <div className=" flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">

          <Link href="/home" className="flex items-center gap-2">
            <Image
              src="/assets/logo.svg"
              alt="NexusForge"
              width={200}
              height={150}
            />
            {/*<span className="text-lg font-bold tracking-tight">
              NexusForge
            </span>*/}
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm text-muted-foreground transition hover:text-foreground"
            >
              Features
            </a>

            <a
              href="#workflow"
              className="text-sm text-muted-foreground transition hover:text-foreground"
            >
              How it works
            </a>

            <a
              href="#pricing"
              className="text-sm text-muted-foreground transition hover:text-foreground"
            >
              Pricing
            </a>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <ThemeToggle />

            <Link
              href="/sign-in"
              className="rounded-lg px-4 py-2 text-sm font-medium transition hover:bg-muted"
            >
              Sign in
            </Link>

            <Link
              href="/sign-up"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Get started
            </Link>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg p-2 md:hidden"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t bg-background px-5 py-5 md:hidden">
            <div className="flex flex-col gap-4">

              <a
                href="#features"
                onClick={() => setMenuOpen(false)}
              >
                Features
              </a>

              <a
                href="#workflow"
                onClick={() => setMenuOpen(false)}
              >
                How it works
              </a>

              <a
                href="#pricing"
                onClick={() => setMenuOpen(false)}
              >
                Pricing
              </a>
              <ThemeToggle />

              <div className="flex items-center gap-3 border-t pt-4">

                <Link
                  href="/sign-in"
                  className="flex-1 rounded-lg border px-4 py-2.5 text-center text-sm"
                >
                  Sign in
                </Link>

                <Link
                  href="/sign-up"
                  className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground"
                >
                  Get started
                </Link>
              </div>

            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="relative px-5 pb-10 pt-20 sm:px-8 sm:pt-40">

        <div className="absolute inset-x-0 top-0 -z-10 h-[600px] bg-[radial-gradient(circle_at_top,theme(colors.primary/10),transparent_60%)]" />

        <div className="mx-auto max-w-5xl text-center">

          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground load-fade-up">
            <Zap size={13} className="text-primary" />
            BUILT FOR FREELANCERS
          </div>

          <h1 className="flex flex-col gap-2 mx-auto max-w-4xl text-5xl font-bold tracking-[-0.04em] sm:text-6xl lg:text-7xl">
  <span className="">
    <span className="write-line line-1">Run your freelance business</span>
    <span className="write-caret caret-1" aria-hidden="true" />
  </span>
  <span className=" text-blue-500">
    <span className="write-line line-2">without the chaos.</span>
    <span className="write-caret caret-2" aria-hidden="true" />
  </span>
</h1>


          <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg load-fade-up delay-1">
            Clients, projects, tasks, time, invoices, and payments —
            connected in one simple workspace built for freelancers.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row load-fade-up delay-2">

            <Link
              href="/sign-up"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg transition hover:-translate-y-0.5 hover:opacity-90"
            >
              Start for free
              <ArrowRight
                size={17}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>

            <a
              href="#workflow"
              className="inline-flex items-center justify-center rounded-xl border bg-card px-6 py-3.5 text-sm font-semibold transition hover:bg-muted"
            >
              See how it works
            </a>

          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground load-fade-up delay-3">
            <span>✓ Free to start</span>
            <span>✓ No credit card required</span>
            <span>✓ Built for solo work</span>
          </div>

        </div>
                {/* DASHBOARD PREVIEW */}
        <div className="mx-auto mt-16 max-w-6xl scroll-scale">
          <div className="overflow-hidden rounded-2xl border bg-card shadow-2xl">

            {/* Browser bar */}
            <div className="flex h-11 items-center gap-2 border-b px-4">
              <span className="h-2.5 w-2.5 rounded-full border" />
              <span className="h-2.5 w-2.5 rounded-full border" />
              <span className="h-2.5 w-2.5 rounded-full border" />

              <div className="ml-4 h-5 flex-1 rounded-md bg-muted/60" />
            </div>

            <div className="grid min-h-[500px] grid-cols-1 sm:grid-cols-[190px_1fr]">

              {/* Sidebar */}
              <aside className="hidden border-r bg-muted/20 p-4 sm:block">
                <div className="mb-7 flex items-center gap-2">
                  <Image
                    src="/assets/logo.svg"
                    alt=""
                    width={25}
                    height={25}
                  />
                  <span className="text-sm font-bold">
                    NexusForge
                  </span>
                </div>

                <div className="space-y-2">
                  {[
                    'Dashboard',
                    'Clients',
                    'Projects',
                    'Tasks',
                    'Invoices',
                  ].map((item, index) => (
                    <div
                      key={item}
                      className={`rounded-lg px-3 py-2 text-xs ${
                        index === 0
                          ? 'bg-primary/10 font-semibold text-primary'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </aside>

              {/* Dashboard */}
              <div className="p-5 sm:p-8">

                <div className="rounded-2xl border bg-background p-6">
                  <p className="text-sm text-muted-foreground">
                    Welcome Back
                  </p>

                  <h3 className="mt-2 text-2xl font-bold">
                    Code X Savage 👋
                  </h3>

                  <p className="mt-2 text-sm text-muted-foreground">
                    You have 2 projects across 2 clients
                  </p>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <div className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
                      + New Project
                    </div>

                    <div className="rounded-lg border bg-card px-4 py-2.5 text-sm font-semibold">
                      + New Client
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">

                  {[
                    ['Clients', '2'],
                    ['Projects', '2'],
                    ['Tasks Due Soon', '0'],
                    ['Overdue Tasks', '0'],
                    ['Total Invoiced', '$0.00'],
                    ['Paid', '$0.00'],
                    ['Outstanding', '$0.00'],
                    ['Overdue', '$0.00'],
                  ].map(([title, value]) => (
                    <div
                      key={title}
                      className="rounded-xl border bg-background p-5"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        {title === 'Clients' && <Users size={18} />}
                        {title === 'Projects' && (
                          <FolderKanban size={18} />
                        )}
                        {title.includes('Tasks') && <Check size={18} />}
                        {title === 'Total Invoiced' && (
                          <FileText size={18} />
                        )}
                        {title === 'Paid' && <Check size={18} />}
                        {title === 'Outstanding' && (
                          <Clock3 size={18} />
                        )}
                        {title === 'Overdue' && <X size={18} />}
                      </div>

                      <p className="mt-5 text-sm font-medium text-muted-foreground">
                        {title}
                      </p>

                      <p className="mt-3 text-2xl font-bold">
                        {value}
                      </p>
                    </div>
                  ))}

                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WORKFLOW */}
      <section
        id="workflow"
        className="border-y bg-muted/20 px-5 py-24 sm:px-8"
      >
        <div className="mx-auto max-w-6xl">

          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-500 text-center scroll-fade-up">
              One connected workflow
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              From workspace setup to getting paid.
            </h2>

            <p className="mt-4 leading-7 text-muted-foreground text-center">
              NexusForge keeps the pieces of your freelance business
              connected so you spend less time jumping between tools
              and more time doing the work.
            </p>
          </div>

          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-2 lg:grid-cols-3 scroll-stagger">

            {workflow.map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="bg-background p-6"
                >
                  <div className="flex items-center justify-between">

                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon size={19} />
                    </div>

                    <span className="text-xs text-muted-foreground">
                      0{index + 1}
                    </span>

                  </div>

                  <h3 className="mt-6 font-semibold">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {item.text}
                  </p>
                </div>
              );
            })}

          </div>
        </div>
      </section>
            <section id="features" className="px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-6xl">

          <div className="mx-auto max-w-2xl text-center scroll-fade-up">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-500 text-center">
              Everything in one place
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Built around the way freelancers actually work.
            </h2>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-3 scroll-fade">

            <FeatureCard
              icon={<Users size={21} />}
              title="Know your clients"
              text="Keep client information, projects, activity, and communication organized in one place."
              items={[
                'Client profiles',
                'Project relationships',
                'Contact information',
              ]}
            />

            <FeatureCard
              icon={<FolderKanban size={21} />}
              title="Control your projects"
              text="Turn scattered to-do lists into a clear workflow with tasks, deadlines, priorities, and progress."
              items={[
                'Project tracking',
                'Tasks & deadlines',
                'Time tracking',
              ]}
            />

            <FeatureCard
              icon={<FileText size={21} />}
              title="Get paid with clarity"
              text="Create invoices, track what has been paid, and always know what is still outstanding."
              items={[
                'Professional invoices',
                'Payment tracking',
                'Shareable invoice links',
              ]}
            />

          </div>
        </div>
      </section>

      {/* MONEY */}
      <section className="border-y bg-muted/20 px-5 py-24 sm:px-8">
        <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2">

          <div className="scroll-fade-up">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-500 text-center">
              Know your numbers
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Your work should lead to your money.
            </h2>

            <p className="mt-5 leading-7 text-muted-foreground text-center">
              NexusForge connects projects and invoices so you can see
              what you've earned, what you've billed, and what is still
              waiting to be paid.
            </p>

            <div className="mt-8 space-y-4">
              {[
                'Create invoices from your workspace',
                'Record partial or full payments',
                'See outstanding balances',
                'Share invoices with a public link',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">

                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Check size={14} />
                  </div>

                  <span className="text-sm">
                    {item}
                  </span>

                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-5 shadow-xl sm:p-7 scroll-scale">

            <div className="flex items-center justify-between border-b pb-5">

              <div>
                <p className="font-semibold">
                  Invoice INV-0002
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Website redesign
                </p>
              </div>

              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                Partially paid
              </span>

            </div>

            <div className="py-8">
              <p className="text-xs text-muted-foreground">
                Invoice total
              </p>

              <p className="mt-2 text-4xl font-bold">
                $1,320.00
              </p>
            </div>

            <div className="space-y-3 border-t pt-5 text-sm">

              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Paid
                </span>

                <span className="font-medium">
                  $500.00
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Balance
                </span>

                <span className="font-semibold">
                  $820.00
                </span>
              </div>

            </div>

            <Link href="https://nexusforge-beta.vercel.app/invoice/fgvXdqFwjbHNrb65cDSwnSZ8PGtPQd3L">
            <button className="mt-6 w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground">
              View invoice
            </button>
            </Link>

          </div>

        </div>
      </section>

      {/* PREMIUM */}
      <section className="px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-5xl">

          <div className="relative overflow-hidden rounded-3xl border bg-card p-8 sm:p-12 scroll-fade-up">

            <div className="absolute right-0 top-0 -z-0 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />

            <div className="relative z-10 grid gap-10 md:grid-cols-[1fr_auto] md:items-center">

              <div>
                <div className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-xs font-semibold text-primary">
                  <Crown size={14} />
                  PREMIUM
                  <span className="text-blue-500">
                    • COMING SOON
                  </span>
                </div>

                <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                  More power when your business grows.
                </h2>

                <p className="mt-4 max-w-xl leading-7 text-muted-foreground text-center">
                  We're working on premium features designed to give
                  growing freelancers more control, automation, and
                  insight.
                </p>
              </div>

              <Link
                href="/waitlist"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                Join the waitlist
                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>

            </div>
          </div>

        </div>
      </section>
            {/* PRICING */}
      <section id="pricing" className="px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-3xl text-center ">

          <p className="text-sm font-semibold uppercase tracking-widest text-blue-500 text-center">
            Simple pricing
          </p>

          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Start free. Build your workflow.
          </h2>

          <p className="mx-auto mt-4 max-w-xl leading-7 text-muted-foreground">
            Start managing your freelance business without paying upfront.
            Upgrade when NexusForge becomes an essential part of your work.
          </p>

          <div className="mx-auto mt-10 max-w-md rounded-2xl border bg-card p-7 text-left shadow-lg">

            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold">
                  Free
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  Everything you need to get started.
                </p>
              </div>

              <div className="text-right">
                <p className="text-3xl font-bold">
                  $0
                </p>

                <p className="text-xs text-muted-foreground">
                  /month
                </p>
              </div>
            </div>

            <div className="my-7 h-px bg-border" />

            <div className="space-y-3">
              {[
                'Up to 2 clients',
                'Up to 5 projects',
                'Invoice & quotes',
                'Basic reports',
              ].map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-3"
                >
                  <Check
                    size={16}
                    className="text-primary"
                  />

                  <span className="text-sm">
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            <Link
              href="/sign-up"
              className="mt-7 block rounded-lg bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Get started
            </Link>

          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-5 pb-24 sm:px-8 ">
        <div className="mx-auto max-w-6xl rounded-3xl border bg-card px-6 py-16 text-center sm:px-10">

          <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl text-blue-500">
            Your freelance business deserves a home.
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Bring your clients, projects, tasks, time, and invoices
            together with NexusForge.
          </p>

          <Link
            href="/sign-up"
            className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Start building for free

            <ArrowRight
              size={17}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">

          <div className="flex items-center gap-2">
            <Image
              src="/assets/logo.svg"
              alt="NexusForge"
              width={250}
              height={150}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} NexusForge. Built for freelancers.
          </p>

        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  text,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  items: string[];
}) {
  return (
    <div className="rounded-2xl border bg-card p-7 transition hover:-translate-y-1 hover:shadow-lg">

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>

      <h3 className="mt-6 text-lg font-bold">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {text}
      </p>

      <div className="mt-7 space-y-3 border-t pt-6">
        {items.map((item) => (
          <div
            key={item}
            className="flex items-center gap-3 text-sm"
          >
            <Check
              size={15}
              className="text-primary"
            />

            {item}
          </div>
        ))}
      </div>

    </div>
  );
}