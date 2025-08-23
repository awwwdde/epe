import { CHANNEL_USERNAME } from '../config';

// Клавиатуры для бота
export const keyboards = {
  // Главное меню для подписанных пользователей
  getMainMenu: (userId: number) => ({
    inline_keyboard: [
      [
        {
          text: '🔗 Реферальная система',
          callback_data: 'referral_menu'
        }
      ],
      [
        {
          text: '📊 Статистика',
          callback_data: 'show_stats'
        },
        {
          text: '🏆 Лидерборд',
          callback_data: 'show_leaderboard'
        }
      ],
      [
        {
          text: '🔄 Проверить подписку',
          callback_data: 'check_subscription'
        },
        {
          text: '📖 Справка',
          callback_data: 'show_help'
        }
      ]
    ]
  }),

  // Меню реферальной системы
  referralMenu: {
    inline_keyboard: [
      [
        {
          text: '🔗 Создать реферальную ссылку',
          callback_data: 'create_referral'
        }
      ],
      [
        {
          text: '📊 Моя статистика',
          callback_data: 'my_referral_stats'
        },
        {
          text: '🏆 Топ рефералов',
          callback_data: 'show_leaderboard'
        }
      ],
      [
        {
          text: '🔙 Назад в главное меню',
          callback_data: 'back_to_main'
        }
      ]
    ]
  },

  // Клавиатура для подписанных пользователей (устаревшая, заменена на getMainMenu)
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

  // Клавиатура для проверки подписки с полным меню
  checkSubscription: {
    inline_keyboard: [
      [
        {
          text: '🔗 Реферальная система',
          callback_data: 'referral_menu'
        }
      ],
      [
        {
          text: '📊 Статистика',
          callback_data: 'show_stats'
        },
        {
          text: '🏆 Лидерборд',
          callback_data: 'show_leaderboard'
        }
      ],
      [
        {
          text: '🔄 Проверить снова',
          callback_data: 'check_subscription'
        },
        {
          text: '📖 Справка',
          callback_data: 'show_help'
        }
      ]
    ]
  },

  // Клавиатура для справки
  help: {
    inline_keyboard: [
      [
        {
          text: '🔗 Реферальная система',
          callback_data: 'referral_menu'
        }
      ],
      [
        {
          text: '📊 Статистика',
          callback_data: 'show_stats'
        },
        {
          text: '🏆 Лидерборд',
          callback_data: 'show_leaderboard'
        }
      ],
      [
        {
          text: '🔙 Назад в главное меню',
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
