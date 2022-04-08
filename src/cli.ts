#!/usr/bin/env node

import { createMultiCommandsProgram, api } from '@cliz/cli';
import config from './config';

async function main() {
  // @TODO
  const configfile = api.path.homedir('.gpm.yml');
  if (!(await api.fs.exist(configfile))) {
    await api.fs.yml.write(configfile, {
      createdAt: new Date(),
    });
  }

  await api.config.load(config.name);

  const program = createMultiCommandsProgram(config.name, __dirname, {
    version: config.version,
  });

  await program.run();
}

main();
// .catch(error => {
//   console.error(error);
// });
