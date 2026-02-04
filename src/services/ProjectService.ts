// Project Service - Handles project management logic
import { Project, Model } from '../types';

export class ProjectService {
  private readonly storageKey = 'morphos_projects';

  getAllProjects(): Project[] {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : [];
  }

  getProject(id: string | number): Project | undefined {
    return this.getAllProjects().find(p => p.id === id.toString());
  }

  createProject(name: string, description: string = ''): Project {
    const newProject: Project = {
      id: Date.now().toString(),
      name,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      models: []
    };
    
    const projects = this.getAllProjects();
    projects.unshift(newProject);
    this.saveProjects(projects);
    return newProject;
  }

  updateProject(id: string | number, updates: Partial<Project>): Project | null {
    const projects = this.getAllProjects();
    const index = projects.findIndex(p => p.id === id.toString());
    
    if (index === -1) return null;
    
    projects[index] = {
      ...projects[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    this.saveProjects(projects);
    return projects[index];
  }

  deleteProject(id: string | number): boolean {
    const projects = this.getAllProjects();
    const filtered = projects.filter(p => p.id !== id.toString());
    this.saveProjects(filtered);
    return true;
  }

  addModelToProject(projectId: string | number, model: Omit<Model, 'id' | 'createdAt'>): Project | null {
    const project = this.getProject(projectId);
    if (!project) return null;
    
    const newModel: Model = {
      id: Date.now().toString(),
      ...model,
      createdAt: new Date().toISOString()
    };
    
    project.models.unshift(newModel);
    return this.updateProject(projectId, project);
  }

  deleteModelFromProject(projectId: string | number, modelId: string | number): Project | null {
    const project = this.getProject(projectId);
    if (!project) return null;
    
    project.models = project.models.filter(m => m.id !== modelId.toString());
    return this.updateProject(projectId, project);
  }

  private saveProjects(projects: Project[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(projects));
  }
}

export default new ProjectService();
