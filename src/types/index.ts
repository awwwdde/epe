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
  referralCode?: string;
  referredBy?: string;
  referralCount: number;
  joinDate: number;
}

export interface ReferralData {
  code: string;
  userId: number;
  username?: string;
  firstName: string;
  referralCount: number;
  createdAt: number;
}

export interface BotConfig {
  botToken: string;
  channelUsername: string;
  subscriptionCheckInterval: number;
}
