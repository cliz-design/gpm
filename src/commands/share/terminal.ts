import { defineSubCommand } from '@cliz/cli';
import { startServer, startClient } from '@cliz/web-terminal/lib/core';

/**
 * example:
 *    server:
 *      using link: gpm share terminal
 *      use code: gpm share terminal --disable-link
 *    
 *    client:
 *      using link: open url in browser
 *      use code: gpm share terminal --client -c <code>
 */
export default defineSubCommand((createCommand) => {
  return createCommand('Share terminal')
    .option('-c, --code <code>', 'Use custom code', {
      default: process.env.CODE,
    })
    .option('-r, --relay <relay>', 'Use custom relay', {
      default: process.env.REPLAY || 'wss://web-terminal.zcorky.com/terminal',
    })
    .option('--disable-link', 'Disable link', {
      default: false,
    })
    .option('--client', 'Set as client, default: false', {
      default: false,
    })
    .option('--verbose', 'Show Command Log')
    .action(({ args, options }) => {
      let useLink = true;
      let isClient = !!options.client;
      if (!!options.disableLink) {
        useLink = false;
      }

      const _options: any = {
        ...args,
        ...options,
        useLink,
      };

      if (!!isClient) {
        return startClient(_options);
      }

      return startServer(_options);
    });
});
