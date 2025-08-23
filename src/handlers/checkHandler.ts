import { Context } from 'telegraf';
import { messages } from '../messages';
import { keyboards } from '../keyboards';
import { UserService } from '../services/UserService';
import { SubscriptionService } from '../services/SubscriptionService';

// Обработчик команды /check
export class CheckHandler {
  constructor(
    private userService: UserService,
    private subscriptionService: SubscriptionService
  ) {}

  async handle(ctx: Context): Promise<void> {
    const userId = ctx.from?.id;
    
    if (!userId) {
      await ctx.reply(messages.userNotFound, {
        reply_markup: keyboards.help
      });
      return;
    }

    const isSubscribed = await this.subscriptionService.checkSubscription(ctx, userId);
    
    // Обновляем данные пользователя
    this.userService.updateSubscriptionStatus(userId, isSubscribed);

    if (isSubscribed) {
      await ctx.reply(messages.subscribed, {
        reply_markup: keyboards.checkSubscription
      });
    } else {
      await ctx.reply(messages.notSubscribed, {
        reply_markup: keyboards.unsubscribe
      });
    }
  }
}
