import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { X } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface AddSetModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (reps: number) => void;
}

export default function AddSetModal({ visible, onClose, onAdd }: AddSetModalProps) {
  const [reps, setReps] = useState<string>('');

  const handleAdd = () => {
    const repsNumber = parseInt(reps);
    if (repsNumber > 0) {
      onAdd(repsNumber);
      setReps('');
      onClose();
    }
  };

  const handleClose = () => {
    setReps('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Добавить подход</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color={Colors.dark.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Количество отжиманий</Text>
          <TextInput
            style={styles.input}
            value={reps}
            onChangeText={setReps}
            keyboardType="numeric"
            placeholder="Введите количество"
            placeholderTextColor={Colors.dark.textTertiary}
            autoFocus
          />

          <TouchableOpacity
            style={[styles.addButton, !reps && styles.addButtonDisabled]}
            onPress={handleAdd}
            disabled={!reps}
          >
            <Text style={styles.addButtonText}>Добавить</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 20,
    padding: 24,
    margin: 20,
    minWidth: 300,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  closeButton: {
    padding: 4,
  },
  label: {
    fontSize: 16,
    color: Colors.dark.text,
    marginBottom: 12,
  },
  input: {
    backgroundColor: Colors.dark.surfaceSecondary,
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: Colors.dark.text,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  addButton: {
    backgroundColor: Colors.dark.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});