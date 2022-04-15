import { defineSubCommand } from '@cliz/cli';

export default defineSubCommand((createCommand, { api }) => {
  return createCommand('Get gpm info').action(async () => {
    const info = {
      os: await api.system.getOsInfo(),
      node: await api.system.getNodeInfo(),
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
