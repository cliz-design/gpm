export interface ServiceManager {
  start(option?: StartOptions): Promise<void>;
  stop(option?: StopOptions): Promise<void>;
  restart(option?: RestartOptions): Promise<void>;
  reload(option?: ReloadOptions): Promise<void>;
}

export interface StartOptions {}

export interface StopOptions {}

export interface RestartOptions {}

export interface ReloadOptions {}
