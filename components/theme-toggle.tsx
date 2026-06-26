'use client'

import { useTheme } from '@/lib/context/theme-provider'
import Image from 'next/image'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className="h-9 w-9 flex items-center justify-center rounded-full border border-muted-foreground/20 hover:bg-popover transition-colors"
    >
      {theme === 'dark' ? 
      <Image src="/svgs/sun.svg" width={24} height={24} alt="sun.svg" /> :
      <Image src="/svgs/moon.svg" width={24} height={24} alt="sun.svg" />
      }
    </button>
  )
}
