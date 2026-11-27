import type { Place } from '../data/types';

/**
 * Official Google Maps URLs (https://developers.google.com/maps/documentation/urls).
 * They open the Google Maps app on iPhone and Android when installed,
 * or maps.google.com in the browser otherwise. No API key needed.
 */
type MapsPlace = Pick<Place, 'name' | 'address' | 'coords' | 'googlePlaceId' | 'mapsQuery' | 'mapsUrl'>;

const queryText = (p: MapsPlace) => (p.address ? `${p.name}, ${p.address}` : p.mapsQuery ?? p.name);

export function mapsSearchUrl(p: MapsPlace): string {
  // A Google Maps share link (maps.app.goo.gl / google.com/maps) opens the exact spot.
  if (p.mapsUrl && /^https:\/\/(maps\.app\.goo\.gl|(www\.)?google\.[a-z.]+\/maps)\//.test(p.mapsUrl)) return p.mapsUrl;
  const params = new URLSearchParams({ api: '1' });
  // Name + address (or an explicit search text) is the most robust query; place id makes it exact.
  const text = queryText(p);
  if (p.googlePlaceId) {
    params.set('query', text || `${p.coords?.lat},${p.coords?.lng}`);
    params.set('query_place_id', p.googlePlaceId);
  } else if (p.coords?.verified && !p.address) {
    params.set('query', `${p.coords.lat},${p.coords.lng}`);
  } else {
    params.set('query', text);
  }
  return `https://www.google.com/maps/search/?${params.toString()}`;
}

export function mapsDirectionsUrl(
  p: MapsPlace,
  travelmode?: 'driving' | 'walking' | 'transit' | 'bicycling',
): string {
  const params = new URLSearchParams({ api: '1' });
  if (p.coords?.verified) params.set('destination', `${p.coords.lat},${p.coords.lng}`);
  else params.set('destination', queryText(p));
  if (p.googlePlaceId) params.set('destination_place_id', p.googlePlaceId);
  if (travelmode) params.set('travelmode', travelmode);
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}
