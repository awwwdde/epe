// Типы и интерфейсы для Telegram бота

export interface User {
  id: number;
  username?: string;
  first_name: string;
  last_name?: string;
}

export interface UserData {
  id: number;
  isSubscribed: boolean;
  lastCheck: number;
}

export interface BotConfig {
  botToken: string;
  channelUsername: string;
  subscriptionCheckInterval: number;
}
