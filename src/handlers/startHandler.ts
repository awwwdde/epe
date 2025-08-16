import { Context } from 'telegraf';
import { User } from '../types';
import { messages } from '../messages';
import { keyboards } from '../keyboards';
import { UserService } from '../services/UserService';
import { SubscriptionService } from '../services/SubscriptionService';

// Обработчик команды /start
export class StartHandler {
  constructor(
    private userService: UserService,
    private subscriptionService: SubscriptionService
  ) {}

  async handle(ctx: Context): Promise<void> {
    const user = ctx.from as User;
    
    // Инициализируем или получаем данные пользователя
    const userData = this.userService.getOrCreateUser(user.id);
    
    // Сразу проверяем подписку пользователя
    const isSubscribed = await this.subscriptionService.checkSubscription(ctx, user.id);
    
    // Обновляем статус подписки
    this.userService.updateSubscriptionStatus(user.id, isSubscribed);
    
    if (isSubscribed) {
      // Пользователь уже подписан - показываем функции
      const successMessage = messages.getWelcomeSubscribed(user.first_name);
      
      await ctx.reply(successMessage, {
        reply_markup: keyboards.subscribed
      });
    } else {
      // Пользователь не подписан - показываем приветствие с просьбой подписаться
      const welcomeMessage = messages.getWelcomeNotSubscribed(user.first_name);
      
      await ctx.reply(welcomeMessage, {
        reply_markup: keyboards.notSubscribed
      });
    }
  }
}
