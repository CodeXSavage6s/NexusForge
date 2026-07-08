'use client'

import { useTheme } from '@/lib/context/theme-provider'
import Image from 'next/image'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const nextLabel = theme === 'dark' ? 'Light' : 'Dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${nextLabel.toLowerCase()} mode`}
      className="flex w-full items-center gap-2 rounded-sm px-1 py-0.5 text-left transition-colors hover:bg-popover"
    >
      {theme === 'dark' ? (
        <Image src="/svgs/sun.svg" width={18} height={18} alt="" />
      ) : (
        <Image src="/svgs/moon.svg" width={18} height={18} alt="" />
      )}
      <span>{nextLabel}</span>
    </button>
  )
}
