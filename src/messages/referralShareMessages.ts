// Реферальное сообщение для поделиться

export const referralShareMessages = {
  getShareMessage: (referralLink: string, username?: string, firstName: string = 'Пользователь') => {
    const userMention = username ? `@${username}` : firstName;
    return `🎉 Присоединяйся к крутому Telegram боту!

🚀 ${userMention} приглашает тебя в удивительный мир возможностей!

✨ Что тебя ждет:
🔗 Реферальная система с призами
📊 Интересная статистика
🏆 Соревнования в лидерборде
🎯 Эксклюзивные функции

💎 Это твой шанс стать частью активного сообщества!

👆 Переходи по ссылке и начинай прямо сейчас:
${referralLink}`;
  }
};