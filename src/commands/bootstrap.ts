import { defineSubCommand } from '@cliz/cli';
import gpm from '../core';

export default defineSubCommand((createCommand) => {
  return createCommand('Project Bootstrap')
    .option('-e, --exec <command>', 'Custom Bootstrap Command')
    .action(async (action) => {
      const options = action.options as any;
      const command = options.command ?? options.exec;

      await gpm.prepare();
      await gpm.devtools.prepare();

      await gpm.devtools.bootstrap({
        command,
      });
    });
});
