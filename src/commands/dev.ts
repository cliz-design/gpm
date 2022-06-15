import { defineSubCommand } from '@cliz/cli';
import gpm from '../core';

export default defineSubCommand((createCommand) => {
  return createCommand('Project Dev')
    .option('-e, --exec <command>', 'Custom dev command')
    .option(
      '-w, --watch [watchPath]',
      'Enable live reload, and set watch path, default: current dir',
    )
    .option('-c, --context <context>', 'Command context')
    .action(async (action) => {
      const options = action.options as any;

      const command = typeof options.command == 'boolean' ? '' : options.exec;
      const watchPath =
        typeof options.watch === 'boolean'
          ? process.cwd()
          : options.watch || process.cwd();
      const context = options.context ?? process.cwd();

      // @TODO <> 必须参数，好像失效了？？？
      if (typeof options.context === 'boolean') {
        throw new Error(`context(-c, --context <context>) is required`);
      }

      await gpm.prepare();
      await gpm.devtools.prepare();

      if (options.watch) {
        if (!command) {
          throw new Error(`command(--exec <command>) is required`);
        }

        return await gpm.devtools.watch({
          command,
          path: watchPath,
          context,
        });
      }

      return await gpm.devtools.dev({
        command,
        context,
      });
    });
});
