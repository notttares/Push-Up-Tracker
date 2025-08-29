import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Modal, Dimensions } from 'react-native';
import { useWorkout } from '@/hooks/workout-store';
import StatsCard from '@/components/StatsCard';
import Colors from '@/constants/colors';
import { UserProfile } from '@/types/workout';
import { ChevronRight, ChevronLeft, ChevronUp } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const { profile, saveProfile, updateMaxReps, getUserPercentile, addWeightEntry, getWeightProgress } = useWorkout();
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
  const [currentMonth, setCurrentMonth] = useState(new Date());

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

  const renderWeightCalendar = () => {
    const { weights } = useWorkout();
    
    const getDaysInMonth = (date: Date) => {
      return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };
    
    const getFirstDayOfMonth = (date: Date) => {
      return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };
    
    const getWeightForDate = (day: number) => {
      const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return weights.find(w => w.date === dateStr);
    };
    
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.calendarDay} />);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const weightEntry = getWeightForDate(day);
      days.push(
        <View key={day} style={[styles.calendarDay, weightEntry && styles.calendarDayWithWeight]}>
          <Text style={[styles.calendarDayText, weightEntry && styles.calendarDayTextWithWeight]}>
            {day}
          </Text>
          {weightEntry && (
            <Text style={styles.calendarWeight}>{weightEntry.weight}</Text>
          )}
        </View>
      );
    }
    
    const monthNames = [
      'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    
    return (
      <View style={styles.weightCalendar}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity
            onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            style={styles.calendarArrow}
          >
            <ChevronLeft size={24} color={Colors.dark.primary} />
          </TouchableOpacity>
          <Text style={styles.calendarTitle}>
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </Text>
          <TouchableOpacity
            onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            style={styles.calendarArrow}
          >
            <ChevronRight size={24} color={Colors.dark.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.calendarWeekDays}>
          {['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'].map(day => (
            <Text key={day} style={styles.calendarWeekDay}>{day}</Text>
          ))}
        </View>
        
        <View style={styles.calendarGrid}>
          {days}
        </View>
      </View>
    );
  };

  if (isEditing) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>
            {profile ? 'Редактировать профиль' : 'Создать профиль'}
          </Text>

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
            
            <ScrollView style={styles.modalContent}>
              {renderWeightCalendar()}
              
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
                    onPress={() => {
                      handleWeightUpdate();
                      setShowWeightModal(false);
                    }}
                    disabled={!weightInput}
                  >
                    <Text style={styles.testButtonText}>Добавить</Text>
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
            
            <ScrollView style={styles.modalContent}>
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
    padding: 20,
  },
  weightChart: {
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
});