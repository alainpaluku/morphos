// Project utility functions for updating models

import { Project, Model, Material } from '../types';
import ProjectService from '../services/ProjectService';

/**
 * Update a model in a project
 * Returns the updated project and model, or null if update failed
 */
export function updateModelInProject(
  project: Project,
  modelId: string,
  updates: Partial<Model>
): { project: Project; model: Model } | null {
  const updatedModels = project.models.map(m =>
    m.id === modelId ? { ...m, ...updates } : m
  );
  
  const updatedProject = ProjectService.updateProject(project.id, { models: updatedModels });
  
  if (!updatedProject) return null;
  
  const updatedModel = updatedModels.find(m => m.id === modelId);
  if (!updatedModel) return null;
  
  return { project: updatedProject, model: updatedModel };
}

/**
 * Update model code in a project
 */
export function updateModelCode(
  project: Project,
  modelId: string,
  code: string
): { project: Project; model: Model } | null {
  return updateModelInProject(project, modelId, { code });
}

/**
 * Update model material in a project
 */
export function updateModelMaterial(
  project: Project,
  modelId: string,
  material: Material
): { project: Project; model: Model } | null {
  return updateModelInProject(project, modelId, { material });
}
