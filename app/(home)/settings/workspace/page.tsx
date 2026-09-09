import Link from "next/link";
import { Building2 } from "lucide-react";
import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUserWorkspaces } from "@/lib/actions/workspace";
import WorkspaceBusinessForm from "@/components/settings/WorkspaceBusinessForm";

export const metadata = { title: "Workspace | NexusForge" };

export default async function WorkspaceSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ ws?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/sign-in");

  const { ws } = await searchParams;
  const workspaces = await getUserWorkspaces(session.user.id);

  if (workspaces.length === 0) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-3 rounded-2xl border border-dashed border-border p-12 text-center">
        <Building2 className="h-8 w-8 text-muted-foreground" />
        <h3 className="text-lg font-semibold">No workspace yet</h3>
        <p className="text-sm text-muted-foreground">
          Create a workspace first — business info lives on the workspace, and invoices need it.
        </p>
        <Link href="/home" className="text-sm font-medium text-primary underline underline-offset-4">
          Go create one
        </Link>
      </div>
    );
  }

  const active = workspaces.find((w) => w.slug === ws) ?? workspaces[0];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-3">
      <div>
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          <h1 className="text-2xl font-bold">Workspace</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Business details used on your invoices and the public invoice page your clients see.
        </p>
      </div>

      {workspaces.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          {workspaces.map((w) => (
            <Link
              key={w.id}
              href={`/settings/workspace?ws=${w.slug}`}
              className={`rounded-full border px-3 py-1 text-sm transition ${
                w.id === active.id
                  ? "border-primary bg-primary/10 font-medium text-primary"
                  : "border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {w.name}
            </Link>
          ))}
        </div>
      ) : null}

      <WorkspaceBusinessForm
        key={active.id}
        initialValues={{
          workspaceId: active.id,
          name: active.name,
          businessEmail: active.businessEmail ?? "",
          businessPhone: active.businessPhone ?? "",
          businessAddress: active.businessAddress ?? "",
          taxId: active.taxId ?? "",
          defaultCurrency: active.defaultCurrency ?? "USD",
          paymentInstructions: active.paymentInstructions ?? "",
        }}
      />
    </div>
  );
}
