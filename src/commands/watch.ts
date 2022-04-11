import { defineSubCommand } from '@cliz/cli';
import gpm from '../core';

export default defineSubCommand((createCommand, { api }) => {
  return createCommand('Project Watch')
    .option('-e, --exec <command>', 'Custom watch command')
    .option('-c, --context <context>', 'Project path')
    .option('-p, --path <path>', 'Custom watch path')
    .option('-i, --ignore <path>', 'Custom ignore path, string or regexp')
    .action(async (action) => {
      const options = action.options as any;
      const command = options.command ?? options.exec;
      const path = options.path;
      const ignore: (string | RegExp)[] = [];
      const context = options?.context;

      if (options.ignore) {
        ignore.push(options.ignore);
      }

      const ignoreFilePath = api.path.join(process.cwd(), '.gpmignore');
      if (await api.fs.exist(ignoreFilePath)) {
        const text = await api.fs.readFile(ignoreFilePath, 'utf8');
        const lines = text.split(/\r?\n/);
        const cwd = process.cwd();
        lines.forEach((line) => {
          if (line) {
            // @TODO
            const fullpath = api.path.join(cwd, line);
            ignore.push(fullpath);
            // ignore.push(line);
            // ignore.push(new RegExp(`^${line}$`));
          }
        });
      }

      await gpm.prepare();
      await gpm.devtools.prepare();

      await gpm.devtools.watch({
        command,
        path,
        ignore,
        context,
      });
    });
});
