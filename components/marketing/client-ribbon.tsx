"use client";
import React from "react";
import Image from "next/image";

/**
 * ClientRibbon — horizontally scrolling marquee of client names/logos.
 * Logos load from /public/images/logos/[filename] if available;
 * falls back to a styled text pill.
 */

interface Client {
  name: string;
  logo?: string; // path relative to /public
  abbr?: string; // short abbreviation for logo alt
}

const clients: Client[] = [
  { name: "AgriTeam Canada Inc." },
  { name: "Agriteam Consulting Canada" },
  { name: "Alexandria Moulding" },
  { name: "Brookfield Asset Management", logo: "/images/logos/brookfield.png" },
  { name: "BDO Canada", logo: "/images/logos/bdo.svg" },
  { name: "US Lumber" },
  { name: "Canada Council for the Arts", logo: "/images/logos/canada-council-for-the-arts.svg" },
  { name: "Canada Revenue Agency" },
  { name: "Canadian Council on Learning" },
  { name: "Canadian Food Inspection Agency" },
  { name: "Canadian Heritage" },
  { name: "Canadian Human Rights Commission" },
  { name: "Canadian Lung Association" },
  { name: "Canadian Red Cross", logo: "/images/logos/red-cross.png" },
  { name: "CRTC" },
  { name: "City of Brooks" },
  { name: "City of Summerside" },
  { name: "Consumer Health Products Canada" },
  { name: "Fisheries & Oceans Canada" },
  { name: "Department of Justice" },
  { name: "National Defence" },
  { name: "Elections Canada" },
  { name: "Employment & Social Development Canada" },
  { name: "Environment & Climate Change Canada" },
  { name: "Financial Consumer Agency of Canada" },
  { name: "Fortis Inc." },
  { name: "Health Canada" },
  { name: "Home Trust" },
  { name: "IRCC" },
  { name: "Indigenous & Northern Affairs Canada" },
  { name: "Innovation, Science & Economic Development Canada" },
  { name: "Library & Archives Canada" },
  { name: "Métis National Council" },
  { name: "Natural Resources Canada" },
  { name: "Office of the Privacy Commissioner" },
  { name: "Privy Council Office" },
  { name: "Public Health Agency of Canada" },
  { name: "Public Services & Procurement Canada" },
  { name: "Rideau Heritage Route Tourism" },
  { name: "Sanofi Aventis" },
  { name: "Service Canada" },
  { name: "Treasury Board Secretariat" },
  { name: "Women of the Métis Nation" },
  { name: "Wrapped Apps" },
];

// Duplicate for seamless loop
const track = [...clients, ...clients];

export function ClientRibbon() {
  return (
    <div className="w-full overflow-hidden py-6 select-none">
      {/* Fade masks on left/right edges */}
      <div className="relative">
        <div
          className="pointer-events-none absolute left-0 top-0 bottom-0 w-20 z-10"
          style={{ background: "linear-gradient(to right, var(--mkt-section), transparent)" }}
        />
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-20 z-10"
          style={{ background: "linear-gradient(to left, var(--mkt-section), transparent)" }}
        />

        {/* Scrolling track */}
        <div
          className="flex items-center gap-8"
          style={{
            animation: "ribbon-scroll 60s linear infinite",
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
        .ribbon-track:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}

function ClientPill({ client }: { client: Client }) {
  return (
    <div
      className="flex items-center gap-2.5 shrink-0 rounded-lg px-4 py-2.5 whitespace-nowrap transition-all duration-200 hover:border-[rgba(139,92,246,0.3)]"
      style={{
        background: "var(--mkt-card)",
        border: "1px solid var(--mkt-border)",
        minWidth: "fit-content",
      }}
    >
      {client.logo && (
        <LogoImage src={client.logo} alt={client.name} />
      )}
      <span
        className="text-xs font-medium"
        style={{ color: "var(--text-muted)" }}
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
    <div className="relative h-5 w-16 shrink-0">
      <Image
        src={src}
        alt={alt}
        fill
        unoptimized
        className="object-contain object-left"
        style={{ filter: "grayscale(100%) brightness(0.7) contrast(1.1)" }}
        onError={() => setError(true)}
        sizes="64px"
      />
    </div>
  );
}
