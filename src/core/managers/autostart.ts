export interface AutostartManager {
  enable(option?: EnableOptions): Promise<void>;
  disable(option?: DisableOptions): Promise<void>;
}

export interface EnableOptions {}

export interface DisableOptions {}
