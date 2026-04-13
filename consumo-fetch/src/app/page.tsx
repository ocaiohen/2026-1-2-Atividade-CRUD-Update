import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-4 py-16">
      <section className="rounded-2xl border bg-card p-8 shadow-sm md:p-12">
        <p className="mb-2 text-sm font-medium text-muted-foreground">
          Atividade CRUD com Next.js
        </p>
        <h1 className="mb-4 text-4xl font-bold tracking-tight">
          Consumo de API com atualização de produtos
        </h1>
        <p className="mb-8 max-w-2xl text-base text-muted-foreground md:text-lg">
          Nesta aplicação você pode listar produtos da API DummyJSON e editar
          informações básicas de cada item.
        </p>

        <Button asChild size="lg">
          <Link href="/produtos">Ir para lista de produtos</Link>
        </Button>
      </section>
    </main>
  );
}
