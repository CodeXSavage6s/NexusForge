"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Bell, ChevronDown, User, Settings, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ThemeToggle from '@/components/theme-toggle'


export function Header({
  logoSrc = "",
  logoAlt = "Logo",
  brandName = "",
  brandHref = "/",
  navLinks = [],
  notificationCount = 0,
  onNotificationClick,
  user,
  menuItems = demoMenuItems,
}: NavbarProps) {
  const initials = user?.name
    ?.split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="relative w-full border-b border-white/5 bg-card">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
        {/* Left: sidebar trigger + logo */}
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-white/80 hover:bg-white/10 hover:text-white" />

          <Link
            href={brandHref}
            className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-md"
          >
            <span className="relative shrink-0 overflow-hidden rounded-md">
              <Image src={logoSrc} alt={logoAlt} width={230} height={90}/>
            </span>
            <span className="text-lg font-semibold tracking-tight text-white">
              {brandName}
            </span>
          </Link>

          {navLinks.length > 0 && (
            <nav className="ml-4 hidden items-center gap-6 md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-white/70 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
        </div>

        {/* Right: notifications + avatar */}
        <div className="flex items-center gap-4 sm:gap-5">
          <Link
          href="/notifications"
            aria-label={
              notificationCount > 0
                ? `${notificationCount} unread notifications`
                : "Notifications"
            }
            className="relative rounded-full p-1.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-600 px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-[#0a0a0f]">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </Link>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                  aria-label="Open account menu"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.image} alt={user.name} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4 text-white/60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user.name}</span>
                    {user.email && (
                      <span className="text-xs font-normal text-muted-foreground">
                        {user.email}
                      </span>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <ThemeToggle />
                </DropdownMenuItem>
                {menuItems.map((item) => {
                  const content = (
                    <span className="flex items-center gap-2">
                      {item.icon}
                      {item.label}
                    </span>
                  );
                  return (
                    <DropdownMenuItem
                      key={item.label}
                      onSelect={item.onSelect}
                      asChild={Boolean(item.href)}
                    >
                   <Link href={item?.href}>{content}</Link>
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuItem>
                  <div className="text-red-500 flex font-black w-full justify-end gap-1">
                    <LogOut /> Logout
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Accent bar */}
      <div className="h-0.5 w-full bg-gradient-to-r from-violet-600 via-indigo-500 to-blue-500" />
    </header>
  );
}

export default Header;
