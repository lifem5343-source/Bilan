import Link from "next/link";
import type { ReactNode } from "react";
import { MISE_A_JOUR_LEGALE } from "@/lib/entreprise";

export default function PageLegale({
  titre,
  children,
}: {
  titre: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <Link href="/" className="font-display text-xl font-bold tracking-tight">
        Bilan
      </Link>
      <h1 className="mt-8 font-display text-4xl font-bold leading-tight tracking-tight">
        {titre}
      </h1>
      <p className="mt-2 text-sm text-sourdine">
        Dernière mise à jour : {MISE_A_JOUR_LEGALE}
      </p>
      <div className="mt-8 space-y-4 text-lg leading-relaxed [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-tight [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-2">
        {children}
      </div>
    </main>
  );
}
