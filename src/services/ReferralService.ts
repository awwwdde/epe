import { ReferralData, UserData } from '../types';

// Сервис для управления реферальной системой
export class ReferralService {
  private referralStore = new Map<string, ReferralData>();
  private userReferrals = new Map<number, string>(); // userId -> referralCode
  private referredUsers = new Set<number>(); // Пользователи, которые уже были приглашены

  // Генерировать уникальный реферальный код
  private generateReferralCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Создать реферальную ссылку для пользователя
  createReferralLink(userId: number, username: string | undefined, firstName: string): string | null {
    // Проверяем, есть ли уже реферальная ссылка у пользователя
    if (this.userReferrals.has(userId)) {
      return null; // У пользователя уже есть реферальная ссылка
    }

    // Генерируем уникальный код
    let code: string;
    do {
      code = this.generateReferralCode();
    } while (this.referralStore.has(code));

    // Создаем реферальные данные
    const referralData: ReferralData = {
      code,
      userId,
      username,
      firstName,
      referralCount: 0,
      createdAt: Date.now()
    };

    // Сохраняем данные
    this.referralStore.set(code, referralData);
    this.userReferrals.set(userId, code);

    return code;
  }

  // Получить реферальную ссылку пользователя
  getUserReferralCode(userId: number): string | undefined {
    return this.userReferrals.get(userId);
  }

  // Получить данные реферальной ссылки по коду
  getReferralData(code: string): ReferralData | undefined {
    return this.referralStore.get(code);
  }

  // Обработать переход по реферальной ссылке
  processReferral(code: string, newUserId: number): boolean {
    const referralData = this.referralStore.get(code);
    if (!referralData) {
      return false; // Неверный код
    }

    // Проверяем, что новый пользователь не является создателем ссылки
    if (referralData.userId === newUserId) {
      return false; // Пользователь не может пригласить сам себя
    }

    // Проверяем, что пользователь еще не был приглашен кем-то
    if (this.referredUsers.has(newUserId)) {
      return false; // Пользователь уже был приглашен
    }

    // Увеличиваем счетчик рефералов
    referralData.referralCount++;
    this.referralStore.set(code, referralData);

    // Отмечаем пользователя как приглашенного
    this.referredUsers.add(newUserId);

    return true;
  }

  // Получить топ пользователей по количеству рефералов
  getLeaderboard(limit: number = 10): ReferralData[] {
    return Array.from(this.referralStore.values())
      .sort((a, b) => b.referralCount - a.referralCount)
      .slice(0, limit);
  }

  // Получить количество рефералов пользователя
  getUserReferralCount(userId: number): number {
    const code = this.userReferrals.get(userId);
    if (!code) return 0;
    
    const referralData = this.referralStore.get(code);
    return referralData ? referralData.referralCount : 0;
  }

  // Проверить, является ли пользователь рефералом
  isReferredUser(userId: number): boolean {
    return this.referredUsers.has(userId);
  }

  // Получить статистику реферальной системы
  getReferralStats() {
    const totalReferrals = Array.from(this.referralStore.values())
      .reduce((sum, data) => sum + data.referralCount, 0);
    
    const activeReferrers = Array.from(this.referralStore.values())
      .filter(data => data.referralCount > 0).length;

    return {
      totalReferrals,
      activeReferrers,
      totalCodes: this.referralStore.size
    };
  }
}
