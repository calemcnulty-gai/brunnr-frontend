/**
 * @fileoverview API types and error classes
 * @module api/types
 */

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public detail?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Re-export types from the main API types file
export * from '@/types/api'
