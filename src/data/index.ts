import { buildModel } from './model';
import { sampleData } from './sample';
import { tripData } from './trip';
import { applyLocal, loadLocal } from '../lib/localStore';
import { forParty } from '../lib/viewer';

const SAMPLE_KEY = 'ovt:sample';

/** Design preview: ?sample=1 turns it on for this tab, ?sample=0 turns it off. */
function sampleMode(): boolean {
  try {
    const q = new URLSearchParams(location.search).get('sample');
    if (q === '1') sessionStorage.setItem(SAMPLE_KEY, '1');
    if (q === '0') sessionStorage.removeItem(SAMPLE_KEY);
    return sessionStorage.getItem(SAMPLE_KEY) === '1';
  } catch {
    return false;
  }
}

export const IS_SAMPLE = sampleMode();
/** Changes saved on this phone (applied on top of the published itinerary). */
export const localStore = loadLocal();
/** The itinerary as this phone's party lives it, with this phone's changes applied. */
function build() {
  if (IS_SAMPLE) return buildModel(sampleData);
  try {
    return buildModel(forParty(applyLocal(tripData, localStore)));
  } catch (e) {
    // A bad local change must never take the itinerary down: fall back to the published one.
    console.error('Local changes ignored:', e);
    return buildModel(forParty(tripData));
  }
}
export const model = build();
export type { TripModel } from './model';
