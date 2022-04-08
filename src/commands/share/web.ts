import { defineSubCommand } from '@cliz/cli';
import {
  client as startClient,
  ICreateClientOptions,
} from '@cliz/inlets/lib/core/client';

const pkg = require('@cliz/inlets/package.json');

export default defineSubCommand((createCommand) => {
  return createCommand('Share Web Service')
    .option('-p, --port <port>', 'The port of the web service', {
      required: true,
    })
    .option('-h, --host <host>', 'The Host', {
      default: '127.0.0.1',
    })
    .option('--verbose', 'Show Command Log')
    .action((action) => {
      const options = action.options as any;
      const logger = action.logger;
      const port = options.port;
      const host = options.host;

      const upstream = `${host}:${port}`;

      logger.info(`share web: http://${upstream}`);

      const config: ICreateClientOptions = {
        remote: 'inlets.zcorky.com:443',
        remoteTCPPort: 8443, // @TODO
        healthcheckInterval: 30 * 1000,
        type: 'http',
        authType: 'public',
        upstream,
        token: 'public',
        version: pkg.version,
        onError: (error) => {
          if (error) {
            logger.error('inlects error:', error);

            process.exit(1);
          }
        },
      };

      if (typeof process.env.DEBUG !== 'undefined') {
        logger.info('running config:', config);
      }

      return startClient(config);
    });
});
