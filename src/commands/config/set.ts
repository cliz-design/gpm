import { defineSubCommand } from '@cliz/cli';
import gpm from '../../core';

export default defineSubCommand((createCommand) => {
  return createCommand('Set gpm config')
    .argument('<key>', 'The Config Key')
    .argument('<value>', 'The Config Value')
    .option('-g, --global', 'Get global config')
    .action(async ({ args }) => {
      try {
        const key = args.key as any as string;
        const value = args.value as any as string;
        // const global = options.global as any as boolean;

        //
        await gpm.prepare();

        gpm.config.set(key as any, value as any, true);
      } catch (error) {
        console.error(error);
      }
    });
});
