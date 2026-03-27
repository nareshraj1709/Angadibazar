import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

const COLORS = {
  saffron: '#e07b39',
  cream: '#fdf6ec',
  earth: '#2d1f0f',
  muted: '#9b7a5a',
};

export default function LanguageToggle({ currentLang, onToggle }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.option, currentLang === 'en' && styles.active]}
        onPress={() => onToggle('en')}
      >
        <Text style={[styles.text, currentLang === 'en' && styles.activeText]}>
          EN
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.option, currentLang === 'te' && styles.active]}
        onPress={() => onToggle('te')}
      >
        <Text style={[styles.text, currentLang === 'te' && styles.activeText]}>
          తె
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.cream,
    borderRadius: 20,
    padding: 2,
    borderWidth: 1,
    borderColor: COLORS.saffron,
  },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
  },
  active: {
    backgroundColor: COLORS.saffron,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.muted,
  },
  activeText: {
    color: '#fff',
  },
});
