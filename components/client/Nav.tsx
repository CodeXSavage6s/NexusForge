"use client"

import { CLIENT_TABS, useClientNav } from "./ClientNavContext"

export default function Nav() {
  const { active, setActive } = useClientNav()

  return (
    <div className="flex justify-center items-center self-start ">
      <div className="flex gap-3">
        {CLIENT_TABS.map((item) => (
          <button
            key={item}
            onClick={() => setActive(item)}
            className={`relative pb-3 px-1 text-sm font-medium transition-colors duration-200 ${
              active === item ? "text-gray-400" : "text-gray-500 hover:text-gray-600"
            }`}
          >
            {item}
            <span
              className={`absolute left-0 right-0 -bottom-px h-0.5 rounded-full bg-gray-900 transition-transform duration-300 ease-out ${
                active === item ? "scale-x-100" : "scale-x-0"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  )
}
