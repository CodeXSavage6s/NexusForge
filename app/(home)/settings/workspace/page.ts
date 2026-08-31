import { Building2 } from "lucide-react";
import ComingSoonSection from "@/components/settings/ComingSoonSection";

export const metadata = { title: "Workspace | NexusForge" };

export default function WorkspaceSettingsPage() {
  return (
    <ComingSoonSection
      title="Workspace"
      icon={Building2}
      description="Managing your workspace name, members, and roles is on the way. For now, workspace settings can be adjusted when you create a workspace."
    />
  );
}
