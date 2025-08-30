/**
 * @fileoverview Zustand store for current project state management
 * @module stores/project-store
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { Project, ProjectData, StepType } from '@/types/database'
import { updateProject } from '@/lib/supabase/queries'
import { debounce } from '@/lib/utils/debounce'

interface ProjectState {
  // Current project
  currentProject: Project | null
  
  // Temporary draft data (before saving)
  draftData: Partial<ProjectData>
  
  // UI state
  isDirty: boolean
  isSaving: boolean
  lastSaved: Date | null
  
  // Actions
  setCurrentProject: (project: Project | null) => void
  updateDraftData: (data: Partial<ProjectData>) => void
  saveProject: () => Promise<void>
  clearDraft: () => void
  setCurrentStep: (step: StepType) => void
}

// Debounced save function
const debouncedSave = debounce(async (projectId: string, updates: any) => {
  await updateProject(projectId, updates)
}, 2000) // Auto-save after 2 seconds of inactivity

export const useProjectStore = create<ProjectState>()(
  persist(
    immer((set, get) => ({
      // Initial state
      currentProject: null,
      draftData: {},
      isDirty: false,
      isSaving: false,
      lastSaved: null,
      
      // Set current project
      setCurrentProject: (project) => set((state) => {
        state.currentProject = project
        state.draftData = {}
        state.isDirty = false
        state.lastSaved = project ? new Date() : null
      }),
      
      // Update draft data and trigger auto-save
      updateDraftData: (data) => set((state) => {
        Object.assign(state.draftData, data)
        state.isDirty = true
        
        // Trigger auto-save
        const project = state.currentProject
        if (project) {
          const mergedData = { ...project.data, ...state.draftData }
          debouncedSave(project.id, { data: mergedData })
        }
      }),
      
      // Manual save
      saveProject: async () => {
        const { currentProject, draftData } = get()
        if (!currentProject || !Object.keys(draftData).length) return
        
        set((state) => {
          state.isSaving = true
        })
        
        try {
          const mergedData = { ...currentProject.data, ...draftData }
          await updateProject(currentProject.id, { data: mergedData })
          
          set((state) => {
            state.currentProject = currentProject ? {
              ...currentProject,
              data: mergedData
            } : null
            state.draftData = {}
            state.isDirty = false
            state.isSaving = false
            state.lastSaved = new Date()
          })
        } catch (error) {
          console.error('Failed to save project:', error)
          set((state) => {
            state.isSaving = false
          })
          throw error
        }
      },
      
      // Clear draft data
      clearDraft: () => set((state) => {
        state.draftData = {}
        state.isDirty = false
      }),
      
      // Update current step
      setCurrentStep: (step) => {
        const { currentProject } = get()
        if (!currentProject) return
        
        set((state) => {
          state.isDirty = true
        })
        
        // Save immediately for step changes
        updateProject(currentProject.id, { 
          current_step: step,
          status: 'in_progress'
        })
      }
    })),
    {
      name: 'project-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        currentProject: state.currentProject,
        draftData: state.draftData,
        isDirty: state.isDirty,
        lastSaved: state.lastSaved
      })
    }
  )
)
