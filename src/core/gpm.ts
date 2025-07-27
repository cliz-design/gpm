import { ConfigManager } from './managers/config';
import { api } from '@cliz/cli';

// import { AutostartManager } from './managers/autostart';
import { DevTools } from './managers/devtools';
import { PackageManager } from './managers/package';
import { ProjectManager } from './managers/project';
// import { ServiceManager } from './managers/service';

export interface IGPM {
  // 1. project manager
  project: ProjectManager;

  // // 2. dev tools
  devtools: DevTools;

  // // 3. service manager
  // service: ServiceManager;

  // // 4. auto start
  // autostart: AutostartManager;

  // 5. package manager
  package: PackageManager;
}

export interface IGPMConfig {
  project: {
    workdir: string;
  };
}


export class GPM implements IGPM {
  public readonly config = new ConfigManager<IGPMConfig>(api.path.homedir(`.gpm.yml`));

  private _project: ProjectManager;
  private _devtools: DevTools;
  private _package: PackageManager;

  public get project() {
    if (!this._project) {
      const config = this.config.get('project');
      this._project = new ProjectManager(config.workdir);
    }

    return this._project;
  }

  public get devtools() {
    if (!this._devtools) {
      this._devtools = new DevTools();
    }

    return this._devtools;
  }

  public get package() {
    if (!this._package) {
      this._package = new PackageManager();
    }

    return this._package;
  }

  public async prepare() {
    await this.config.prepare();
  }
}
