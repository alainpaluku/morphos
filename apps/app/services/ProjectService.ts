// Project Service - Handles project management logic
import { Project, Model, AppMode } from '../types';

export class ProjectService {
  private readonly storageKey = 'morphos_projects';

  getAllProjects(): Project[] {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse projects from storage', e);
      return [];
    }
  }

  getProject(id: string | number): Project | undefined {
    return this.getAllProjects().find(p => p.id === id.toString());
  }

  createProject(name: string, description: string = '', mode: AppMode = '3D'): Project {
    const newProject: Project = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      mode,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      models: []
    };

    const projects = this.getAllProjects();
    projects.unshift(newProject);
    this.saveProjects(projects);
    return newProject;
  }

  saveProject(project: Project): void {
      const projects = this.getAllProjects();
      const index = projects.findIndex(p => p.id === project.id);
      if (index >= 0) {
          projects[index] = { ...project, updatedAt: new Date().toISOString() };
      } else {
          projects.unshift(project);
      }
      this.saveProjects(projects);
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
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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

  /**
   * Import functions
   */
  async importFile(file: File): Promise<Partial<Model>> {
    const name = file.name;
    const extension = name.split('.').pop()?.toLowerCase();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      if (extension === 'stl') {
        reader.onload = (e) => {
            resolve({
                name,
                mode: '3D',
                stlData: e.target?.result as ArrayBuffer,
                code: `// Imported STL: ${name}\nconst main = () => { return null; };`
            });
        };
        reader.readAsArrayBuffer(file);
      } else if (extension === 'svg' || extension === 'dxf') {
        reader.onload = (e) => {
            resolve({
                name,
                mode: '2D',
                svgData: extension === 'svg' ? e.target?.result as string : undefined,
                dxfData: extension === 'dxf' ? e.target?.result as string : undefined,
                code: `// Imported ${extension.toUpperCase()}: ${name}\nconst main = () => { return null; };`
            });
        };
        reader.readAsText(file);
      } else {
        reject(new Error('Unsupported file format for import'));
      }
    });
  }
}

export default new ProjectService();
