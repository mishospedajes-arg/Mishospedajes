"use client";

interface GoogleMapsEmbedProps {
  latitude: number;
  longitude: number;
}

export function GoogleMapsEmbed({ latitude, longitude }: GoogleMapsEmbedProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-200 rounded-lg">
        <p className="text-slate-500">API Key de Google Maps</p>
      </div>
    );
  }

  const mapSrc = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${latitude},${longitude}`;

  return (
    <iframe
      width="100%"
      height="100%"
      style={{ border: 0 }}
      src={mapSrc}
      allowFullScreen
      className="rounded-lg"
    ></iframe>
  );
}
