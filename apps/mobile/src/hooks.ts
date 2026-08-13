import { useEffect, useState } from 'react';
import { mobileStore } from './demoStore';

/** Re-render when mobileStore mutates. */
export function useMobileStore() {
  const [, setTick] = useState(0);
  useEffect(() => mobileStore.subscribe(() => setTick((t) => t + 1)), []);
  return mobileStore;
}
