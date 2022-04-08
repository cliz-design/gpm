import { defineSubCommand, api, inquirer } from '@cliz/cli';
import gpm from '../core';
import { GPM } from '../core/gpm';

export default defineSubCommand((createCommand) => {
  return createCommand('Add an project')
    .argument('<url>', 'The Git Project Url')
    .option('-d, --depth <depth>', 'Specify git repo clone depth', {
      validator: (value: string) => {
        if (!value) {
          throw new Error(`depth is required in -d, --depth <depth>`);
        }

        if (!/\d+/.test(value)) {
          throw new Error(`depth must be a number`);
        }
        return +value;
      },
    })
    .action(async ({ args, options }) => {
      try {
        const url = args.url as any as string;

        console.info(`Adding repository: ${api.color.success(url)}`);

        //
        await gpm.prepare();
        const projectConfig = gpm.config.get('project');
        if (!projectConfig?.workdir) {
          await setupConfig(gpm);
        }

        await gpm.project.prepare();
        //

        const project = gpm.project.get(url);
        // console.info(`Cloning into: ${api.color.success(project.path)}`);

        if (!(await gpm.project.validate(url))) {
          console.error(
            `Failed to add: ${api.color.error(url)} is not a valid project`,
          );
          return;
        }

        try {
          await gpm.project.add(url, options as any);

          console.info(`Project at path: ${api.color.success(project.path)}`);
        } catch (error) {
          if (/found/i.test(error.message)) {
            console.error(`Found at path: ${api.color.error(project.path)}`);
          } else {
            throw error;
          }
        } finally {
          await api.clipboard
            .copy(project.path)
            .then(() =>
              console.info(
                `Copied (${api.color.success(project.path)}) to clipboard`,
              ),
            )
            .catch(() =>
              console.error(
                `Failed to copied (${api.color.success(
                  project.path,
                )}) to clipboard`,
              ),
            );
        }
      } catch (error) {
        console.error(error);
      }
    });
});

async function setupConfig(gpm: GPM) {
  const answers = await inquirer.prompt([
    {
      name: 'workdir',
      type: 'text',
      message: 'Input Your Work Directory ?',
      default: api.path.homedir('code'),
      validate: (t) => !!t,
    },
  ]);

  let workdir = answers.workdir as any as string;
  if (!workdir.startsWith('/')) {
    workdir = api.path.homedir(workdir);
  }

  gpm.config.set('project', {
    workdir,
  });
}
