import { useState } from "react";
import {
  Star,
  Pencil,
  Plus,
  Archive,
  Trash2,
  Clock,
  FileText,
  Users,
  Wallet,
  CheckCircle2,
  Circle,
  ChevronRight,
  ListChecks,
  StickyNote,
  FolderKanban,
  Settings as SettingsIcon,
  MessageSquare,
} from "lucide-react";

// ---- Design tokens -------------------------------------------------------
const C = {
  ink: "#12201A",
  ink2: "#1B2A22",
  ink3: "#24362A",
  inkLine: "#334638",
  paper: "#F2ECDC",
  paperDim: "#E8E0C7",
  paperLine: "#D8CBA3",
  brass: "#C0924C",
  brassDim: "#8E703C",
  rust: "#A8462F",
  sage: "#5F6B54",
  textDark: "#20261C",
  textMute: "#726B54",
  cream: "#F8F3E5",
};

const font = {
  display: "'Fraunces', ui-serif, Georgia, serif",
  body: "'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif",
  mono: "'IBM Plex Mono', ui-monospace, monospace",
};

// ---- Mock data (presentation only, no fetching / no business logic) ----
const CLIENT = {
  name: "TechNova",
  tagline: "Web Development Client",
  fileCode: "TN-004",
  status: "Active",
  created: "5 months ago",
  lastActivity: "Yesterday",
  healthStars: 5,
  healthLabel: "Healthy Client",
  snapshot: {
    projects: 3,
    tasks: 12,
    documents: 5,
    lastWorked: "Yesterday",
    memberSince: "January",
    totalEarned: "$12,500",
  },
  budget: "$8,500",
  outstanding: "$500",
  projects: [
    { name: "Website Redesign", status: "Active", progress: 72, due: "Due in 12 days" },
    { name: "Landing Page", status: "Completed", progress: 100, due: null },
    { name: "Maintenance", status: "Planning", progress: 10, due: null },
  ],
  activity: [
    { time: "Yesterday", label: "Created project", detail: "Website Redesign" },
    { time: "2 days ago", label: "Uploaded logo", detail: null },
    { time: "1 week ago", label: "Completed", detail: "Landing Page" },
  ],
};

const TABS = [
  { id: "summary", label: "Summary", icon: ListChecks },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "notes", label: "Notes", icon: StickyNote },
  { id: "settings", label: "Settings", icon: SettingsIcon },
  { id: "comms", label: "Comms", icon: MessageSquare, soon: true },
];

// ---- Small building blocks ----------------------------------------------
function StampBadge() {
  return (
    <div
      className="absolute -bottom-8 right-8 flex h-20 w-20 rotate-[-9deg] flex-col items-center justify-center rounded-full border-2 text-center"
      style={{ borderColor: C.brass, backgroundColor: "rgba(192,146,76,0.08)" }}
    >
      <span
        className="text-[10px] font-semibold tracking-[0.18em]"
        style={{ color: C.brass, fontFamily: font.mono }}
      >
        ACTIVE
      </span>
      <span className="mt-1 flex gap-[1px]">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={9}
            style={{ color: C.brass }}
            fill={i < CLIENT.healthStars ? C.brass : "none"}
          />
        ))}
      </span>
      <span
        className="mt-1 text-[8px] tracking-[0.25em]"
        style={{ color: C.brassDim, fontFamily: font.mono }}
      >
        FILE
      </span>
    </div>
  );
}

function SnapshotStat({ label, value }) {
  return (
    <div className="flex flex-col items-start px-5 py-4 first:pl-0">
      <span
        className="text-[10px] uppercase tracking-[0.14em]"
        style={{ color: C.textMute, fontFamily: font.mono }}
      >
        {label}
      </span>
      <span
        className="mt-1 text-lg"
        style={{ color: C.textDark, fontFamily: font.mono, fontWeight: 500 }}
      >
        {value}
      </span>
    </div>
  );
}

function SectionHeading({ eyebrow, title }) {
  return (
    <div className="mb-4 flex items-baseline gap-3">
      <h3
        className="text-xl"
        style={{ color: C.textDark, fontFamily: font.display, fontWeight: 600 }}
      >
        {title}
      </h3>
      {eyebrow && (
        <span
          className="text-[10px] uppercase tracking-[0.16em]"
          style={{ color: C.textMute, fontFamily: font.mono }}
        >
          {eyebrow}
        </span>
      )}
    </div>
  );
}

