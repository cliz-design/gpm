import { resolve } from 'path';
import { ChildProcess } from 'child_process';
import { api, inquirer, doreamon } from '@cliz/cli';

import { runInBackground, runInShell } from '../utils';
import { ConfigManager } from './config';

export interface IDevTools {
  bootstrap(options?: BootstrapOptions): Promise<void>;
  dev(options?: DevOptions): Promise<void>;
  build(options?: BuildOptions): Promise<void>;
  test(options?: TestOptions): Promise<void>;
  fmt(options?: FmtOptions): Promise<void>;
  run(option?: RunOptions): Promise<void>;
  watch(options?: WatchOptions): Promise<void>;
  cli(options?: CliOptions): Promise<void>;
  install(options?: InstallOptions): Promise<void>;
  sync(): Promise<void>;
  clean(options?: CleanOptions): Promise<void>;
  commit(): Promise<void>;
}

export interface DevToolsOptions {
  command?: string | string[];
  context?: string;
}

export interface BootstrapOptions extends DevToolsOptions { }

export interface DevOptions extends DevToolsOptions { }

export interface BuildOptions extends DevToolsOptions { }

export interface TestOptions extends DevToolsOptions { }

export interface FmtOptions extends DevToolsOptions {
  dirOrGlob?: string;
}

export interface RunOptions extends DevToolsOptions { }

export interface InstallOptions extends DevToolsOptions { }

export interface CleanOptions extends DevToolsOptions { }

export interface WatchOptions extends DevToolsOptions {
  path?: string;
  ignore?: (string | RegExp)[];
}

export interface CliOptions extends DevToolsOptions { }

export interface DevToolsConfig {
  bootstrap?: string;
  dev?: string;
  build?: string;
  test?: string;
  fmt?: string;
  run?: string;
  watch?: string;
  cli?: string;
  install?: string;
  clean?: string;
}

export class DevTools implements IDevTools {
  private logger = doreamon.logger.getLogger('DevTools');

  public readonly config = new ConfigManager<DevToolsConfig>(api.path.cwd('.gpm.yml'));

  public async bootstrap(options?: BuildOptions) {
    let command =
      options?.command ?? this.config.get('bootstrap') ?? '';

    if (command === '') {
      if (await api.fs.exist(api.path.join(process.cwd(), 'yarn.lock'))) {
        command = 'yarn bootstrap';
      } else if (await api.fs.exist(api.path.join(process.cwd(), 'pnpm-lock.yaml'))) {
        command = 'pnpm run bootstrap';
      } else if (await api.fs.exist(api.path.join(process.cwd(), 'package-lock.json'))) {
        command = 'npm run bootstrap';
      } else {
        command = 'yarn bootstrap';
      }
    }

    if (Array.isArray(command)) {
      await Promise.all(command.map((e) => runInShell(e)));
      return;
    }

    await runInShell(command);
  }

  public async dev(options?: DevOptions) {
    const { logger } = this;
    const command = options?.command ?? this.config.get('dev') ?? 'yarn dev';

    // parallel
    if (Array.isArray(command)) {
      logger.info(
        `[dev] command: ${command.join(',')} in context(${options?.context})`,
      );

      await Promise.all(command.map((e) => runInShell(e)));
      return;
    }

    logger.info(`[dev] command: ${command} in context(${options?.context})`);
    await runInShell(command);
  }

  public async build(options?: BuildOptions) {
    const command =
      options?.command ?? this.config.get('build') ?? 'yarn build';

    if (Array.isArray(command)) {
      await Promise.all(command.map((e) => runInShell(e)));
      return;
    }

    await runInShell(command);
  }

  public async test(options?: BuildOptions) {
    const command =
      options?.command ?? this.config.get('test') ?? 'yarn test';

    if (Array.isArray(command)) {
      await Promise.all(command.map((e) => runInShell(e)));
      return;
    }

    await runInShell(command);
  }

  public async fmt(options?: FmtOptions) {
    let command = options?.command ?? this.config.get('fmt');
    const context = options?.context ?? process.cwd();
    if (!command) {
      const prettier = `${resolve(
        __dirname,
        '../../../node_modules/.bin',
      )}/prettier`;
      const prettierConfigPath = api.path.join(
        __dirname,
        '../../../config/prettierrc.json',
      );

      let glob = options?.dirOrGlob ?? `src/**/*.{ts,tsx,js,jsx,json,md}`;
      // monorepo
      if (await api.fs.exist(resolve(context, 'packages/'))) {
        glob = options?.dirOrGlob ? `packages/**/${options?.dirOrGlob}` : `packages/**/src/*.{ts,tsx,js,jsx,json,md}`;
      }

      command = `${prettier} --no-error-on-unmatched-pattern --write '${glob}' --config ${prettierConfigPath}`;
    }

    if (Array.isArray(command)) {
      await Promise.all(command.map((e) => runInShell(e)));
      return;
    }

    await runInShell(command);
  }

