import { defineSubCommand, api, inquirer } from '@cliz/cli';
import gpm from '../core';
import { GPM } from '../core/gpm';

export default defineSubCommand((createCommand) => {
  return createCommand('Search a project')
    .argument('<keyword>', 'Keyword')
    .action(async ({ args }) => {
      try {
        const keyword = args.keyword as any as string;

        //
        await gpm.prepare();
        const projectConfig = gpm.config.get('project');
        if (!projectConfig?.workdir) {
          await setupConfig(gpm);
        }

        await gpm.project.prepare();
        //

        const projects = await gpm.project.search(keyword);
        const answers = await inquirer.prompt([
          {
            name: 'projectId',
            type: 'list',
            message: 'Select ?',
            choices: projects.map((e) => ({ name: e.id, value: e.id })),
            validate: (t) => !!t,
          },
        ]);

        const project = projects.find((e) => answers.projectId === e.id);
        if (!project) {
          return console.error(`no projects includes keyword ${keyword}`);
        }

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
