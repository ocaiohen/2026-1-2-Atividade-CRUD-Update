"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { ProductEditForm } from "@/components/product-edit-form";
import { Button } from "@/components/ui/button";
import { applyOverride, type EditableProduct } from "@/lib/product-overrides";
import { apiGet, type ApiError } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/api-config";

type ProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

async function getProductById(id: string): Promise<EditableProduct | null> {
  try {
    const product = await apiGet<EditableProduct>(
      API_ENDPOINTS.PRODUCT_BY_ID(id),
    );
    return product;
  } catch (error) {
    const apiError = error as ApiError;
    if (apiError.statusCode === 404) {
      return null;
    }
    throw error;
  }
}

export default function EditarProdutoPage({ params }: ProductPageProps) {
  const { id } = use(params);
  const [product, setProduct] = useState<EditableProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFoundProduct, setNotFoundProduct] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadProduct() {
      try {
        const apiProduct = await getProductById(id);

        if (!apiProduct) {
          setNotFoundProduct(true);
          return;
        }

        setProduct(applyOverride(apiProduct));
      } catch (error) {
        const apiError = error as ApiError;
        setErrorMessage(apiError.message || "Não foi possível carregar o produto");
      } finally {
        setIsLoading(false);
      }
    }

    loadProduct();
  }, [id]);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="mb-8 space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Editar produto</h1>
        <p className="text-sm text-muted-foreground">ID: {id}</p>
      </div>

      {notFoundProduct && (
        <div className="space-y-4">
          <p className="text-sm text-destructive">Produto não encontrado.</p>
          <Button asChild variant="outline">
            <Link href="/produtos">Voltar para lista</Link>
          </Button>
        </div>
      )}

      {isLoading && (
        <p className="text-sm text-muted-foreground">Carregando produto...</p>
      )}

      {errorMessage && (
        <p className="text-sm text-destructive">{errorMessage}</p>
      )}

      {product && <ProductEditForm product={product} />}
    </main>
  );
}
