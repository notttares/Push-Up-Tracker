import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useWorkout } from '@/hooks/workout-store';
import StatsCard from '@/components/StatsCard';
import Colors from '@/constants/colors';
import { Svg, Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

export default function RecoveryScreen() {
  const { profile, todayWorkout } = useWorkout();

  const recoveryData = useMemo(() => {
    if (!profile || !profile.maxReps) {
      return {
        recoveryPercentage: 100,
        status: 'Полное восстановление',
        recommendation: 'Готов к тренировке!',
        color: Colors.dark.success,
      };
    }

    const todayIntensity = todayWorkout.totalReps / profile.maxReps;
    const ageMultiplier = profile.age > 40 ? 1.2 : profile.age > 30 ? 1.1 : 1.0;
    const genderMultiplier = profile.gender === 'female' ? 0.9 : 1.0;
    
    // Calculate recovery based on today's intensity
    let recoveryPercentage = Math.max(0, 100 - (todayIntensity * 100 * ageMultiplier * genderMultiplier));
    recoveryPercentage = Math.min(100, recoveryPercentage);

    let status: string;
    let recommendation: string;
    let color: string;

    if (recoveryPercentage >= 80) {
      status = 'Отличное восстановление';
      recommendation = 'Готов к интенсивной тренировке!';
      color = Colors.dark.success;
    } else if (recoveryPercentage >= 60) {
      status = 'Хорошее восстановление';
      recommendation = 'Можно тренироваться с умеренной нагрузкой';
      color = '#FFA500';
    } else if (recoveryPercentage >= 40) {
      status = 'Частичное восстановление';
      recommendation = 'Рекомендуется легкая тренировка';
      color = '#FF6B35';
    } else {
      status = 'Требуется отдых';
      recommendation = 'Лучше отдохнуть или сделать растяжку';
      color = '#FF4444';
    }

    return {
      recoveryPercentage: Math.round(recoveryPercentage),
      status,
      recommendation,
      color,
    };
  }, [profile, todayWorkout]);

  const renderSilhouette = () => {
    const isMale = profile?.gender === 'male';
    const fillPercentage = recoveryData.recoveryPercentage;
    
    // Male silhouette path
    const malePath = "M50 10 C55 10 60 15 60 20 C60 25 55 30 50 30 C45 30 40 25 40 20 C40 15 45 10 50 10 Z M50 30 L50 70 M35 45 L50 45 L65 45 M50 70 L40 100 M50 70 L60 100";
    
    // Female silhouette path
    const femalePath = "M50 10 C55 10 60 15 60 20 C60 25 55 30 50 30 C45 30 40 25 40 20 C40 15 45 10 50 10 Z M50 30 L50 50 C45 50 40 55 40 60 C40 65 45 70 50 70 C55 70 60 65 60 60 C60 55 55 50 50 50 Z M50 70 L50 85 M35 45 L50 45 L65 45 M50 85 L40 100 M50 85 L60 100";
    
    const silhouettePath = isMale ? malePath : femalePath;
    
    return (
      <View style={styles.silhouetteContainer}>
        <Svg width={200} height={200} viewBox="0 0 100 110">
          {/* Background silhouette */}
          <Path
            d={silhouettePath}
            stroke={Colors.dark.border}
            strokeWidth="2"
            fill="none"
          />
          
          {/* Filled silhouette based on recovery */}
          <Path
            d={silhouettePath}
            stroke={recoveryData.color}
            strokeWidth="2"
            fill={recoveryData.color}
            fillOpacity={fillPercentage / 100}
          />
        </Svg>
        
        <View style={styles.silhouetteOverlay}>
          <Text style={[styles.recoveryPercentage, { color: recoveryData.color }]}>
            {recoveryData.recoveryPercentage}%
          </Text>
        </View>
      </View>
    );
  };

  if (!profile) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Восстановление</Text>
          <View style={styles.noProfileContainer}>
            <Text style={styles.noProfileText}>
              Для расчета восстановления необходимо заполнить профиль
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Восстановление</Text>
        
        <View style={styles.recoveryCard}>
          <Text style={styles.cardTitle}>Уровень восстановления</Text>
          
          {renderSilhouette()}
          
          <View style={styles.statusContainer}>
            <Text style={[styles.status, { color: recoveryData.color }]}>
              {recoveryData.status}
            </Text>
            <Text style={styles.recommendation}>
              {recoveryData.recommendation}
            </Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <StatsCard
            title="Сегодня выполнено"
            value={todayWorkout.totalReps}
            subtitle="отжиманий"
          />
          <StatsCard
            title="Интенсивность"
            value={profile.maxReps ? `${Math.round((todayWorkout.totalReps / profile.maxReps) * 100)}%` : '0%'}
            subtitle="от максимума"
          />
        </View>

        <View style={styles.factorsCard}>
          <Text style={styles.cardTitle}>Факторы восстановления</Text>
          
          <View style={styles.factorsList}>
            <View style={styles.factorItem}>
              <Text style={styles.factorLabel}>Возраст:</Text>
              <Text style={styles.factorValue}>
                {profile.age > 40 ? 'Замедленное восстановление' : 
                 profile.age > 30 ? 'Нормальное восстановление' : 'Быстрое восстановление'}
              </Text>
            </View>
            
            <View style={styles.factorItem}>
              <Text style={styles.factorLabel}>Пол:</Text>
              <Text style={styles.factorValue}>
                {profile.gender === 'male' ? 'Мужской' : 'Женский'}
              </Text>
            </View>
            
            <View style={styles.factorItem}>
              <Text style={styles.factorLabel}>Нагрузка сегодня:</Text>
              <Text style={styles.factorValue}>
                {todayWorkout.totalReps === 0 ? 'Отсутствует' :
                 todayWorkout.totalReps < (profile.maxReps || 0) * 0.3 ? 'Легкая' :
                 todayWorkout.totalReps < (profile.maxReps || 0) * 0.7 ? 'Умеренная' : 'Высокая'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.tipsCard}>
          <Text style={styles.cardTitle}>Рекомендации для восстановления</Text>
          
          <View style={styles.tipsList}>
            <Text style={styles.tipItem}>• Полноценный сон 7-9 часов</Text>
            <Text style={styles.tipItem}>• Достаточное потребление воды</Text>
            <Text style={styles.tipItem}>• Сбалансированное питание с белком</Text>
            <Text style={styles.tipItem}>• Легкая растяжка или йога</Text>
            <Text style={styles.tipItem}>• Избегание стресса</Text>
          </View>
        </View>
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
  noProfileContainer: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  noProfileText: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  recoveryCard: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 20,
  },
  silhouetteContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 24,
  },
  silhouetteOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -30 }, { translateY: -15 }],
  },
  recoveryPercentage: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statusContainer: {
    alignItems: 'center',
    gap: 8,
  },
  status: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  recommendation: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  factorsCard: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  factorsList: {
    gap: 12,
  },
  factorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  factorLabel: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    fontWeight: '600',
  },
  factorValue: {
    fontSize: 14,
    color: Colors.dark.text,
    fontWeight: '600',
  },
  tipsCard: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    lineHeight: 20,
  },
});