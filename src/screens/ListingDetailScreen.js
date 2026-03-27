import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Share,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { Image } from 'expo-image';
import i18n, { getCurrentLanguage } from '../i18n';

const COLORS = {
  saffron: '#e07b39',
  deep: '#b5470f',
  gold: '#f5a623',
  cream: '#fdf6ec',
  earth: '#2d1f0f',
  muted: '#9b7a5a',
  green: '#25d366',
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ListingDetailScreen({ route, navigation }) {
  const { listing } = route.params;
  const [lang] = useState(getCurrentLanguage());
  const [activePhoto, setActivePhoto] = useState(0);
  const scrollRef = useRef(null);

  const t = useCallback((key) => i18n.t(key), [lang]);
  const title = lang === 'te' && listing.title_te ? listing.title_te : listing.title;
  const hasPhotos = listing.photos && listing.photos.length > 0;

  const openWhatsApp = () => {
    const phone = listing.phone?.replace(/\D/g, '') || '';
    const message =
      lang === 'te'
        ? `నమస్కారం, మీరు AngadiBazarలో పెట్టిన ${title} ₹${listing.price}కి ఇంకా అందుబాటులో ఉందా?`
        : `Hi, I saw your listing for ${title} at ₹${listing.price} on AngadiBazar. Is it still available?`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    Linking.openURL(url);
  };

  const onShare = async () => {
    try {
      await Share.share({
        message: `${title} - ₹${listing.price}/${listing.unit} on AngadiBazar! ${t('shareMessage')}`,
      });
    } catch (e) {
      // ignore
    }
  };

  const onScroll = (event) => {
    const slide = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActivePhoto(slide);
  };

  const memberDate = listing.created_at
    ? new Date(listing.created_at).toLocaleDateString(lang === 'te' ? 'te-IN' : 'en-IN', {
        year: 'numeric',
        month: 'short',
      })
    : '';

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Photo Gallery */}
        {hasPhotos ? (
          <View>
            <ScrollView
              ref={scrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={onScroll}
              scrollEventThrottle={16}
            >
              {listing.photos.map((uri, idx) => (
                <Image
                  key={idx}
                  source={{ uri }}
                  style={styles.photo}
                  contentFit="cover"
                  transition={200}
                />
              ))}
            </ScrollView>
            {listing.photos.length > 1 && (
              <View style={styles.dots}>
                {listing.photos.map((_, idx) => (
                  <View
                    key={idx}
                    style={[styles.dot, idx === activePhoto && styles.dotActive]}
                  />
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.noPhoto}>
            <Text style={styles.noPhotoEmoji}>📦</Text>
          </View>
        )}

        {/* Back button */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>

          <Text style={styles.price}>
            ₹{listing.price}
            <Text style={styles.unit}>/{listing.unit}</Text>
          </Text>

          <View style={styles.tags}>
            <View style={styles.categoryTag}>
              <Text style={styles.categoryText}>
                {i18n.t(`categories.${listing.category}`) || listing.category}
              </Text>
            </View>
            {listing.negotiate && (
              <View style={styles.negotiateTag}>
                <Text style={styles.negotiateText}>{t('negotiate')}</Text>
              </View>
            )}
          </View>

          {/* Seller info */}
          <View style={styles.sellerCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(listing.seller_name || 'S').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.sellerInfo}>
              <Text style={styles.sellerName}>
                {listing.seller_name || 'Seller'}
              </Text>
              <Text style={styles.sellerVillage}>
                📍 {listing.village}
              </Text>
              {memberDate ? (
                <Text style={styles.memberSince}>
                  {t('memberSince')} {memberDate}
                </Text>
              ) : null}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.shareButton} onPress={onShare}>
          <Text style={styles.shareText}>↗ Share</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.whatsappButton} onPress={openWhatsApp}>
          <Text style={styles.whatsappText}>{t('interested')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  photo: {
    width: SCREEN_WIDTH,
    height: 300,
  },
  noPhoto: {
    width: SCREEN_WIDTH,
    height: 220,
    backgroundColor: COLORS.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noPhotoEmoji: {
    fontSize: 64,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: -24,
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 3,
  },
  dotActive: {
    backgroundColor: '#fff',
    width: 20,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.earth,
    marginBottom: 8,
  },
  price: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.deep,
    marginBottom: 12,
  },
  unit: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.muted,
  },
  tags: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  categoryTag: {
    backgroundColor: COLORS.saffron + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
  },
  categoryText: {
    color: COLORS.deep,
    fontSize: 13,
    fontWeight: '600',
  },
  negotiateTag: {
    backgroundColor: COLORS.gold + '25',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  negotiateText: {
    color: COLORS.deep,
    fontSize: 13,
    fontWeight: '600',
  },
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cream,
    padding: 16,
    borderRadius: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.saffron,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  sellerInfo: {
    flex: 1,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.earth,
  },
  sellerVillage: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 2,
  },
  memberSince: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 2,
  },
  bottomBar: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: COLORS.muted + '20',
  },
  shareButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.saffron,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginRight: 10,
  },
  shareText: {
    color: COLORS.saffron,
    fontWeight: '700',
    fontSize: 16,
  },
  whatsappButton: {
    flex: 2,
    backgroundColor: COLORS.green,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  whatsappText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
