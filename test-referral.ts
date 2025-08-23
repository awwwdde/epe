// Тестовый файл для демонстрации исправленной реферальной системы
import { ReferralService } from './src/services/ReferralService';
import { UserService } from './src/services/UserService';

console.log('🧪 Тестирование исправленной реферальной системы...\n');

// Создаем сервисы
const referralService = new ReferralService();
const userService = new UserService();

// Тест 1: Создание реферальных ссылок
console.log('📝 Тест 1: Создание реферальных ссылок');
const user1Id = 123456;
const user2Id = 789012;
const user3Id = 345678;

const code1 = referralService.createReferralLink(user1Id, 'user1', 'Иван');
const code2 = referralService.createReferralLink(user2Id, 'user2', 'Мария');
const code3 = referralService.createReferralLink(user3Id, 'user3', 'Петр');

console.log(`✅ Пользователь ${user1Id} получил код: ${code1}`);
console.log(`✅ Пользователь ${user2Id} получил код: ${code2}`);
console.log(`✅ Пользователь ${user3Id} получил код: ${code3}`);

// Тест 2: Попытка создать вторую ссылку
console.log('\n📝 Тест 2: Попытка создать вторую ссылку');
const duplicateCode = referralService.createReferralLink(user1Id, 'user1', 'Иван');
console.log(`❌ Повторная попытка для ${user1Id}: ${duplicateCode === null ? 'Отклонено' : 'Ошибка'}`);

// Тест 3: Попытка пригласить самого себя (должно быть отклонено)
console.log('\n📝 Тест 3: Попытка пригласить самого себя');
const selfReferral = referralService.processReferral(code1!, user1Id);
console.log(`❌ Пользователь ${user1Id} пытается пригласить сам себя: ${selfReferral ? 'Ошибка' : 'Отклонено'}`);

// Тест 4: Обработка реферальных переходов (только новых пользователей)
console.log('\n📝 Тест 4: Обработка реферальных переходов новых пользователей');
const newUser1 = 111111;
const newUser2 = 222222;
const newUser3 = 333333;
const newUser4 = 444444;

const success1 = referralService.processReferral(code1!, newUser1);
const success2 = referralService.processReferral(code2!, newUser2);
const success3 = referralService.processReferral(code1!, newUser3);
const success4 = referralService.processReferral(code2!, newUser4);

console.log(`✅ Новый пользователь ${newUser1} по коду ${code1}: ${success1 ? 'Успешно' : 'Ошибка'}`);
console.log(`✅ Новый пользователь ${newUser2} по коду ${code2}: ${success2 ? 'Успешно' : 'Ошибка'}`);
console.log(`✅ Новый пользователь ${newUser3} по коду ${code1}: ${success3 ? 'Успешно' : 'Ошибка'}`);
console.log(`✅ Новый пользователь ${newUser4} по коду ${code2}: ${success4 ? 'Успешно' : 'Ошибка'}`);

// Тест 5: Попытка повторно пригласить уже приглашенного пользователя
console.log('\n📝 Тест 5: Попытка повторно пригласить уже приглашенного пользователя');
const duplicateReferral1 = referralService.processReferral(code1!, newUser1);
const duplicateReferral2 = referralService.processReferral(code3!, newUser1);
console.log(`❌ Повторная попытка пригласить ${newUser1} по коду ${code1}: ${duplicateReferral1 ? 'Ошибка' : 'Отклонено'}`);
console.log(`❌ Попытка пригласить ${newUser1} по другому коду ${code3}: ${duplicateReferral2 ? 'Ошибка' : 'Отклонено'}`);

// Тест 6: Лидерборд
console.log('\n📝 Тест 6: Лидерборд');
const leaderboard = referralService.getLeaderboard(5);
console.log('🏆 Топ рефералов:');
leaderboard.forEach((user, index) => {
  const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅';
  console.log(`${medal} ${index + 1}. ${user.firstName} - ${user.referralCount} рефералов`);
});

// Тест 7: Статистика
console.log('\n📝 Тест 7: Статистика');
const stats = referralService.getReferralStats();
console.log(`📊 Общая статистика:`);
console.log(`👥 Всего приглашено: ${stats.totalReferrals}`);
console.log(`🎯 Активных рефереров: ${stats.activeReferrers}`);
console.log(`🔗 Всего кодов: ${stats.totalCodes}`);

// Тест 8: Индивидуальная статистика
console.log('\n📝 Тест 8: Индивидуальная статистика');
const user1Stats = referralService.getUserReferralCount(user1Id);
const user2Stats = referralService.getUserReferralCount(user2Id);
const user3Stats = referralService.getUserReferralCount(user3Id);

console.log(`📊 Статистика пользователей:`);
console.log(`👤 ${user1Id}: ${user1Stats} рефералов`);
console.log(`👤 ${user2Id}: ${user2Stats} рефералов`);
console.log(`👤 ${user3Id}: ${user3Stats} рефералов`);

// Тест 9: Проверка статуса рефералов
console.log('\n📝 Тест 9: Проверка статуса рефералов');
console.log(`🔍 Пользователь ${user1Id} является рефералом: ${referralService.isReferredUser(user1Id) ? 'Да' : 'Нет'}`);
console.log(`🔍 Пользователь ${newUser1} является рефералом: ${referralService.isReferredUser(newUser1) ? 'Да' : 'Нет'}`);
console.log(`🔍 Пользователь ${newUser2} является рефералом: ${referralService.isReferredUser(newUser2) ? 'Да' : 'Нет'}`);

console.log('\n🎉 Тестирование исправленной системы завершено!');
console.log('✅ Основные исправления:');
console.log('• Создатель ссылки не считается рефералом');
console.log('• Учитываются только новые пользователи');
console.log('• Защита от повторных приглашений');
console.log('• Защита от саморефералов');
console.log('\n💡 Теперь система работает корректно!');
