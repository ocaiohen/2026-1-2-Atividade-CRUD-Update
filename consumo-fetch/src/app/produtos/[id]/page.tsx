import { notFound } from "next/navigation";

import { ProductEditForm } from "@/components/product-edit-form";

type Product = {
  id: number;
  title: string;
  description: string;
  price: number;
};

type ProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

async function getProductById(id: string): Promise<Product | null> {
  const response = await fetch(`https://dummyjson.com/products/${id}`, {
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Não foi possível carregar o produto");
  }

  const product: Product = await response.json();
  return product;
}

export default async function EditarProdutoPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="mb-8 space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Editar produto</h1>
        <p className="text-sm text-muted-foreground">ID: {product.id}</p>
      </div>

      <ProductEditForm product={product} />
    </main>
  );
}
