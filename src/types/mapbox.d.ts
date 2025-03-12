
// Type definitions for Mapbox GL JS
interface MapboxGLMapOptions {
  container: string | HTMLElement;
  style: string;
  center?: [number, number];
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
  pitch?: number;
  bearing?: number;
  projection?: string;
}

interface MapboxPopup {
  setLngLat(lngLat: [number, number]): this;
  setHTML(html: string): this;
  addTo(map: any): this;
}

interface MapboxMarker {
  setLngLat(lngLat: [number, number]): this;
  setPopup(popup: MapboxPopup): this;
  addTo(map: any): this;
  remove(): this;
}

interface MapboxBounds {
  extend(lngLat: [number, number]): this;
  isEmpty(): boolean;
}

declare interface Window {
  mapboxgl: {
    accessToken: string;
    Map: new (options: MapboxGLMapOptions) => any;
    NavigationControl: new () => any;
    Marker: new () => MapboxMarker;
    Popup: new () => MapboxPopup;
    LngLatBounds: new () => MapboxBounds;
  };
}
