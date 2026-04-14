export type EditableProduct = {
  id: number;
  title: string;
  description: string;
  price: number;
};

const STORAGE_KEY = "product-overrides";

type ProductOverrides = Record<number, Partial<EditableProduct>>;

function readOverrides(): ProductOverrides {
  if (typeof window === "undefined") {
    return {};
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY);

  if (!rawValue) {
    return {};
  }

  try {
    return JSON.parse(rawValue) as ProductOverrides;
  } catch {
    return {};
  }
}

function writeOverrides(overrides: ProductOverrides) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
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
