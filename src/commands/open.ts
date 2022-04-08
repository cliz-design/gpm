import { defineSubCommand } from '@cliz/cli';
import { open } from '@cliz/open/lib/core/open';

export default defineSubCommand((createCommand) => {
  return createCommand('Project Finder Open')
    .argument('[target]', 'custom target', {
      default: process.cwd(),
    })
    .option('-n, --new', 'Force open new instance', {
      default: false,
    })
    .action(async ({ args, options }) => {
      await open(args.target, {
        forceNew: options.new,
      });
    });
});
