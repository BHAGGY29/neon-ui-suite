import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface LocationMapProps {
  latitude?: number | null;
  longitude?: number | null;
  onLocationUpdate?: (lat: number, lng: number, accuracy: number) => void;
  trackLive?: boolean;
  className?: string;
}

const LocationMap = ({ 
  latitude, 
  longitude, 
  onLocationUpdate, 
  trackLive = false,
  className = "h-[300px]" 
}: LocationMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [status, setStatus] = useState<string>("Initializing...");

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map with default view (India center)
    mapInstanceRef.current = L.map(mapRef.current).setView([20.5937, 78.9629], 5);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapInstanceRef.current);

    setStatus("Map loaded");

    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update map when coordinates change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (latitude && longitude) {
      const newLatLng = new L.LatLng(latitude, longitude);

      if (!markerRef.current) {
        markerRef.current = L.marker(newLatLng)
          .addTo(mapInstanceRef.current)
          .bindPopup("<b>Location</b><br>Live Tracking").openPopup();
      } else {
        markerRef.current.setLatLng(newLatLng);
      }

      mapInstanceRef.current.flyTo(newLatLng, 15);
      setStatus(`📍 ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
    }
  }, [latitude, longitude]);

  // Live tracking
  useEffect(() => {
    if (!trackLive || !navigator.geolocation) return;

    setStatus("⚠️ Getting location...");

    const getLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude: lat, longitude: lng, accuracy } = position.coords;
          onLocationUpdate?.(lat, lng, accuracy);
          setStatus(`✅ Live: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        },
        (error) => {
          setStatus(`⚠️ ${error.message}`);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    };

    getLocation();
    const interval = setInterval(getLocation, 10000);

    return () => clearInterval(interval);
  }, [trackLive, onLocationUpdate]);

  return (
    <div className="space-y-2">
      <div 
        ref={mapRef} 
        className={`${className} rounded-xl border border-neon-cyan/30 overflow-hidden`}
      />
      <p className="text-xs text-muted-foreground text-center">{status}</p>
    </div>
  );
};

export default LocationMap;
