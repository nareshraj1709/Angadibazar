import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { supabase } from '../lib/supabase';
import i18n, { loadLanguage } from '../i18n';

const COLORS = {
  saffron: '#e07b39',
  deep: '#b5470f',
  cream: '#fdf6ec',
  earth: '#2d1f0f',
  muted: '#9b7a5a',
};

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const init = async () => {
      await loadLanguage();

      // Wait at least 2 seconds for branding
      await new Promise((r) => setTimeout(r, 2000));

      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        navigation.replace('MainTabs');
      } else {
        navigation.replace('Auth');
      }
    };

    init();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🏪</Text>
      <Text style={styles.logo}>AngadiBazar</Text>
      <Text style={styles.logoTe}>అంగడిబజార్</Text>
      <Text style={styles.tagline}>Your Village Shop, Online</Text>
      <Text style={styles.taglineTe}>మీ గ్రామ అంగడి, ఆన్‌లైన్‌లో</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  logo: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.deep,
    letterSpacing: 1,
  },
  logoTe: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.saffron,
    marginTop: 2,
  },
  tagline: {
    fontSize: 16,
    color: COLORS.muted,
    marginTop: 16,
  },
  taglineTe: {
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 4,
  },
});
