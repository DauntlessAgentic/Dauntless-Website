"use client";
import React from "react";
import Image from "next/image";

/**
 * ClientRibbon — horizontally scrolling marquee of client names/logos.
 * Federal government orgs get a 🍁 flag prefix.
 * Logos load from /public/images/logos/[filename] if available.
 */

export interface Client {
  name: string;
  logo?: string;
  federal?: boolean; // Canadian federal government departments/agencies
}

export function ClientRibbon({ clients }: { clients: Client[] }) {
  // Duplicate for seamless loop
  const track = [...clients, ...clients];

  return (
    <div className="w-full overflow-hidden py-6 select-none">
      <div className="relative">
        {/* Fade masks */}
        <div
          className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 z-10"
          style={{ background: "linear-gradient(to right, var(--mkt-section), transparent)" }}
        />
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 z-10"
          style={{ background: "linear-gradient(to left, var(--mkt-section), transparent)" }}
        />

        {/* Scrolling track */}
        <div
          className="flex items-center gap-5"
          style={{
            animation: "ribbon-scroll 70s linear infinite",
            width: "max-content",
          }}
        >
          {track.map((client, i) => (
            <ClientPill key={`${client.name}-${i}`} client={client} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes ribbon-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

function ClientPill({ client }: { client: Client }) {
  return (
    <div
      className="flex items-center gap-2 shrink-0 rounded-lg px-3.5 py-2 whitespace-nowrap transition-colors duration-200"
      style={{
        background: "rgba(var(--accent-rgb),0.07)",
        border: "1px solid rgba(var(--accent-bright-rgb),0.18)",
      }}
    >
      {client.federal && (
        <span className="text-xs leading-none" aria-label="Government of Canada">🍁</span>
      )}
      {client.logo && (
        <LogoImage src={client.logo} alt={client.name} />
      )}
      <span
        className="text-xs font-medium"
        style={{ color: "var(--text-secondary)" }}
      >
        {client.name}
      </span>
    </div>
  );
}

function LogoImage({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = React.useState(false);
  if (error) return null;
  return (
    <div className="relative h-4 w-14 shrink-0">
      <Image
        src={src}
        alt={alt}
        fill
        unoptimized
        className="object-contain object-left"
        style={{ filter: "grayscale(100%) brightness(0.75) contrast(1.1)" }}
        onError={() => setError(true)}
        sizes="56px"
      />
    </div>
  );
}
