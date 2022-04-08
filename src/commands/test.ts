import { defineSubCommand } from '@cliz/cli';
import gpm from '../core';

export default defineSubCommand((createCommand) => {
  return createCommand('Project Test')
    .option('-e, --exec <command>', 'Custom Test Command')
    .action(async (action) => {
      const options = action.options as any;
      const command = options.command ?? options.exec;

      await gpm.prepare();
      await gpm.devtools.prepare();

      await gpm.devtools.test({
        command,
      });
    });
});
