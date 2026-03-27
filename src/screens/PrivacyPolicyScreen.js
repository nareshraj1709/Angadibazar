import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

const COLORS = {
  saffron: '#e07b39',
  deep: '#b5470f',
  cream: '#fdf6ec',
  earth: '#2d1f0f',
  muted: '#9b7a5a',
};

export default function PrivacyPolicyScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 50 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.updated}>Last updated: March 2026</Text>

        <Text style={styles.sectionTitle}>1. Information We Collect</Text>
        <Text style={styles.body}>
          AngadiBazar ("we", "our", "us") collects the following information when you use our app:{'\n\n'}
          <Text style={styles.bold}>Account Information:</Text> Phone number (for authentication via OTP), display name, and village name.{'\n\n'}
          <Text style={styles.bold}>Listing Data:</Text> Product titles, descriptions, prices, categories, and photos you upload when creating listings.{'\n\n'}
          <Text style={styles.bold}>Location Data:</Text> With your permission, we collect your approximate location to show nearby listings and calculate distances. You can deny location permission and still use the app without distance features.{'\n\n'}
          <Text style={styles.bold}>Device Information:</Text> We may collect device type and OS version for crash reporting and performance monitoring.
        </Text>

        <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
        <Text style={styles.body}>
          • To authenticate your identity via phone OTP{'\n'}
          • To display your listings to other users{'\n'}
          • To show nearby listings based on your location{'\n'}
          • To enable buyer-seller communication via WhatsApp{'\n'}
          • To improve app performance and fix bugs
        </Text>

        <Text style={styles.sectionTitle}>3. Data Sharing</Text>
        <Text style={styles.body}>
          We do not sell your personal data. Your listing information (title, price, village, photos) is visible to other app users. Your phone number is shared only when a buyer initiates WhatsApp contact for a listing.{'\n\n'}
          We use Supabase as our backend provider, which stores data securely with encryption at rest and in transit.
        </Text>

        <Text style={styles.sectionTitle}>4. Data Storage & Security</Text>
        <Text style={styles.body}>
          Your data is stored securely on Supabase servers. We use industry-standard encryption for data in transit (TLS) and at rest. Authentication tokens are stored securely on your device.
        </Text>

        <Text style={styles.sectionTitle}>5. Your Rights</Text>
        <Text style={styles.body}>
          You have the right to:{'\n'}
          • Access your personal data through the Profile screen{'\n'}
          • Edit your name and village at any time{'\n'}
          • Delete individual listings at any time{'\n'}
          • Delete your entire account and all associated data{'\n'}
          • Deny location and camera permissions
        </Text>

        <Text style={styles.sectionTitle}>6. Account Deletion</Text>
        <Text style={styles.body}>
          You can delete your account at any time from the Profile screen. This permanently removes your profile, all listings, and all uploaded photos. This action cannot be undone.
        </Text>

        <Text style={styles.sectionTitle}>7. Children's Privacy</Text>
        <Text style={styles.body}>
          AngadiBazar is not intended for children under 13. We do not knowingly collect personal information from children under 13.
        </Text>

        <Text style={styles.sectionTitle}>8. Permissions Used</Text>
        <Text style={styles.body}>
          <Text style={styles.bold}>Location (ACCESS_FINE_LOCATION, ACCESS_COARSE_LOCATION):</Text> To show listings near you and calculate distance to sellers. Optional — the app works without it.{'\n\n'}
          <Text style={styles.bold}>Camera (CAMERA):</Text> To take photos of items you want to sell. Only accessed when you tap the photo button on the sell screen.{'\n\n'}
          <Text style={styles.bold}>Photos (READ_MEDIA_IMAGES):</Text> To select existing photos from your gallery for listings. Only accessed when you choose to add photos.
        </Text>

        <Text style={styles.sectionTitle}>9. Changes to This Policy</Text>
        <Text style={styles.body}>
          We may update this policy from time to time. We will notify users of significant changes through the app.
        </Text>

        <Text style={styles.sectionTitle}>10. Contact Us</Text>
        <Text style={styles.body}>
          For questions about this privacy policy or your data, contact us at:{'\n'}
          Email: privacy@angadibazar.com{'\n'}
          Address: Andhra Pradesh, India
        </Text>

        <View style={{ height: 40 }} />
      </ScrollView>
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
    paddingBottom: 12,
    backgroundColor: '#fff',
  },
  back: {
    fontSize: 16,
    color: COLORS.saffron,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.earth,
  },
  content: {
    padding: 20,
  },
  updated: {
    fontSize: 13,
    color: COLORS.muted,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.earth,
    marginTop: 20,
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.earth,
  },
  bold: {
    fontWeight: '700',
  },
});
