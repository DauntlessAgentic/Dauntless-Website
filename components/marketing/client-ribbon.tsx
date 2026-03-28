"use client";
import React from "react";
import Image from "next/image";

/**
 * ClientRibbon — horizontally scrolling marquee of client names/logos.
 * Federal government orgs get a 🍁 flag prefix.
 * Logos load from /public/images/logos/[filename] if available.
 */

interface Client {
  name: string;
  logo?: string;
  federal?: boolean; // Canadian federal government departments/agencies
}

const clients: Client[] = [
  { name: "AgriTeam Canada Inc." },
  { name: "Alexandria Moulding" },
  { name: "Brookfield Asset Management", logo: "/images/logos/brookfield.png" },
  { name: "BDO Canada", logo: "/images/logos/bdo.svg" },
  { name: "US Lumber" },
  { name: "Canada Council for the Arts", logo: "/images/logos/canada-council-for-the-arts.svg", federal: true },
  { name: "Canada Revenue Agency", federal: true },
  { name: "Canadian Council on Learning" },
  { name: "Canadian Food Inspection Agency", federal: true },
  { name: "Canadian Heritage", federal: true },
  { name: "Canadian Human Rights Commission", federal: true },
  { name: "Canadian Lung Association" },
  { name: "Canadian Red Cross", logo: "/images/logos/red-cross.png" },
  { name: "CRTC", federal: true },
  { name: "City of Brooks" },
  { name: "City of Summerside" },
  { name: "Consumer Health Products Canada" },
  { name: "Fisheries & Oceans Canada", federal: true },
  { name: "Department of Justice", federal: true },
  { name: "National Defence", federal: true },
  { name: "Elections Canada", federal: true },
  { name: "Employment & Social Development Canada", federal: true },
  { name: "Environment & Climate Change Canada", federal: true },
  { name: "Financial Consumer Agency of Canada", federal: true },
  { name: "Fortis Inc." },
  { name: "Health Canada", federal: true },
  { name: "Home Trust" },
  { name: "IRCC", federal: true },
  { name: "Indigenous & Northern Affairs Canada", federal: true },
  { name: "Innovation, Science & Economic Development Canada", federal: true },
  { name: "Library & Archives Canada", federal: true },
  { name: "Métis National Council" },
  { name: "Natural Resources Canada", federal: true },
  { name: "Office of the Privacy Commissioner", federal: true },
  { name: "Privy Council Office", federal: true },
  { name: "Public Health Agency of Canada", federal: true },
  { name: "Public Services & Procurement Canada", federal: true },
  { name: "Rideau Heritage Route Tourism" },
  { name: "Sanofi Aventis" },
  { name: "Service Canada", federal: true },
  { name: "Treasury Board Secretariat", federal: true },
  { name: "Women of the Métis Nation" },
  { name: "Wrapped Apps" },
];

// Duplicate for seamless loop
const track = [...clients, ...clients];

export function ClientRibbon() {
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
        background: "rgba(34,211,238,0.07)",
        border: "1px solid rgba(34,211,238,0.22)",
      }}
    >
      {client.federal && (
        <span className="text-[11px] leading-none" aria-label="Government of Canada">🍁</span>
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
