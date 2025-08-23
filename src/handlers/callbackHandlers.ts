import { Context } from 'telegraf';
import { messages } from '../messages';
import { keyboards } from '../keyboards';
import { UserService } from '../services/UserService';
import { SubscriptionService } from '../services/SubscriptionService';
import { ReferralService } from '../services/ReferralService';

// Обработчики callback запросов
export class CallbackHandlers {
  constructor(
    private userService: UserService,
    private subscriptionService: SubscriptionService,
    private referralService: ReferralService
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
        reply_markup: keyboards.getMainMenu(userId)
      });
    }
  }

  // Показать меню реферальной системы
  async showReferralMenu(ctx: Context): Promise<void> {
    const userId = ctx.from?.id;
    
    if (!userId) {
      await ctx.answerCbQuery(messages.userNotFound);
      return;
    }

    const message = `🔗 Реферальная система\n\n` +
      `Здесь вы можете:\n` +
      `• Создать реферальную ссылку\n` +
      `• Посмотреть свою статистику\n` +
      `• Увидеть топ рефералов\n\n` +
      `💡 Приглашайте друзей и соревнуйтесь!`;

    await ctx.editMessageText(message, {
      reply_markup: keyboards.referralMenu
    });
  }

  // Создать реферальную ссылку
  async createReferral(ctx: Context): Promise<void> {
    const userId = ctx.from?.id;
    
    if (!userId) {
      await ctx.answerCbQuery(messages.userNotFound);
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
              callback_data: 'referral_menu'
            }
          ]
        ]
      };
      
      await ctx.editMessageText(message, {
        parse_mode: 'HTML',
        reply_markup: keyboard
      });
      return;
    }

    // Создаем новую реферальную ссылку
    const referralCode = this.referralService.createReferralLink(userId, username, firstName);
    
    if (!referralCode) {
      await ctx.editMessageText('❌ Не удалось создать реферальную ссылку', {
        reply_markup: keyboards.referralMenu
      });
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
            callback_data: 'referral_menu'
          }
        ]
      ]
    };
    
    await ctx.editMessageText(message, {
      parse_mode: 'HTML',
      reply_markup: keyboard
    });
  }

  // Копировать ссылку
  async copyLink(ctx: Context): Promise<void> {
    const callbackData = ctx.callbackQuery?.data;
    if (!callbackData) {
      await ctx.answerCbQuery('❌ Ошибка при копировании ссылки');
      return;
    }

    const code = callbackData.replace('copy_link_', '');
    const botUsername = ctx.botInfo?.username;
    const referralLink = `https://t.me/${botUsername}?start=${code}`;

    // Отправляем ссылку как отдельное сообщение для удобного копирования
    await ctx.reply(`📋 Ваша реферальная ссылка:\n\n<code>${referralLink}</code>\n\n💡 Скопируйте эту ссылку и поделитесь с друзьями!`, {
      parse_mode: 'HTML'
    });

    // Отвечаем на callback
    await ctx.answerCbQuery('✅ Ссылка скопирована!');
  }

  // Показать личную реферальную статистику
  async showMyReferralStats(ctx: Context): Promise<void> {
    const userId = ctx.from?.id;
    
    if (!userId) {
      await ctx.answerCbQuery(messages.userNotFound);
      return;
    }

    const referralCode = this.referralService.getUserReferralCode(userId);
    const referralCount = this.referralService.getUserReferralCount(userId);
    const stats = this.referralService.getReferralStats();

    if (!referralCode) {
      await ctx.editMessageText('❌ У вас нет реферальной ссылки. Используйте "Создать реферальную ссылку" для создания.', {
        reply_markup: keyboards.referralMenu
      });
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

    await ctx.editMessageText(message, {
      reply_markup: keyboards.referralMenu
    });
  }

  // Показать лидерборд
  async showLeaderboard(ctx: Context): Promise<void> {
    const leaderboard = this.referralService.getLeaderboard(10);
    
    if (leaderboard.length === 0) {
      await ctx.editMessageText('📊 Пока нет данных для лидерборда рефералов', {
        reply_markup: keyboards.getMainMenu(ctx.from?.id || 0)
      });
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

    await ctx.editMessageText(message, {
      reply_markup: keyboards.getMainMenu(ctx.from?.id || 0)
    });
  }

  // Показать общую статистику
  async showStats(ctx: Context): Promise<void> {
    const userId = ctx.from?.id;
    
    if (!userId) {
      await ctx.answerCbQuery(messages.userNotFound);
      return;
    }

    const userData = this.userService.getUser(userId);
    const stats = this.referralService.getReferralStats();
    const referralCount = this.referralService.getUserReferralCount(userId);

    const message = `📊 Статистика бота\n\n` +
      `👤 Ваши данные:\n` +
      `• ID: ${userId}\n` +
      `• Подписка: ${userData?.isSubscribed ? '✅ Активна' : '❌ Неактивна'}\n` +
      `• Рефералы: ${referralCount} человек\n\n` +
      `📈 Общая статистика:\n` +
      `• Всего пользователей: ${this.userService.getUserCount()}\n` +
      `• Подписанных: ${this.userService.getUsersBySubscriptionStatus(true).length}\n` +
      `• Всего приглашено: ${stats.totalReferrals}\n` +
      `• Активных рефереров: ${stats.activeReferrers}`;

    await ctx.editMessageText(message, {
      reply_markup: keyboards.getMainMenu(userId)
    });
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
