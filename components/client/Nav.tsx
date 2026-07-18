"use client"

import { useState } from "react";

export default function TabNavigator() {
  const items = ["Activity", "Settings", "Detail"];
  const [active, setActive] = useState(0);

  return (
    <div className="flex justify-center items-center">
      <div className="flex gap-3">
        {items.map((item, i) => (
          <button
            key={item}
            onClick={() => setActive(i)}
            className={`relative pb-3 px-1 text-sm font-medium transition-colors duration-200 ${
              active === i ? "text-gray-500" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {item}
            <span
              className={`absolute left-0 right-0 -bottom-px h-0.5 rounded-full bg-gray-900 transition-transform duration-300 ease-out ${
                active === i ? "scale-x-100" : "scale-x-0"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
