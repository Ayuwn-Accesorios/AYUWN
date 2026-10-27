// src/lib/useIsHydrated.ts
import { useEffect, useState } from 'react';

export function useIsHydrated() {
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => setIsHydrated(true), []);
  return isHydrated;
}