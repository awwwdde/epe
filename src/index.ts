import { Telegraf } from 'telegraf';
import * as dotenv from 'dotenv';

dotenv.config();

const token = process.env.BOT_TOKEN;
if (!token) {
  throw new Error('BOT_TOKEN должен быть указан в переменных окружения');
}
const bot = new Telegraf(token);

bot.start((ctx) => {
  ctx.reply('Привет! Я ваш новый Telegram бот! 👋\n\nДобро пожаловать в мир автоматизации! 🚀');
});

bot.help((ctx) => {
  ctx.reply('Доступные команды:\n/start - Начать работу с ботом\n/help - Показать справку');
});

bot.on('text', (ctx) => {
  ctx.reply('Используйте /start для начала работы или /help для справки.');
});

bot.launch()
  .then(() => {
    console.log('Бот успешно запущен! 🎉');
  })
  .catch((error) => {
    console.error('Ошибка при запуске бота:', error);
  });

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM')); 