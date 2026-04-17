/**
 * Cliente HTTP centralizado com tratamento de erro consistente
 * Evita duplicação de lógica de erro em múltiplos componentes
 */

type FetchOptions = RequestInit & {
  timeout?: number;
};

class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly isNetworkError: boolean = false,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Faz requisição HTTP com timeout e tratamento de erro padronizado
 */
async function fetchWithTimeout(
  url: string,
  options: FetchOptions = {},
): Promise<Response> {
  const { timeout = 10000, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError(
        "Requisição expirou. Verifique sua conexão.",
        undefined,
        true,
      );
    }

    throw new ApiError(
      "Erro de conexão. Verifique sua internet.",
      undefined,
      true,
    );
  }
}

/**
 * Requisição GET com tratamento de erro
 */
export async function apiGet<T>(url: string): Promise<T> {
  const response = await fetchWithTimeout(url, {
    cache: "no-store",
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new ApiError("Recurso não encontrado", 404);
    }
    throw new ApiError(
      `Erro na requisição: ${response.statusText}`,
      response.status,
    );
  }

  return response.json();
}

/**
 * Requisição PUT com tratamento de erro
 */
export async function apiPut<T>(url: string, body: unknown): Promise<T> {
  const response = await fetchWithTimeout(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new ApiError(
      `Falha ao atualizar: ${response.statusText}`,
      response.status,
    );
  }

  return response.json();
}

export type { ApiError };
