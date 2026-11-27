import { useEffect, useState } from 'react';
import { model } from './data';
import { tripToday } from './data/model';

/** Today's date in Vietnam, refreshed every minute (handles midnight rollover). */
export function useToday() {
  const [today, setToday] = useState(() => tripToday(model));
  useEffect(() => {
    const t = setInterval(() => setToday(tripToday(model)), 60_000);
    const vis = () => document.visibilityState === 'visible' && setToday(tripToday(model));
    document.addEventListener('visibilitychange', vis);
    return () => { clearInterval(t); document.removeEventListener('visibilitychange', vis); };
  }, []);
  return today;
}

/** The day the "Dia a dia" tab should open on. */
export function defaultDay(today: string) {
  const { startDate, endDate } = model.trip;
  if (today < startDate) return startDate;
  if (today > endDate) return model.trip.dayOneDate ?? startDate;
  return today;
}
