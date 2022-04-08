import { defineSubCommand } from '@cliz/cli';
import { startServer } from '@cliz/web-terminal/lib/core';

export default defineSubCommand((createCommand) => {
  return createCommand('Share terminal')
    .option('-c, --code <code>', 'Use custom code', {
      default: process.env.CODE,
    })
    .option('-r, --relay <relay>', 'Use custom relay', {
      default: process.env.REPLAY || 'wss://web-terminal.zcorky.com/terminal',
    })
    .option('--verbose', 'Show Command Log')
    .action(({ args, options }) => {
      const _options: any = {
        ...args,
        ...options,
        useLink: true,
      };

      return startServer(_options);
    });
});
