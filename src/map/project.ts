import { PROJECTION } from './vietnamGeo';

/** Same Mercator projection used to generate the Vietnam outline (d3 geoMercator). */
export function project(lat: number, lng: number): [number, number] {
  const λ = (lng * Math.PI) / 180;
  const φ = (lat * Math.PI) / 180;
  const { scale: k, translate: [tx, ty] } = PROJECTION;
  return [tx + k * λ, ty - k * Math.log(Math.tan(Math.PI / 4 + φ / 2))];
}
