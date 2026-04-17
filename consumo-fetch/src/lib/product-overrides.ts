/**
 * Schema de validação para garantir tipos seguros após JSON.parse
 */

export type EditableProduct = {
  id: number;
  title: string;
  description: string;
  price: number;
};

type ProductOverrides = Record<number, Partial<EditableProduct>>;

const STORAGE_KEY = "product-overrides";

/**
 * Verifica se o ambiente tem acesso ao localStorage (SSR-safe)
 */
function isClientSide(): boolean {
  return typeof window !== "undefined";
}

/**
 * Valida dados lidos do localStorage
 * Retorna objeto válido ou registro vazio em caso de erro
 */
function validateOverrides(data: unknown): ProductOverrides {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return {};
  }

  // Validação: todos os valores devem ser objetos parciais de produto
  const validated: ProductOverrides = {};
  for (const [key, value] of Object.entries(data)) {
    const id = Number(key);
    if (!Number.isFinite(id) || typeof value !== "object" || value === null) {
      continue;
    }

    const override = value as Record<string, unknown>;
    validated[id] = {
      ...(typeof override.title === "string" && { title: override.title }),
      ...(typeof override.description === "string" && {
        description: override.description,
      }),
      ...(typeof override.price === "number" && { price: override.price }),
    };
  }

  return validated;
}

/**
 * Lê overrides do localStorage com validação
 */
function readOverrides(): ProductOverrides {
  if (!isClientSide()) {
    return {};
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY);

  if (!rawValue) {
    return {};
  }

  try {
    const parsed = JSON.parse(rawValue);
    return validateOverrides(parsed);
  } catch {
    console.warn("[product-overrides] localStorage corrompido, usando vazio");
    return {};
  }
}

/**
 * Salva overrides no localStorage
 */
function writeOverrides(overrides: ProductOverrides) {
  if (!isClientSide()) {
    return;
  }

  try {
    const json = JSON.stringify(overrides);
    window.localStorage.setItem(STORAGE_KEY, json);
  } catch {
    console.warn("[product-overrides] Falha ao salvar no localStorage");
  }
}

export function saveProductOverride(product: EditableProduct) {
  const overrides = readOverrides();

  overrides[product.id] = {
    title: product.title,
    description: product.description,
    price: product.price,
  };

  writeOverrides(overrides);
}

export function applyOverride(product: EditableProduct): EditableProduct {
  const overrides = readOverrides();
  const override = overrides[product.id];

  if (!override) {
    return product;
  }

  return {
    ...product,
    ...override,
  };
}

export function applyOverrides(products: EditableProduct[]): EditableProduct[] {
  return products.map(applyOverride);
}

/**
 * Limpa todos os overrides (útil para testes ou reset)
 */
export function clearAllOverrides(): void {
  if (!isClientSide()) {
    return;
  }

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    console.warn("[product-overrides] Falha ao limpar localStorage");
  }
}
