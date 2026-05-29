"use client";

import { useState } from "react";

import { WorkCard, type WorkCategory } from "@/components/ui/work-card";

interface Project {
  department: string;
  project: string;
  category: WorkCategory;
  sector: "federal" | "private" | "international";
  image?: string;
}

export function WorkFilter({
  projects,
  categories,
}: {
  projects: Project[];
  categories: ("All" | WorkCategory)[];
}) {
  const [active, setActive] = useState<"All" | WorkCategory>("All");

  const filtered =
    active === "All" ? projects : projects.filter((project) => project.category === active);

  return (
    <>
      <section className="sticky top-16 z-10 border-b border-[--mkt-border] bg-[--mkt-section] px-6 py-4">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-3 md:hidden">
            <select
              value={active}
              onChange={(event) => setActive(event.target.value as typeof active)}
              className="flex-1 rounded-lg border border-[--mkt-border] bg-[--mkt-card] px-3 py-2 text-sm text-[--text-primary] focus:border-[--accent-vivid] focus:outline-none"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <span className="shrink-0 text-xs text-[--text-muted]">
              {filtered.length} project{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActive(category)}
                  className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                    active === category
                      ? "bg-[--accent-vivid] text-white shadow-[0_0_12px_rgba(139,92,246,0.4)]"
                      : "border border-[--mkt-border] bg-[--mkt-card] text-[--text-secondary] hover:border-[--accent-vivid] hover:text-[--text-primary]"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            <span className="ml-auto shrink-0 pl-2 text-xs text-[--text-muted]">
              {filtered.length} project{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </section>

      <section className="bg-[--mkt-bg] px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <p className="mb-6 text-xs text-[--text-muted]">{filtered.length} projects</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((project, index) => (
              <WorkCard
                key={`${project.department}-${project.project}-${index}`}
                department={project.department}
                project={project.project}
                category={project.category}
                sector={project.sector}
                image={project.image}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
