import { defineSubCommand, api, inquirer } from '@cliz/cli';
import gpm from '../core';
import { GPM } from '../core/gpm';

export default defineSubCommand((createCommand) => {
  return createCommand('Remove a project')
    .argument('<repo>', 'The Git Project')
    .action(async ({ args }) => {
      try {
        const repo = args.repo as any as string;

        //
        await gpm.prepare();
        const projectConfig = gpm.config.get('project');
        if (!projectConfig?.workdir) {
          await setupConfig(gpm);
        }

        await gpm.project.prepare();
        //

        const projects = await gpm.project.search(repo);
        let project = projects[0];
        if (projects.length > 1) {
          const answers = await inquirer.prompt([
            {
              name: 'projectId',
              type: 'list',
              message: 'Select ?',
              choices: projects.map((e) => ({ name: e.id, value: e.id })),
              validate: (t) => !!t,
            },
          ]);

          project = projects.find((e) => answers.projectId === e.id);
        }

        if (!project) {
          return console.error(`Project not found: ${api.color.error(repo)}`);
        }

        const answers = await inquirer.prompt([
          {
            name: 'ok',
            type: 'confirm',
            message: `Confirm to remove ${api.color.error(project.id)}?`,
            required: true,
            default: false,
          },
        ]);

        if (answers.ok) {
          await gpm.project.remove(
            project.provider,
            project.owner,
            project.name,
          );

          console.info(
            `Success to remove ${api.color.error(
              project.id,
            )} at ${api.color.error(project.path)}`,
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
