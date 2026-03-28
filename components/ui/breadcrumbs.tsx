import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface Crumb {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  crumbs: Crumb[];
}

export function Breadcrumbs({ crumbs }: BreadcrumbsProps) {
  return (
    <nav
      className="flex items-center gap-1 text-xs text-[--text-muted]"
      aria-label="Breadcrumb"
    >
      {crumbs.map((crumb, i) => (
        <React.Fragment key={i}>
          {i > 0 && (
            <ChevronRight className="h-3 w-3 text-[--text-muted] shrink-0" />
          )}
          {crumb.href ? (
            <Link
              href={crumb.href}
              className="hover:text-[--text-secondary] transition-colors"
            >
              {crumb.label}
            </Link>
          ) : (
            <span className="text-[--text-secondary] font-medium">
              {crumb.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
