/**
 * @fileoverview Typed fetch wrapper for Brunnr API
 * @module api/client
 */

import { ApiError } from "./types";

// Use proxy route to handle API key on server side
const API_BASE_URL = "/api/brunnr";

interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  body?: any;
  params?: Record<string, string | number | boolean>;
}

/**
 * Makes a typed API request to the Brunnr service
 * @param endpoint - API endpoint path
 * @param options - Request options
 * @returns Promise resolving to the response data
 * @throws {ApiError} If the API request fails
 */
export async function apiCall<T>(
  endpoint: string,
  options?: ApiRequestOptions
): Promise<T> {
  const { body, params, ...requestOptions } = options || {};
  
  // Build URL with query params
  const url = new URL(`${API_BASE_URL}${endpoint}`, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
  }

  const response = await fetch(url.toString(), {
    ...requestOptions,
    headers: {
      "Content-Type": "application/json",
      ...requestOptions.headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const responseText = await response.text();
  
  if (!response.ok) {
    let errorDetail = responseText;
    try {
      const errorJson = JSON.parse(responseText);
      errorDetail = errorJson.detail || errorJson.message || responseText;
    } catch {
      // Keep responseText as is
    }
    
    throw new ApiError(
      response.status,
      `API Error: ${response.statusText}`,
      errorDetail
    );
  }

  // Handle empty responses
  if (!responseText) {
    return {} as T;
  }

  try {
    return JSON.parse(responseText);
  } catch {
    // If response is not JSON, return as is
    return responseText as T;
  }
}

/**
 * API client with typed methods for each HTTP verb
 */
export const apiClient = {
  get: <T>(endpoint: string, options?: Omit<ApiRequestOptions, "body">) =>
    apiCall<T>(endpoint, { ...options, method: "GET" }),
    
  post: <T>(endpoint: string, body?: any, options?: Omit<ApiRequestOptions, "body">) =>
    apiCall<T>(endpoint, { ...options, method: "POST", body }),
    
  put: <T>(endpoint: string, body?: any, options?: Omit<ApiRequestOptions, "body">) =>
    apiCall<T>(endpoint, { ...options, method: "PUT", body }),
    
  patch: <T>(endpoint: string, body?: any, options?: Omit<ApiRequestOptions, "body">) =>
    apiCall<T>(endpoint, { ...options, method: "PATCH", body }),
    
  delete: <T>(endpoint: string, options?: Omit<ApiRequestOptions, "body">) =>
    apiCall<T>(endpoint, { ...options, method: "DELETE" }),
};
