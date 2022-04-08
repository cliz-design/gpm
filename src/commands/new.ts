import { defineSubCommand, api, inquirer } from '@cliz/cli';
import gpm from '../core';
import { GPM } from '../core/gpm';

export default defineSubCommand((createCommand) => {
  return createCommand('Create an project')
    .argument('<target>', 'The Target Git Repo')
    .argument('<template>', 'The Template Git Repo')
    .action(async ({ args }) => {
      try {
        const target = args.target as any as string;
        const template = args.template as any as string;

        console.info(`Creating repository: ${api.color.success(target)}`);

        //
        await gpm.prepare();
        const projectConfig = gpm.config.get('project');
        if (!projectConfig?.workdir) {
          await setupConfig(gpm);
        }

        await gpm.project.prepare();
        //

        const project = gpm.project.get(target);
        // console.info(`Cloning into: ${api.color.success(project.path)}`);

        try {
          await gpm.project.create(target, template);

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
