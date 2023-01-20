import { api } from '@cliz/cli';
import * as path from 'path';
import * as parseGitUrl from 'git-url-parse';
import { runInShell } from '../utils';
import { ConfigManager } from './config';

export interface IProjectManager {
  create(name: string, template: string): Promise<void>;
  add(url: string): Promise<void>;
  remove(provider: string, owner: string, name: string): Promise<void>;
  sync(provider: string, owner: string, name: string): Promise<void>;
  search(keyword?: string): Promise<IProject[]>;
}

export interface IProject {
  id: string;
  name: string;
  owner: string;
  url: string;
  path: string;
  provider: string; // github / gitlab / gitee
  repo: string;
  workdir: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectManagerOptions { }

export interface ProjectAddOptions {
  depth?: number;
}

export class ProjectManager implements IProjectManager {
  public readonly config = new ConfigManager<Record<string, IProject>>(api.path.homedir(`.gpm/project.yml`));

  constructor(
    private readonly workdir: string, // private readonly options?: ProjectManagerOptions,
  ) {
    //
  }

  // create('zcorky.com/myapp', 'zcorky/xxx')
  public async create(target: string, template: string): Promise<void> {
    let target_url = target;
    let template_url = template;
    // example:
    //  zcorky/zodash
    //  github.com/zcorky/zodahs
    if (!/^(https?|git@)/.test(target)) {
      if (target.split('/').length === 2) {
        target_url = `https://github.com/${target}`;
      } else if (target.split('/').length === 3) {
        target_url = `https://${target}`;
      } else {
        throw new Error(`invalid target: ${target}`);
      }
    }

    if (!/^(https?|git@)/.test(template)) {
      if (template.split('/').length === 2) {
        template_url = `https://github.com/${template}`;
      } else if (template.split('/').length === 3) {
        template_url = `https://${template}`;
      } else {
        throw new Error(`invalid template: ${template}`);
      }
    }

    const project = new Project({ url: target_url, workdir: this.workdir });
    if (await this.has(project)) {
      throw new Error(
        `project ${project.name}(${project.repo}) found in ${project.path}, use another`,
      );
    }

    if (await this.existDir(project)) {
      // save info
      this.config.set(project.id, project.toJSON(), true);

      throw new Error(
        `project ${project.name}(${project.repo}) found in ${project.path}, use another`,
      );
    }

    await runInShell(`git clone --progress ${template_url} ${project.path}`);

    // @TODO define template

    this.config.set(project.id, project.toJSON(), true);
  }

  public async add(url: string, options?: ProjectAddOptions): Promise<void> {
    let shouldClone = true;

    const project = new Project({ url, workdir: this.workdir });
    if (await this.has(project) && await this.existDir(project)) {
      throw new Error(
        `project ${project.name}(${project.repo}) found in ${project.path}`,
      );
    } else if (await this.existDir(project)) {
      shouldClone = false;
    }

    if (shouldClone) {
      let cmd = `git clone --progress ${project.url} ${project.path}`;
      if (options?.depth) {
        cmd += ` --depth=${options.depth}`;
      }

      await runInShell(cmd);
    }

    this.config.set(project.id, project.toJSON(), true);
  }

  public async remove(
    provider: string,
    owner: string,
    name: string,
  ): Promise<void> {
    const project = new Project({
      provider,
      name,
      owner,
      workdir: this.workdir,
    });
    if (!(await this.has(project))) {
      throw new Error(`project ${project.name}(${project.repo}) not found`);
    }

    // @TODO
    if (!project.path || project.path === '/') {
      throw new Error(`project path (${project.path}) is not vaild`);
    }

    if (await this.existDir(project)) {
      await api.fs.rimraf(project.path);
    }

    this.config.set(project.id, null, true);
  }

