import { DataStorageService } from './src/services/DataStorageService';
import { ReferralService } from './src/services/ReferralService';
import { UserService } from './src/services/UserService';

// Тестовый скрипт для проверки системы сохранения данных
async function testStorage() {
  console.log('🧪 Тестирование системы сохранения данных...\n');

  try {
    // Создаем сервисы
    const dataStorage = new DataStorageService();
    const referralService = new ReferralService();
    const userService = new UserService();

    console.log('📊 Информация о файле данных:');
    const fileInfo = dataStorage.getFileInfo();
    console.log(`   Существует: ${fileInfo.exists ? 'Да' : 'Нет'}`);
    console.log(`   Размер: ${fileInfo.size} байт`);
    console.log(`   Последнее изменение: ${new Date(fileInfo.lastModified).toLocaleString()}\n`);

    // Тестируем реферальную систему
    console.log('🔗 Тестирование реферальной системы...');
    
    // Создаем тестовых пользователей
    const testUser1 = { id: 123456789, username: 'testuser1', firstName: 'Тест' };
    const testUser2 = { id: 987654321, username: 'testuser2', firstName: 'Пользователь' };

    // Создаем реферальную ссылку для первого пользователя
    const referralCode = referralService.createReferralLink(
      testUser1.id, 
      testUser1.username, 
      testUser1.firstName
    );
    
    if (referralCode) {
      console.log(`   ✅ Создана реферальная ссылка: ${referralCode}`);
      
      // Обрабатываем реферальный переход
      const success = referralService.processReferral(referralCode, testUser2.id);
      if (success) {
        console.log(`   ✅ Пользователь ${testUser2.id} успешно привязан к рефералу`);
      } else {
        console.log(`   ❌ Не удалось привязать пользователя ${testUser2.id}`);
      }
    } else {
      console.log('   ❌ Не удалось создать реферальную ссылку');
    }

    // Тестируем пользовательский сервис
    console.log('\n👤 Тестирование пользовательского сервиса...');
    
    const userData1 = userService.getOrCreateUser(testUser1.id);
    userData1.isSubscribed = true;
    userService.updateSubscriptionStatus(testUser1.id, true);
    
    const userData2 = userService.getOrCreateUser(testUser2.id);
    userData2.isSubscribed = false;
    userService.updateSubscriptionStatus(testUser2.id, false);

    console.log(`   ✅ Создан пользователь 1: ${userData1.id} (подписка: ${userData1.isSubscribed})`);
    console.log(`   ✅ Создан пользователь 2: ${userData2.id} (подписка: ${userData2.isSubscribed})`);

    // Получаем статистику
    console.log('\n📊 Статистика реферальной системы:');
    const stats = referralService.getReferralStats();
    console.log(`   Общее количество рефералов: ${stats.totalReferrals}`);
    console.log(`   Активных рефереров: ${stats.activeReferrers}`);
    console.log(`   Всего кодов: ${stats.totalCodes}`);

    // Получаем leaderboard
    console.log('\n🏆 Leaderboard:');
    const leaderboard = referralService.getLeaderboard(5);
    leaderboard.forEach((item, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅';
      console.log(`   ${medal} ${item.firstName} (@${item.username || 'без username'}): ${item.referralCount} рефералов`);
    });

    // Принудительно сохраняем данные
    console.log('\n💾 Принудительное сохранение данных...');
    referralService.forceSave();
    userService.forceSave();
    console.log('   ✅ Данные сохранены');

    // Проверяем информацию о файле после сохранения
    console.log('\n📁 Информация о файле после сохранения:');
    const newFileInfo = dataStorage.getFileInfo();
    console.log(`   Существует: ${newFileInfo.exists ? 'Да' : 'Нет'}`);
    console.log(`   Размер: ${newFileInfo.size} байт`);
    console.log(`   Последнее изменение: ${new Date(newFileInfo.lastModified).toLocaleString()}`);

    console.log('\n✅ Тестирование завершено успешно!');
    console.log('📁 Проверьте папку data/ для просмотра сохраненных данных');

  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error);
  }
}

// Запускаем тест
testStorage();
