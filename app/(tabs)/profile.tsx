import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Modal, Dimensions } from 'react-native';
import { useWorkout } from '@/hooks/workout-store';
import StatsCard from '@/components/StatsCard';
import Colors from '@/constants/colors';
import { UserProfile } from '@/types/workout';
import { ChevronRight, ChevronLeft, ChevronUp, LogIn, LogOut } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const { profile, saveProfile, updateMaxReps, getUserPercentile, addWeightEntry, getWeightProgress, weights, googleUser, signInWithGoogle, signOut, setWeightGoal, getWeightGoalProgress, getFilteredWeights } = useWorkout();
  const [isEditing, setIsEditing] = useState(!profile);
  const [formData, setFormData] = useState<Partial<UserProfile>>(
    profile || {
      height: 0,
      weight: 0,
      age: 0,
      gender: 'male',
    }
  );
  const [maxRepsInput, setMaxRepsInput] = useState<string>('');
  const [weightInput, setWeightInput] = useState<string>('');
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showBMIModal, setShowBMIModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'30d' | '90d' | '1y' | 'all'>('30d');
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalTarget, setGoalTarget] = useState<string>('');
  const [goalType, setGoalType] = useState<'lose' | 'gain'>('lose');

  const handleSave = () => {
    if (!formData.height || !formData.weight || !formData.age) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
      return;
    }

    const newProfile: UserProfile = {
      height: formData.height!,
      weight: formData.weight!,
      age: formData.age!,
      gender: formData.gender!,
      maxReps: profile?.maxReps,
      createdAt: profile?.createdAt || Date.now(),
    };

    saveProfile(newProfile);
    setIsEditing(false);
  };

  const handleMaxRepsTest = () => {
    const maxReps = parseInt(maxRepsInput);
    if (maxReps > 0) {
      updateMaxReps(maxReps);
      setMaxRepsInput('');
      Alert.alert(
        'Отлично!',
        `Ваш максимум: ${maxReps} отжиманий\nВы сильнее ${getUserPercentile(maxReps)}% людей в вашей категории!`
      );
    }
  };

  const handleWeightUpdate = () => {
    const weight = parseFloat(weightInput);
    if (weight > 0) {
      addWeightEntry(weight);
      setWeightInput('');
      const progress = getWeightProgress();
      if (progress?.isImprovement) {
        Alert.alert(
          '🎉 Отлично!',
          `Ваш новый вес: ${weight} кг\nИзменение: ${progress.change >= 0 ? '+' : ''}${progress.change.toFixed(1)} кг\nВы на правильном пути!`
        );
      } else {
        Alert.alert(
          'Вес записан',
          `Ваш новый вес: ${weight} кг${progress ? `\nИзменение: ${progress.change >= 0 ? '+' : ''}${progress.change.toFixed(1)} кг` : ''}`
        );
      }
    }
  };

  const getBMI = () => {
    if (!profile?.height || !profile?.weight) return 0;
    const heightInM = profile.height / 100;
    return Math.round((profile.weight / (heightInM * heightInM)) * 10) / 10;
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return 'Недостаток в весе';
    if (bmi < 25) return 'Нормальный вес тела';
    if (bmi < 30) return 'Избыточная масса тела';
    if (bmi < 35) return 'Ожирение (класс I)';
    if (bmi < 40) return 'Ожирение (класс II)';
    return 'Ожирение (класс III)';
  };

  const getBMIColor = (bmi: number) => {
    if (bmi < 18.5) return 'rgb(244, 90, 0)';
    if (bmi < 25) return 'rgb(0, 255, 3)';
    if (bmi < 30) return 'rgb(245, 181, 0)';
    if (bmi < 35) return 'rgb(244, 131, 1)';
    if (bmi < 40) return 'rgb(244, 90, 0)';
    return 'rgb(213, 59, 58)';
  };

  const renderBMIScale = () => {
    const bmi = getBMI();
    const minBMI = 15;
    const maxBMI = 45;
    const position = Math.max(0, Math.min(1, (bmi - minBMI) / (maxBMI - minBMI)));
    
    const createGradientSegments = () => {
      const segments = [
        { start: 0, end: (18.5 - minBMI) / (maxBMI - minBMI), color: 'rgb(244, 90, 0)' },
        { start: (18.5 - minBMI) / (maxBMI - minBMI), end: (25 - minBMI) / (maxBMI - minBMI), color: 'rgb(0, 255, 3)' },
        { start: (25 - minBMI) / (maxBMI - minBMI), end: (30 - minBMI) / (maxBMI - minBMI), color: 'rgb(245, 181, 0)' },
        { start: (30 - minBMI) / (maxBMI - minBMI), end: (35 - minBMI) / (maxBMI - minBMI), color: 'rgb(244, 131, 1)' },
        { start: (35 - minBMI) / (maxBMI - minBMI), end: (40 - minBMI) / (maxBMI - minBMI), color: 'rgb(244, 90, 0)' },
        { start: (40 - minBMI) / (maxBMI - minBMI), end: 1, color: 'rgb(213, 59, 58)' },
      ];
      
      return (
        <View style={styles.bmiGradientContainer}>
          {segments.map((segment, index) => (
            <View
              key={index}
              style={[
                styles.bmiSegment,
                {
                  flex: segment.end - segment.start,
                  backgroundColor: segment.color,
                },
              ]}
            />
          ))}
        </View>
      );
    };
    
    return (
      <View style={styles.bmiScale}>
        <View style={styles.bmiScaleTrack}>
          {createGradientSegments()}
          <View style={[styles.bmiIndicator, { left: `${position * 100}%` }]} />
        </View>
        <View style={styles.bmiLabels}>
          <Text style={styles.bmiLabel}>&lt;18.4</Text>
          <Text style={styles.bmiLabel}>18.5-24.9</Text>
          <Text style={styles.bmiLabel}>25-30</Text>
          <Text style={styles.bmiLabel}>30.1-34.9</Text>
          <Text style={styles.bmiLabel}>35-40</Text>
          <Text style={styles.bmiLabel}>&gt;40</Text>
        </View>
      </View>
    );
  };

  const handleSetGoal = async () => {
    const target = parseFloat(goalTarget);
    if (target > 0) {
      await setWeightGoal(target, goalType);
      setGoalTarget('');
      setShowGoalModal(false);
      Alert.alert('Цель установлена!', `Ваша цель: ${goalType === 'lose' ? 'снизить' : 'набрать'} вес до ${target} кг`);
    }
  };

  const goalProgress = getWeightGoalProgress();
  
  const renderWeightChart = () => {
    const filteredWeights = getFilteredWeights(selectedPeriod);
    
    if (filteredWeights.length === 0) {
      return (
        <View style={styles.emptyChart}>
          <Text style={styles.emptyChartText}>Нет данных о весе</Text>
        </View>
      );
    }
    
    const sortedWeights = [...filteredWeights].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const minWeight = Math.min(...sortedWeights.map(w => w.weight)) - 1;
    const maxWeight = Math.max(...sortedWeights.map(w => w.weight)) + 1;
    const weightRange = maxWeight - minWeight;
    
    const chartHeight = 200;
    const chartWidth = width - 80;
    
    const getYPosition = (weight: number) => {
      return chartHeight - ((weight - minWeight) / weightRange) * chartHeight;
    };
    
    const getXPosition = (index: number) => {
      return (index / (sortedWeights.length - 1)) * chartWidth;
    };
    
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return `${String(date.getDate()).padStart(2, '0')} ${['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'][date.getMonth()]}`;
    };
    
    return (
      <View style={styles.weightChart}>
        <View style={styles.goalProgressHeader}>
          <Text style={styles.goalProgressTitle}>Прогресс цели</Text>
          <View style={styles.goalProgressRight}>
            <Text style={styles.goalProgressPercent}>
              {goalProgress ? `${goalProgress.progress.toFixed(1)}%` : '0.0%'}
            </Text>
            <Text style={styles.goalProgressLabel}>Достигнуто</Text>
          </View>
        </View>
        
        <View style={styles.periodSelector}>
          {[
            { key: '30d' as const, label: '30 дней' },
            { key: '90d' as const, label: '90 дней' },
            { key: '1y' as const, label: '1 год' },
            { key: 'all' as const, label: 'За всё время' },
          ].map(period => (
            <TouchableOpacity
              key={period.key}
              style={[
                styles.periodButton,
                selectedPeriod === period.key && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod(period.key)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period.key && styles.periodButtonTextActive,
                ]}
              >
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.chartContainer}>
          <View style={styles.yAxisLabels}>
            {Array.from({ length: 5 }, (_, i) => {
              const weight = maxWeight - (i * weightRange / 4);
              return (
                <Text key={i} style={styles.yAxisLabel}>
                  {weight.toFixed(1)} kg
                </Text>
              );
            })}
          </View>
          
          <View style={styles.chartArea}>
            <View style={[styles.chartBackground, { height: chartHeight }]}>
              {Array.from({ length: 5 }, (_, i) => (
                <View key={i} style={styles.gridLine} />
              ))}
            </View>
            
            <View style={[styles.chartContent, { height: chartHeight }]}>
              {sortedWeights.map((weight, index) => {
                const x = getXPosition(index);
                const y = getYPosition(weight.weight);
                
                return (
                  <View key={weight.id}>
                    <View
                      style={[
                        styles.dataPoint,
                        {
                          left: x - 4,
                          top: y - 4,
                        },
                      ]}
                    />
                    {index === sortedWeights.length - 1 && (
                      <View
                        style={[
                          styles.dataPointLabel,
                          {
                            left: x - 15,
                            top: y - 25,
                          },
                        ]}
                      >
                        <Text style={styles.dataPointText}>{weight.weight}</Text>
                      </View>
                    )}
                  </View>
                );
              })}
              
              {sortedWeights.length > 1 && (
                <View style={styles.chartLine}>
                  {sortedWeights.slice(1).map((weight, index) => {
                    const prevWeight = sortedWeights[index];
                    const x1 = getXPosition(index);
                    const y1 = getYPosition(prevWeight.weight);
                    const x2 = getXPosition(index + 1);
                    const y2 = getYPosition(weight.weight);
                    
                    const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                    const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
                    
                    return (
                      <View
                        key={index}
                        style={[
                          styles.lineSegment,
                          {
                            left: x1,
                            top: y1,
                            width: length,
                            transform: [{ rotate: `${angle}deg` }],
                          },
                        ]}
                      />
                    );
                  })}
                </View>
              )}
            </View>
          </View>
          
          <View style={styles.xAxisLabels}>
            {sortedWeights.filter((_, i) => i % Math.max(1, Math.floor(sortedWeights.length / 6)) === 0).map((weight, index) => (
              <Text key={weight.id} style={styles.xAxisLabel}>
                {formatDate(weight.date)}
              </Text>
            ))}
          </View>
        </View>
      </View>
    );
  };

  if (isEditing) {
    return (
      <ScrollView style={styles.container} testID="profile-edit-scroll">
        <View style={styles.content}>
          <Text style={styles.title}>
            {profile ? 'Редактировать профиль' : 'Создать профиль'}
          </Text>

          <View style={styles.googleAuthContainer} testID="google-auth-edit">
            {googleUser ? (
              <View style={styles.googleUserInfo}>
                <View style={styles.googleUserDetails}>
                  <Text style={styles.googleUserName}>{googleUser.name}</Text>
                  <Text style={styles.googleUserEmail}>{googleUser.email}</Text>
                  <Text style={styles.syncStatus}>✅ Данные синхронизированы</Text>
                </View>
                <TouchableOpacity
                  style={styles.signOutButton}
                  onPress={async () => {
                    try {
                      await signOut();
                      Alert.alert('Успешно', 'Вы вышли из аккаунта');
                    } catch (error) {
                      Alert.alert('Ошибка', 'Не удалось выйти из аккаунта');
                    }
                  }}
                >
                  <LogOut size={20} color={Colors.dark.text} />
                  <Text style={styles.signOutButtonText}>Выйти</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.googleSignInButton}
                onPress={async () => {
                  try {
                    await signInWithGoogle();
                    Alert.alert(
                      'Успешно!',
                      'Вы вошли в аккаунт Google. Теперь ваши данные будут синхронизированы.'
                    );
                  } catch (error) {
                    Alert.alert('Ошибка', 'Не удалось войти в аккаунт Google');
                  }
                }}
                testID="google-sign-in-button-edit"
              >
                <LogIn size={16} color="#FFFFFF" />
                <Text style={styles.googleSignInButtonText}>Войти через Google</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Рост (см)</Text>
              <TextInput
                style={styles.input}
                value={formData.height?.toString() || ''}
                onChangeText={(text) => setFormData({ ...formData, height: parseInt(text) || 0 })}
                keyboardType="numeric"
                placeholder="175"
                placeholderTextColor={Colors.dark.textTertiary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Вес (кг)</Text>
              <TextInput
                style={styles.input}
                value={formData.weight?.toString() || ''}
                onChangeText={(text) => setFormData({ ...formData, weight: parseInt(text) || 0 })}
                keyboardType="numeric"
                placeholder="70"
                placeholderTextColor={Colors.dark.textTertiary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Возраст</Text>
              <TextInput
                style={styles.input}
                value={formData.age?.toString() || ''}
                onChangeText={(text) => setFormData({ ...formData, age: parseInt(text) || 0 })}
                keyboardType="numeric"
                placeholder="25"
                placeholderTextColor={Colors.dark.textTertiary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Пол</Text>
              <View style={styles.genderSelector}>
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    formData.gender === 'male' && styles.genderButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, gender: 'male' })}
                >
                  <Text
                    style={[
                      styles.genderButtonText,
                      formData.gender === 'male' && styles.genderButtonTextActive,
                    ]}
                  >
                    Мужской
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    formData.gender === 'female' && styles.genderButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, gender: 'female' })}
                >
                  <Text
                    style={[
                      styles.genderButtonText,
                      formData.gender === 'female' && styles.genderButtonTextActive,
                    ]}
                  >
                    Женский
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Сохранить</Text>
              </TouchableOpacity>
              {profile && (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setIsEditing(false);
                    setFormData(profile);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Отмена</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }

  if (!profile) {
    return null;
  }

  const bmi = getBMI();
  const percentile = profile.maxReps ? getUserPercentile(profile.maxReps) : 0;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Профиль</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(true)}
          >
            <Text style={styles.editButtonText}>Редактировать</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.googleAuthContainer}>
          {googleUser ? (
            <View style={styles.googleUserInfo}>
              <View style={styles.googleUserDetails}>
                <Text style={styles.googleUserName}>{googleUser.name}</Text>
                <Text style={styles.googleUserEmail}>{googleUser.email}</Text>
                <Text style={styles.syncStatus}>✅ Данные синхронизированы</Text>
              </View>
              <TouchableOpacity
                style={styles.signOutButton}
                onPress={async () => {
                  try {
                    await signOut();
                    Alert.alert('Успешно', 'Вы вышли из аккаунта');
                  } catch (error) {
                    Alert.alert('Ошибка', 'Не удалось выйти из аккаунта');
                  }
                }}
              >
                <LogOut size={20} color={Colors.dark.text} />
                <Text style={styles.signOutButtonText}>Выйти</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.googleSignInButton}
              onPress={async () => {
                try {
                  await signInWithGoogle();
                  Alert.alert(
                    'Успешно!',
                    'Вы вошли в аккаунт Google. Теперь ваши данные будут синхронизированы.'
                  );
                } catch (error) {
                  Alert.alert('Ошибка', 'Не удалось войти в аккаунт Google');
                }
              }}
            >
              <LogIn size={16} color="#FFFFFF" />
              <Text style={styles.googleSignInButtonText}>Войти через Google</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.statsContainer}>
          <StatsCard
            title="Рост"
            value={`${profile.height} см`}
            horizontal
          />
          <TouchableOpacity onPress={() => setShowWeightModal(true)} style={styles.expandableCard}>
            <StatsCard
              title="Вес"
              value={`${profile.weight} кг`}
              horizontal
            />
            <View style={styles.triangleArrow}>
              <ChevronUp size={16} color={Colors.dark.primary} />
            </View>
          </TouchableOpacity>
          <StatsCard
            title="Возраст"
            value={`${profile.age} лет`}
            horizontal
          />
          <TouchableOpacity onPress={() => setShowBMIModal(true)} style={styles.expandableCard}>
            <StatsCard
              title="ИМТ"
              value={bmi}
              subtitle={getBMICategory(bmi)}
              horizontal
            />
            <View style={styles.triangleArrow}>
              <ChevronUp size={16} color={Colors.dark.primary} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.maxRepsContainer}>
          <Text style={styles.sectionTitle}>Тест максимума</Text>
          {profile.maxReps ? (
            <View style={styles.maxRepsResult}>
              <StatsCard
                title="Ваш максимум"
                value={profile.maxReps}
                subtitle="отжиманий за раз"
              />
              <StatsCard
                title="Ваш уровень"
                value={`${percentile}%`}
                subtitle="сильнее других"
                color={Colors.dark.success}
              />
            </View>
          ) : (
            <View style={styles.maxRepsTest}>
              <Text style={styles.maxRepsDescription}>
                Сделайте максимальное количество отжиманий за один подход и введите результат
              </Text>
            </View>
          )}
          
          <View style={styles.maxRepsInput}>
            <TextInput
              style={styles.input}
              value={maxRepsInput}
              onChangeText={setMaxRepsInput}
              keyboardType="numeric"
              placeholder="Введите максимум отжиманий"
              placeholderTextColor={Colors.dark.textTertiary}
            />
            <TouchableOpacity
              style={[styles.testButton, !maxRepsInput && styles.testButtonDisabled]}
              onPress={handleMaxRepsTest}
              disabled={!maxRepsInput}
            >
              <Text style={styles.testButtonText}>
                {profile.maxReps ? 'Обновить' : 'Записать'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Modal
          visible={showWeightModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowWeightModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowWeightModal(false)}>
                <Text style={styles.modalCloseButton}>Закрыть</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Отслеживание веса</Text>
              <View style={{ width: 60 }} />
            </View>
            
            <ScrollView
              contentContainerStyle={styles.modalScrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {renderWeightChart()}
              
              <View style={styles.weightInputSection}>
                <Text style={styles.sectionTitle}>Добавить новый вес</Text>
                <View style={styles.weightInput}>
                  <TextInput
                    style={styles.input}
                    value={weightInput}
                    onChangeText={setWeightInput}
                    keyboardType="decimal-pad"
                    placeholder="Введите текущий вес (кг)"
                    placeholderTextColor={Colors.dark.textTertiary}
                  />
                  <TouchableOpacity
                    style={[styles.testButton, !weightInput && styles.testButtonDisabled]}
                    onPress={handleWeightUpdate}
                    disabled={!weightInput}
                  >
                    <Text style={styles.testButtonText}>Добавить</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.goalSection}>
                  <Text style={styles.sectionTitle}>
                    {profile?.weightGoal ? 'Изменить цель' : 'Установить цель'}
                  </Text>
                  {profile?.weightGoal && (
                    <View style={styles.currentGoalInfo}>
                      <Text style={styles.currentGoalText}>
                        Текущая цель: {profile.weightGoal.type === 'lose' ? 'снизить' : 'набрать'} вес до {profile.weightGoal.target} кг
                      </Text>
                      <Text style={styles.currentGoalProgress}>
                        Прогресс: {goalProgress ? `${goalProgress.progress.toFixed(1)}%` : '0%'}
                      </Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.setGoalButton}
                    onPress={() => {
                      if (profile?.weightGoal) {
                        setGoalTarget(profile.weightGoal.target.toString());
                        setGoalType(profile.weightGoal.type);
                      }
                      setShowGoalModal(true);
                    }}
                  >
                    <Text style={styles.setGoalButtonText}>
                      {profile?.weightGoal ? 'Изменить цель' : 'Установить цель'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </Modal>

        <Modal
          visible={showBMIModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowBMIModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowBMIModal(false)}>
                <Text style={styles.modalCloseButton}>Закрыть</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Индекс массы тела</Text>
              <View style={{ width: 60 }} />
            </View>
            
            <ScrollView
              contentContainerStyle={styles.modalScrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.bmiContainer}>
                <View style={styles.bmiValueContainer}>
                  <Text style={styles.bmiValue}>{bmi}</Text>
                  <Text style={[styles.bmiCategory, { color: getBMIColor(bmi) }]}>
                    {getBMICategory(bmi)}
                  </Text>
                </View>
                
                {renderBMIScale()}
                
                <View style={styles.bmiInfo}>
                  <Text style={styles.bmiInfoTitle}>Категории ИМТ:</Text>
                  <View style={styles.bmiInfoItem}>
                    <View style={[styles.bmiColorIndicator, { backgroundColor: 'rgb(244, 90, 0)' }]} />
                    <Text style={styles.bmiInfoText}>До 18.4 - Недостаток в весе</Text>
                  </View>
                  <View style={styles.bmiInfoItem}>
                    <View style={[styles.bmiColorIndicator, { backgroundColor: 'rgb(0, 255, 3)' }]} />
                    <Text style={styles.bmiInfoText}>18.5-24.9 - Нормальный вес тела</Text>
                  </View>
                  <View style={styles.bmiInfoItem}>
                    <View style={[styles.bmiColorIndicator, { backgroundColor: 'rgb(245, 181, 0)' }]} />
                    <Text style={styles.bmiInfoText}>25.0-29.9 - Избыточная масса тела</Text>
                  </View>
                  <View style={styles.bmiInfoItem}>
                    <View style={[styles.bmiColorIndicator, { backgroundColor: 'rgb(244, 131, 1)' }]} />
                    <Text style={styles.bmiInfoText}>30.1-34.9 - Ожирение (класс I)</Text>
                  </View>
                  <View style={styles.bmiInfoItem}>
                    <View style={[styles.bmiColorIndicator, { backgroundColor: 'rgb(244, 90, 0)' }]} />
                    <Text style={styles.bmiInfoText}>35.0-39.9 - Ожирение (класс II)</Text>
                  </View>
                  <View style={styles.bmiInfoItem}>
                    <View style={[styles.bmiColorIndicator, { backgroundColor: 'rgb(213, 59, 58)' }]} />
                    <Text style={styles.bmiInfoText}>Более 40.0 - Ожирение (класс III)</Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        </Modal>

        <Modal
          visible={showGoalModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowGoalModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowGoalModal(false)}>
                <Text style={styles.modalCloseButton}>Отмена</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Цель веса</Text>
              <TouchableOpacity onPress={handleSetGoal} disabled={!goalTarget}>
                <Text style={[styles.modalCloseButton, !goalTarget && { opacity: 0.5 }]}>Сохранить</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <View style={styles.goalTypeSelector}>
                <Text style={styles.sectionTitle}>Тип цели</Text>
                <View style={styles.genderSelector}>
                  <TouchableOpacity
                    style={[
                      styles.genderButton,
                      goalType === 'lose' && styles.genderButtonActive,
                    ]}
                    onPress={() => setGoalType('lose')}
                  >
                    <Text
                      style={[
                        styles.genderButtonText,
                        goalType === 'lose' && styles.genderButtonTextActive,
                      ]}
                    >
                      Потеря веса
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.genderButton,
                      goalType === 'gain' && styles.genderButtonActive,
                    ]}
                    onPress={() => setGoalType('gain')}
                  >
                    <Text
                      style={[
                        styles.genderButtonText,
                        goalType === 'gain' && styles.genderButtonTextActive,
                      ]}
                    >
                      Набор веса
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Целевой вес (кг)</Text>
                <TextInput
                  style={styles.input}
                  value={goalTarget}
                  onChangeText={setGoalTarget}
                  keyboardType="decimal-pad"
                  placeholder={profile ? `Текущий: ${profile.weight} кг` : "75"}
                  placeholderTextColor={Colors.dark.textTertiary}
                />
              </View>
            </View>
          </View>
        </Modal>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  editButton: {
    backgroundColor: Colors.dark.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  input: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.dark.text,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  genderSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 4,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  genderButtonActive: {
    backgroundColor: Colors.dark.primary,
  },
  genderButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.textSecondary,
  },
  genderButtonTextActive: {
    color: '#FFFFFF',
  },
  buttonContainer: {
    gap: 12,
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: Colors.dark.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  cancelButtonText: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '600',
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
  maxRepsContainer: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  maxRepsResult: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  maxRepsTest: {
    marginBottom: 16,
  },
  maxRepsDescription: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  maxRepsInput: {
    gap: 12,
  },
  testButton: {
    backgroundColor: Colors.dark.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  testButtonDisabled: {
    opacity: 0.5,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  weightTrackingContainer: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  weightDescription: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  weightInput: {
    gap: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  modalCloseButton: {
    fontSize: 16,
    color: Colors.dark.primary,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
  },
  modalScrollContent: {
    padding: 20,
    paddingBottom: 56,
    gap: 16,
  },
  weightChart: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 120,
    gap: 8,
    justifyContent: 'space-around',
  },
  weightBarContainer: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  weightBar: {
    width: 20,
    borderRadius: 4,
    minHeight: 20,
  },
  weightBarLabel: {
    fontSize: 10,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
  },
  weightBarValue: {
    fontSize: 12,
    color: Colors.dark.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  weightInputSection: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  bmiContainer: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  bmiValueContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  bmiValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  bmiCategory: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },
  bmiScale: {
    marginBottom: 24,
  },
  bmiScaleTrack: {
    height: 8,
    borderRadius: 4,
    position: 'relative',
    marginBottom: 8,
    overflow: 'hidden',
  },
  bmiGradientContainer: {
    flexDirection: 'row',
    height: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  bmiSegment: {
    height: '100%',
  },
  bmiIndicator: {
    position: 'absolute',
    top: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.dark.text,
    borderWidth: 2,
    borderColor: Colors.dark.background,
    transform: [{ translateX: -6 }],
  },
  bmiLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  bmiLabel: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  bmiCategories: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bmiCategoryText: {
    fontSize: 10,
    fontWeight: '600',
  },
  bmiInfo: {
    marginTop: 16,
  },
  bmiInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 12,
  },
  bmiInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bmiColorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  bmiInfoText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  expandableCard: {
    position: 'relative',
  },
  triangleArrow: {
    position: 'absolute',
    right: '50%',
    top: '50%',
    transform: [{ translateX: 8 }, { translateY: -8 }],
    backgroundColor: Colors.dark.primary + '20',
    borderRadius: 12,
    padding: 4,
  },
  googleAuthContainer: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  googleSignInButton: {
    backgroundColor: '#4285F4',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  googleSignInButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  googleUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  googleUserDetails: {
    flex: 1,
  },
  googleUserName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  googleUserEmail: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginBottom: 4,
  },
  syncStatus: {
    fontSize: 12,
    color: Colors.dark.success,
    fontWeight: '600',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.dark.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  signOutButtonText: {
    fontSize: 14,
    color: Colors.dark.text,
    fontWeight: '600',
  },
  weightCalendar: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  calendarArrow: {
    padding: 8,
  },
  calendarWeekDays: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  calendarWeekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: Colors.dark.textSecondary,
    paddingVertical: 8,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: `${100/7}%`,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 4,
  },
  calendarDayWithWeight: {
    backgroundColor: Colors.dark.success + '20',
    borderWidth: 1,
    borderColor: Colors.dark.success,
  },
  calendarDayText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  calendarDayTextWithWeight: {
    color: Colors.dark.text,
    fontWeight: '600',
  },
  calendarWeight: {
    fontSize: 10,
    color: Colors.dark.success,
    fontWeight: '600',
    marginTop: 2,
  },
  emptyChart: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    marginBottom: 20,
  },
  emptyChartText: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
  },
  goalProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalProgressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  goalProgressRight: {
    alignItems: 'flex-end',
  },
  goalProgressPercent: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  goalProgressLabel: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.background,
    borderRadius: 8,
    padding: 3,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  periodButtonActive: {
    backgroundColor: Colors.dark.primary,
  },
  periodButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.dark.textSecondary,
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
  },
  chartContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  yAxisLabels: {
    width: 50,
    justifyContent: 'space-between',
    paddingRight: 8,
  },
  yAxisLabel: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    textAlign: 'right',
  },
  chartArea: {
    flex: 1,
    position: 'relative',
  },
  chartBackground: {
    position: 'absolute',
    width: '100%',
    justifyContent: 'space-between',
  },
  gridLine: {
    height: 1,
    backgroundColor: Colors.dark.border,
    opacity: 0.3,
  },
  chartContent: {
    position: 'relative',
    width: '100%',
  },
  dataPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.dark.primary,
  },
  dataPointLabel: {
    position: 'absolute',
    backgroundColor: Colors.dark.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    width: 30,
    alignItems: 'center',
  },
  dataPointText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  chartLine: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  lineSegment: {
    position: 'absolute',
    height: 2,
    backgroundColor: Colors.dark.primary,
    transformOrigin: '0 50%',
  },
  xAxisLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 10,
  },
  xAxisLabel: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  goalSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  setGoalButton: {
    backgroundColor: Colors.dark.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  setGoalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  currentGoalInfo: {
    backgroundColor: Colors.dark.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  currentGoalText: {
    fontSize: 16,
    color: Colors.dark.text,
    fontWeight: '600',
    marginBottom: 8,
  },
  currentGoalProgress: {
    fontSize: 14,
    color: Colors.dark.primary,
    fontWeight: '600',
  },
  goalTypeSelector: {
    marginBottom: 20,
  },
});