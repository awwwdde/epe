import { Context } from 'telegraf';
import { CHANNEL_USERNAME } from '../config';

// Сервис для проверки подписок
export class SubscriptionService {
  
  // Проверить подписку пользователя на канал
  async checkSubscription(ctx: Context, userId: number): Promise<boolean> {
    try {
      // Получаем информацию о пользователе в канале
      const chatMember = await ctx.telegram.getChatMember(`@${CHANNEL_USERNAME}`, userId);
      
      // Проверяем статус пользователя
      return ['creator', 'administrator', 'member'].includes(chatMember.status);
    } catch (error) {
      console.error('Ошибка при проверке подписки:', error);
      return false;
    }
  }

  // Проверить, не заблокировал ли пользователь бота
  async isUserBlocked(bot: any, userId: number): Promise<boolean> {
    try {
      // Пытаемся отправить пустое сообщение для проверки
      await bot.telegram.sendChatAction(userId, 'typing');
      return false;
    } catch (error: any) {
      // Если получаем ошибку о заблокированном пользователе
      if (error.description?.includes('bot was blocked') || 
          error.description?.includes('user is deactivated') ||
          error.description?.includes('chat not found')) {
        return true;
      }
      return false;
    }
  }
}
