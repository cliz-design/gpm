import { api } from '@cliz/cli';
import * as config from '@znode/config';

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

export class GPM implements IGPM {
  public readonly config = new GPMConfig<IGPMConfig>();

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

export interface IGPMConfig {
  project: {
    workdir: string;
  };
}

export class GPMConfig<Config extends object> {
  private name = 'gpm';
  public path = api.path.homedir(`.${this.name}.yml`); // $HOME/.gpm/project.yml
  private _config: Config;

  public isReady = false;

  constructor() {}

  private async load() {
    this._config = await config.load({ path: this.path });
    if (!this._config) this._config = {} as any;

    this.isReady = true;
  }

  private async sync() {
    // sort config
    const config = Object.keys(this._config)
      .sort((a, b) => a.localeCompare(b))
      .reduce((all, path) => {
        all[path] = this._config[path];
        return all;
      }, {} as Config);

    await api.fs.yml.write(this.path, config);
  }

  private ensure() {
    if (!this.isReady) {
      throw new Error(`config is not ready`);
    }
  }

  public async prepare() {
    await this.load();
  }

  public get<K extends keyof Config>(key: K): Config[K] {
    this.ensure();

    return this._config[key];
  }

  public set<K extends keyof Config>(key: string, value: Config[K]) {
    this.ensure();

    if (!value) {
      delete this._config[key];
    } else {
      this._config[key] = value;
    }

    this.sync().catch((error) => console.error('config sync error:', error));
  }

  public getAll(): Config {
    return this._config;
  }
}
