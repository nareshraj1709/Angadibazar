import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import i18n, { getCurrentLanguage } from '../i18n';

const COLORS = {
  saffron: '#e07b39',
  deep: '#b5470f',
  gold: '#f5a623',
  cream: '#fdf6ec',
  earth: '#2d1f0f',
  muted: '#9b7a5a',
};

const UNITS = ['kg', 'litre', 'piece', 'dozen', 'bundle', 'day', 'hour'];

const CATEGORY_KEYS = [
  'vegetables', 'grains', 'livestock', 'handmade',
  'tools', 'dairy', 'spices', 'services', 'other',
];

export default function SellScreen({ navigation }) {
  const [lang] = useState(getCurrentLanguage());
  const t = useCallback((key) => i18n.t(key), [lang]);

  const [photos, setPhotos] = useState([]);
  const [title, setTitle] = useState('');
  const [titleTe, setTitleTe] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('kg');
  const [category, setCategory] = useState('');
  const [negotiate, setNegotiate] = useState(false);
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('');
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    if (photos.length >= 4) {
      Alert.alert('', t('selectPhotos'));
      return;
    }

    // Check existing permission first
    const { status: existing } = await ImagePicker.getMediaLibraryPermissionsAsync();
    if (existing !== 'granted') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          lang === 'te' ? 'అనుమతి అవసరం' : 'Permission Required',
          lang === 'te'
            ? 'మీ లిస్టింగ్‌కి ఫోటోలు జోడించడానికి ఫోటో లైబ్రరీ యాక్సెస్ అవసరం. దయచేసి సెట్టింగ్స్‌లో అనుమతించండి.'
            : 'Photo library access is needed to add images to your listing. Please enable it in Settings.',
        );
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotos((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const removePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadPhotos = async () => {
    const urls = [];
    for (const uri of photos) {
      const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
      const response = await fetch(uri);
      const blob = await response.blob();

      const { data, error } = await supabase.storage
        .from('listings')
        .upload(filename, blob, { contentType: 'image/jpeg' });

      if (error) {
        console.error('Upload error:', error);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from('listings')
        .getPublicUrl(filename);

      if (urlData?.publicUrl) {
        urls.push(urlData.publicUrl);
      }
    }
    return urls;
  };

  const validate = () => {
    if (!title.trim()) return t('itemName') + ' - ' + t('required');
    if (title.trim().length > 60) return t('maxChars');
    if (!price.trim() || isNaN(Number(price))) return t('price') + ' - ' + t('required');
    if (!category) return t('category') + ' - ' + t('required');
    if (!village.trim()) return t('location') + ' - ' + t('required');
    return null;
  };

  const postListing = async () => {
    const err = validate();
    if (err) {
      Alert.alert('', err);
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('phone')
        .eq('id', user.id)
        .single();

      let photoUrls = [];
      if (photos.length > 0) {
        photoUrls = await uploadPhotos();
      }

      const { error } = await supabase.from('listings').insert({
        seller_id: user.id,
        title: title.trim(),
        title_te: titleTe.trim() || null,
        price: Number(price),
        unit,
        category,
        village: village.trim(),
        district: district.trim() || null,
        negotiate,
        photos: photoUrls,
        phone: profile?.phone || '',
        active: true,
      });

      if (error) throw error;

      Alert.alert('✅', t('listingPosted'));
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Error', error.message || t('somethingWrong'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.heading}>{t('listItem')}</Text>

      {/* Photos */}
      <Text style={styles.label}>{t('photos')}</Text>
      <View style={styles.photoRow}>
        {[0, 1, 2, 3].map((idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.photoSlot}
            onPress={photos[idx] ? () => removePhoto(idx) : pickImage}
          >
            {photos[idx] ? (
              <View style={styles.photoWrapper}>
                <Image source={{ uri: photos[idx] }} style={styles.photoImage} contentFit="cover" />
                <View style={styles.removeIcon}>
                  <Text style={styles.removeText}>✕</Text>
                </View>
                {idx === 0 && (
                  <View style={styles.mainBadge}>
                    <Text style={styles.mainBadgeText}>{t('mainPhoto')}</Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.addPhoto}>
                <Text style={styles.addPhotoIcon}>+</Text>
                <Text style={styles.addPhotoText}>📷</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Title */}
      <Text style={styles.label}>{t('itemName')}</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder={t('itemName')}
        placeholderTextColor={COLORS.muted}
        maxLength={60}
      />
      <Text style={styles.charCount}>{title.length}/60</Text>

      {/* Title Telugu */}
      <Text style={styles.label}>{t('itemNameTE')}</Text>
      <TextInput
        style={styles.input}
        value={titleTe}
        onChangeText={setTitleTe}
        placeholder={t('itemNameTE')}
        placeholderTextColor={COLORS.muted}
        maxLength={60}
      />

      {/* Price */}
      <Text style={styles.label}>{t('price')}</Text>
      <View style={styles.priceRow}>
        <View style={styles.rupee}>
          <Text style={styles.rupeeText}>₹</Text>
        </View>
        <TextInput
          style={[styles.input, styles.priceInput]}
          value={price}
          onChangeText={setPrice}
          placeholder="0"
          placeholderTextColor={COLORS.muted}
          keyboardType="numeric"
        />
      </View>

      {/* Unit */}
      <Text style={styles.label}>{t('unit')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        {UNITS.map((u) => (
          <TouchableOpacity
            key={u}
            style={[styles.chip, unit === u && styles.chipSelected]}
            onPress={() => setUnit(u)}
          >
            <Text style={[styles.chipText, unit === u && styles.chipTextSelected]}>
              {u}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Category */}
      <Text style={styles.label}>{t('category')}</Text>
      <View style={styles.categoryGrid}>
        {CATEGORY_KEYS.map((key) => (
          <TouchableOpacity
            key={key}
            style={[styles.chip, category === key && styles.chipSelected]}
            onPress={() => setCategory(key)}
          >
            <Text style={[styles.chipText, category === key && styles.chipTextSelected]}>
              {i18n.t(`categories.${key}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Negotiate */}
      <View style={styles.toggleRow}>
        <Text style={styles.label}>{t('negotiable')}</Text>
        <Switch
          value={negotiate}
          onValueChange={setNegotiate}
          trackColor={{ false: COLORS.muted + '40', true: COLORS.saffron + '80' }}
          thumbColor={negotiate ? COLORS.saffron : '#f4f3f4'}
        />
      </View>

      {/* Village */}
      <Text style={styles.label}>{t('location')}</Text>
      <TextInput
        style={styles.input}
        value={village}
        onChangeText={setVillage}
        placeholder={t('location')}
        placeholderTextColor={COLORS.muted}
      />

      {/* District */}
      <Text style={styles.label}>{t('district')}</Text>
      <TextInput
        style={styles.input}
        value={district}
        onChangeText={setDistrict}
        placeholder={t('district')}
        placeholderTextColor={COLORS.muted}
      />

      {/* Post button */}
      <TouchableOpacity
        style={[styles.postButton, loading && styles.postButtonDisabled]}
        onPress={postListing}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.postButtonText}>{t('postListing')}</Text>
        )}
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  content: {
    padding: 20,
    paddingTop: 56,
  },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.deep,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.earth,
    marginBottom: 8,
    marginTop: 16,
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
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 4,
  },
  photoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  photoSlot: {
    width: '23%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  photoWrapper: {
    flex: 1,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  removeIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  mainBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.saffron,
    paddingVertical: 2,
    alignItems: 'center',
  },
  mainBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '600',
  },
  addPhoto: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.muted + '30',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoIcon: {
    fontSize: 24,
    color: COLORS.muted,
  },
  addPhotoText: {
    fontSize: 14,
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rupee: {
    backgroundColor: COLORS.saffron + '20',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.saffron + '40',
  },
  rupeeText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.deep,
  },
  priceInput: {
    flex: 1,
  },
  chipScroll: {
    flexDirection: 'row',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.muted + '40',
    marginRight: 8,
    marginBottom: 4,
  },
  chipSelected: {
    backgroundColor: COLORS.saffron,
    borderColor: COLORS.saffron,
  },
  chipText: {
    fontSize: 13,
    color: COLORS.earth,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#fff',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  postButton: {
    backgroundColor: COLORS.saffron,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 28,
  },
  postButtonDisabled: {
    opacity: 0.6,
  },
  postButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
