import { defineSubCommand, api } from '@cliz/cli';
import * as path from 'path';
import * as parseGitUrl from 'git-url-parse';
import * as open from 'open';

export default defineSubCommand((createCommand) => {
  return createCommand('Project GitHub Open').action(async () => {
    const gitConfigPath = path.resolve(process.cwd(), '.git/config');
    if (!api.fs.exist(gitConfigPath)) {
      throw new Error(`Not a vaild git project`);
    }

    const gitConfig = await api.fs.ini.load(gitConfigPath);
    const _url = gitConfig['remote "origin"'].url;
    const _parsed = parseGitUrl(_url);
    const url = `https://${_parsed.resource || _parsed.source}/${_parsed.owner}/${_parsed.name}`;

    await open(url);
  });
});
