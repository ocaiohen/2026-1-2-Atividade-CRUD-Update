"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { applyOverrides, type EditableProduct } from "@/lib/product-overrides";

type ProductsResponse = {
  products: EditableProduct[];
};

async function getProducts(): Promise<EditableProduct[]> {
  const response = await fetch("https://dummyjson.com/products?limit=12", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Não foi possível carregar os produtos");
  }

  const data: ProductsResponse = await response.json();
  return data.products;
}

export default function ProdutosPage() {
  const [products, setProducts] = useState<EditableProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        const apiProducts = await getProducts();
        setProducts(applyOverrides(apiProducts));
      } catch {
        setErrorMessage("Não foi possível carregar os produtos");
      } finally {
        setIsLoading(false);
      }
    }

    loadProducts();
  }, []);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Lista de produtos
          </h1>
          <p className="text-sm text-muted-foreground">
            Dados vindos da API pública DummyJSON.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/">Voltar para início</Link>
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando produtos...</p>
      ) : null}

      {errorMessage ? (
        <p className="text-sm text-destructive">{errorMessage}</p>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <article
            key={product.id}
            className="flex h-full flex-col rounded-xl border bg-card p-5 shadow-sm"
          >
            <h2 className="mb-2 text-lg font-semibold leading-tight">
              {product.title}
            </h2>
            <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">
              {product.description}
            </p>
            <div className="mt-auto flex items-center justify-between">
              <span className="text-lg font-bold">
                R$ {product.price.toFixed(2)}
              </span>
              <Button asChild>
                <Link href={`/produtos/${product.id}`}>Editar</Link>
              </Button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
