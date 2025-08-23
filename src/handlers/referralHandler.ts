import { Context } from 'telegraf';
import { ReferralService } from '../services/ReferralService';
import { UserService } from '../services/UserService';

export class ReferralHandler {
  constructor(
    private referralService: ReferralService,
    private userService: UserService
  ) {}

  // Обработчик команды /referral
  async handle(ctx: Context): Promise<void> {
    try {
      const userId = ctx.from?.id;
      if (!userId) {
        await ctx.reply('❌ Не удалось определить пользователя');
        return;
      }

      const username = ctx.from?.username;
      const firstName = ctx.from?.first_name || 'Пользователь';

      // Проверяем, есть ли уже реферальная ссылка у пользователя
      const existingCode = this.referralService.getUserReferralCode(userId);
      
      if (existingCode) {
        // У пользователя уже есть реферальная ссылка
        const referralCount = this.referralService.getUserReferralCount(userId);
        const botUsername = ctx.botInfo?.username;
        const referralLink = `https://t.me/${botUsername}?start=${existingCode}`;
        
        const message = `🔗 У вас уже есть реферальная ссылка!\n\n` +
          `📊 Количество приглашенных: ${referralCount}\n\n` +
          `🔗 Ваша ссылка:\n` +
          `<code>${referralLink}</code>\n\n` +
          `💡 Поделитесь этой ссылкой с друзьями!`;
        
        // Создаем клавиатуру с кнопками для работы со ссылкой
        const keyboard = {
          inline_keyboard: [
            [
              {
                text: '🔗 Открыть ссылку',
                url: referralLink
              },
              {
                text: '📋 Копировать ссылку',
                callback_data: `copy_link_${existingCode}`
              }
            ],
            [
              {
                text: '📤 Поделиться ссылкой',
                switch_inline_query: `Присоединяйся к боту по моей реферальной ссылке: ${referralLink}`
              }
            ],
            [
              {
                text: '🔙 Назад в меню',
                callback_data: 'back_to_main'
              }
            ]
          ]
        };
        
        await ctx.reply(message, {
          parse_mode: 'HTML',
          reply_markup: keyboard
        });
        return;
      }

      // Создаем новую реферальную ссылку
      const referralCode = this.referralService.createReferralLink(userId, username, firstName);
      
      if (!referralCode) {
        await ctx.reply('❌ Не удалось создать реферальную ссылку');
        return;
      }

      // Обновляем данные пользователя
      this.userService.setReferralLink(userId, referralCode);

      const botUsername = ctx.botInfo?.username;
      const referralLink = `https://t.me/${botUsername}?start=${referralCode}`;
      
      const message = `🎉 Реферальная ссылка создана!\n\n` +
        `🔗 Ваша ссылка:\n` +
        `<code>${referralLink}</code>\n\n` +
        `💡 Поделитесь этой ссылкой с друзьями!\n` +
        `📊 За каждого приглашенного друга вы будете отображаться в топе рефералов.`;
      
      // Создаем клавиатуру с кнопками для работы со ссылкой
      const keyboard = {
        inline_keyboard: [
          [
            {
              text: '🔗 Открыть ссылку',
              url: referralLink
            },
            {
              text: '📋 Копировать ссылку',
              callback_data: `copy_link_${referralCode}`
            }
          ],
          [
            {
              text: '📤 Поделиться ссылкой',
              switch_inline_query: `Присоединяйся к боту по моей реферальной ссылке: ${referralLink}`
            }
          ],
          [
            {
              text: '🔙 Назад в меню',
              callback_data: 'back_to_main'
            }
          ]
        ]
      };
      
      await ctx.reply(message, {
        parse_mode: 'HTML',
        reply_markup: keyboard
      });

    } catch (error) {
      console.error('Ошибка в ReferralHandler:', error);
      await ctx.reply('❌ Произошла ошибка при создании реферальной ссылки');
    }
  }

  // Обработчик команды /leaderboard
  async handleLeaderboard(ctx: Context): Promise<void> {
    try {
      const leaderboard = this.referralService.getLeaderboard(10);
      
      if (leaderboard.length === 0) {
        await ctx.reply('📊 Пока нет данных для лидерборда рефералов');
        return;
      }

      let message = '🏆 Топ рефералов:\n\n';
      
      leaderboard.forEach((user, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅';
        const username = user.username ? `@${user.username}` : user.firstName;
        message += `${medal} ${index + 1}. ${username} - ${user.referralCount} рефералов\n`;
      });

      const stats = this.referralService.getReferralStats();
      message += `\n📈 Общая статистика:\n` +
        `👥 Всего приглашено: ${stats.totalReferrals}\n` +
        `🎯 Активных рефереров: ${stats.activeReferrers}`;

      await ctx.reply(message);

    } catch (error) {
      console.error('Ошибка в ReferralHandler.leaderboard:', error);
      await ctx.reply('❌ Произошла ошибка при получении лидерборда');
    }
  }

  // Обработчик команды /mystats
  async handleMyStats(ctx: Context): Promise<void> {
    try {
      const userId = ctx.from?.id;
      if (!userId) {
        await ctx.reply('❌ Не удалось определить пользователя');
        return;
      }

      const referralCode = this.referralService.getUserReferralCode(userId);
      const referralCount = this.referralService.getUserReferralCount(userId);
      const stats = this.referralService.getReferralStats();

      if (!referralCode) {
        await ctx.reply('❌ У вас нет реферальной ссылки. Используйте /referral для создания.');
        return;
      }

      // Находим позицию в топе
      const leaderboard = this.referralService.getLeaderboard();
      const position = leaderboard.findIndex(user => user.userId === userId) + 1;

      const message = `📊 Ваша реферальная статистика:\n\n` +
        `🔗 Код: ${referralCode}\n` +
        `👥 Приглашено: ${referralCount} человек\n` +
        `🏆 Позиция в топе: ${position > 0 ? position : 'Не в топе'}\n\n` +
        `📈 Общая статистика бота:\n` +
        `👥 Всего приглашено: ${stats.totalReferrals}\n` +
        `🎯 Активных рефереров: ${stats.activeReferrers}`;

      await ctx.reply(message);

    } catch (error) {
      console.error('Ошибка в ReferralHandler.myStats:', error);
      await ctx.reply('❌ Произошла ошибка при получении статистики');
    }
  }
}
