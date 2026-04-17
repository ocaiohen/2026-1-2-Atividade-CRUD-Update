/**
 * Configuração centralizada da API
 * Facilita mudanças de URL base e timeout
 */

export const API_CONFIG = {
  BASE_URL: "https://dummyjson.com",
  TIMEOUT: 10000,
} as const;

export const API_ENDPOINTS = {
  PRODUCTS: `${API_CONFIG.BASE_URL}/products`,
  PRODUCT_BY_ID: (id: string | number) =>
    `${API_CONFIG.BASE_URL}/products/${id}`,
} as const;
