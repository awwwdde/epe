import { Context } from 'telegraf';
import { messages } from '../messages';

// Обработчик команды /help
export class HelpHandler {
  async handle(ctx: Context): Promise<void> {
    const helpMessage = messages.help;
    await ctx.reply(helpMessage);
  }
}
