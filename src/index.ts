import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';

// Импорты конфигурации
import { config, SUBSCRIPTION_CHECK_INTERVAL, CHANNEL_USERNAME } from './config';

// Импорты сервисов
import { UserService } from './services/UserService';
import { SubscriptionService } from './services/SubscriptionService';
import { MessageService } from './services/MessageService';
import { MonitoringService } from './services/MonitoringService';
import { ReferralService } from './services/ReferralService';

// Импорты обработчиков
import { StartHandler } from './handlers/startHandler';
import { HelpHandler } from './handlers/helpHandler';
import { SubscribeHandler } from './handlers/subscribeHandler';
import { CheckHandler } from './handlers/checkHandler';
import { CallbackHandlers } from './handlers/callbackHandlers';
import { ReferralHandler } from './handlers/referralHandler';

// Импорты сообщений
import { messages } from './messages';

// Создаем экземпляр бота
const bot = new Telegraf(config.botToken);

// Инициализируем сервисы
const userService = new UserService();
const subscriptionService = new SubscriptionService();
const messageService = new MessageService();
const referralService = new ReferralService();
const monitoringService = new MonitoringService(bot, userService, subscriptionService, messageService);

// Инициализируем обработчики
const startHandler = new StartHandler(userService, subscriptionService, referralService);
const helpHandler = new HelpHandler();
const subscribeHandler = new SubscribeHandler();
const checkHandler = new CheckHandler(userService, subscriptionService);
const callbackHandlers = new CallbackHandlers(userService, subscriptionService, referralService);
const referralHandler = new ReferralHandler(referralService, userService);

// Регистрируем обработчики команд
bot.start(async (ctx) => {
  await startHandler.handle(ctx);
});

bot.help(async (ctx) => {
  await helpHandler.handle(ctx);
});

bot.command('subscribe', async (ctx) => {
  await subscribeHandler.handle(ctx);
});

bot.command('check', async (ctx) => {
  await checkHandler.handle(ctx);
});

// Реферальные команды
bot.command('referral', async (ctx) => {
  await referralHandler.handle(ctx);
});

bot.command('leaderboard', async (ctx) => {
  await referralHandler.handleLeaderboard(ctx);
});

bot.command('mystats', async (ctx) => {
  await referralHandler.handleMyStats(ctx);
});

// Регистрируем обработчики callback запросов
bot.action('show_help', async (ctx) => {
  await callbackHandlers.showHelp(ctx);
});

bot.action('back_to_main', async (ctx) => {
  await callbackHandlers.backToMain(ctx);
});

bot.action('check_subscription', async (ctx) => {
  await callbackHandlers.checkSubscription(ctx);
});

// Новые callback обработчики для реферальной системы
bot.action('referral_menu', async (ctx) => {
  await callbackHandlers.showReferralMenu(ctx);
});

bot.action('create_referral', async (ctx) => {
  await callbackHandlers.createReferral(ctx);
});

bot.action('my_referral_stats', async (ctx) => {
  await callbackHandlers.showMyReferralStats(ctx);
});

bot.action('show_leaderboard', async (ctx) => {
  await callbackHandlers.showLeaderboard(ctx);
});

bot.action('show_stats', async (ctx) => {
  await callbackHandlers.showStats(ctx);
});

// Обработчик неизвестных команд
bot.on(message('text'), async (ctx) => {
  await ctx.reply(messages.unknownCommand);
});

// Обработчик ошибок
bot.catch((err, ctx) => {
  console.error('Ошибка бота:', err);
  ctx.reply(messages.error);
});

// Функция запуска бота
async function startBot() {
  try {
    console.log('🚀 Запуск Telegram бота...');
    console.log(`📢 Канал для проверки: @${CHANNEL_USERNAME}`);
    
    // Запускаем бота
    await bot.launch();
    
    console.log('✅ Бот успешно запущен!');
    console.log('📱 Используйте Ctrl+C для остановки');
    
    // Запускаем периодический мониторинг подписок
    monitoringService.startMonitoring(SUBSCRIPTION_CHECK_INTERVAL);
    
    // Обработка graceful shutdown
    process.once('SIGINT', () => {
      console.log('\n🛑 Получен сигнал SIGINT, останавливаю бота...');
      bot.stop('SIGINT');
    });
    
    process.once('SIGTERM', () => {
      console.log('\n🛑 Получен сигнал SIGTERM, останавливаю бота...');
      bot.stop('SIGTERM');
    });
    
  } catch (error) {
    console.error('❌ Ошибка при запуске бота:', error);
    process.exit(1);
  }
}

// Запускаем бота
startBot();