  public async sync(
    provider: string,
    owner: string,
    name: string,
  ): Promise<void> {
    const project = new Project({
      provider,
      name,
      owner,
      workdir: this.workdir,
    });
    if (!(await this.has(project))) {
      throw new Error(`project ${project.name}(${project.repo}) not found`);
    }

    // add first
    if (!(await this.existDir(project))) {
      await this.add(project.url);
    }

    // use original created at
    const _project = this.config.get(project.id);
    project.createdAt = new Date(_project.createdAt);

    return new Promise<void>((resolve) => {
      api.$.cd(project.path);
      const child = api.$.spawn(`git pull --progress`);
      child.on('error', (e: any) => process.stderr.write(e));
      child.on('data', (e: any) => process.stdout.write(e));
      child.on('exit', () => {
        project.updatedAt = new Date();
        this.config.set(project.id, project.toJSON(), true);

        resolve();
      });
    });
  }

  public async list() {
    const config = this.config.getAll();
    return Object.values(config).sort((a, b) => a.id.localeCompare(b.id));
  }

  public async search(keyword?: string) {
    const config = this.config.getAll();
    const projects = Object.values(config).sort((a, b) =>
      a?.id?.localeCompare(b?.id),
    );

    if (!keyword) {
      return projects;
    }

    const re = new RegExp(keyword);
    return projects.filter((project) => {
      return re.test(project.url);
    });
  }

  public async validate(url: string) {
    const project = new Project({ url, workdir: this.workdir });
    if (!project.owner || !project.name) {
      return false;
    }
    return true;
  }

  public async prepare() {
    if (!(await api.fs.exist(this.config.path))) {
      await api.fs.mkdirp(path.dirname(this.config.path));
      await api.fs.yml.write(this.config.path, {});
    }

    await this.config.prepare();
  }

  public get(url: string) {
    const _url = /^(https?|git@)/.test(url)
      ? url
      : `https://github.com/${url}`;
    return new Project({ url: _url, workdir: this.workdir });
  }

  private async has(project: Project) {
    if (!!this.config.get(project.id)) {
      return true;
    }

    return false;
  }

  private async existDir(project: Project) {
    if (await api.fs.exist(project.path)) {
      return true;
    }

    return false;
  }
}

export interface ProjectOptions {
  workdir?: string;
  //
  url?: string;
  //
  provider?: string;
  owner?: string;
  name?: string;
}

const DEFAULT_PROVIDER = 'github.com';

export class Project {
  private parsedGitUrl = this.url && parseGitUrl(this.url);

  public _name: string = this.parsedGitUrl.name;
  public _owner: string = this.parsedGitUrl.owner;
  public _provider: string =
    this.parsedGitUrl.resource || this.parsedGitUrl.source;
  public createdAt = new Date();
  public updatedAt = new Date();

  constructor(private readonly options?: ProjectOptions) {
    //
  }

  public get id() {
    const { name, owner, provider } = this;
    return path.join(provider, owner, name);
  }

  public get name() {
    return this.options?.name || this._name;
  }

  public get owner() {
    return this.options?.owner || this._owner;
  }

  public get provider() {
    return this.options?.provider || this._provider;
  }

  public get url() {
    const { name, owner, provider = DEFAULT_PROVIDER } = this;
    if (this.options?.url) {
      // http/https
      if (/^https?:\/\//.test(this.options?.url)) return this.options.url;
      // git@
      if (/^git@/.test(this.options?.url)) return this.options.url;
      // ssh://
      if (/^ssh:\/\//.test(this.options?.url)) return this.options.url;
      // owner/repo
      return `https://${provider}/${this.options?.url.replace(
        /^\/(.*)/,
        '$1',
      )}`;
    }

    return `https://${provider}/${owner}/${name}`;
  }

  public get workdir() {
    return this.options?.workdir ?? api.path.homedir('code');
  }

  public get path() {
    const { name, owner, provider } = this;
    return path.join(this.workdir, provider, owner, name);
  }

  public get repo() {
    return `${this.owner}/${this.name}`;
  }

  public toJSON(): IProject {
    const {
      id,
      name,
      owner,
      provider,
      url,
      path,
      repo,
      workdir,
      createdAt,
      updatedAt,
    } = this;
    return {
      id,
      name,
      owner,
      provider,
      repo,
      url,
      path,
      workdir,
      createdAt,
      updatedAt,
    };
  }
}
