import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const COLORS = {
  saffron: '#e07b39',
  cream: '#fdf6ec',
  earth: '#2d1f0f',
  muted: '#9b7a5a',
};

const CATEGORY_EMOJIS = {
  all: '🛒',
  vegetables: '🥬',
  grains: '🌾',
  livestock: '🐄',
  handmade: '🧶',
  tools: '🔧',
  dairy: '🥛',
  spices: '🌶️',
  services: '🛠️',
  other: '📦',
};

export default function CategoryChip({ categoryKey, label, selected, onPress }) {
  const emoji = CATEGORY_EMOJIS[categoryKey] || '📦';

  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.selectedChip]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.label, selected && styles.selectedLabel]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.cream,
    borderWidth: 1,
    borderColor: COLORS.muted + '40',
    marginRight: 8,
  },
  selectedChip: {
    backgroundColor: COLORS.saffron,
    borderColor: COLORS.saffron,
  },
  emoji: {
    fontSize: 14,
    marginRight: 4,
  },
  label: {
    fontSize: 13,
    color: COLORS.earth,
    fontWeight: '500',
  },
  selectedLabel: {
    color: '#fff',
  },
});
