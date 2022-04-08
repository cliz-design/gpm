import { defineSubCommand } from '@cliz/cli';
import gpm from '../core';

export default defineSubCommand((createCommand) => {
  return createCommand('Project Install Dependencies').action(async () => {
    await gpm.prepare();
    await gpm.package.prepare();

    await gpm.package.release();
  });
});
