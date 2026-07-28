import Link from 'next/link'

export default function InfoCard({
  href = "",
  icon: Icon,
  iconBg,
  iconColor,
  title,
  count,
  subtitle,
  subtitleColor,
  progress,
  progressColor,
  caption = undefined,
}: {
  href?: string;
  icon: any;
  iconBg: any;
  iconColor: any;
  title: any;
  count: any;
  subtitle: any;
  subtitleColor: any;
  progress: any;
  progressColor: any;
  caption?: any;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-3 p-3 bg-card rounded-lg shadow shadow-foreground-secondary/20 transition-shadow hover:shadow-md"
    >
      <div className="flex items-center gap-2 flex-col md:flex-row">
        {Icon && (
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
            style={{ backgroundColor: iconBg }}
          >
            <Icon className="h-4 w-4" style={{ color: iconColor }} />
          </span>
        )}
        <span className="text-sm font-medium truncate">{title}</span>
      </div>

      <span className="text-2xl font-bold">{count}</span>

      {subtitle && (
        <span className="text-xs font-medium" style={{ color: subtitleColor }}>
          {subtitle}
        </span>
      )}

      {typeof progress === "number" && (
        <div className="h-1.5 w-full rounded-full bg-muted">
          <div
            className="h-1.5 rounded-full"
            style={{ width: `${progress}%`, backgroundColor: progressColor }}
          />
        </div>
      )}

      {caption && <span className="text-[11px] text-gray-400">{caption}</span>}
    </Link>
  )
}
