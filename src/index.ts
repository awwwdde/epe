import { Telegraf, Context } from 'telegraf';
import * as dotenv from 'dotenv';

dotenv.config();

const token = process.env.BOT_TOKEN;
const channelUsername = process.env.CHANNEL_USERNAME || '@your_channel_username';
const webhookUrl = process.env.WEBHOOK_URL;
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

if (!token) {
  throw new Error('BOT_TOKEN должен быть указан в переменных окружения');
}

if (!process.env.CHANNEL_USERNAME) {
  console.warn('CHANNEL_USERNAME не указан, используется значение по умолчанию');
}

const bot = new Telegraf(token);

// Интерфейс для пользовательских данных
interface UserData {
  subscribed: boolean;
  lastCheck: number;
  chatId?: number;
  username?: string;
}

// Хранилище данных пользователей (в продакшне лучше использовать базу данных)
const userData = new Map<number, UserData>();

// Функция проверки подписки пользователя на канал
async function checkSubscription(ctx: Context): Promise<boolean> {
  try {
    const userId = ctx.from?.id;
    if (!userId) return false;

    // Получаем информацию о пользователе в канале
    const chatMember = await ctx.telegram.getChatMember(channelUsername, userId);
    
    // Проверяем статус подписки
    return ['creator', 'administrator', 'member'].includes(chatMember.status);
  } catch (error) {
    console.error('Ошибка при проверке подписки:', error);
    return false;
  }
}

// Функция проверки подписки по userId
async function checkSubscriptionById(userId: number): Promise<boolean> {
  try {
    // Получаем информацию о пользователе в канале
    const chatMember = await bot.telegram.getChatMember(channelUsername, userId);
    
    // Проверяем статус подписки
    return ['creator', 'administrator', 'member'].includes(chatMember.status);
  } catch (error) {
    console.error('Ошибка при проверке подписки по ID:', error);
    return false;
  }
}

// Функция обновления данных пользователя
function updateUserData(userId: number, subscribed: boolean, chatId?: number, username?: string): void {
  const existingData = userData.get(userId);
  userData.set(userId, {
    subscribed,
    lastCheck: Date.now(),
    chatId: chatId || existingData?.chatId,
    username: username || existingData?.username
  });
}

// Функция отправки уведомления об отписке
async function sendUnsubscribeNotification(userId: number): Promise<void> {
  try {
    const userInfo = userData.get(userId);
    if (!userInfo?.chatId) return;

    await bot.telegram.sendMessage(
      userInfo.chatId,
      '❌ <b>Внимание! Вы отписались от канала!</b>\n\n' +
      'Для продолжения работы с ботом необходимо снова подписаться на канал:\n\n' +
      `🔗 <a href="https://t.me/${channelUsername.replace('@', '')}">${channelUsername}</a>\n\n` +
      'После подписки нажмите кнопку "✅ Проверить подписку"',
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🔗 Перейти на канал',
                url: `https://t.me/${channelUsername.replace('@', '')}`
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
      }
    );
    
    console.log(`📤 Отправлено уведомление об отписке пользователю ${userId}`);
  } catch (error) {
    console.error(`❌ Ошибка при отправке уведомления об отписке пользователю ${userId}:`, error);
  }
}

// Функция мониторинга подписок (проверяет всех пользователей)
async function monitorSubscriptions(): Promise<void> {
  console.log('🔍 Запуск мониторинга подписок...');
  
  for (const [userId, data] of userData.entries()) {
    try {
      const currentStatus = await checkSubscriptionById(userId);
      const previousStatus = data.subscribed;
      
      // Если статус изменился с подписан на не подписан
      if (previousStatus && !currentStatus) {
        console.log(`📉 Пользователь ${userId} отписался от канала`);
        await sendUnsubscribeNotification(userId);
      }
      
      // Обновляем статус
      updateUserData(userId, currentStatus, data.chatId, data.username);
      
    } catch (error) {
      console.error(`❌ Ошибка при мониторинге пользователя ${userId}:`, error);
    }
  }
  
  console.log('✅ Мониторинг подписок завершен');
}

// Обработчик команды /start
bot.start(async (ctx) => {
  const userId = ctx.from?.id;
  const chatId = ctx.chat?.id;
  const username = ctx.from?.username;
  
  if (!userId) return;

  // Проверяем текущую подписку
  const isSubscribed = await checkSubscription(ctx);
  updateUserData(userId, isSubscribed, chatId, username);

  if (isSubscribed) {
    // Пользователь уже подписан
    ctx.reply(
      '🎉 Добро пожаловать! Вы уже подписаны на наш канал!\n\n' +
      'Используйте /help для получения справки.',
      { parse_mode: 'HTML' }
    );
  } else {
    // Пользователь не подписан
    ctx.reply(
      '👋 Добро пожаловать!\n\n' +
      '📢 Для продолжения работы с ботом необходимо подписаться на наш канал:\n\n' +
      `🔗 <a href="https://t.me/${channelUsername.replace('@', '')}">${channelUsername}</a>\n\n` +
      'После подписки нажмите кнопку "✅ Проверить подписку"',
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🔗 Перейти на канал',
                url: `https://t.me/${channelUsername.replace('@', '')}`
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
      }
    );
  }
});

