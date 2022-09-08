import { api } from '@cliz/cli';
import * as config from '@znode/config';

export class ConfigManager<Config> {
  // public homeDirConfig = api.path.homedir(`.gpm.yml`);
  // public currentDirConfig = api.path.cwd('.gpm.yml'); // $PWD/.gpm.yml
  private _config: Config;

  public isReady = false;

  constructor(public readonly path: string) { }

  private async load() {
    if (await api.fs.exist(this.path)) {
      this._config = await config.load({ path: this.path });
    } else {
      this._config = {} as any;
    }

    this.isReady = true;
  }

  public async persist() {
    try {
      // sort config
      const config = Object.keys(this._config)
        .sort((a, b) => a.localeCompare(b))
        .reduce((all, path) => {
          all[path] = this._config[path];
          return all;
        }, {} as Config);

      await api.fs.yml.write(this.path, config);
    } catch (error) {
      console.error('config persist error:', error)
    }
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

  public set<K extends keyof Config>(key: string, value: Config[K], persist?: boolean) {
    this.ensure();

    if (!value) {
      delete this._config[key];
    } else {
      this._config[key] = value;
    }

    if (!persist) {
      this.persist();
    }
  }

  public getAll(): Config {
    return this._config;
  }
}
