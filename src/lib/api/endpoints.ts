/**
 * @fileoverview API endpoint constants
 * @module api/endpoints
 */

export const API_ENDPOINTS = {
  // Health check
  HEALTH: "/",
  
  // Video generation pipeline
  QUESTION_TO_VIDEO: "/media/question-to-video",
  QUESTION_TO_EXPLANATION: "/question-to-explanation",
  EXPLANATION_TO_SCREENPLAY: "/explanation-to-screenplay",
  SCREENPLAY_TO_MANIFEST: "/screenplay-to-manifest",
  MANIFEST_TO_VIDEO: "/manifest-to-video",
  
  // Utility endpoints
  RETRY_STEP: "/retry-step",
  VIDEO_STATUS: "/video-status",
  
  // Project management (if backend supports)
  PROJECTS: "/projects",
  PROJECT_BY_ID: (id: string) => `/projects/${id}`,
  
  // Analytics (if backend supports)
  ANALYTICS: "/analytics",
  PROJECT_ANALYTICS: (id: string) => `/analytics/${id}`,
} as const;
