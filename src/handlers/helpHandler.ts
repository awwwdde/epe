import { Context } from 'telegraf';
import { messages } from '../messages';
import { keyboards } from '../keyboards';

// Обработчик команды /help
export class HelpHandler {
  async handle(ctx: Context): Promise<void> {
    const helpMessage = messages.help;
    const userId = ctx.from?.id || 0;
    
    await ctx.reply(helpMessage, {
      reply_markup: keyboards.help
    });
  }
}
