"use client";

export default function Erreur({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-5">
      <h1 className="font-display text-4xl font-bold tracking-tight">
        Quelque chose s&apos;est mal passé.
      </h1>
      <p className="mt-4 text-lg text-sourdine">
        Ce n&apos;est pas de ton fait. Réessaie, ou reviens à l&apos;accueil.
      </p>
      <div className="mt-8 flex max-w-xs flex-col gap-3">
        <button type="button" onClick={() => reset()} className="bouton">
          Réessayer
        </button>
        <a href="/" className="text-center font-semibold underline underline-offset-4">
          Retour à l&apos;accueil
        </a>
      </div>
    </main>
  );
}