  public async run(options?: RunOptions) {
    const command = options?.command ?? this.config.get('run') ?? 'yarn prod';

    if (Array.isArray(command)) {
      await Promise.all(command.map((e) => runInShell(e)));
      return;
    }

    await runInShell(command);
  }

  public async watch(options?: WatchOptions) {
    // const logger = doreamon.logger.getLogger('WatchDog');
    const { logger } = this;
    const command = options?.command ?? this.config.get('watch');
    const context = options?.context || process.cwd();
    const ignore: any[] = [/\.git/];
    if (options.ignore) {
      if (!Array.isArray(options.ignore)) {
        ignore.push(options.ignore);
      } else {
        ignore.push(...options.ignore);
      }
    }

    let path = options?.path || context;
    if (!command) {
      throw new Error(`Watch no command found`);
    }

    if (!/^\//.test(path)) {
      path = `${process.cwd()}/${path}`;
    }

    const run = async (first?: boolean) => {
      if (Array.isArray(command)) {
        if (!first) {
          console.log();
          logger.info(`[watch] file changing, exec commands ...`);
        }

        return await Promise.all(
          command.map((e) =>
            runInBackground(e, {
              cwd: context,
            }),
          ),
        );
      }

      if (!first) {
        console.log();
        logger.info(`[watch] file changing, exec \`${command}\` ...`);
      }

      return await runInBackground(command, {
        cwd: context,
      });
    };

    logger.info(`[watch] command: ${command} in context(${context})`);
    logger.info(`[watch] watching ${path} ...`);

    function createRun() {
      let child: ChildProcess | ChildProcess[];

      return doreamon.func.debounce(async (options?: any) => {
        if (child) {
          if (Array.isArray(child)) {
            for (const c of child) {
              await c.kill();
            }
          } else {
            await child.kill();
          }
        }

        child = await run(options);
      }, 1000);
    }

    const _run = createRun();

    api.fs.watch(
      {
        path,
        ignore,
      },
      async () => {
        await _run();
      },
    );

    await _run(true);
  }

  public async cli(options?: CliOptions) {
    let command = options?.command ?? this.config.get('cli') ?? '';

    if (command === '') {
      if (await api.fs.exist(api.path.join(process.cwd(), 'yarn.lock'))) {
        command = 'yarn cli';
      } else if (await api.fs.exist(api.path.join(process.cwd(), 'pnpm-lock.yaml'))) {
        command = 'pnpm run cli';
      } else if (await api.fs.exist(api.path.join(process.cwd(), 'package-lock.json'))) {
        command = 'npm run cli';
      } else {
        command = 'yarn cli';
      }
    }

    // parallel
    if (Array.isArray(command)) {
      await Promise.all(command.map((e) => runInShell(e)));
      return;
    }

    await runInShell(command);
  }

  public async install(options?: InstallOptions) {
    let command = options?.command ?? this.config.get('install') ?? '';

    if (command === '') {
      if (await api.fs.exist(api.path.join(process.cwd(), 'yarn.lock'))) {
        command = 'yarn';
      } else if (await api.fs.exist(api.path.join(process.cwd(), 'pnpm-lock.yaml'))) {
        command = 'pnpm';
      } else if (await api.fs.exist(api.path.join(process.cwd(), 'package-lock.json'))) {
        command = 'npm';
      } else {
        command = 'yarn';
      }
    }

    if (Array.isArray(command)) {
      await Promise.all(command.map((e) => runInShell(e)));
      return;
    }

    await runInShell(command);
  }

  public async sync() {
    await runInShell(`git pull --progress`);
  }

  public async clean(options?: CleanOptions) {
    const command = options?.command ?? this.config.get('clean');
    if (command) {
      if (Array.isArray(command)) {
        await Promise.all(command.map((e) => runInShell(e)));
        return;
      }

      await runInShell(command);
    }

    const dirs = ['node_modules', 'dist', 'lib'];
    const answers = await inquirer.prompt([
      {
        name: 'ok',
        type: 'confirm',
        message: `Confirm to remove ${dirs.join('/')} ?`,
        default: false,
      },
    ]);

    if (answers.ok) {
      for (const name of dirs) {
        const dir = resolve(process.cwd(), name);
        if ((await api.fs.exist(dir)) && (await api.fs.isDir(dir))) {
          await api.fs.rimraf(dir);
        }
      }
    }
  }


  // xxx
  public async commit() {
    const command = `${resolve(
      __dirname,
      '../../../node_modules/.bin',
    )}/cliz-commit`;

    await runInShell(command);
  }

  public async prepare() {
    await this.config.prepare();
  }
}
