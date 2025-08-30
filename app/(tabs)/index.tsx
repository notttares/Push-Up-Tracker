import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert, PanResponder, Animated } from 'react-native';
import { Trash2, Flame } from 'lucide-react-native';
import { useWorkout } from '@/hooks/workout-store';
import CircularButton from '@/components/CircularButton';
import StatsCard from '@/components/StatsCard';
import AddSetModal from '@/components/AddSetModal';
import Colors from '@/constants/colors';

export default function HomeScreen() {
  const { todayWorkout, addWorkoutSet, removeWorkoutSet, streak } = useWorkout();
  const [modalVisible, setModalVisible] = useState(false);

  const handleAddSet = (reps: number) => {
    addWorkoutSet(reps);
  };

  const formatDate = (date: string) => {
    const today = new Date();
    const targetDate = new Date(date);
    
    if (targetDate.toDateString() === today.toDateString()) {
      return 'Сегодня';
    }
    
    return targetDate.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Время тренировки!</Text>
          <Text style={styles.date}>{formatDate(todayWorkout.date)}</Text>
        </View>

        <View style={styles.statsContainer}>
          <StatsCard
            title="Всего сегодня"
            value={todayWorkout.totalReps}
            subtitle="отжиманий"
          />
          <StatsCard
            title="Подходы"
            value={todayWorkout.sets.length}
            subtitle="выполнено"
          />
        </View>

        <View style={styles.streakContainer}>
          <Flame size={20} color={Colors.dark.primary} />
          <Text style={styles.streakText}>
            Текущая серия: <Text style={styles.streakValue}>{streak.current} дней</Text>
          </Text>
          {streak.longest > 0 && (
            <Text style={styles.bestStreak}>
              Лучшая: {streak.longest} дней
            </Text>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <CircularButton
            title="Добавить"
            subtitle="подход"
            onPress={() => setModalVisible(true)}
          />
        </View>

        {todayWorkout.sets.length > 0 && (
          <View style={styles.setsContainer}>
            <Text style={styles.setsTitle}>Подходы сегодня</Text>
            <Text style={styles.swipeHint}>Свайпните влево для удаления</Text>
            <View style={styles.setsList}>
              {todayWorkout.sets
                .sort((a, b) => b.timestamp - a.timestamp)
                .map((set, index) => (
                  <SwipeableSetItem
                    key={set.id}
                    set={set}
                    index={index}
                    onDelete={() => {
                      Alert.alert(
                        'Удалить подход',
                        `Удалить подход ${index + 1} (${set.reps} отжиманий)?`,
                        [
                          { text: 'Отмена', style: 'cancel' },
                          { 
                            text: 'Удалить', 
                            style: 'destructive',
                            onPress: () => removeWorkoutSet(set.id)
                          }
                        ]
                      );
                    }}
                  />
                ))}
            </View>
          </View>
        )}
      </ScrollView>

      <AddSetModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAdd={handleAddSet}
      />
    </SafeAreaView>
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
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  date: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 40,
  },
  buttonContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    gap: 8,
  },
  streakText: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
  },
  streakValue: {
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  bestStreak: {
    fontSize: 12,
    color: Colors.dark.textTertiary,
    marginLeft: 8,
  },
  setsContainer: {
    marginTop: 20,
  },
  setsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  setsList: {
    gap: 12,
  },
  setItem: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  setNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.primary,
    width: 40,
  },
  setReps: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    flex: 1,
  },
  setTime: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  swipeHint: {
    fontSize: 12,
    color: Colors.dark.textTertiary,
    textAlign: 'center',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  swipeContainer: {
    position: 'relative',
  },
  deleteAction: {
    position: 'absolute',
    right: 20,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.error,
    borderRadius: 12,
    width: 60,
    zIndex: 1,
  },
});

interface SwipeableSetItemProps {
  set: { id: string; reps: number; timestamp: number };
  index: number;
  onDelete: () => void;
}

function SwipeableSetItem({ set, index, onDelete }: SwipeableSetItemProps) {
  const translateX = new Animated.Value(0);
  const opacity = new Animated.Value(1);
  const deleteOpacity = new Animated.Value(0);

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dy) < 50;
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dx < 0) {
        const progress = Math.min(Math.abs(gestureState.dx) / 100, 1);
        translateX.setValue(gestureState.dx);
        deleteOpacity.setValue(progress);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx < -100) {
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: -400,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onDelete();
        });
      } else {
        Animated.parallel([
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }),
          Animated.timing(deleteOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }
    },
  });

  return (
    <View style={styles.swipeContainer}>
      <Animated.View style={[styles.deleteAction, { opacity: deleteOpacity }]}>
        <Trash2 size={24} color="#FFFFFF" />
      </Animated.View>
      <Animated.View
        style={[
          styles.setItem,
          {
            transform: [{ translateX }],
            opacity,
          },
        ]}
        {...panResponder.panHandlers}
      >
        <Text style={styles.setNumber}>{index + 1}</Text>
        <Text style={styles.setReps}>{set.reps}</Text>
        <Text style={styles.setTime}>
          {new Date(set.timestamp).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </Animated.View>
    </View>
  );
}