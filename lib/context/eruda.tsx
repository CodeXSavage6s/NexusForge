"use client";

import { useEffect } from 'react';

export default function Eruda({ children }: { children: React.ReactNode }) {
    useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      import('eruda').then((eruda) => eruda.default.init());
    }
  }, []);
  return <>{children}</>;
}
