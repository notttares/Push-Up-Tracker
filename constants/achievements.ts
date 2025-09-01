import { Achievement } from '@/types/workout';

// Реалистичные достижения (до ~1 года), видимые с начала
export const ACHIEVEMENTS: Achievement[] = [
  // Старт
  {
    id: 'first_pushup',
    title: 'Первые шаги',
    description: 'Выполните первое отжимание',
    icon: '🌱',
    category: 'beginner',
    requirement: { type: 'total_reps', value: 1, timeframe: 'all_time' }
  },
  {
    id: 'ten_pushups',
    title: 'Десятка',
    description: 'Выполните 10 отжиманий за один подход',
    icon: '💪',
    category: 'beginner',
    requirement: { type: 'single_set', value: 10 }
  },
  {
    id: 'fifteen_set',
    title: 'Пятнашка',
    description: 'Выполните 15 отжиманий за один подход',
    icon: '🎯',
    category: 'beginner',
    requirement: { type: 'single_set', value: 15 }
  },
  {
    id: 'twenty_set',
    title: 'Двадцатка',
    description: 'Выполните 20 отжиманий за один подход',
    icon: '🔥',
    category: 'beginner',
    requirement: { type: 'single_set', value: 20 }
  },
  {
    id: 'twenty_five_set',
    title: 'Четверть сотни',
    description: 'Выполните 25 отжиманий за один подход',
    icon: '⚡',
    category: 'beginner',
    requirement: { type: 'single_set', value: 25 }
  },
  {
    id: 'thirty_set',
    title: 'Тридцатка',
    description: 'Выполните 30 отжиманий за один подход',
    icon: '🏅',
    category: 'intermediate',
    requirement: { type: 'single_set', value: 30 }
  },
  {
    id: 'thirty_five_set',
    title: 'Тридцать пять',
    description: 'Выполните 35 отжиманий за один подход',
    icon: '⚡',
    category: 'intermediate',
    requirement: { type: 'single_set', value: 35 }
  },
  {
    id: 'forty_set',
    title: 'Сороковник',
    description: 'Выполните 40 отжиманий за один подход',
    icon: '🚀',
    category: 'intermediate',
    requirement: { type: 'single_set', value: 40 }
  },
  {
    id: 'fifty_set',
    title: 'Полтинник',
    description: 'Выполните 50 отжиманий за один подход',
    icon: '🔵',
    category: 'advanced',
    requirement: { type: 'single_set', value: 50 }
  },
  {
    id: 'sixty_set',
    title: 'Шестьдесят',
    description: 'Выполните 60 отжиманий за один подход',
    icon: '💪',
    category: 'advanced',
    requirement: { type: 'single_set', value: 60 }
  },
  {
    id: 'seventy_set',
    title: 'Семьдесят',
    description: 'Выполните 70 отжиманий за один подход',
    icon: '🦾',
    category: 'expert',
    requirement: { type: 'single_set', value: 70 }
  },

  // Общий объём (за всё время)
  {
    id: 'hundred_total',
    title: 'Сотня',
    description: 'Выполните 100 отжиманий всего',
    icon: '💯',
    category: 'beginner',
    requirement: { type: 'total_reps', value: 100, timeframe: 'all_time' }
  },
  {
    id: 'five_hundred_total',
    title: 'Пятьсот',
    description: 'Выполните 500 отжиманий всего',
    icon: '🥉',
    category: 'beginner',
    requirement: { type: 'total_reps', value: 500, timeframe: 'all_time' }
  },
  {
    id: 'thousand_total',
    title: 'Тысяча',
    description: 'Выполните 1000 отжиманий всего',
    icon: '🥈',
    category: 'intermediate',
    requirement: { type: 'total_reps', value: 1000, timeframe: 'all_time' }
  },
  {
    id: 'two_thousand_total',
    title: 'Две тысячи',
    description: 'Выполните 2000 отжиманий всего',
    icon: '🥇',
    category: 'intermediate',
    requirement: { type: 'total_reps', value: 2000, timeframe: 'all_time' }
  },
  {
    id: 'five_thousand_total',
    title: 'Пять тысяч',
    description: 'Выполните 5000 отжиманий всего',
    icon: '🏆',
    category: 'advanced',
    requirement: { type: 'total_reps', value: 5000, timeframe: 'all_time' }
  },
  {
    id: 'ten_thousand_total',
    title: 'Десять тысяч',
    description: 'Выполните 10000 отжиманий всего',
    icon: '💎',
    category: 'advanced',
    requirement: { type: 'total_reps', value: 10000, timeframe: 'all_time' }
  },
  {
    id: 'fifteen_thousand_total',
    title: 'Пятнадцать тысяч',
    description: 'Выполните 15000 отжиманий всего',
    icon: '🌟',
    category: 'expert',
    requirement: { type: 'total_reps', value: 15000, timeframe: 'all_time' }
  },
  {
    id: 'twenty_thousand_total',
    title: 'Двадцать тысяч',
    description: 'Выполните 20000 отжиманий всего',
    icon: '🔥',
    category: 'expert',
    requirement: { type: 'total_reps', value: 20000, timeframe: 'all_time' }
  },
  {
    id: 'thirty_thousand_total',
    title: 'Тридцать тысяч',
    description: 'Выполните 30000 отжиманий всего',
    icon: '🏅',
    category: 'legendary',
    requirement: { type: 'total_reps', value: 30000, timeframe: 'all_time' }
  },

  // За день (сумма повторений за день)
  {
    id: 'fifty_daily',
    title: 'Полсотни за день',
    description: 'Выполните 50 отжиманий за один день',
    icon: '🌞',
    category: 'beginner',
    requirement: { type: 'weekly_total', value: 50, timeframe: 'day' }
  },
  {
    id: 'hundred_daily',
    title: 'Сотня за день',
    description: 'Выполните 100 отжиманий за один день',
    icon: '✨',
    category: 'intermediate',
    requirement: { type: 'weekly_total', value: 100, timeframe: 'day' }
  },
  {
    id: 'one_fifty_daily',
    title: 'Полтораста за день',
    description: 'Выполните 150 отжиманий за один день',
    icon: '⚡',
    category: 'advanced',
    requirement: { type: 'weekly_total', value: 150, timeframe: 'day' }
  },
  {
    id: 'two_hundred_daily',
    title: 'Две сотни за день',
    description: 'Выполните 200 отжиманий за один день',
    icon: '🔥',
    category: 'advanced',
    requirement: { type: 'weekly_total', value: 200, timeframe: 'day' }
  },

  // За неделю (сумма повторений за неделю)
  {
    id: 'five_hundred_week',
    title: '500 за неделю',
    description: 'Выполните 500 отжиманий за неделю',
    icon: '📅',
    category: 'intermediate',
    requirement: { type: 'weekly_total', value: 500, timeframe: 'week' }
  },
  {
    id: 'seven_hundred_week',
    title: '700 за неделю',
    description: 'Выполните 700 отжиманий за неделю',
    icon: '📆',
    category: 'advanced',
    requirement: { type: 'weekly_total', value: 700, timeframe: 'week' }
  },
  {
    id: 'thousand_week',
    title: '1000 за неделю',
    description: 'Выполните 1000 отжиманий за неделю',
    icon: '🏁',
    category: 'expert',
    requirement: { type: 'weekly_total', value: 1000, timeframe: 'week' }
  },

  // Серии (подряд дней)
  {
    id: 'three_day_streak',
    title: 'Постоянство',
    description: 'Занимайтесь 3 дня подряд',
    icon: '🔥',
    category: 'beginner',
    requirement: { type: 'daily_streak', value: 3 }
  },
  {
    id: 'week_streak',
    title: 'Недельный марафон',
    description: 'Занимайтесь 7 дней подряд',
    icon: '📅',
    category: 'intermediate',
    requirement: { type: 'daily_streak', value: 7 }
  },
  {
    id: 'two_week_streak',
    title: 'Двухнедельный воин',
    description: 'Занимайтесь 14 дней подряд',
    icon: '⚔️',
    category: 'intermediate',
    requirement: { type: 'daily_streak', value: 14 }
  },
  {
    id: 'month_streak',
    title: 'Месячный чемпион',
    description: 'Занимайтесь 30 дней подряд',
    icon: '🎯',
    category: 'advanced',
    requirement: { type: 'daily_streak', value: 30 }
  },
  {
    id: 'sixty_day_streak',
    title: '60 дней без перерыва',
    description: 'Занимайтесь 60 дней подряд',
    icon: '🏋️',
    category: 'advanced',
    requirement: { type: 'daily_streak', value: 60 }
  },
  {
    id: 'ninety_day_streak',
    title: '90 дней прогресса',
    description: 'Занимайтесь 90 дней подряд',
    icon: '🥇',
    category: 'expert',
    requirement: { type: 'daily_streak', value: 90 }
  },
  {
    id: 'half_year_streak',
    title: 'Полгода в строю',
    description: 'Занимайтесь 180 дней подряд',
    icon: '🛡️',
    category: 'expert',
    requirement: { type: 'daily_streak', value: 180 }
  },
  {
    id: 'year_streak',
    title: 'Годовой титан',
    description: 'Занимайтесь 365 дней подряд',
    icon: '🌟',
    category: 'legendary',
    requirement: { type: 'daily_streak', value: 365 }
  },

  // Подходы за день
  {
    id: 'five_sets_day',
    title: 'Пятикратный',
    description: 'Выполните 5 подходов за один день',
    icon: '✋',
    category: 'beginner',
    requirement: { type: 'daily_sets', value: 5 }
  },
  {
    id: 'ten_sets_day',
    title: 'Десятикратный',
    description: 'Выполните 10 подходов за один день',
    icon: '🔟',
    category: 'intermediate',
    requirement: { type: 'daily_sets', value: 10 }
  },
  {
    id: 'fifteen_sets_day',
    title: 'Пятнадцатикратный',
    description: 'Выполните 15 подходов за один день',
    icon: '🎪',
    category: 'advanced',
    requirement: { type: 'daily_sets', value: 15 }
  },
  {
    id: 'twenty_sets_day',
    title: 'Двадцатикратный',
    description: 'Выполните 20 подходов за один день',
    icon: '🎭',
    category: 'expert',
    requirement: { type: 'daily_sets', value: 20 }
  },
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