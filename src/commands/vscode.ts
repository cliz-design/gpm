import { defineSubCommand, api } from '@cliz/cli';

export default defineSubCommand((createCommand) => {
  return createCommand('Project VSCode Open').action(async () => {
    await api.$`code .`;
  });
});
