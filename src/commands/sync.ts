import { defineSubCommand, api, inquirer } from '@cliz/cli';
import gpm from '../core';
import { GPM } from '../core/gpm';

export default defineSubCommand((createCommand) => {
  return createCommand('Sync a project')
    .argument('[repo]', 'The Git Project')
    .action(async ({ args }) => {
      try {
        const repo = args.repo as any as string;

        //
        await gpm.prepare();

        // sync local project
        if (!repo) {
          return await gpm.devtools.sync();
        }

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
              message: 'Select project ?',
              choices: projects.map((e) => ({ name: e.id, value: e.id })),
              validate: (t) => !!t,
            },
          ]);

          project = projects.find((e) => answers.projectId === e.id);
        }

        if (!project) {
          return console.error(`project ${repo} not found`);
        }

        const answers = await inquirer.prompt([
          {
            name: 'ok',
            type: 'confirm',
            message: `Confirm to sync ${api.color.success(project.id)}?`,
            required: true,
            default: true,
          },
        ]);

        if (answers.ok) {
          console.info(
            `Syncing repository: ${api.color.success(project.id)}`,
          );

          await gpm.project.sync(
            project.provider,
            project.owner,
            project.name,
          );

          console.info(
            `Success to sync ${api.color.success(
              project.id,
            )} at ${api.color.success(project.path)}`,
          );

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
