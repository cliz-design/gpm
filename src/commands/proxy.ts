import { defineSubCommand, api } from '@cliz/cli';
import { proxy } from '@cliz/proxy/lib/core/proxy';

export default defineSubCommand((createCommand) => {
  return createCommand('Run command in proxy')
    .configure({
      strictArgsCount: false,
      strictOptions: false,
    })
    .argument('<command>', 'The command')
    .option('--host <host>', 'The proxy host', {
      default: '127.0.0.1',
    })
    .option('--port <port>', 'The proxy port', {
      default: 17890,
    })
    .action(async (action) => {
      const options = action.options as any;
      // const args = action.args as any;

      const host = options.host || '127.0.0.1';
      const port = +options.port || 17890;

      // @HACK
      // let command = process.argv.join(' ');
      // let index = command.indexOf('proxy');
      // command = command.slice(index + 5);
      // if (options.host) {
      //   command = command
      //     .replace(new RegExp(`-h\s+${host}`), '')
      //     .replace(new RegExp(`--host\s+${host}`), '')
      // }
      // if (options.port) {
      //   command = command
      //     .replace(new RegExp(`-p\s+${port}`), '')
      //     .replace(new RegExp(`--port\s+${port}`), '')
      // }
      // command = command.trim();
      const command_parts: string[] = [];
      let isMeetProxy = false;
      let isMeetHost = false;
      let isMeetPort = false;
      for (let index = 0; index < process.argv.length; index++) {
        const part = process.argv[index];

        if (part === 'proxy') {
          isMeetProxy = true;
          continue;
        }

        // ignore
        if (!isMeetProxy) continue;

        // host / port
        if (!isMeetHost && ['-h', '--host'].includes(part)) {
          isMeetHost = true;
          // ignore next
          index += 1;
          continue;
        }

        if (!isMeetPort && ['-p', '--port'].includes(part)) {
          isMeetPort = true;

          // ignore next
          index += 1;
          continue;
        }

        isMeetHost = true;
        isMeetPort = true;
        // real parts
        command_parts.push(part);
      }

      const command = command_parts.join(' ');
      console.log('command:', api.color.success(command) + '\n');

      await proxy(command, {
        host,
        port,
      });
    });
});
