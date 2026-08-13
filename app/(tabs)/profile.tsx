import React, { useEffect, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import Header from '../../components/header';

const COLORS = {
  blue: '#C7D3DB',
  taupe: '#A79A8A',
  cream: '#FCF7DF',
  chocolate: '#3E3630',
};

export default function Profile() {
  const [nickname, setNickname] = useState('');
  const [backgroundUrl, setBackgroundUrl] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [favoriteMedia, setFavoriteMedia] = useState('');
  const [favoriteGenres, setFavoriteGenres] = useState('');
  const [favoriteDirector, setFavoriteDirector] = useState('');
  const [about, setAbout] = useState('');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          nickname,
          background_url,
          profile_picture_url,
          favorite_media,
          favorite_genres,
          favorite_director,
          about
        `)
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.log('Profile loading error:', error);
      }

      if (data) {
        setNickname(data.nickname ?? '');
        setBackgroundUrl(data.background_url ?? '');
        setProfilePictureUrl(data.profile_picture_url ?? '');
        setFavoriteMedia(data.favorite_media ?? '');
        setFavoriteGenres(data.favorite_genres ?? '');
        setFavoriteDirector(data.favorite_director ?? '');
        setAbout(data.about ?? '');
      }
    } finally {
      setLoading(false);
    }
  }

  async function chooseImage(type: 'background' | 'profile') {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Photo permission needed',
        'Please allow photo access so you can choose a picture.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: type === 'profile' ? [1, 1] : [16, 7],
      quality: 0.85,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    await uploadImage(result.assets[0].uri, type);
  }

  async function uploadImage(uri: string, type: 'background' | 'profile') {
    try {
      setUploading(true);

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert('Not signed in', 'Please sign in again.');
        return;
      }

      const response = await fetch(uri);
      const arrayBuffer = await response.arrayBuffer();

      const bucket = type === 'background'
        ? 'profile-backgrounds'
        : 'profile-pictures';

      const prefix = type === 'background' ? 'background' : 'profile';
      const filePath = `${user.id}/${prefix}-${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (uploadError) {
        Alert.alert('Couldn\'t upload photo', uploadError.message);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      if (type === 'background') {
        setBackgroundUrl(`${publicUrl}?t=${Date.now()}`);
      } else {
        setProfilePictureUrl(`${publicUrl}?t=${Date.now()}`);
      }
    } catch (error) {
      console.log(error);
      Alert.alert(
        'Couldn\'t upload photo',
        'Something went wrong while uploading your picture.'
      );
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    try {
      setSaving(true);

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert('Not signed in', 'Please sign in again.');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          nickname: nickname.trim() || null,
          background_url: backgroundUrl || null,
          profile_picture_url: profilePictureUrl || null,
          favorite_media: favoriteMedia.trim() || null,
          favorite_genres: favoriteGenres.trim() || null,
          favorite_director: favoriteDirector.trim() || null,
          about: about.trim() || null,
        });

      if (error) {
        Alert.alert('Couldn\'t update', error.message);
        return;
      }

      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  function confirmLogout() {
    Alert.alert(
      'log out?',
      'are you sure you want to logout?',
      [
        { text: 'cancel', style: 'cancel' },
        { text: 'yes', style: 'destructive', onPress: logout },
      ]
    );
  }

  async function logout() {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        Alert.alert('Couldn\'t log out', error.message);
        return;
      }

      router.replace('/auth');
    } catch (error) {
      console.log('Logout error:', error);
      Alert.alert('Couldn\'t log out', 'Something went wrong while logging out.');
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingPage}>
        <ActivityIndicator size="small" color={COLORS.taupe} />
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <Header />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.hero}>
          {backgroundUrl ? (
            <Image
              source={{ uri: backgroundUrl }}
              style={styles.backgroundImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.emptyBackground}>
              <Text style={styles.emptyBackgroundText}>
                your little corner
              </Text>
            </View>
          )}

          <View style={styles.heroOverlay} />

          <View style={styles.avatarWrapper}>
            {profilePictureUrl ? (
              <Image
                source={{ uri: profilePictureUrl }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {nickname ? nickname.slice(0, 1).toUpperCase() : 'F'}
                </Text>
              </View>
            )}

            {editing && (
              <Pressable
                style={styles.profilePhotoButton}
                onPress={() => chooseImage('profile')}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color={COLORS.cream} />
                ) : (
                  <Text style={styles.profilePhotoButtonText}>+</Text>
                )}
              </Pressable>
            )}
          </View>

          {editing && (
            <Pressable
              style={styles.changePhoto}
              onPress={() => chooseImage('background')}
              disabled={uploading}
            >
              <Text style={styles.changePhotoText}>
                {uploading ? 'uploading...' : 'change background'}
              </Text>
            </Pressable>
          )}
        </View>

        <Text style={styles.nickname}>
          {nickname || 'new viewer'}
        </Text>

        <Text style={styles.subheading}>
          your little cinema archive
        </Text>

        {editing ? (
          <View style={styles.form}>
            <View>
              <Text style={styles.label}>nickname</Text>
              <TextInput
                style={styles.input}
                value={nickname}
                onChangeText={setNickname}
                placeholder="what should we call you?"
                placeholderTextColor={COLORS.taupe}
              />
            </View>

            <View>
              <Text style={styles.label}>favorite media</Text>
              <TextInput
                style={styles.input}
                value={favoriteMedia}
                onChangeText={setFavoriteMedia}
                placeholder="your all-time favorite movie, series, film, etc."
                placeholderTextColor={COLORS.taupe}
              />
            </View>

            <View>
              <Text style={styles.label}>favorite genres</Text>
              <TextInput
                style={styles.input}
                value={favoriteGenres}
                onChangeText={setFavoriteGenres}
                placeholder="e.g. horror, romance, sci-fi"
                placeholderTextColor={COLORS.taupe}
              />
            </View>

            <View>
              <Text style={styles.label}>favorite director</Text>
              <TextInput
                style={styles.input}
                value={favoriteDirector}
                onChangeText={setFavoriteDirector}
                placeholder="who makes your favorites?"
                placeholderTextColor={COLORS.taupe}
              />
            </View>

            <View>
              <Text style={styles.label}>about your taste</Text>
              <TextInput
                style={[styles.input, styles.aboutInput]}
                value={about}
                onChangeText={setAbout}
                placeholder="tell us a little about what you love watching..."
                placeholderTextColor={COLORS.taupe}
                multiline
                textAlignVertical="top"
              />
            </View>

            <Pressable
              style={[
                styles.saveButton,
                (saving || uploading) && styles.disabled,
              ]}
              onPress={save}
              disabled={saving || uploading}
            >
              {saving ? (
                <ActivityIndicator size="small" color={COLORS.cream} />
              ) : (
                <Text style={styles.saveButtonText}>save profile</Text>
              )}
            </Pressable>

            <Pressable
              style={styles.cancelButton}
              onPress={() => {
                setEditing(false);
                loadProfile();
              }}
              disabled={saving || uploading}
            >
              <Text style={styles.cancelButtonText}>cancel</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Pressable style={styles.editButton} onPress={() => setEditing(true)}>
              <Text style={styles.editButtonText}>edit profile</Text>
            </Pressable>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>my media taste</Text>
              <Text style={styles.sectionSubtitle}>
                a few things about what i love
              </Text>
            </View>

            <View style={styles.tasteCard}>
              <View style={styles.tasteRow}>
                <View style={styles.tasteIcon}>
                  <Text style={styles.tasteIconText}>★</Text>
                </View>
                <View style={styles.tasteInfo}>
                  <Text style={styles.tasteLabel}>favorite media</Text>
                  <Text style={styles.tasteValue}>
                    {favoriteMedia || 'not added yet'}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.tasteRow}>
                <View style={styles.tasteIcon}>
                  <Text style={styles.tasteIconText}>♡</Text>
                </View>
                <View style={styles.tasteInfo}>
                  <Text style={styles.tasteLabel}>favorite genres</Text>
                  <Text style={styles.tasteValue}>
                    {favoriteGenres || 'not added yet'}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.tasteRow}>
                <View style={styles.tasteIcon}>
                  <Text style={styles.tasteIconText}>🎞</Text>
                </View>
                <View style={styles.tasteInfo}>
                  <Text style={styles.tasteLabel}>favorite director</Text>
                  <Text style={styles.tasteValue}>
                    {favoriteDirector || 'not added yet'}
                  </Text>
                </View>
              </View>
            </View>

            {about ? (
              <View style={styles.aboutCard}>
                <Text style={styles.aboutLabel}>about my taste</Text>
                <Text style={styles.aboutText}>{about}</Text>
              </View>
            ) : null}
          </>
        )}

        <Pressable
          style={styles.logout}
          onPress={confirmLogout}
          disabled={saving || uploading}
        >
          <Text style={styles.logoutText}>log out</Text>
        </Pressable>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },

  loadingPage: {
    flex: 1,
    backgroundColor: COLORS.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 140,
  },

  hero: {
    height: 190,
    borderRadius: 28,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: COLORS.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },

  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },

  emptyBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.blue,
  },

  emptyBackgroundText: {
    fontFamily: 'BeVietnamProItalic',
    color: COLORS.chocolate,
    fontSize: 12,
    opacity: 0.7,
  },

  heroOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(62,54,48,0.10)',
  },

  avatarWrapper: {
    position: 'relative',
  },

  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: COLORS.cream,
    borderWidth: 4,
    borderColor: 'rgba(252,247,223,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.chocolate,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 7,
    elevation: 4,
  },

  avatarImage: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 4,
    borderColor: COLORS.cream,
    backgroundColor: COLORS.cream,
  },

  avatarText: {
    fontFamily: 'BeVietnamProBold',
    fontSize: 30,
    color: COLORS.chocolate,
  },

  profilePhotoButton: {
    position: 'absolute',
    right: -3,
    bottom: -3,
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: COLORS.chocolate,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.cream,
  },

  profilePhotoButtonText: {
    color: COLORS.cream,
    fontFamily: 'BeVietnamProBold',
    fontSize: 17,
    lineHeight: 19,
  },

  changePhoto: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: COLORS.cream,
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },

  changePhotoText: {
    fontFamily: 'BeVietnamProBold',
    fontSize: 10,
    color: COLORS.chocolate,
  },

  nickname: {
    fontFamily: 'BeVietnamProBold',
    fontSize: 25,
    color: COLORS.chocolate,
    textAlign: 'center',
    marginTop: 18,
  },

  subheading: {
    fontFamily: 'BeVietnamProItalic',
    fontSize: 11,
    color: COLORS.taupe,
    textAlign: 'center',
    marginTop: 3,
    marginBottom: 20,
  },

  editButton: {
    height: 50,
    backgroundColor: COLORS.blue,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  editButtonText: {
    fontFamily: 'BeVietnamProBold',
    fontSize: 12,
    color: COLORS.chocolate,
  },

  sectionHeader: {
    marginTop: 30,
    marginBottom: 12,
    paddingHorizontal: 4,
  },

  sectionTitle: {
    fontFamily: 'BeVietnamProBold',
    fontSize: 17,
    color: COLORS.chocolate,
  },

  sectionSubtitle: {
    fontFamily: 'BeVietnamProItalic',
    fontSize: 10,
    color: COLORS.taupe,
    marginTop: 2,
  },

  tasteCard: {
    backgroundColor: COLORS.blue,
    borderRadius: 22,
    paddingHorizontal: 17,
    paddingVertical: 5,
  },

  tasteRow: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
  },

  tasteIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.cream,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  tasteIconText: {
    fontSize: 15,
    color: COLORS.chocolate,
  },

  tasteInfo: {
    flex: 1,
  },

  tasteLabel: {
    fontFamily: 'BeVietnamProBold',
    fontSize: 9,
    color: COLORS.taupe,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  tasteValue: {
    fontFamily: 'BeVietnamProRegular',
    fontSize: 13,
    color: COLORS.chocolate,
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: 'rgba(62,54,48,0.10)',
  },

  aboutCard: {
    marginTop: 14,
    backgroundColor: COLORS.chocolate,
    borderRadius: 22,
    padding: 18,
  },

  aboutLabel: {
    fontFamily: 'BeVietnamProBold',
    fontSize: 9,
    color: COLORS.blue,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },

  aboutText: {
    fontFamily: 'BeVietnamProItalic',
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.cream,
    marginTop: 7,
  },

  form: {
    gap: 13,
  },

  label: {
    fontFamily: 'BeVietnamProBold',
    fontSize: 10,
    color: COLORS.chocolate,
    marginLeft: 5,
    marginBottom: 6,
  },

  input: {
    height: 52,
    backgroundColor: COLORS.blue,
    borderRadius: 15,
    paddingHorizontal: 16,
    fontFamily: 'BeVietnamProRegular',
    fontSize: 13,
    color: COLORS.chocolate,
  },

  aboutInput: {
    height: 105,
    paddingTop: 15,
    paddingBottom: 15,
  },

  saveButton: {
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.chocolate,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },

  saveButtonText: {
    fontFamily: 'BeVietnamProBold',
    fontSize: 12,
    color: COLORS.cream,
  },

  cancelButton: {
    alignItems: 'center',
    paddingVertical: 9,
  },

  cancelButtonText: {
    fontFamily: 'BeVietnamProRegular',
    fontSize: 11,
    color: COLORS.taupe,
  },

  disabled: {
    opacity: 0.6,
  },

  logout: {
    alignItems: 'center',
    paddingVertical: 18,
    marginTop: 20,
  },

  logoutText: {
    fontFamily: 'BeVietnamProRegular',
    fontSize: 11,
    color: COLORS.taupe,
  },

  bottomSpace: {
    height: 35,
  },
});