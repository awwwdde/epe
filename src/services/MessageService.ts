import { Telegraf } from 'telegraf';
import { CHANNEL_USERNAME } from '../config';

// Сервис для отправки сообщений
export class MessageService {
  
  // Отправить сообщение об отписке
  async sendUnsubscribeMessage(bot: Telegraf, userId: number): Promise<void> {
    try {
      const message = `⚠️ Внимание! Вы отписались от канала @${CHANNEL_USERNAME}

Для продолжения работы с ботом необходимо снова подписаться на канал.

Используйте команду /start для повторной проверки.`;

      await bot.telegram.sendMessage(userId, message, {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '📢 Подписаться на канал',
                url: `https://t.me/${CHANNEL_USERNAME}`
              }
            ],
            [
              {
                text: '✅ Проверить подписку',
                callback_data: 'check_subscription'
              }
            ]
          ]
        }
      });

      console.log(`📤 Отправлено сообщение об отписке пользователю ${userId}`);
    } catch (error) {
      console.error(`❌ Ошибка отправки сообщения об отписке пользователю ${userId}:`, error);
    }
  }
}
