import { Telegraf } from 'telegraf';
import { UserService } from './UserService';
import { SubscriptionService } from './SubscriptionService';
import { MessageService } from './MessageService';

// Сервис для мониторинга подписок
export class MonitoringService {
  constructor(
    private bot: Telegraf,
    private userService: UserService,
    private subscriptionService: SubscriptionService,
    private messageService: MessageService
  ) {}

  // Проверить все подписки
  async checkAllSubscriptions(): Promise<void> {
    console.log('🔍 Проверяю подписки всех пользователей...');
    
    for (const [userId, userData] of this.userService.getAllUsers().entries()) {
      try {
        // Проверяем, не заблокировал ли пользователь бота
        const isBlocked = await this.subscriptionService.isUserBlocked(this.bot, userId);
        
        if (isBlocked) {
          console.log(`🚫 Пользователь ${userId} заблокировал бота, удаляю из хранилища`);
          this.userService.removeUser(userId);
          continue;
        }

        // Проверяем текущий статус подписки
        const currentSubscription = await this.subscriptionService.checkSubscription(this.bot as any, userId);
        
        // Если пользователь был подписан, а теперь отписался
        if (userData.isSubscribed && !currentSubscription) {
          console.log(`📉 Пользователь ${userId} отписался от канала`);
          
          // Отправляем сообщение об отписке
          await this.messageService.sendUnsubscribeMessage(this.bot, userId);
          
          // Обновляем статус
          this.userService.updateSubscriptionStatus(userId, false);
        } else if (!userData.isSubscribed && currentSubscription) {
          // Если пользователь подписался
          console.log(`📈 Пользователь ${userId} подписался на канал`);
          this.userService.updateSubscriptionStatus(userId, true);
        }
        
      } catch (error) {
        console.error(`❌ Ошибка при проверке пользователя ${userId}:`, error);
      }
    }
    
    console.log(`✅ Проверка завершена. Активных пользователей: ${this.userService.getUserCount()}`);
  }

  // Запустить периодический мониторинг
  startMonitoring(interval: number): void {
    setInterval(() => {
      this.checkAllSubscriptions();
    }, interval);
    
    console.log(`⏰ Запущен периодический мониторинг подписок каждые ${interval / 60000} минут`);
  }
}