function LedgerRow({ label, value, tone }) {
  return (
    <div
      className="flex items-center justify-between border-t py-3"
      style={{ borderColor: C.paperLine }}
    >
      <span className="text-sm" style={{ color: C.textMute, fontFamily: font.body }}>
        {label}
      </span>
      <span
        className="text-base"
        style={{
          color: tone === "rust" ? C.rust : C.textDark,
          fontFamily: font.mono,
          fontWeight: 500,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function ActivityItem({ time, label, detail, isLast }) {
  return (
    <div className="relative flex gap-3 pb-5 pl-1 last:pb-0">
      <div className="relative flex flex-col items-center">
        <span
          className="mt-1 h-2 w-2 rounded-full"
          style={{ backgroundColor: C.brass }}
        />
        {!isLast && (
          <span className="mt-1 w-px flex-1" style={{ backgroundColor: C.paperLine }} />
        )}
      </div>
      <div className="pb-1">
        <span
          className="block text-[10px] uppercase tracking-[0.12em]"
          style={{ color: C.textMute, fontFamily: font.mono }}
        >
          {time}
        </span>
        <span className="text-sm" style={{ color: C.textDark, fontFamily: font.body }}>
          {label}
          {detail && (
            <span style={{ color: C.textMute }}> · {detail}</span>
          )}
        </span>
      </div>
    </div>
  );
}

function ProjectRow({ name, status, progress, due }) {
  const statusColor =
    status === "Active" ? C.brass : status === "Completed" ? C.sage : C.textMute;
  return (
    <button
      type="button"
      className="group flex w-full items-center justify-between gap-4 border-t py-4 text-left"
      style={{ borderColor: C.paperLine }}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span
            className="text-base"
            style={{ color: C.textDark, fontFamily: font.display, fontWeight: 600 }}
          >
            {name}
          </span>
          <span
            className="rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.1em]"
            style={{
              color: statusColor,
              border: `1px solid ${statusColor}`,
              fontFamily: font.mono,
            }}
          >
            {status}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-3">
          <div
            className="h-1.5 w-40 overflow-hidden rounded-full"
            style={{ backgroundColor: C.paperDim }}
          >
            <div
              className="h-full rounded-full"
              style={{ width: `${progress}%`, backgroundColor: C.brass }}
            />
          </div>
          <span
            className="text-xs"
            style={{ color: C.textMute, fontFamily: font.mono }}
          >
            {progress}%
          </span>
          {due && (
            <span
              className="text-xs"
              style={{ color: C.textMute, fontFamily: font.body }}
            >
              {due}
            </span>
          )}
        </div>
      </div>
      <ChevronRight
        size={18}
        className="shrink-0 opacity-40 transition-opacity group-hover:opacity-100"
        style={{ color: C.textDark }}
      />
    </button>
  );
}

function FieldRow({ label, value }) {
  return (
    <div className="grid grid-cols-[140px_1fr] items-center gap-4 border-t py-3" style={{ borderColor: C.paperLine }}>
      <span className="text-xs uppercase tracking-[0.1em]" style={{ color: C.textMute, fontFamily: font.mono }}>
        {label}
      </span>
      <span
        className="rounded-md px-3 py-2 text-sm"
        style={{ backgroundColor: C.cream, color: C.textDark, fontFamily: font.body }}
      >
        {value}
      </span>
    </div>
  );
}

// ---- Tab panels -----------------------------------------------------------
function SummaryTab() {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
      <div className="md:col-span-3">
        <SectionHeading title="Relationship health" eyebrow="Score" />
        <div
          className="rounded-lg border p-5"
          style={{ borderColor: C.paperLine, backgroundColor: C.cream }}
        >
          <div className="flex items-center gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={18}
                style={{ color: C.brass }}
                fill={i < CLIENT.healthStars ? C.brass : "none"}
              />
            ))}
            <span
              className="ml-2 text-sm"
              style={{ color: C.textDark, fontFamily: font.body, fontWeight: 500 }}
            >
              {CLIENT.healthLabel}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div>
              <span className="block text-[10px] uppercase tracking-[0.1em]" style={{ color: C.textMute, fontFamily: font.mono }}>
                Last activity
              </span>
              <span className="text-sm" style={{ color: C.textDark, fontFamily: font.body }}>
                {CLIENT.lastActivity}
              </span>
            </div>
            <div>
              <span className="block text-[10px] uppercase tracking-[0.1em]" style={{ color: C.textMute, fontFamily: font.mono }}>
                Projects
              </span>
              <span className="text-sm" style={{ color: C.textDark, fontFamily: font.body }}>
                {CLIENT.snapshot.projects} open
              </span>
            </div>
            <div>
              <span className="block text-[10px] uppercase tracking-[0.1em]" style={{ color: C.textMute, fontFamily: font.mono }}>
                Outstanding
              </span>
              <span className="text-sm" style={{ color: C.rust, fontFamily: font.body }}>
                {CLIENT.outstanding}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <SectionHeading title="Current projects" eyebrow="Preview" />
          <div style={{ borderColor: C.paperLine }}>
            {CLIENT.projects.slice(0, 2).map((p) => (
              <ProjectRow key={p.name} {...p} />
            ))}
          </div>
        </div>
      </div>

      <div className="md:col-span-2">
        <SectionHeading title="Ledger" eyebrow="Finances" />
        <div
          className="rounded-lg border px-5"
          style={{ borderColor: C.paperLine, backgroundColor: C.cream }}
        >
          <LedgerRow label="Current budget" value={CLIENT.budget} />
          <LedgerRow label="Outstanding invoice" value={CLIENT.outstanding} tone="rust" />
        </div>

        <div className="mt-8">
          <SectionHeading title="Recent activity" eyebrow="Timeline" />
          <div
            className="rounded-lg border p-5"
            style={{ borderColor: C.paperLine, backgroundColor: C.cream }}
          >
            {CLIENT.activity.map((a, i) => (
              <ActivityItem key={a.label} {...a} isLast={i === CLIENT.activity.length - 1} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectsTab() {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <SectionHeading title="Projects" eyebrow={`${CLIENT.projects.length} total`} />
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium"
          style={{ backgroundColor: C.ink, color: C.cream, fontFamily: font.mono }}
        >
          <Plus size={13} /> New project
        </button>
      </div>
      <div style={{ borderColor: C.paperLine }}>
        {CLIENT.projects.map((p) => (
          <ProjectRow key={p.name} {...p} />
        ))}
      </div>
    </div>
  );
}

function NotesTab() {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <SectionHeading title="Notes" eyebrow="Markdown" />
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium"
          style={{ borderColor: C.textMute, color: C.textDark, fontFamily: font.mono }}
        >
          <Pencil size={12} /> Edit
        </button>
      </div>
      <div
        className="rounded-lg border p-6"
        style={{ borderColor: C.paperLine, backgroundColor: C.cream }}
      >
        <h4 style={{ fontFamily: font.display, fontWeight: 700, color: C.textDark }} className="text-lg">
          TechNova
        </h4>

        <p
          className="mt-4 text-xs font-semibold uppercase tracking-[0.12em]"
          style={{ color: C.brassDim, fontFamily: font.mono }}
        >
          Meeting
        </p>
        <p className="mt-1 text-sm" style={{ color: C.textDark, fontFamily: font.body }}>
          Discussed redesign.
        </p>

        <div className="my-4 h-px w-full" style={{ backgroundColor: C.paperLine }} />

        <p
          className="text-xs font-semibold uppercase tracking-[0.12em]"
          style={{ color: C.brassDim, fontFamily: font.mono }}
        >
          Preferences
        </p>
        <ul className="mt-1 list-disc pl-5 text-sm" style={{ color: C.textDark, fontFamily: font.body }}>
          <li>Blue branding</li>
          <li>Fast loading</li>
        </ul>

        <div className="my-4 h-px w-full" style={{ backgroundColor: C.paperLine }} />

        <p
          className="text-xs font-semibold uppercase tracking-[0.12em]"
          style={{ color: C.brassDim, fontFamily: font.mono }}
        >
          Credentials
        </p>
        <p className="mt-1 text-sm" style={{ color: C.textDark, fontFamily: font.body }}>
          Hosting — Cloudflare
          <br />
          Repo — GitHub
        </p>

        <div className="my-4 h-px w-full" style={{ backgroundColor: C.paperLine }} />

        <p
          className="text-xs font-semibold uppercase tracking-[0.12em]"
          style={{ color: C.brassDim, fontFamily: font.mono }}
        >
          To-do
        </p>
        <div className="mt-1 space-y-1.5">
          <div className="flex items-center gap-2 text-sm" style={{ color: C.textDark, fontFamily: font.body }}>
            <Circle size={13} style={{ color: C.textMute }} /> Send proposal
          </div>
          <div className="flex items-center gap-2 text-sm" style={{ color: C.textDark, fontFamily: font.body }}>
            <Circle size={13} style={{ color: C.textMute }} /> Upload mockups
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsTab() {
  return (
    <div className="max-w-xl">
      <SectionHeading title="Settings" eyebrow="Details" />
      <div className="rounded-lg border px-5" style={{ borderColor: C.paperLine, backgroundColor: C.cream }}>
        <FieldRow label="Company" value="TechNova" />
        <FieldRow label="Email" value="hello@technova.io" />
        <FieldRow label="Phone" value="+1 (555) 019-2244" />
        <FieldRow label="Website" value="technova.io" />
        <FieldRow label="Currency" value="USD" />
        <FieldRow label="Status" value="Active" />
      </div>

      <div className="mt-8">
        <SectionHeading title="Danger zone" eyebrow="Irreversible" />
        <div
          className="flex items-center justify-between rounded-lg border px-5 py-4"
          style={{ borderColor: C.rust }}
        >
          <div>
            <span className="block text-sm font-medium" style={{ color: C.textDark, fontFamily: font.body }}>
              Archive this client
            </span>
            <span className="text-xs" style={{ color: C.textMute, fontFamily: font.body }}>
              Hides the file without deleting it
            </span>
          </div>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium"
            style={{ borderColor: C.textMute, color: C.textDark, fontFamily: font.mono }}
          >
            <Archive size={12} /> Archive
          </button>
        </div>
        <div
          className="mt-3 flex items-center justify-between rounded-lg border px-5 py-4"
          style={{ borderColor: C.rust }}
        >
          <div>
            <span className="block text-sm font-medium" style={{ color: C.rust, fontFamily: font.body }}>
              Delete this client
            </span>
            <span className="text-xs" style={{ color: C.textMute, fontFamily: font.body }}>
              Removes the file and everything in it
            </span>
          </div>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium"
            style={{ backgroundColor: C.rust, color: C.cream, fontFamily: font.mono }}
          >
            <Trash2 size={12} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Page -------------------------------------------------------------
export default function ClientDossierPage() {
  const [activeTab, setActiveTab] = useState("summary");

  return (
    <div
      className="min-h-screen w-full px-4 py-10 md:px-10"
      style={{ backgroundColor: C.ink, fontFamily: font.body }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
      `}</style>

      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div
          className="relative rounded-t-xl px-8 pb-10 pt-7"
          style={{ backgroundColor: C.ink2, border: `1px solid ${C.inkLine}`, borderBottom: "none" }}
        >
          <span
            className="text-[11px] uppercase tracking-[0.2em]"
            style={{ color: C.brass, fontFamily: font.mono }}
          >
            Client file — {CLIENT.fileCode}
          </span>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1
                className="text-4xl"
                style={{ color: C.cream, fontFamily: font.display, fontWeight: 600 }}
              >
                {CLIENT.name}
              </h1>
              <p className="mt-1 text-sm" style={{ color: "#B9C2B4" }}>
                {CLIENT.tagline}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium"
                style={{ borderColor: C.inkLine, color: C.cream, fontFamily: font.mono }}
              >
                <Pencil size={12} /> Edit
              </button>
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium"
                style={{ backgroundColor: C.brass, color: C.ink, fontFamily: font.mono }}
              >
                <Plus size={12} /> Add project
              </button>
            </div>
          </div>
          <div className="mt-5 flex gap-6 text-xs" style={{ color: "#8FA085", fontFamily: font.mono }}>
            <span>Created {CLIENT.created}</span>
            <span>Last activity {CLIENT.lastActivity}</span>
          </div>
          <StampBadge />
        </div>

        {/* Snapshot bar */}
        <div
          className="flex flex-wrap divide-x px-8"
          style={{ backgroundColor: C.ink3, borderLeft: `1px solid ${C.inkLine}`, borderRight: `1px solid ${C.inkLine}` }}
        >
          <div className="flex flex-wrap" style={{ color: C.cream }}>
            {[
              ["Projects", CLIENT.snapshot.projects],
              ["Tasks", CLIENT.snapshot.tasks],
              ["Documents", CLIENT.snapshot.documents],
              ["Last worked", CLIENT.snapshot.lastWorked],
              ["Member since", CLIENT.snapshot.memberSince],
              ["Total earned", CLIENT.snapshot.totalEarned],
            ].map(([label, value]) => (
              <div key={label} className="px-5 py-4 first:pl-0">
                <span
                  className="block text-[10px] uppercase tracking-[0.14em]"
                  style={{ color: "#8FA085", fontFamily: font.mono }}
                >
                  {label}
                </span>
                <span
                  className="mt-1 block text-lg"
                  style={{ color: C.cream, fontFamily: font.mono, fontWeight: 500 }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Folder tabs */}
        <div className="flex gap-1 px-6 pt-3" style={{ backgroundColor: C.ink }}>
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                disabled={tab.soon}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-1.5 rounded-t-lg px-4 py-2.5 text-xs font-medium transition-colors disabled:cursor-not-allowed"
                style={{
                  backgroundColor: active ? C.paper : "transparent",
                  color: active ? C.textDark : tab.soon ? "#5C6B57" : "#B9C2B4",
                  fontFamily: font.mono,
                }}
              >
                <Icon size={13} />
                {tab.label}
                {tab.soon && (
                  <span
                    className="ml-1 rounded-full px-1.5 py-0.5 text-[9px] uppercase"
                    style={{ backgroundColor: C.ink3, color: "#8FA085" }}
                  >
                    Soon
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div
          className="rounded-b-xl px-8 py-8"
          style={{ backgroundColor: C.paper, border: `1px solid ${C.paperLine}` }}
        >
          {activeTab === "summary" && <SummaryTab />}
          {activeTab === "projects" && <ProjectsTab />}
          {activeTab === "notes" && <NotesTab />}
          {activeTab === "settings" && <SettingsTab />}
        </div>
      </div>
    </div>
  );
}