// Обработчик кнопки "Проверить подписку"
bot.action('check_subscription', async (ctx) => {
  const userId = ctx.from?.id;
  const chatId = ctx.chat?.id;
  const username = ctx.from?.username;
  
  if (!userId) return;

  // Проверяем подписку
  const isSubscribed = await checkSubscription(ctx);
  const previousStatus = userData.get(userId)?.subscribed || false;
  
  updateUserData(userId, isSubscribed, chatId, username);

  if (isSubscribed) {
    if (!previousStatus) {
 
      ctx.editMessageText(
        '🎉 Отлично! Вы успешно подписались на канал!\n\n' +
        'Теперь вы можете использовать все возможности бота.\n\n' +
        'Используйте /help для получения справки.',
        { parse_mode: 'HTML' }
      );
    } else {

      ctx.editMessageText(
        '✅ Вы уже подписаны на канал!\n\n' +
        'Используйте /help для получения справки.',
        { parse_mode: 'HTML' }
      );
    }
  } else {
    if (previousStatus) {
      ctx.editMessageText(
        '❌ Вы отписались от канала!\n\n' +
        'Для продолжения работы необходимо снова подписаться на канал:\n\n' +
        `🔗 <a href="https://t.me/${channelUsername.replace('@', '')}">${channelUsername}</a>\n\n` +
        'После подписки нажмите кнопку "✅ Проверить подписку"',
        {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '🔗 Перейти на канал',
                  url: `https://t.me/${channelUsername.replace('@', '')}`
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
        }
      );
    } else {

      ctx.editMessageText(
        '❌ Условия не соблюдены!\n\n' +
        'Вы не подписаны на канал. Для продолжения работы необходимо подписаться:\n\n' +
        `🔗 <a href="https://t.me/${channelUsername.replace('@', '')}">${channelUsername}</a>\n\n` +
        'После подписки нажмите кнопку "✅ Проверить подписку"',
        {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '🔗 Перейти на канал',
                  url: `https://t.me/${channelUsername.replace('@', '')}`
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
        }
      );
    }
  }
});

bot.help((ctx) => {
  ctx.reply(
    '📚 <b>Справка по боту</b>\n\n' +
    '🔹 <b>Доступные команды:</b>\n' +
    '/start - Начать работу с ботом\n' +
    '/help - Показать эту справку\n' +
    '/check - Проверить статус подписки\n\n' +
    '🔹 <b>Как использовать:</b>\n' +
    '1. Нажмите /start\n' +
    '2. Подпишитесь на канал\n' +
    '3. Нажмите "Проверить подписку"\n' +
    '4. Готово!\n\n' +
    '⚠️ <b>Важно:</b> Бот автоматически отслеживает отписки от канала',
    { parse_mode: 'HTML' }
  );
});

bot.command('check', async (ctx) => {
  const userId = ctx.from?.id;
  const chatId = ctx.chat?.id;
  const username = ctx.from?.username;
  
  if (!userId) return;

  const isSubscribed = await checkSubscription(ctx);
  updateUserData(userId, isSubscribed, chatId, username);

  if (isSubscribed) {
    ctx.reply(
      '✅ Статус: <b>Подписан на канал</b>\n\n' +
      'Вы можете использовать все возможности бота!',
      { parse_mode: 'HTML' }
    );
  } else {
    ctx.reply(
      '❌ Статус: <b>Не подписан на канал</b>\n\n' +
      'Для продолжения работы необходимо подписаться на канал:\n\n' +
      `🔗 <a href="https://t.me/${channelUsername.replace('@', '')}">${channelUsername}</a>`,
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🔗 Перейти на канал',
                url: `https://t.me/${channelUsername.replace('@', '')}`
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
      }
    );
  }
});

bot.on('text', (ctx) => {
  ctx.reply(
    'Используйте /start для начала работы или /help для справки.'
  );
});

if (webhookUrl) {
  console.log('🚀 Запуск бота в режиме webhook...');
  
  bot.telegram.setWebhook(webhookUrl);
  const express = require('express');
  const app = express();
  
  app.use(express.json());
  
  app.post('/webhook', (req: any, res: any) => {
    bot.handleUpdate(req.body);
    res.sendStatus(200);
  });
  
  app.listen(port, () => {
    console.log(`🌐 Webhook сервер запущен на порту ${port}`);
    console.log(`📡 Webhook URL: ${webhookUrl}`);
  });
  setInterval(monitorSubscriptions, 5 * 60 * 1000);
  
} else {
  console.log('🚀 Запуск бота в режиме long polling...');
  
  bot.launch()
    .then(() => {
      console.log('🤖 Бот успешно запущен!');
      console.log(`📢 Канал для проверки: ${channelUsername}`);
      setInterval(monitorSubscriptions, 5 * 60 * 1000);
    })
    .catch((error) => {
      console.error('❌ Ошибка при запуске бота:', error);
    });
}

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM')); 