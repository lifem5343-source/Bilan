import Link from "next/link";

export default function NonTrouvee() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-5">
      <p className="chiffre text-6xl">404</p>
      <h1 className="mt-4 font-display text-4xl font-bold tracking-tight">
        Cette page n&apos;existe pas.
      </h1>
      <p className="mt-4 text-lg text-sourdine">
        Le lien est peut-être ancien ou mal copié.
      </p>
      <div className="mt-8 max-w-xs">
        <Link href="/" className="bouton">
          Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  );
}
