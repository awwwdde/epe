import { Context } from 'telegraf';
import { User } from '../types';
import { messages } from '../messages';
import { keyboards } from '../keyboards';
import { UserService } from '../services/UserService';
import { SubscriptionService } from '../services/SubscriptionService';
import { ReferralService } from '../services/ReferralService';

// Обработчик команды /start
export class StartHandler {
  constructor(
    private userService: UserService,
    private subscriptionService: SubscriptionService,
    private referralService: ReferralService
  ) {}

  async handle(ctx: Context): Promise<void> {
    const user = ctx.from as User;
    
    // Проверяем, есть ли реферальный код в start параметре
    const startPayload = (ctx.message as any)?.text?.split(' ')[1];
    let referralMessage = '';
    
    if (startPayload) {
      // Обрабатываем реферальный переход
      const success = this.referralService.processReferral(startPayload, user.id);
      if (success) {
        // Устанавливаем связь с реферером
        this.userService.setReferredBy(user.id, startPayload);
        referralMessage = '\n\n🎉 Вы присоединились по реферальной ссылке!';
      }
    }
    
    // Инициализируем или получаем данные пользователя
    const userData = this.userService.getOrCreateUser(user.id);
    
    // Сразу проверяем подписку пользователя
    const isSubscribed = await this.subscriptionService.checkSubscription(ctx, user.id);
    
    // Обновляем статус подписки
    this.userService.updateSubscriptionStatus(user.id, isSubscribed);
    
    if (isSubscribed) {
      // Пользователь уже подписан - показываем функции
      const successMessage = messages.getWelcomeSubscribed(user.first_name) + referralMessage;
      
      await ctx.reply(successMessage, {
        reply_markup: keyboards.getMainMenu(user.id)
      });
    } else {
      // Пользователь не подписан - показываем приветствие с просьбой подписаться
      const welcomeMessage = messages.getWelcomeNotSubscribed(user.first_name) + referralMessage;
      
      await ctx.reply(welcomeMessage, {
        reply_markup: keyboards.notSubscribed
      });
    }
  }
}
