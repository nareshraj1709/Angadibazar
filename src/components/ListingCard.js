import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';

const COLORS = {
  saffron: '#e07b39',
  deep: '#b5470f',
  gold: '#f5a623',
  cream: '#fdf6ec',
  earth: '#2d1f0f',
  muted: '#9b7a5a',
  green: '#25d366',
};

const CATEGORY_EMOJIS = {
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

export default function ListingCard({ item, lang, onPress, distance }) {
  const title = lang === 'te' && item.title_te ? item.title_te : item.title;
  const hasPhotos = item.photos && item.photos.length > 0;
  const emoji = CATEGORY_EMOJIS[item.category] || '📦';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.imageContainer}>
        {hasPhotos ? (
          <Image
            source={{ uri: item.photos[0] }}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderEmoji}>{emoji}</Text>
          </View>
        )}
        {hasPhotos && item.photos.length > 1 && (
          <View style={styles.photoBadge}>
            <Text style={styles.photoBadgeText}>📷 {item.photos.length}</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>

        <Text style={styles.price}>
          ₹{item.price}
          <Text style={styles.unit}>/{item.unit}</Text>
        </Text>

        <View style={styles.meta}>
          <Text style={styles.seller} numberOfLines={1}>
            {item.seller_name || 'Seller'}
          </Text>
          <Text style={styles.village} numberOfLines={1}>
            📍 {item.village}
            {distance != null ? ` · ${distance} km` : ''}
          </Text>
        </View>

        {item.negotiate && (
          <View style={styles.negotiateTag}>
            <Text style={styles.negotiateText}>Negotiable</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: {
    width: 110,
    height: 120,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: {
    fontSize: 36,
  },
  photoBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  photoBadgeText: {
    color: '#fff',
    fontSize: 11,
  },
  info: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.earth,
    marginBottom: 4,
  },
  price: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.deep,
    marginBottom: 4,
  },
  unit: {
    fontSize: 13,
    fontWeight: '400',
    color: COLORS.muted,
  },
  meta: {
    marginBottom: 4,
  },
  seller: {
    fontSize: 12,
    color: COLORS.muted,
  },
  village: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 1,
  },
  negotiateTag: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.gold + '25',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  negotiateText: {
    fontSize: 11,
    color: COLORS.deep,
    fontWeight: '600',
  },
});
