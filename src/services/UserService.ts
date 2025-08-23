import { UserData } from '../types';
import { DataStorageService } from './DataStorageService';

// Сервис для управления пользователями
export class UserService {
  private userStore = new Map<number, UserData>();
  private dataStorage: DataStorageService;

  constructor() {
    this.dataStorage = new DataStorageService();
    this.loadUsersFromStorage();
  }

  // Загрузка пользователей из хранилища
  private loadUsersFromStorage(): void {
    try {
      const storedData = this.dataStorage.loadData();
      
      // Восстанавливаем данные пользователей
      this.userStore.clear();
      Object.entries(storedData.users).forEach(([userId, userData]) => {
        this.userStore.set(Number(userId), userData);
      });

      // Убираем лишний лог
      // console.log('✅ Данные пользователей загружены из хранилища');
    } catch (error) {
      console.error('❌ Ошибка при загрузке данных пользователей:', error);
    }
  }

  // Сохранение пользователей в хранилище
  private saveUsersToStorage(): void {
    try {
      const storedData = this.dataStorage.loadData();
      storedData.users = Object.fromEntries(this.userStore);
      this.dataStorage.saveData(storedData);
    } catch (error) {
      console.error('❌ Ошибка при сохранении данных пользователей:', error);
    }
  }

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
      this.saveUsersToStorage();
    }
    
    return userData;
  }

  // Обновить статус подписки пользователя
  updateSubscriptionStatus(userId: number, isSubscribed: boolean): void {
    const userData = this.getOrCreateUser(userId);
    userData.isSubscribed = isSubscribed;
    userData.lastCheck = Date.now();
    this.saveUsersToStorage();
  }

  // Установить реферальную связь
  setReferralLink(userId: number, referralCode: string): void {
    const userData = this.getOrCreateUser(userId);
    userData.referralCode = referralCode;
    this.saveUsersToStorage();
  }

  // Установить, кто пригласил пользователя
  setReferredBy(userId: number, referredBy: string): void {
    const userData = this.getOrCreateUser(userId);
    userData.referredBy = referredBy;
    this.saveUsersToStorage();
  }

  // Удалить пользователя
  removeUser(userId: number): void {
    this.userStore.delete(userId);
    this.saveUsersToStorage();
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

  // Принудительное сохранение данных
  forceSave(): void {
    this.saveUsersToStorage();
  }

  // Получить информацию о файле данных
  getStorageInfo() {
    return this.dataStorage.getFileInfo();
  }
}
