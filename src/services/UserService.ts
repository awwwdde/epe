import { UserData } from '../types';

// Сервис для управления пользователями
export class UserService {
  private userStore = new Map<number, UserData>();

  // Получить данные пользователя
  getUser(userId: number): UserData | undefined {
    return this.userStore.get(userId);
  }

  // Создать или получить данные пользователя
  getOrCreateUser(userId: number): UserData {
    let userData = this.userStore.get(userId);
    
    if (!userData) {
      userData = {
        id: userId,
        isSubscribed: false,
        lastCheck: Date.now(),
        referralCount: 0,
        joinDate: Date.now()
      };
      this.userStore.set(userId, userData);
    }
    
    return userData;
  }

  // Обновить статус подписки пользователя
  updateSubscriptionStatus(userId: number, isSubscribed: boolean): void {
    const userData = this.getOrCreateUser(userId);
    userData.isSubscribed = isSubscribed;
    userData.lastCheck = Date.now();
  }

  // Установить реферальную связь
  setReferralLink(userId: number, referralCode: string): void {
    const userData = this.getOrCreateUser(userId);
    userData.referralCode = referralCode;
  }

  // Установить, кто пригласил пользователя
  setReferredBy(userId: number, referredBy: string): void {
    const userData = this.getOrCreateUser(userId);
    userData.referredBy = referredBy;
  }

  // Удалить пользователя
  removeUser(userId: number): void {
    this.userStore.delete(userId);
  }

  // Получить всех пользователей
  getAllUsers(): Map<number, UserData> {
    return this.userStore;
  }

  // Получить количество пользователей
  getUserCount(): number {
    return this.userStore.size;
  }

  // Получить пользователей по статусу подписки
  getUsersBySubscriptionStatus(isSubscribed: boolean): UserData[] {
    return Array.from(this.userStore.values()).filter(user => user.isSubscribed === isSubscribed);
  }
}
