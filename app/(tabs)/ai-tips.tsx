import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useWorkout } from '@/hooks/workout-store';
import Colors from '@/constants/colors';
import { Lightbulb, TrendingUp, Target, Award } from 'lucide-react-native';

interface AITip {
  id: string;
  type: 'motivation' | 'advice' | 'achievement' | 'goal';
  title: string;
  content: string;
  icon: React.ReactNode;
}

export default function AITipsScreen() {
  const { profile, weeklyStats, todayWorkout } = useWorkout();
  const [isGenerating, setIsGenerating] = useState(false);
  const [customTips, setCustomTips] = useState<AITip[]>([]);

  const getStaticTips = (): AITip[] => {
    const tips: AITip[] = [];

    // Мотивационные советы
    if (todayWorkout.totalReps > 0) {
      tips.push({
        id: 'motivation-1',
        type: 'motivation',
        title: 'Отличная работа!',
        content: `Сегодня вы сделали ${todayWorkout.totalReps} отжиманий. Каждое повторение приближает вас к цели!`,
        icon: <Award size={24} color={Colors.dark.primary} />,
      });
    }

    // Советы по прогрессу
    if (weeklyStats.length >= 2) {
      const currentWeek = weeklyStats[0];
      const previousWeek = weeklyStats[1];
      const change = currentWeek.totalReps - previousWeek.totalReps;
      
      if (change > 0) {
        tips.push({
          id: 'progress-1',
          type: 'achievement',
          title: 'Прогресс налицо!',
          content: `На этой неделе вы сделали на ${change} отжиманий больше, чем на прошлой. Это рост на ${Math.round((change / previousWeek.totalReps) * 100)}%!`,
          icon: <TrendingUp size={24} color={Colors.dark.success} />,
        });
      }
    }

    // Советы по технике
    tips.push({
      id: 'advice-1',
      type: 'advice',
      title: 'Правильная техника',
      content: 'Держите тело прямо, опускайтесь до касания грудью пола, полностью выпрямляйте руки. Качество важнее количества!',
      icon: <Target size={24} color={Colors.dark.primary} />,
    });

    // Советы по тренировкам
    if (profile) {
      const ageGroup = profile.age < 30 ? 'молодой' : profile.age < 50 ? 'средний' : 'зрелый';
      tips.push({
        id: 'advice-2',
        type: 'advice',
        title: `Советы для ${ageGroup} возраста`,
        content: profile.age < 30 
          ? 'В вашем возрасте мышцы быстро восстанавливаются. Можете тренироваться через день с постепенным увеличением нагрузки.'
          : profile.age < 50
          ? 'Уделяйте больше внимания разминке и растяжке. Тренируйтесь 3-4 раза в неделю с днями отдыха.'
          : 'Сосредоточьтесь на качестве движений. 2-3 тренировки в неделю с полным восстановлением между ними.',
        icon: <Lightbulb size={24} color={Colors.dark.warning} />,
      });
    }

    // Цели
    const currentMax = profile?.maxReps || 0;
    if (currentMax > 0) {
      const nextGoal = Math.ceil(currentMax * 1.2);
      tips.push({
        id: 'goal-1',
        type: 'goal',
        title: 'Следующая цель',
        content: `Ваш текущий максимум: ${currentMax}. Попробуйте достичь ${nextGoal} отжиманий за один подход!`,
        icon: <Target size={24} color={Colors.dark.primary} />,
      });
    }

    return tips;
  };

  const generateAITips = async () => {
    if (!profile) return;

    setIsGenerating(true);
    try {
      const prompt = `Ты персональный тренер по фитнесу. Дай 2-3 персональных совета для пользователя со следующими данными:
      - Возраст: ${profile.age}
      - Пол: ${profile.gender === 'male' ? 'мужской' : 'женский'}
      - Рост: ${profile.height} см
      - Вес: ${profile.weight} кг
      - Максимум отжиманий: ${profile.maxReps || 'не указан'}
      - Отжиманий сегодня: ${todayWorkout.totalReps}
      - Подходов сегодня: ${todayWorkout.sets.length}
      
      Дай конкретные, мотивирующие советы по улучшению результатов в отжиманиях. Каждый совет должен быть коротким (1-2 предложения).`;

      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: prompt }
          ]
        }),
      });

      const data = await response.json();
      
      if (data.completion) {
        const aiTipsText = data.completion.split('\n').filter((tip: string) => tip.trim());
        const newTips: AITip[] = aiTipsText.map((tip: string, index: number) => ({
          id: `ai-tip-${Date.now()}-${index}`,
          type: 'advice' as const,
          title: 'ИИ-совет',
          content: tip.replace(/^\d+\.\s*/, '').trim(),
          icon: <Lightbulb size={24} color={Colors.dark.primary} />,
        }));
        
        setCustomTips(newTips);
      }
    } catch (error) {
      console.error('Error generating AI tips:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const allTips = [...getStaticTips(), ...customTips];

  const getTypeColor = (type: AITip['type']) => {
    switch (type) {
      case 'motivation': return Colors.dark.success;
      case 'achievement': return Colors.dark.primary;
      case 'advice': return Colors.dark.warning;
      case 'goal': return Colors.dark.primary;
      default: return Colors.dark.textSecondary;
    }
  };

  const getTypeLabel = (type: AITip['type']) => {
    switch (type) {
      case 'motivation': return 'Мотивация';
      case 'achievement': return 'Достижение';
      case 'advice': return 'Совет';
      case 'goal': return 'Цель';
      default: return '';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>ИИ-Советы</Text>
        
        <TouchableOpacity
          style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]}
          onPress={generateAITips}
          disabled={isGenerating || !profile}
        >
          {isGenerating ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Lightbulb size={20} color="#FFFFFF" />
          )}
          <Text style={styles.generateButtonText}>
            {isGenerating ? 'Генерируем советы...' : 'Получить персональные советы'}
          </Text>
        </TouchableOpacity>

        <View style={styles.tipsContainer}>
          {allTips.map((tip) => (
            <View key={tip.id} style={styles.tipCard}>
              <View style={styles.tipHeader}>
                <View style={styles.tipIcon}>
                  {tip.icon}
                </View>
                <View style={styles.tipHeaderText}>
                  <Text style={styles.tipTitle}>{tip.title}</Text>
                  <Text style={[styles.tipType, { color: getTypeColor(tip.type) }]}>
                    {getTypeLabel(tip.type)}
                  </Text>
                </View>
              </View>
              <Text style={styles.tipContent}>{tip.content}</Text>
            </View>
          ))}
        </View>

        {!profile && (
          <View style={styles.noProfileContainer}>
            <Text style={styles.noProfileText}>
              Создайте профиль, чтобы получать персональные советы от ИИ
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 24,
  },
  generateButton: {
    backgroundColor: Colors.dark.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  tipsContainer: {
    gap: 16,
  },
  tipCard: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipIcon: {
    marginRight: 12,
  },
  tipHeaderText: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  tipType: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  tipContent: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    lineHeight: 22,
  },
  noProfileContainer: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  noProfileText: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});