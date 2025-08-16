import * as dotenv from 'dotenv';
import { BotConfig } from '../types';

// Загружаем переменные окружения
dotenv.config();

// Проверяем наличие обязательных переменных
if (!process.env.BOT_TOKEN) {
  throw new Error('BOT_TOKEN не указан в переменных окружения');
}

if (!process.env.CHANNEL_USERNAME) {
  throw new Error('CHANNEL_USERNAME не указан в переменных окружения');
}

// Конфигурация бота
export const config: BotConfig = {
  botToken: process.env.BOT_TOKEN,
  channelUsername: process.env.CHANNEL_USERNAME.replace('@', ''),
  subscriptionCheckInterval: 5 * 60 * 1000, // 5 минут
};

// Константы
export const SUBSCRIPTION_CHECK_INTERVAL = config.subscriptionCheckInterval;
export const CHANNEL_USERNAME = config.channelUsername;
