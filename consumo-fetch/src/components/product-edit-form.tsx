"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveProductOverride, type EditableProduct } from "@/lib/product-overrides";
import { apiPut, type ApiError } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/api-config";

type FormState = "idle" | "loading" | "success" | "error" | "network-error";

type ProductEditFormProps = {
  product: EditableProduct;
};

/**
 * Validação de campos do formulário
 */
function validateProduct(product: {
  title: string;
  description: string;
  price: string;
}): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!product.title.trim()) {
    errors.title = "Título é obrigatório";
  }

  if (!product.description.trim()) {
    errors.description = "Descrição é obrigatória";
  }

  const price = Number(product.price);
  if (isNaN(price) || price < 0) {
    errors.price = "Preço deve ser um número positivo";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function ProductEditForm({ product }: ProductEditFormProps) {
  const router = useRouter();

  // Campos do formulário
  const [title, setTitle] = useState(product.title);
  const [description, setDescription] = useState(product.description);
  const [price, setPrice] = useState(String(product.price));

  // Estado de submissão
  const [state, setState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setFieldErrors({});

    // Validar entrada
    const validation = validateProduct({ title, description, price });
    if (!validation.valid) {
      setFieldErrors(validation.errors);
      return;
    }

    setState("loading");

    try {
      const updatedProduct = await apiPut<EditableProduct>(
        API_ENDPOINTS.PRODUCT_BY_ID(product.id),
        {
          title: title.trim(),
          description: description.trim(),
          price: Number(price),
        },
      );

      // Salvar override local para persistência
      saveProductOverride(updatedProduct);

      setState("success");

      // Redirecionar após breve delay para feedback visual
      setTimeout(() => {
        router.push("/produtos");
      }, 1500);
    } catch (error) {
      const apiError = error as ApiError;

      if (apiError.isNetworkError) {
        setState("network-error");
        setErrorMessage(apiError.message);
      } else {
        setState("error");
        setErrorMessage(
          apiError.message || "Não foi possível atualizar o produto",
        );
      }
    }
  }

  const isLoading = state === "loading";
  const showSuccess = state === "success";
  const showError = state === "error" || state === "network-error";

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
          disabled={isLoading}
          required
          aria-invalid={!!fieldErrors.title}
          aria-describedby={fieldErrors.title ? "title-error" : undefined}
        />
        {fieldErrors.title && (
          <p id="title-error" className="text-xs text-destructive">
            {fieldErrors.title}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Descrição
        </label>
        <textarea
          id="description"
          className="min-h-28 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          disabled={isLoading}
          required
          aria-invalid={!!fieldErrors.description}
          aria-describedby={fieldErrors.description ? "description-error" : undefined}
        />
        {fieldErrors.description && (
          <p id="description-error" className="text-xs text-destructive">
            {fieldErrors.description}
          </p>
        )}
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
          disabled={isLoading}
          required
          aria-invalid={!!fieldErrors.price}
          aria-describedby={fieldErrors.price ? "price-error" : undefined}
        />
        {fieldErrors.price && (
          <p id="price-error" className="text-xs text-destructive">
            {fieldErrors.price}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={isLoading || showSuccess}>
          {isLoading ? (
            <>
              <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Salvando...
            </>
          ) : showSuccess ? (
            "✓ Salvo com sucesso!"
          ) : (
            "Salvar alterações"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/produtos")}
          disabled={isLoading}
        >
          Voltar para lista
        </Button>
      </div>

      {showSuccess && (
        <p className="text-sm text-emerald-700">
          ✓ Produto atualizado com sucesso! Redirecionando...
        </p>
      )}

      {showError && (
        <div className="space-y-2">
          <p className="text-sm text-destructive">{errorMessage}</p>
          {state === "network-error" && (
            <p className="text-xs text-muted-foreground">
              Dica: Suas alterações foram salvas localmente e serão sincronizadas
              quando a conexão for restaurada.
            </p>
          )}
        </div>
      )}
    </form>
  );
}
