import Link from 'next/link'
import Greetings from '@/components/dashboard/Greetings'
import InfoCard from '@/components/dashboard/InfoCard'
import ClientBox from '@/components/dashboard/ClientBox'
import { Users, FolderKanban, CalendarCheck, AlertCircle, DollarSign, CheckCircle2, Clock, Plus } from 'lucide-react'
import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { ProjectsCount } from "@/lib/actions/project"
import { ClientCount, GetWorkspaceClient } from "@/lib/actions/client"
import { getWorkspace, getUserWorkspaces } from "@/lib/actions/workspace"
import { GetInvoiceSummary } from "@/lib/actions/invoice"
import { GetWorkspaceTaskOverview } from "@/lib/actions/task"
import { GetWorkspaceActivities } from "@/lib/actions/activity"
import { Button } from "@/components/ui/button"
import { CreateClientDialog } from '@/components/workspace/CreateClient'

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
}

function formatOrdinalDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function WorkspaceDashboard({
  params,
}: {
  params: Promise<{ workspace: string }>;
}) {
  const { workspace: workspaceSlug } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect('/sign-in');

  const user = session.user

  // Verify user owns or belongs to this workspace
  const userWorkspaces = await getUserWorkspaces(session.user.id);
  const hasAccess = userWorkspaces.some(w => w.slug === workspaceSlug);
  if (!hasAccess) notFound();

  const workspace = await getWorkspace(workspaceSlug, user.id);
  if (!workspace) notFound();

  // A small, well-scoped set of aggregate reads rather than pulling every
  // record in the workspace into memory.
  const [projectCount, clientCount, invoiceSummary, taskOverview, activityResult, clientsResult] =
    await Promise.all([
      ProjectsCount(workspace.id),
      ClientCount(workspace.id),
      GetInvoiceSummary(workspace.id),
      GetWorkspaceTaskOverview(workspace.id),
      GetWorkspaceActivities(workspace.id, 8),
      GetWorkspaceClient(workspace.id),
    ]);

  const isEmptyWorkspace = clientCount === 0 && projectCount === 0;
  const currency = workspace.defaultCurrency ?? invoiceSummary.currency;

  const upcoming = [...taskOverview.overdue, ...taskOverview.dueSoon]
    .sort((a, b) => (a.dueDate!.getTime() - b.dueDate!.getTime()))
    .slice(0, 6);

  return (
    <div className="flex flex-col gap-3 p-2">
      <Greetings
        user={user.name}
        projectCount={projectCount}
        clientCount={clientCount}
        workspaceId={workspace.id}
      />

      {isEmptyWorkspace ? (
        <div className="flex flex-col items-center gap-2 rounded-md border border-dashed p-10 text-center">
          <FolderKanban className="h-8 w-8 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Let&apos;s get you set up</h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            Add your first client, then create a project under them to start tracking tasks,
            time, and invoices.
          </p>
          <CreateClientDialog workspaceId={workspace.id} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 mid:grid-cols-4">
            <InfoCard
              title="Clients"
              href={`/${workspace.slug}/clients`}
              icon={Users}
              iconBg="rgba(224,17,228,0.15)"
              iconColor="#e011e4"
              subtitleColor={undefined}
              progressColor={undefined}
              count={clientCount}
              subtitle={undefined}
              progress={undefined}
            />

            <InfoCard
              title="Projects"
              href={`/${workspace.slug}/projects`}
              icon={FolderKanban}
              iconBg="rgba(59,130,246,0.15)"
              iconColor="#3b82f6"
              subtitleColor={undefined}
              progressColor={undefined}
              count={projectCount}
              subtitle={undefined}
              progress={undefined}
            />

            <InfoCard
              title="Tasks Due Soon"
              href={`/${workspace.slug}/clients`}
              icon={CalendarCheck}
              iconBg="rgba(249,115,22,0.15)"
              iconColor="#f97316"
              subtitleColor="#f97316"
              progressColor={undefined}
              count={taskOverview.dueSoonCount}
              subtitle="Next 7 days"
              progress={undefined}
            />

            <InfoCard
              title="Overdue Tasks"
              href={`/${workspace.slug}/clients`}
              icon={AlertCircle}
              iconBg="rgba(239,68,68,0.15)"
              iconColor="#ef4444"
              subtitleColor="#ef4444"
              progressColor={undefined}
              count={taskOverview.overdueCount}
              subtitle={taskOverview.overdueCount > 0 ? "Needs attention" : "All caught up"}
              progress={undefined}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 mid:grid-cols-4">
            <InfoCard
              title="Total Invoiced"
              href={`/${workspace.slug}/invoices`}
              icon={DollarSign}
              iconBg="rgba(34,197,94,0.15)"
              iconColor="#22c55e"
              subtitleColor={undefined}
              progressColor={undefined}
              count={formatMoney(invoiceSummary.totalInvoiced, currency)}
              subtitle={undefined}
              progress={undefined}
            />

            <InfoCard
              title="Paid"
              href={`/${workspace.slug}/invoices`}
              icon={CheckCircle2}
              iconBg="rgba(16,185,129,0.15)"
              iconColor="#10b981"
              subtitleColor={undefined}
              progressColor={undefined}
              count={formatMoney(invoiceSummary.totalPaid, currency)}
              subtitle={undefined}
              progress={undefined}
            />

            <InfoCard
              title="Outstanding"
              href={`/${workspace.slug}/invoices`}
              icon={Clock}
              iconBg="rgba(245,158,11,0.15)"
              iconColor="#f59e0b"
              subtitleColor={undefined}
              progressColor={undefined}
              count={formatMoney(invoiceSummary.totalOutstanding, currency)}
              subtitle={undefined}
              progress={undefined}
            />

            <InfoCard
              title="Overdue"
              href={`/${workspace.slug}/invoices`}
              icon={AlertCircle}
              iconBg="rgba(239,68,68,0.15)"
              iconColor="#ef4444"
              subtitleColor="#ef4444"
              progressColor={undefined}
              count={formatMoney(invoiceSummary.totalOverdue, currency)}
              subtitle={
                invoiceSummary.overdueCount > 0
                  ? `${invoiceSummary.overdueCount} invoice${invoiceSummary.overdueCount === 1 ? "" : "s"}`
                  : undefined
              }
              progress={undefined}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <CreateClientDialog workspaceId={workspace.id} />
            <Button asChild variant="outline">
              <Link href={`/${workspace.slug}/clients`}>
                <Plus className="mr-1.5 h-4 w-4" />
                New Project
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/${workspace.slug}/invoices/new`}>
                <Plus className="mr-1.5 h-4 w-4" />
                New Invoice
              </Link>
            </Button>
          </div>

          <div className="grid gap-2 lg:grid-cols-2">
            <div className="rounded-md bg-card p-3 shadow shadow-foreground-secondary/20">
              <p className="mb-2 text-sm font-semibold">Upcoming &amp; Overdue Tasks</p>
              {upcoming.length === 0 ? (
                <p className="py-4 text-sm text-muted-foreground">Nothing due in the next 7 days.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {upcoming.map((t) => {
                    const isOverdue = t.dueDate!.getTime() < Date.now();
                    return (
                      <Link
                        key={t.id}
                        href={`/${workspace.slug}/clients/${t.clientId}/projects/${t.projectId}`}
                        className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/50"
                      >
                        <span className="truncate">
                          {t.title}
                          <span className="ml-2 text-xs text-muted-foreground">{t.projectName}</span>
                        </span>
                        <span className={`shrink-0 text-xs ${isOverdue ? "font-medium text-destructive" : "text-muted-foreground"}`}>
                          {formatOrdinalDate(t.dueDate!)}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="rounded-md bg-card p-3 shadow shadow-foreground-secondary/20">
              <p className="mb-2 text-sm font-semibold">Recent Activity</p>
              {!activityResult.success || activityResult.activities.length === 0 ? (
                <p className="py-4 text-sm text-muted-foreground">No activity yet.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {activityResult.activities.map((act) => (
                    <div key={act.id} className="flex flex-col text-sm">
                      <span>{act.message}</span>
                      <span className="text-xs text-muted-foreground">{formatOrdinalDate(act.createdAt)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <ClientBox title="Clients" clients={clientsResult.client} workspace={workspace.slug} />
        </>
      )}
    </div>
  )
}
