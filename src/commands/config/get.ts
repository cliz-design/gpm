import { defineSubCommand } from '@cliz/cli';
import gpm from '../../core';

export default defineSubCommand((createCommand) => {
  return createCommand('Get gpm config')
    .argument('<key>', 'The Config Key')
    .option('-g, --global', 'Get global config')
    .action(async ({ args, options }) => {
      try {
        const key = args.key as any as string;
        // const global = options.global as any as boolean;

        //
        await gpm.prepare();

        const value = gpm.config.get(key as any) ?? '';

        console.log(value);
      } catch (error) {
        console.error(error);
      }
    });
});
