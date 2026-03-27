import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Switch,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../lib/supabase';
import i18n, { getCurrentLanguage, setLanguage } from '../i18n';
import LanguageToggle from '../components/LanguageToggle';

const COLORS = {
  saffron: '#e07b39',
  deep: '#b5470f',
  gold: '#f5a623',
  cream: '#fdf6ec',
  earth: '#2d1f0f',
  muted: '#9b7a5a',
};

export default function ProfileScreen({ navigation }) {
  const [lang, setLang] = useState(getCurrentLanguage());
  const [profile, setProfile] = useState(null);
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editVillage, setEditVillage] = useState('');

  const t = useCallback((key) => i18n.t(key), [lang]);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setEditName(profileData.name);
        setEditVillage(profileData.village);
      }

      const { data: listingsData } = await supabase
        .from('listings')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      setMyListings(listingsData || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchProfile);
    return unsubscribe;
  }, [navigation]);

  const handleLangToggle = async (newLang) => {
    await setLanguage(newLang);
    setLang(newLang);
  };

  const saveProfile = async () => {
    if (!editName.trim() || !editVillage.trim()) {
      Alert.alert('', t('required'));
      return;
    }
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name: editName.trim(), village: editVillage.trim() })
        .eq('id', profile.id);
      if (error) throw error;
      setProfile({ ...profile, name: editName.trim(), village: editVillage.trim() });
      setEditing(false);
    } catch (e) {
      Alert.alert('Error', e.message || t('somethingWrong'));
    }
  };

  const toggleListingActive = async (listingId, currentActive) => {
    try {
      const { error } = await supabase
        .from('listings')
        .update({ active: !currentActive })
        .eq('id', listingId);
      if (error) throw error;
      setMyListings((prev) =>
        prev.map((l) => (l.id === listingId ? { ...l, active: !currentActive } : l))
      );
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const deleteListing = (listingId) => {
    Alert.alert(t('delete'), t('signOutConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            const { error } = await supabase.from('listings').delete().eq('id', listingId);
            if (error) throw error;
            setMyListings((prev) => prev.filter((l) => l.id !== listingId));
          } catch (e) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  };

  const signOut = () => {
    Alert.alert(t('signOut'), t('signOutConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('signOut'),
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          navigation.reset({ index: 0, routes: [{ name: 'Splash' }] });
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.saffron} />
      </View>
    );
  }

  const memberDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString(lang === 'te' ? 'te-IN' : 'en-IN', {
        year: 'numeric',
        month: 'long',
      })
    : '';

  const renderListingItem = ({ item }) => {
    const title = lang === 'te' && item.title_te ? item.title_te : item.title;
    return (
      <View style={styles.listingItem}>
        <View style={styles.listingInfo}>
          <Text style={styles.listingTitle} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.listingPrice}>
            ₹{item.price}/{item.unit}
          </Text>
        </View>
        <View style={styles.listingActions}>
          <Switch
            value={item.active}
            onValueChange={() => toggleListingActive(item.id, item.active)}
            trackColor={{ false: COLORS.muted + '40', true: COLORS.saffron + '80' }}
            thumbColor={item.active ? COLORS.saffron : '#f4f3f4'}
            style={styles.switch}
          />
          <TouchableOpacity onPress={() => deleteListing(item.id)}>
            <Text style={styles.deleteText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('profile')}</Text>
        <LanguageToggle currentLang={lang} onToggle={handleLangToggle} />
      </View>

      <FlatList
        data={myListings}
        keyExtractor={(item) => item.id}
        renderItem={renderListingItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* Profile card */}
            <View style={styles.profileCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(profile?.name || 'U').charAt(0).toUpperCase()}
                </Text>
              </View>

              {editing ? (
                <View style={styles.editForm}>
                  <TextInput
                    style={styles.editInput}
                    value={editName}
                    onChangeText={setEditName}
                    placeholder="Name"
                    placeholderTextColor={COLORS.muted}
                  />
                  <TextInput
                    style={styles.editInput}
                    value={editVillage}
                    onChangeText={setEditVillage}
                    placeholder="Village"
                    placeholderTextColor={COLORS.muted}
                  />
                  <View style={styles.editButtons}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => {
                        setEditing(false);
                        setEditName(profile.name);
                        setEditVillage(profile.village);
                      }}
                    >
                      <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
                      <Text style={styles.saveButtonText}>{t('save')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>{profile?.name}</Text>
                  <Text style={styles.profileVillage}>📍 {profile?.village}</Text>
                  {memberDate ? (
                    <Text style={styles.profileDate}>
                      {t('memberSince')} {memberDate}
                    </Text>
                  ) : null}
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => setEditing(true)}
                  >
                    <Text style={styles.editButtonText}>{t('editProfile')}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* My Listings header */}
            <Text style={styles.sectionTitle}>{t('myListings')}</Text>
          </>
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>{t('noListings')}</Text>
        }
        ListFooterComponent={
          <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
            <Text style={styles.signOutText}>{t('signOut')}</Text>
          </TouchableOpacity>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.cream,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.deep,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.saffron,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.earth,
  },
  profileVillage: {
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 4,
  },
  profileDate: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 4,
  },
  editButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  editButtonText: {
    color: COLORS.saffron,
    fontSize: 14,
    fontWeight: '600',
  },
  editForm: {
    flex: 1,
  },
  editInput: {
    backgroundColor: COLORS.cream,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.earth,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.muted + '30',
  },
  editButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.muted,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.muted,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: COLORS.saffron,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.earth,
    marginBottom: 12,
  },
  listingItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  listingInfo: {
    flex: 1,
    marginRight: 12,
  },
  listingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.earth,
  },
  listingPrice: {
    fontSize: 14,
    color: COLORS.deep,
    fontWeight: '600',
    marginTop: 2,
  },
  listingActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  switch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  deleteText: {
    fontSize: 18,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.muted,
    fontSize: 15,
    paddingVertical: 20,
  },
  signOutButton: {
    marginTop: 24,
    borderWidth: 1.5,
    borderColor: '#d44',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  signOutText: {
    color: '#d44',
    fontSize: 16,
    fontWeight: '700',
  },
});
