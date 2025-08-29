import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/colors';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
  horizontal?: boolean;
}

export default function StatsCard({ title, value, subtitle, color = Colors.dark.primary, horizontal = false }: StatsCardProps) {
  return (
    <View style={[styles.container, horizontal && styles.containerHorizontal]}>
      <View style={horizontal ? styles.textContainerHorizontal : styles.textContainer}>
        <Text style={[styles.title, horizontal && styles.titleHorizontal]}>{title}</Text>
        {subtitle && <Text style={[styles.subtitle, horizontal && styles.subtitleHorizontal]}>{subtitle}</Text>}
      </View>
      <Text style={[styles.value, { color }, horizontal && styles.valueHorizontal]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  containerHorizontal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 0,
    marginBottom: 12,
  },
  textContainer: {
    alignItems: 'center',
  },
  textContainerHorizontal: {
    flex: 1,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  titleHorizontal: {
    fontSize: 16,
    marginBottom: 4,
    textAlign: 'left',
  },
  value: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  valueHorizontal: {
    fontSize: 24,
    marginBottom: 0,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.dark.textTertiary,
    textAlign: 'center',
  },
  subtitleHorizontal: {
    fontSize: 12,
    textAlign: 'left',
  },
});