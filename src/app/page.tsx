"use client";
import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { ClipboardIcon } from "@heroicons/react/24/outline";

const MAPBOX_TOKEN = "pk.eyJ1Ijoia2FsbWFudG9taWthIiwiYSI6ImNtMzNiY3pvdDEwZDIya3I2NWwxanJ6cXIifQ.kiSWtgrH6X-l0TpquCKiXA";
mapboxgl.accessToken = MAPBOX_TOKEN;

export default function Home() {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<{ place_name: string; center: [number, number] }[]>([]);
  const [selected, setSelected] = useState<{ place_name: string; center: [number, number] } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (query.trim() === "") {
      setSuggestions([]);
      return;
    }
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&limit=5`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
         if (data.features) {
            setSuggestions(data.features.map((f: any) => ({ place_name: f.place_name, center: f.center })));
         } else {
            setSuggestions([]);
         }
      })
      .catch (err => { console.error("Geocoding error:", err); setSuggestions([]); });
  }, [query]);

  useEffect(() => {
    if (!mapContainerRef.current || !selected) return;
    if (mapRef.current) {
      mapRef.current.remove();
    }
    const [lng, lat] = selected.center;
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      center: [lng, lat],
      zoom: 14,
      style: "mapbox://styles/mapbox/streets-v11",
    });
    new mapboxgl.Marker().setLngLat([lng, lat]).addTo(mapRef.current);
    return () => { mapRef.current?.remove(); };
  }, [selected]);

  const handleCopy = (value: string, type: "lat" | "lng") => {
    navigator.clipboard.writeText(value);
    setCopied(type);
    setTimeout(() => setCopied(null), 1200);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4 gap-8">
      <div className="w-full max-w-md flex flex-col gap-4">
        <label className="font-semibold text-lg text-gray-800 dark:text-gray-100">Keresés helyszínre</label>
        <div className="relative">
          <input
            type="text"
            className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            placeholder="Írjon a kereséshez…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />
          {query && suggestions.length > 0 && (
            <ul className="absolute z-10 w-full bg-white dark:bg-gray-800 border rounded-lg mt-1 max-h-48 overflow-auto shadow-lg">
              {suggestions.map((s, i) => (
                <li
                  key={i}
                  className="px-4 py-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900"
                  onClick={() => { setSelected(s); setQuery(""); }}
                >
                  {s.place_name}
                </li>
              ))}
            </ul>
          )}
        </div>
        {selected && (
          <div className="flex gap-2 mt-2">
            <button
              className="flex items-center p-4 gap 1 px 4 py 2 bg-blue 600 text white rounded hover bg blue 700 transition text-lg border border-white"
              onClick={() => handleCopy(selected.center[1].toString(), "lat")}
            >
              <ClipboardIcon className="w-5 h-5" />
              Szélesség: {selected.center[1].toFixed(6)}
            </button>
            <button
              className="flex p-4 items center gap 1 px 4 py 2 bg-blue 600 text white rounded hover bg blue 700 transition text-lg border border-white"
              onClick={() => handleCopy(selected.center[0].toString(), "lng")}
            >
              <ClipboardIcon className="w-5 h-5" />
              Hosszúság: {selected.center[0].toFixed(6)}
            </button>
            {copied && (
              <span className="ml-2 text green 600 dark text green 400 font medium animate pulse">Másolva {copied}!</span>
            )}
          </div>
        )}
      </div>
      <div
        ref={mapContainerRef}
        className="w-full max-w-2xl h-[400px] rounded-lg shadow-lg border border-gray-200 overflow-hidden"
      />
    </div>
  );
}
