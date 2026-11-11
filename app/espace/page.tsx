import type { Metadata } from "next";
import Espace from "@/components/Espace";

export const metadata: Metadata = {
  title: "Mon espace",
  robots: { index: false },
};

export default function PageEspace() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-5 py-10">
      <Espace />
    </main>
  );
}
