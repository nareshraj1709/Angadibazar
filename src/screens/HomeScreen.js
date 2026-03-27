import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as Location from 'expo-location';
import { supabase } from '../lib/supabase';
import i18n, { getCurrentLanguage, setLanguage } from '../i18n';
import LanguageToggle from '../components/LanguageToggle';
import CategoryChip from '../components/CategoryChip';
import ListingCard from '../components/ListingCard';

const COLORS = {
  saffron: '#e07b39',
  deep: '#b5470f',
  cream: '#fdf6ec',
  earth: '#2d1f0f',
  muted: '#9b7a5a',
};

const CATEGORY_KEYS = [
  'all', 'vegetables', 'grains', 'livestock', 'handmade',
  'tools', 'dairy', 'spices', 'services', 'other',
];

const PAGE_SIZE = 20;

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export default function HomeScreen({ navigation }) {
  const [lang, setLang] = useState(getCurrentLanguage());
  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [userLocation, setUserLocation] = useState(null);

  const t = useCallback((key) => i18n.t(key), [lang]);

  useEffect(() => {
    (async () => {
      try {
        const { status: existing } = await Location.getForegroundPermissionsAsync();
        if (existing === 'granted') {
          const loc = await Location.getCurrentPositionAsync({});
          setUserLocation(loc.coords);
          return;
        }

        // Show rationale before requesting permission (Play Store requirement)
        Alert.alert(
          lang === 'te' ? 'స్థానం అనుమతి' : 'Location Permission',
          lang === 'te'
            ? 'మీ దగ్గర లిస్టింగులు చూపించడానికి మరియు అమ్మకందారుల దూరం లెక్కించడానికి AngadiBazarకి మీ స్థానం అవసరం. మీరు నిరాకరించినా యాప్ పని చేస్తుంది.'
            : 'AngadiBazar uses your location to show nearby listings and calculate distance to sellers. The app works without it if you decline.',
          [
            { text: lang === 'te' ? 'వద్దు' : 'Not Now', style: 'cancel' },
            {
              text: lang === 'te' ? 'అనుమతించు' : 'Allow',
              onPress: async () => {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                  const loc = await Location.getCurrentPositionAsync({});
                  setUserLocation(loc.coords);
                }
              },
            },
          ]
        );
      } catch (e) {
        // Location denied — proceed without distance
      }
    })();
  }, []);

  const fetchListings = useCallback(async (reset = false) => {
    const currentPage = reset ? 0 : page;
    const from = currentPage * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from('listings')
      .select('*, profiles!listings_seller_id_fkey(name)')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (category !== 'all') {
      query = query.eq('category', category);
    }

    if (search.trim()) {
      query = query.or(`title.ilike.%${search.trim()}%,title_te.ilike.%${search.trim()}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Fetch error:', error);
      return;
    }

    const items = (data || []).map((item) => ({
      ...item,
      seller_name: item.profiles?.name || 'Seller',
    }));

    if (reset) {
      setListings(items);
      setPage(1);
    } else {
      setListings((prev) => [...prev, ...items]);
      setPage(currentPage + 1);
    }
    setHasMore(items.length === PAGE_SIZE);
  }, [page, category, search]);

  useEffect(() => {
    setLoading(true);
    fetchListings(true).finally(() => setLoading(false));
  }, [category, search]);

  // Refresh on navigation focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchListings(true);
    });
    return unsubscribe;
  }, [navigation, fetchListings]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchListings(true);
    setRefreshing(false);
  };

  const onEndReached = () => {
    if (hasMore && !loading) {
      fetchListings(false);
    }
  };

  const handleLangToggle = async (newLang) => {
    await setLanguage(newLang);
    setLang(newLang);
  };

  const getItemDistance = (item) => {
    if (!userLocation || !item.lat || !item.lng) return null;
    return getDistance(userLocation.latitude, userLocation.longitude, item.lat, item.lng);
  };

  const renderItem = ({ item }) => (
    <ListingCard
      item={item}
      lang={lang}
      distance={getItemDistance(item)}
      onPress={() => navigation.navigate('ListingDetail', { listing: item })}
    />
  );

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyEmoji}>🏪</Text>
        <Text style={styles.emptyText}>{t('noListings')}</Text>
        <Text style={styles.emptySubtext}>{t('beFirst')}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.logo}>🏪 {t('appName')}</Text>
        </View>
        <LanguageToggle currentLang={lang} onToggle={handleLangToggle} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={t('search')}
          placeholderTextColor={COLORS.muted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryRow}
      >
        {CATEGORY_KEYS.map((key) => (
          <CategoryChip
            key={key}
            categoryKey={key}
            label={i18n.t(`categories.${key}`)}
            selected={category === key}
            onPress={() => setCategory(key)}
          />
        ))}
      </ScrollView>

      {/* Listings */}
      {loading && listings.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.saffron} />
        </View>
      ) : (
        <FlatList
          data={listings}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.saffron]}
              tintColor={COLORS.saffron}
            />
          }
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={renderEmpty}
          getItemLayout={(data, index) => ({
            length: 132,
            offset: 132 * index,
            index,
          })}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 52,
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: '#fff',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.deep,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  searchInput: {
    backgroundColor: COLORS.cream,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.earth,
    borderWidth: 1,
    borderColor: COLORS.muted + '20',
  },
  categoryRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  list: {
    paddingTop: 4,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.earth,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 4,
  },
});
