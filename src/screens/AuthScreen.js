import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { supabase } from '../lib/supabase';
import i18n, { setLanguage, getCurrentLanguage } from '../i18n';
import LanguageToggle from '../components/LanguageToggle';

const COLORS = {
  saffron: '#e07b39',
  deep: '#b5470f',
  gold: '#f5a623',
  cream: '#fdf6ec',
  earth: '#2d1f0f',
  muted: '#9b7a5a',
};

export default function AuthScreen({ navigation }) {
  const [lang, setLang] = useState(getCurrentLanguage());
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [name, setName] = useState('');
  const [village, setVillage] = useState('');
  const [loading, setLoading] = useState(false);

  const t = useCallback((key) => i18n.t(key), [lang]);

  const handleLangToggle = async (newLang) => {
    await setLanguage(newLang);
    setLang(newLang);
  };

  const sendOTP = async () => {
    if (phone.length < 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: `+91${phone}`,
      });
      if (error) throw error;
      setOtpSent(true);
    } catch (error) {
      Alert.alert('Error', error.message || t('somethingWrong'));
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (otp.length !== 6) {
      Alert.alert('Error', t('invalidOTP'));
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: `+91${phone}`,
        token: otp,
        type: 'sms',
      });
      if (error) throw error;

      // Check if profile exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profile) {
        navigation.replace('MainTabs');
      } else {
        setShowProfile(true);
      }
    } catch (error) {
      Alert.alert('Error', error.message || t('invalidOTP'));
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!name.trim() || !village.trim()) {
      Alert.alert('Error', t('required'));
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('profiles').insert({
        id: user.id,
        phone: `+91${phone}`,
        name: name.trim(),
        village: village.trim(),
      });
      if (error) throw error;
      navigation.replace('MainTabs');
    } catch (error) {
      Alert.alert('Error', error.message || t('somethingWrong'));
    } finally {
      setLoading(false);
    }
  };

  if (showProfile) {
    return (
      <View style={styles.container}>
        <View style={styles.langRow}>
          <LanguageToggle currentLang={lang} onToggle={handleLangToggle} />
        </View>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.emoji}>👋</Text>
          <Text style={styles.heading}>
            {lang === 'te' ? 'మీ గురించి చెప్పండి' : 'Tell us about you'}
          </Text>

          <Text style={styles.label}>
            {lang === 'te' ? 'మీ పేరు' : 'Your Name'}
          </Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder={lang === 'te' ? 'పేరు' : 'Name'}
            placeholderTextColor={COLORS.muted}
          />

          <Text style={styles.label}>{t('location')}</Text>
          <TextInput
            style={styles.input}
            value={village}
            onChangeText={setVillage}
            placeholder={lang === 'te' ? 'గ్రామం పేరు' : 'Village name'}
            placeholderTextColor={COLORS.muted}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={saveProfile}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? '...' : t('save')}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.langRow}>
        <LanguageToggle currentLang={lang} onToggle={handleLangToggle} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.emoji}>🏪</Text>
          <Text style={styles.logo}>{t('appName')}</Text>
          <Text style={styles.tagline}>{t('tagline')}</Text>

          <Text style={styles.label}>{t('signIn')}</Text>
          <View style={styles.phoneRow}>
            <View style={styles.prefix}>
              <Text style={styles.prefixText}>+91</Text>
            </View>
            <TextInput
              style={[styles.input, styles.phoneInput]}
              value={phone}
              onChangeText={setPhone}
              placeholder="9876543210"
              placeholderTextColor={COLORS.muted}
              keyboardType="phone-pad"
              maxLength={10}
              editable={!otpSent}
            />
          </View>

          {!otpSent ? (
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={sendOTP}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? '...' : t('sendOTP')}
              </Text>
            </TouchableOpacity>
          ) : (
            <>
              <Text style={styles.label}>OTP</Text>
              <TextInput
                style={styles.input}
                value={otp}
                onChangeText={setOtp}
                placeholder="000000"
                placeholderTextColor={COLORS.muted}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
              />
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={verifyOTP}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? '...' : t('verify')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resend}
                onPress={() => {
                  setOtpSent(false);
                  setOtp('');
                }}
              >
                <Text style={styles.resendText}>
                  {lang === 'te' ? 'నంబర్ మార్చండి' : 'Change number'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  flex: {
    flex: 1,
  },
  langRow: {
    alignItems: 'flex-end',
    paddingTop: 56,
    paddingRight: 20,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 40,
  },
  emoji: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 8,
  },
  logo: {
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.deep,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 15,
    color: COLORS.muted,
    textAlign: 'center',
    marginBottom: 40,
    marginTop: 4,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.earth,
    textAlign: 'center',
    marginBottom: 28,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.earth,
    marginBottom: 8,
    marginTop: 16,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prefix: {
    backgroundColor: COLORS.saffron + '20',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.saffron + '40',
  },
  prefixText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.earth,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.earth,
    borderWidth: 1,
    borderColor: COLORS.muted + '30',
  },
  phoneInput: {
    flex: 1,
  },
  button: {
    backgroundColor: COLORS.saffron,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  resend: {
    alignItems: 'center',
    marginTop: 16,
  },
  resendText: {
    color: COLORS.saffron,
    fontSize: 14,
    fontWeight: '600',
  },
});
