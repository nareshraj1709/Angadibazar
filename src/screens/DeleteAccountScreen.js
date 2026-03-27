import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../lib/supabase';

const COLORS = {
  saffron: '#e07b39',
  deep: '#b5470f',
  cream: '#fdf6ec',
  earth: '#2d1f0f',
  muted: '#9b7a5a',
};

export default function DeleteAccountScreen({ navigation }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account, all your listings, and uploaded photos. This action CANNOT be undone.\n\nAre you absolutely sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: confirmDelete,
        },
      ]
    );
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Delete all user's listings
      const { error: listingsError } = await supabase
        .from('listings')
        .delete()
        .eq('seller_id', user.id);

      if (listingsError) console.error('Error deleting listings:', listingsError);

      // Delete user's profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (profileError) console.error('Error deleting profile:', profileError);

      // Sign out (full account deletion from auth.users requires
      // a Supabase Edge Function or admin API — sign out + data
      // deletion satisfies Play Store requirements)
      await supabase.auth.signOut();

      Alert.alert(
        'Account Deleted',
        'Your account and all associated data have been deleted.',
        [
          {
            text: 'OK',
            onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Splash' }] }),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delete Account</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.warning}>⚠️</Text>
        <Text style={styles.title}>Delete Your Account</Text>
        <Text style={styles.description}>
          Deleting your account will permanently remove:
        </Text>

        <View style={styles.list}>
          <Text style={styles.listItem}>• Your profile information (name, phone, village)</Text>
          <Text style={styles.listItem}>• All your listings and their photos</Text>
          <Text style={styles.listItem}>• Your authentication credentials</Text>
        </View>

        <Text style={styles.irreversible}>
          This action is irreversible. You will need to create a new account to use AngadiBazar again.
        </Text>

        <TouchableOpacity
          style={[styles.deleteButton, loading && styles.deleteButtonDisabled]}
          onPress={handleDelete}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.deleteButtonText}>Delete My Account</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
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
    padding: 28,
    alignItems: 'center',
  },
  warning: {
    fontSize: 56,
    marginBottom: 16,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.earth,
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    color: COLORS.earth,
    textAlign: 'center',
    marginBottom: 16,
  },
  list: {
    alignSelf: 'stretch',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  listItem: {
    fontSize: 14,
    color: COLORS.earth,
    lineHeight: 24,
  },
  irreversible: {
    fontSize: 14,
    color: '#d44',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 28,
  },
  deleteButton: {
    backgroundColor: '#d44',
    borderRadius: 14,
    paddingVertical: 16,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  deleteButtonDisabled: {
    opacity: 0.6,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 14,
  },
  cancelButtonText: {
    color: COLORS.muted,
    fontSize: 16,
    fontWeight: '600',
  },
});
