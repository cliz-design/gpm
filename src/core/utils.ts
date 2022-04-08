import { ChildProcess, spawn } from 'child_process';
import * as kill from 'tree-kill';

// declare module '@cliz/core' {
//   export interface API {
//     runInShell: typeof runInShell;
//   }
// }

export interface Options {
  cwd?: string;
  env?: Record<string, string | number | boolean>;
}

export async function runInShell(command: string, options?: Options) {
  if (options?.env) {
    for (const key in options.env) {
      process.env[key] = '' + options.env[key];
    }
  }

  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, {
      shell: true,
      stdio: 'inherit',
      cwd: options?.cwd,
    });

    // child.on('data', e => console.log('daa:', e));

    child.on('exit', (code) => {
      if (code !== 0)
        return reject(
          `run command error (command: ${command}, code: ${code})`,
        );
      resolve();
    });

    child.on('error', (error) => {
      return reject(
        `run command error (command: ${command}, error: ${error?.message})`,
      );
    });

    (child as any).kill = () => {
      return new Promise<void>((resolve, reject) => {
        kill(child.pid, (error) => {
          if (error) {
            return reject(error);
          }

          return resolve();
        });
      });
    };
  });
}

export async function runInBackground(command: string, options?: Options) {
  if (options?.env) {
    for (const key in options.env) {
      process.env[key] = '' + options.env[key];
    }
  }

  return new Promise<ChildProcess>((resolve, reject) => {
    // console.log('command context:', options?.cwd, command);

    const child = spawn(command, {
      shell: true,
      stdio: 'inherit',
      cwd: options?.cwd,
    });

    child.on('exit', (code) => {
      if (code !== 0)
        return reject(
          `run command error (command: ${command}, code: ${code})`,
        );
      resolve(child);
    });

    child.on('error', (error) => {
      return reject(
        `run command error (command: ${command}, error: ${error?.message})`,
      );
    });

    (child as any).kill = () => {
      return new Promise<void>((resolve, reject) => {
        kill(child.pid, (error) => {
          if (error) {
            return reject(error);
          }

          return resolve();
        });
      });
    };

    resolve(child);
  });
}
