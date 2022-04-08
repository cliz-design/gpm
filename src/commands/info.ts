import { defineSubCommand } from '@cliz/cli';
import { osInfo } from '@znode/os-info';
import { nodeInfo } from '@znode/node-info';

export default defineSubCommand((createCommand) => {
  return createCommand('Get gpm info').action(async () => {
    const info = {
      os: await osInfo(),
      node: await nodeInfo(),
    };

    console.info('Platform:', info.os.platform);
    console.info('Architecture:', info.os.arch);
    console.info('Kernal:', info.os.kernel);
    console.info('Node:', info.node.version);
    console.info('V8:', info.node.v8);
    console.info('NPM:', info.node.npm);
    console.info('Yarn:', info.node.yarn);
  });
});
