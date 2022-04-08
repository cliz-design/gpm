import { defineSubCommand } from '@cliz/cli';
import gpm from '../core';

export default defineSubCommand((createCommand) => {
  return createCommand('Project Build')
    .option('-e, --exec <command>', 'Custom Dev Command')
    .action(async (action) => {
      const options = action.options as any;
      const command = options.command ?? options.exec;

      await gpm.prepare();
      await gpm.devtools.prepare();

      await gpm.devtools.build({
        command,
      });
    });
});
