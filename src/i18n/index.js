import { I18n } from 'i18n-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './en';
import te from './te';

const i18n = new I18n({ en, te });
i18n.defaultLocale = 'en';
i18n.locale = 'en';
i18n.enableFallback = true;

const LANG_KEY = '@angadibazar_lang';

export const loadLanguage = async () => {
  try {
    const lang = await AsyncStorage.getItem(LANG_KEY);
    if (lang) {
      i18n.locale = lang;
    }
  } catch (e) {
    // fallback to English
  }
  return i18n.locale;
};

export const setLanguage = async (lang) => {
  i18n.locale = lang;
  try {
    await AsyncStorage.setItem(LANG_KEY, lang);
  } catch (e) {
    // ignore
  }
};

export const getCurrentLanguage = () => i18n.locale;

export default i18n;
