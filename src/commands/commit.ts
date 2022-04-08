import { defineSubCommand } from '@cliz/cli';
import gpm from '../core';

export default defineSubCommand((createCommand) => {
  return createCommand('Project Commit').action(async () => {
    await gpm.prepare();
    await gpm.devtools.prepare();

    try {
      await gpm.devtools.commit();
    } catch (error) {
      console.error(error);
    }
  });
});
