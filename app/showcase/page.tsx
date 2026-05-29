import { notFound } from "next/navigation";

import { ShowcaseView } from "./showcase-view";

export default function ShowcasePage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return <ShowcaseView />;
}
