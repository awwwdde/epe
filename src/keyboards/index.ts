import { CHANNEL_USERNAME } from '../config';

// Клавиатуры для бота
export const keyboards = {
  // Клавиатура для подписанных пользователей
  subscribed: {
    inline_keyboard: [
      [
        {
          text: '🔄 Проверить подписку снова',
          callback_data: 'check_subscription'
        }
      ],
      [
        {
          text: '📖 Справка',
          callback_data: 'show_help'
        }
      ]
    ]
  },

  // Клавиатура для неподписанных пользователей
  notSubscribed: {
    inline_keyboard: [
      [
        {
          text: '📢 Подписаться на канал',
          url: `https://t.me/${CHANNEL_USERNAME}`
        }
      ],
      [
        {
          text: '✅ Проверить подписку',
          callback_data: 'check_subscription'
        }
      ]
    ]
  },

  // Клавиатура для быстрой подписки
  subscribe: {
    inline_keyboard: [
      [
        {
          text: '📢 Подписаться на канал',
          url: `https://t.me/${CHANNEL_USERNAME}`
        }
      ]
    ]
  },

  // Клавиатура для проверки подписки
  checkSubscription: {
    inline_keyboard: [
      [
        {
          text: '🔄 Проверить снова',
          callback_data: 'check_subscription'
        }
      ]
    ]
  },

  // Клавиатура для справки
  help: {
    inline_keyboard: [
      [
        {
          text: '🔙 Назад',
          callback_data: 'back_to_main'
        }
      ]
    ]
  },

  // Клавиатура для сообщения об отписке
  unsubscribe: {
    inline_keyboard: [
      [
        {
          text: '📢 Подписаться на канал',
          url: `https://t.me/${CHANNEL_USERNAME}`
        }
      ],
      [
        {
          text: '✅ Проверить подписку',
          callback_data: 'check_subscription'
        }
      ]
    ]
  }
};
