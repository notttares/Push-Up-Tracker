import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useWorkout } from '@/hooks/workout-store';
import StatsCard from '@/components/StatsCard';
import Colors from '@/constants/colors';

const { width } = Dimensions.get('window');

type Period = 'day' | 'week' | 'month' | 'all';

export default function ProgressScreen() {
  const { workouts, weeklyStats, weights, getWeightProgress } = useWorkout();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('day');

  const getRecentWorkouts = () => {
    const now = new Date();
    
    if (selectedPeriod === 'day') {
      // Only today
      const today = now.toISOString().split('T')[0];
      return workouts.filter(w => w.date === today);
    } else if (selectedPeriod === 'week') {
      // Last 7 days
      const cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return workouts.filter(w => new Date(w.date) >= cutoff);
    } else if (selectedPeriod === 'month') {
      // Last 30-31 days (current month)
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return workouts.filter(w => new Date(w.date) >= startOfMonth);
    } else {
      // All time
      return workouts;
    }
  };

  const recentWorkouts = getRecentWorkouts();
  const totalReps = recentWorkouts.reduce((sum, w) => sum + w.totalReps, 0);
  const totalSets = recentWorkouts.reduce((sum, w) => sum + w.sets.length, 0);
  const averageReps = totalSets > 0 ? Math.round(totalReps / totalSets) : 0;
  const bestDayReps = recentWorkouts.length > 0 ? Math.max(...recentWorkouts.map(w => w.totalReps)) : 0;
  const bestDayDate = recentWorkouts.find(w => w.totalReps === bestDayReps)?.date || '';
  const bestDayFormatted = bestDayDate ? new Date(bestDayDate).toLocaleDateString('ru-RU') : '';

  const renderChart = () => {
    if (recentWorkouts.length === 0) {
      return (
        <View style={styles.emptyChart}>
          <Text style={styles.emptyText}>Нет данных для отображения</Text>
        </View>
      );
    }

    const maxReps = Math.max(...recentWorkouts.map(w => w.totalReps));
    const minReps = Math.min(...recentWorkouts.map(w => w.totalReps));
    const range = maxReps - minReps || 1;
    
    let chartData = recentWorkouts;
    let displayCount = 14;
    
    if (selectedPeriod === 'day') {
      chartData = recentWorkouts.slice(-7);
      displayCount = 7;
    } else if (selectedPeriod === 'week') {
      chartData = recentWorkouts.slice(-28);
      displayCount = 28;
    } else if (selectedPeriod === 'month') {
      chartData = recentWorkouts.slice(-90);
      displayCount = 90;
    }
    
    const pointWidth = Math.max(4, Math.min(8, (width - 80) / Math.min(chartData.length, displayCount)));
    const chartWidth = Math.max(width - 80, chartData.length * 30);

    return (
      <View style={styles.chartWrapper}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.chartScrollContent, { width: chartWidth }]}
        >
          <View style={[styles.lineChart, { width: chartWidth }]}>
            {/* Render line path */}
            <View style={styles.lineContainer}>
              {chartData.map((workout, index) => {
                const x = (index / (chartData.length - 1 || 1)) * (chartWidth - 40);
                const y = 80 - ((workout.totalReps - minReps) / range) * 60;
                const date = new Date(workout.date);
                let label = '';
                
                if (selectedPeriod === 'day') {
                  label = date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
                } else if (selectedPeriod === 'week') {
                  label = date.getDate().toString();
                } else {
                  label = date.getDate().toString();
                }
                
                return (
                  <View key={workout.date}>
                    {/* Data point */}
                    <View
                      style={[
                        styles.dataPoint,
                        {
                          left: x - pointWidth / 2,
                          top: y - pointWidth / 2,
                          width: pointWidth,
                          height: pointWidth,
                        },
                      ]}
                    />
                    {/* Label */}
                    <Text
                      style={[
                        styles.chartLabel,
                        {
                          left: x - 20,
                          top: 90,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {label}
                    </Text>
                    {/* Value */}
                    <Text
                      style={[
                        styles.chartValue,
                        {
                          left: x - 15,
                          top: y - 20,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {workout.totalReps}
                    </Text>
                    {/* Line to next point */}
                    {index < chartData.length - 1 && (
                      <View
                        style={[
                          styles.lineSegment,
                          {
                            left: x,
                            top: y,
                            width: Math.sqrt(
                              Math.pow((chartWidth - 40) / (chartData.length - 1), 2) +
                              Math.pow(
                                ((chartData[index + 1].totalReps - minReps) / range) * 60 -
                                ((workout.totalReps - minReps) / range) * 60,
                                2
                              )
                            ),
                            transform: [
                              {
                                rotate: `${Math.atan2(
                                  ((chartData[index + 1].totalReps - minReps) / range) * 60 -
                                  ((workout.totalReps - minReps) / range) * 60,
                                  (chartWidth - 40) / (chartData.length - 1)
                                )}rad`,
                              },
                            ],
                          },
                        ]}
                      />
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </View>
    );
  };



  const renderWeeklyComparison = () => {
    if (weeklyStats.length < 2) return null;

    const currentWeek = weeklyStats[0];
    const previousWeek = weeklyStats[1];
    const change = currentWeek.totalReps - previousWeek.totalReps;
    const changePercent = previousWeek.totalReps > 0 
      ? Math.round((change / previousWeek.totalReps) * 100) 
      : 0;

    return (
      <View style={styles.comparisonContainer}>
        <Text style={styles.comparisonTitle}>Сравнение с прошлой неделей</Text>
        <View style={styles.comparisonStats}>
          <View style={styles.comparisonItem}>
            <Text style={styles.comparisonLabel}>Изменение</Text>
            <Text style={[
              styles.comparisonValue,
              { color: change >= 0 ? Colors.dark.success : Colors.dark.error }
            ]}>
              {change >= 0 ? '+' : ''}{change}
            </Text>
          </View>
          <View style={styles.comparisonItem}>
            <Text style={styles.comparisonLabel}>Процент</Text>
            <Text style={[
              styles.comparisonValue,
              { color: changePercent >= 0 ? Colors.dark.success : Colors.dark.error }
            ]}>
              {changePercent >= 0 ? '+' : ''}{changePercent}%
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Text style={styles.title}>Прогресс</Text>

        <View style={styles.periodSelector}>
          {(['day', 'week', 'month', 'all'] as Period[]).map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period && styles.periodButtonTextActive,
                ]}
              >
                {period === 'day' ? 'День' : period === 'week' ? 'Неделя' : period === 'month' ? 'Месяц' : 'Всё время'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.statsContainer}>
          <StatsCard
            title="Всего отжиманий"
            value={totalReps}
            subtitle={selectedPeriod === 'day' ? 'сегодня' : selectedPeriod === 'week' ? 'за неделю' : selectedPeriod === 'month' ? 'за месяц' : 'за всё время'}
            horizontal
          />
          <StatsCard
            title="Подходы"
            value={totalSets}
            subtitle="выполнено"
            horizontal
          />
          <StatsCard
            title="Среднее за подход"
            value={averageReps}
            subtitle="отжиманий"
            horizontal
          />
          <StatsCard
            title="Лучший день"
            value={bestDayReps}
            subtitle={bestDayFormatted || 'отжиманий'}
            horizontal
          />
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>
            Динамика по {selectedPeriod === 'day' ? 'дням' : selectedPeriod === 'week' ? 'неделям' : 'месяцам'}
          </Text>
          {renderChart()}
        </View>

        {renderWeeklyComparison()}
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
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: Colors.dark.primary,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.textSecondary,
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
  },
  statsContainer: {
    marginBottom: 32,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  chartContainer: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  chartWrapper: {
    height: 160,
    marginTop: 8,
  },
  chartScrollContent: {
    paddingHorizontal: 20,
    minWidth: width - 80,
  },
  lineChart: {
    height: 120,
    position: 'relative',
    marginBottom: 20,
  },
  lineContainer: {
    position: 'relative',
    height: '100%',
    width: '100%',
  },
  dataPoint: {
    position: 'absolute',
    backgroundColor: Colors.dark.primary,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: Colors.dark.background,
  },
  lineSegment: {
    position: 'absolute',
    height: 2,
    backgroundColor: Colors.dark.primary,
    transformOrigin: '0 50%',
  },
  chartLabel: {
    position: 'absolute',
    fontSize: 12,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    width: 40,
  },
  chartValue: {
    position: 'absolute',
    fontSize: 11,
    color: Colors.dark.text,
    fontWeight: '600',
    textAlign: 'center',
    width: 30,
    backgroundColor: Colors.dark.surface,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  emptyChart: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
  },
  comparisonContainer: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  comparisonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  comparisonStats: {
    flexDirection: 'row',
    gap: 20,
  },
  comparisonItem: {
    flex: 1,
    alignItems: 'center',
  },
  comparisonLabel: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginBottom: 8,
  },
  comparisonValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  weightStats: {
    marginBottom: 16,
  },
  congratsContainer: {
    backgroundColor: Colors.dark.success + '20',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  congratsText: {
    fontSize: 14,
    color: Colors.dark.success,
    fontWeight: '600',
  },
});