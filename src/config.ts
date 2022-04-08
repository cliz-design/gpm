import { resolve } from 'path';

const pkgPath = resolve(__dirname, '../package.json');
const pkg = require(pkgPath);

class Config {
  // prod
  public name = 'gpm';
  public version = pkg.version;
  public ignoreFilePath = resolve(process.cwd(), '.gpmignore');

  constructor() {
    if (process.env.NODE_ENV === 'development') {
      config.name = 'yarn';
    }
  }
}

const config = new Config();

export default config;
