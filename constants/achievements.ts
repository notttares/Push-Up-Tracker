import { Achievement } from '@/types/workout';

// All achievements are now visible from the start

export const ACHIEVEMENTS: Achievement[] = [
  // Beginner achievements
  {
    id: 'first_pushup',
    title: 'Первые шаги',
    description: 'Выполните первое отжимание',
    icon: '🌱',
    category: 'beginner',
    requirement: {
      type: 'total_reps',
      value: 1,
      timeframe: 'all_time'
    }
  },
  {
    id: 'ten_pushups',
    title: 'Десятка',
    description: 'Выполните 10 отжиманий за один подход',
    icon: '💪',
    category: 'beginner',
    requirement: {
      type: 'single_set',
      value: 10
    }
  },
  {
    id: 'hundred_total',
    title: 'Сотня',
    description: 'Выполните 100 отжиманий всего',
    icon: '💯',
    category: 'beginner',
    requirement: {
      type: 'total_reps',
      value: 100,
      timeframe: 'all_time'
    }
  },
  {
    id: 'three_day_streak',
    title: 'Постоянство',
    description: 'Занимайтесь 3 дня подряд',
    icon: '🔥',
    category: 'beginner',
    requirement: {
      type: 'daily_streak',
      value: 3
    }
  },

  // Intermediate achievements
  {
    id: 'twenty_five_set',
    title: 'Четверть сотни',
    description: 'Выполните 25 отжиманий за один подход',
    icon: '⚡',
    category: 'intermediate',
    requirement: {
      type: 'single_set',
      value: 25
    }
  },
  {
    id: 'five_hundred_total',
    title: 'Пятьсот воин',
    description: 'Выполните 500 отжиманий всего',
    icon: '🏆',
    category: 'intermediate',
    requirement: {
      type: 'total_reps',
      value: 500,
      timeframe: 'all_time'
    }
  },
  {
    id: 'week_streak',
    title: 'Недельный марафон',
    description: 'Занимайтесь 7 дней подряд',
    icon: '📅',
    category: 'intermediate',
    requirement: {
      type: 'daily_streak',
      value: 7
    }
  },
  {
    id: 'hundred_daily',
    title: 'Сотня за день',
    description: 'Выполните 100 отжиманий за один день',
    icon: '🌟',
    category: 'intermediate',
    requirement: {
      type: 'weekly_total',
      value: 100,
      timeframe: 'day'
    }
  },

  // Advanced achievements
  {
    id: 'fifty_set',
    title: 'Полтинник',
    description: 'Выполните 50 отжиманий за один подход',
    icon: '🚀',
    category: 'advanced',
    requirement: {
      type: 'single_set',
      value: 50
    }
  },
  {
    id: 'thousand_total',
    title: 'Тысячник',
    description: 'Выполните 1000 отжиманий всего',
    icon: '👑',
    category: 'advanced',
    requirement: {
      type: 'total_reps',
      value: 1000,
      timeframe: 'all_time'
    }
  },
  {
    id: 'two_week_streak',
    title: 'Двухнедельный воин',
    description: 'Занимайтесь 14 дней подряд',
    icon: '⚔️',
    category: 'advanced',
    requirement: {
      type: 'daily_streak',
      value: 14
    }
  },
  {
    id: 'two_hundred_daily',
    title: 'Двойная сотня',
    description: 'Выполните 200 отжиманий за один день',
    icon: '💥',
    category: 'advanced',
    requirement: {
      type: 'weekly_total',
      value: 200,
      timeframe: 'day'
    }
  },

  // Expert achievements
  {
    id: 'seventy_five_set',
    title: 'Мастер силы',
    description: 'Выполните 75 отжиманий за один подход',
    icon: '🦾',
    category: 'expert',
    requirement: {
      type: 'single_set',
      value: 75
    }
  },
  {
    id: 'five_thousand_total',
    title: 'Пятитысячник',
    description: 'Выполните 5000 отжиманий всего',
    icon: '🏅',
    category: 'expert',
    requirement: {
      type: 'total_reps',
      value: 5000,
      timeframe: 'all_time'
    }
  },
  {
    id: 'month_streak',
    title: 'Месячный чемпион',
    description: 'Занимайтесь 30 дней подряд',
    icon: '🎯',
    category: 'expert',
    requirement: {
      type: 'daily_streak',
      value: 30
    }
  },
  {
    id: 'thousand_weekly',
    title: 'Тысяча за неделю',
    description: 'Выполните 1000 отжиманий за неделю',
    icon: '🌪️',
    category: 'expert',
    requirement: {
      type: 'weekly_total',
      value: 1000,
      timeframe: 'week'
    }
  },

  // Legendary achievements
  {
    id: 'hundred_set',
    title: 'Легенда',
    description: 'Выполните 100 отжиманий за один подход',
    icon: '🔱',
    category: 'legendary',
    requirement: {
      type: 'single_set',
      value: 100
    }
  },
  {
    id: 'ten_thousand_total',
    title: 'Десятитысячник',
    description: 'Выполните 10000 отжиманий всего',
    icon: '💎',
    category: 'legendary',
    requirement: {
      type: 'total_reps',
      value: 10000,
      timeframe: 'all_time'
    }
  },
  {
    id: 'hundred_day_streak',
    title: 'Столетний воин',
    description: 'Занимайтесь 100 дней подряд',
    icon: '🏛️',
    category: 'legendary',
    requirement: {
      type: 'daily_streak',
      value: 100
    }
  },
  {
    id: 'five_hundred_daily',
    title: 'Невозможное возможно',
    description: 'Выполните 500 отжиманий за один день',
    icon: '🌌',
    category: 'legendary',
    requirement: {
      type: 'weekly_total',
      value: 500,
      timeframe: 'day'
    }
  },
  {
    id: 'year_streak',
    title: 'Годовой титан',
    description: 'Занимайтесь 365 дней подряд',
    icon: '🌟',
    category: 'legendary',
    requirement: {
      type: 'daily_streak',
      value: 365
    }
  },

  // Additional achievements to reach 35 total
  {
    id: 'five_sets_day',
    title: 'Пятикратный',
    description: 'Выполните 5 подходов за один день',
    icon: '✋',
    category: 'beginner',
    requirement: {
      type: 'daily_sets',
      value: 5
    }
  },
  {
    id: 'fifteen_set',
    title: 'Пятнашка',
    description: 'Выполните 15 отжиманий за один подход',
    icon: '🎯',
    category: 'beginner',
    requirement: {
      type: 'single_set',
      value: 15
    }
  },
  {
    id: 'fifty_daily',
    title: 'Полсотни за день',
    description: 'Выполните 50 отжиманий за один день',
    icon: '🔥',
    category: 'intermediate',
    requirement: {
      type: 'weekly_total',
      value: 50,
      timeframe: 'day'
    }
  },
  {
    id: 'ten_sets_day',
    title: 'Десятикратный',
    description: 'Выполните 10 подходов за один день',
    icon: '🔟',
    category: 'intermediate',
    requirement: {
      type: 'daily_sets',
      value: 10
    }
  },
  {
    id: 'thirty_five_set',
    title: 'Тридцать пять',
    description: 'Выполните 35 отжиманий за один подход',
    icon: '⚡',
    category: 'intermediate',
    requirement: {
      type: 'single_set',
      value: 35
    }
  },
  {
    id: 'three_hundred_daily',
    title: 'Тройная сотня',
    description: 'Выполните 300 отжиманий за один день',
    icon: '🌪️',
    category: 'advanced',
    requirement: {
      type: 'weekly_total',
      value: 300,
      timeframe: 'day'
    }
  },
  {
    id: 'fifteen_sets_day',
    title: 'Пятнадцатикратный',
    description: 'Выполните 15 подходов за один день',
    icon: '🎪',
    category: 'advanced',
    requirement: {
      type: 'daily_sets',
      value: 15
    }
  },
  {
    id: 'sixty_set',
    title: 'Шестьдесят силы',
    description: 'Выполните 60 отжиманий за один подход',
    icon: '💪',
    category: 'advanced',
    requirement: {
      type: 'single_set',
      value: 60
    }
  },
  {
    id: 'two_thousand_total',
    title: 'Двухтысячник',
    description: 'Выполните 2000 отжиманий всего',
    icon: '🏆',
    category: 'advanced',
    requirement: {
      type: 'total_reps',
      value: 2000,
      timeframe: 'all_time'
    }
  },
  {
    id: 'eighty_set',
    title: 'Восьмидесятка',
    description: 'Выполните 80 отжиманий за один подход',
    icon: '🚀',
    category: 'expert',
    requirement: {
      type: 'single_set',
      value: 80
    }
  },
  {
    id: 'twenty_sets_day',
    title: 'Двадцатикратный',
    description: 'Выполните 20 подходов за один день',
    icon: '🎭',
    category: 'expert',
    requirement: {
      type: 'daily_sets',
      value: 20
    }
  },
  {
    id: 'seven_thousand_total',
    title: 'Семитысячник',
    description: 'Выполните 7000 отжиманий всего',
    icon: '💎',
    category: 'expert',
    requirement: {
      type: 'total_reps',
      value: 7000,
      timeframe: 'all_time'
    }
  },
  {
    id: 'hundred_twenty_set',
    title: 'Сверхчеловек',
    description: 'Выполните 120 отжиманий за один подход',
    icon: '🦸',
    category: 'legendary',
    requirement: {
      type: 'single_set',
      value: 120
    }
  },
  {
    id: 'twenty_thousand_total',
    title: 'Двадцатитысячник',
    description: 'Выполните 20000 отжиманий всего',
    icon: '🌌',
    category: 'legendary',
    requirement: {
      type: 'total_reps',
      value: 20000,
      timeframe: 'all_time'
    }
  }
];

export const getCategoryColor = (category: Achievement['category']): string => {
  const colors = {
    beginner: '#4CAF50',
    intermediate: '#2196F3',
    advanced: '#FF6B35',
    expert: '#9C27B0',
    legendary: '#FFD700',
  };
  return colors[category];
};

export const getCategoryTitle = (category: Achievement['category']): string => {
  const titles = {
    beginner: 'Новичок',
    intermediate: 'Средний',
    advanced: 'Продвинутый',
    expert: 'Эксперт',
    legendary: 'Легенда',
  };
  return titles[category];
};