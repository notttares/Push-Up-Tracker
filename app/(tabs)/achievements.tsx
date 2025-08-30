import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useWorkout } from '@/hooks/workout-store';
import Colors from '@/constants/colors';
import { Achievement } from '@/types/workout';
import { getCategoryColor, getCategoryTitle } from '@/constants/achievements';
import { Flame, Trophy, Target } from 'lucide-react-native';

type TabType = 'unlocked' | 'locked';

export default function AchievementsScreen() {
  const { getUnlockedAchievements, getLockedAchievements, streak } = useWorkout();
  const [activeTab, setActiveTab] = useState<TabType>('unlocked');

  const unlockedAchievements = getUnlockedAchievements();
  const lockedAchievements = getLockedAchievements();

  const renderAchievement = (achievement: Achievement, isUnlocked: boolean) => {
    const categoryColor = getCategoryColor(achievement.category);
    const progress = achievement.progress || 0;

    return (
      <View key={achievement.id} style={[styles.achievementCard, { borderLeftColor: categoryColor }]}>
        <View style={styles.achievementHeader}>
          <View style={styles.achievementIcon}>
            <Text style={styles.achievementEmoji}>{achievement.icon}</Text>
          </View>
          <View style={styles.achievementInfo}>
            <Text style={[styles.achievementTitle, !isUnlocked && styles.lockedText]}>
              {achievement.title}
            </Text>
            <Text style={[styles.achievementCategory, { color: categoryColor }]}>
              {getCategoryTitle(achievement.category)}
            </Text>
            <Text style={[styles.achievementDescription, !isUnlocked && styles.lockedText]}>
              {achievement.description}
            </Text>
          </View>
          {isUnlocked && (
            <View style={styles.unlockedBadge}>
              <Trophy size={16} color={Colors.dark.warning} />
            </View>
          )}
        </View>
        
        {!isUnlocked && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${progress}%`, backgroundColor: categoryColor }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>{Math.round(progress)}%</Text>
          </View>
        )}
        
        {isUnlocked && achievement.unlockedAt && (
          <Text style={styles.unlockedDate}>
            Получено: {new Date(achievement.unlockedAt).toLocaleDateString('ru-RU')}
          </Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.streakContainer}>
          <Flame size={24} color={Colors.dark.primary} />
          <View style={styles.streakInfo}>
            <Text style={styles.streakTitle}>Текущая серия</Text>
            <Text style={styles.streakValue}>{streak.current} дней</Text>
          </View>
        </View>
        
        <View style={styles.streakContainer}>
          <Target size={24} color={Colors.dark.success} />
          <View style={styles.streakInfo}>
            <Text style={styles.streakTitle}>Лучшая серия</Text>
            <Text style={styles.streakValue}>{streak.longest} дней</Text>
          </View>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'unlocked' && styles.activeTab]}
          onPress={() => setActiveTab('unlocked')}
        >
          <Text style={[styles.tabText, activeTab === 'unlocked' && styles.activeTabText]}>
            Получено ({unlockedAchievements.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'locked' && styles.activeTab]}
          onPress={() => setActiveTab('locked')}
        >
          <Text style={[styles.tabText, activeTab === 'locked' && styles.activeTabText]}>
            В процессе ({lockedAchievements.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'unlocked' ? (
          unlockedAchievements.length > 0 ? (
            unlockedAchievements.map(achievement => renderAchievement(achievement, true))
          ) : (
            <View style={styles.emptyState}>
              <Trophy size={48} color={Colors.dark.textSecondary} />
              <Text style={styles.emptyTitle}>Пока нет достижений</Text>
              <Text style={styles.emptyDescription}>
                Начните тренироваться, чтобы получить первые медали!
              </Text>
            </View>
          )
        ) : (
          lockedAchievements.length > 0 ? (
            lockedAchievements.map(achievement => renderAchievement(achievement, false))
          ) : (
            <View style={styles.emptyState}>
              <Target size={48} color={Colors.dark.textSecondary} />
              <Text style={styles.emptyTitle}>Все достижения получены!</Text>
              <Text style={styles.emptyDescription}>
                Поздравляем! Вы настоящий чемпион!
              </Text>
            </View>
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.dark.surface,
    marginBottom: 16,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  streakInfo: {
    alignItems: 'center',
  },
  streakTitle: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginBottom: 2,
  },
  streakValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: Colors.dark.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.textSecondary,
  },
  activeTabText: {
    color: Colors.dark.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  achievementCard: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.dark.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementEmoji: {
    fontSize: 24,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 2,
  },
  achievementCategory: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    lineHeight: 20,
  },
  lockedText: {
    opacity: 0.6,
  },
  unlockedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.dark.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.dark.surfaceSecondary,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    fontWeight: '600',
    minWidth: 32,
    textAlign: 'right',
  },
  unlockedDate: {
    fontSize: 12,
    color: Colors.dark.textTertiary,
    marginTop: 8,
    textAlign: 'right',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 40,
  },
});