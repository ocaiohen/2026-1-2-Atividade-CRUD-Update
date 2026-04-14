"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveProductOverride } from "@/lib/product-overrides";

type Product = {
  id: number;
  title: string;
  description: string;
  price: number;
};

type ProductEditFormProps = {
  product: Product;
};

export function ProductEditForm({ product }: ProductEditFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(product.title);
  const [description, setDescription] = useState(product.description);
  const [price, setPrice] = useState(String(product.price));
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setStatusMessage("");
    setErrorMessage("");

    try {
      const response = await fetch(
        `https://dummyjson.com/products/${product.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            description,
            price: Number(price),
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Falha ao atualizar o produto");
      }

      const updatedProduct: Product = await response.json();
      saveProductOverride(updatedProduct);

      setStatusMessage("Produto atualizado com sucesso!");
      router.push("/produtos");
    } catch {
      setErrorMessage("Não foi possível atualizar o produto. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-xl border bg-card p-6 shadow-sm"
    >
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          Título
        </label>
        <Input
          id="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Descrição
        </label>
        <textarea
          id="description"
          className="min-h-28 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="price" className="text-sm font-medium">
          Preço
        </label>
        <Input
          id="price"
          type="number"
          min="0"
          step="0.01"
          value={price}
          onChange={(event) => setPrice(event.target.value)}
          required
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Salvando..." : "Salvar alterações"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/produtos")}
        >
          Voltar para lista
        </Button>
      </div>

      {statusMessage ? (
        <p className="text-sm text-emerald-700">{statusMessage}</p>
      ) : null}
      {errorMessage ? (
        <p className="text-sm text-destructive">{errorMessage}</p>
      ) : null}
    </form>
  );
}
