import { Context } from 'telegraf';
import { messages } from '../messages';
import { keyboards } from '../keyboards';

// Обработчик команды /subscribe
export class SubscribeHandler {
  async handle(ctx: Context): Promise<void> {
    await ctx.reply(messages.subscribePrompt, {
      reply_markup: keyboards.subscribe
    });
  }
}
