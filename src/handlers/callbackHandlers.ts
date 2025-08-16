import { Context } from 'telegraf';
import { messages } from '../messages';
import { keyboards } from '../keyboards';
import { UserService } from '../services/UserService';
import { SubscriptionService } from '../services/SubscriptionService';

// Обработчики callback запросов
export class CallbackHandlers {
  constructor(
    private userService: UserService,
    private subscriptionService: SubscriptionService
  ) {}

  // Показать справку
  async showHelp(ctx: Context): Promise<void> {
    await ctx.editMessageText(messages.help, {
      reply_markup: keyboards.help
    });
  }

  // Вернуться к главному меню
  async backToMain(ctx: Context): Promise<void> {
    const userId = ctx.from?.id;
    
    if (!userId) {
      await ctx.answerCbQuery(messages.userNotFound);
      return;
    }

    const userData = this.userService.getUser(userId);
    if (userData?.isSubscribed) {
      // Пользователь подписан - показываем главное меню
      const successMessage = messages.getWelcomeSubscribed(ctx.from?.first_name || 'Пользователь');
      
      await ctx.editMessageText(successMessage, {
        reply_markup: keyboards.subscribed
      });
    }
  }

  // Проверить подписку
  async checkSubscription(ctx: Context): Promise<void> {
    const userId = ctx.from?.id;
    
    if (!userId) {
      await ctx.answerCbQuery(messages.userNotFound);
      return;
    }

    // Показываем "печатает" индикатор
    await ctx.answerCbQuery(messages.checkingSubscription);

    // Проверяем подписку
    const isSubscribed = await this.subscriptionService.checkSubscription(ctx, userId);
    
    // Получаем или создаем данные пользователя
    this.userService.updateSubscriptionStatus(userId, isSubscribed);

    if (isSubscribed) {
      // Пользователь подписан
      await ctx.editMessageText(messages.subscriptionSuccess, {
        reply_markup: keyboards.checkSubscription
      });
    } else {
      // Пользователь не подписан
      await ctx.editMessageText(messages.subscriptionNotSuccess, {
        reply_markup: keyboards.unsubscribe
      });
    }
  }
}
