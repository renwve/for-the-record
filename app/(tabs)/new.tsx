import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { MEDIA_TYPES } from '../../lib/types';
import Header from '../../components/header';

const COLORS = {
  blue: '#C7D3DB',
  taupe: '#A79A8A',
  cream: '#FCF7DF',
  chocolate: '#3E3630',
};

export default function New() {
  const [title, setTitle] = useState('');
  const [actors, setActors] = useState('');
  const [release, setRelease] = useState('');
  const [type, setType] = useState('Movie');
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);

  async function pickImage() {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'photo permission needed',
          'please allow photo access so you can add a cover image.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [2, 3],
        quality: 0.85,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const selectedImage = result.assets[0];
      await uploadImage(selectedImage.uri);
    } catch (error) {
      console.log('Image picker error:', error);
      Alert.alert(
        'couldn\'t choose image',
        'something went wrong while choosing your picture.'
      );
    }
  }

  async function uploadImage(uri: string) {
    try {
      setUploading(true);

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert('not signed in', 'please sign in again.');
        return;
      }

      const response = await fetch(uri);
      const arrayBuffer = await response.arrayBuffer();

      const filePath = `${user.id}/media-${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('media-images')
        .upload(filePath, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (uploadError) {
        Alert.alert('couldn\'t upload image', uploadError.message);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('media-images')
        .getPublicUrl(filePath);

      setImageUrl(publicUrl);
    } catch (error) {
      console.log('Image upload error:', error);
      Alert.alert(
        'couldn\'t upload image',
        'something went wrong while uploading your picture.'
      );
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    if (!title.trim()) {
      Alert.alert('missing title', 'give your record a name.');
      return;
    }

    try {
      setBusy(true);

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert('not signed in', 'please sign in again.');
        return;
      }

      const { error } = await supabase
        .from('media')
        .insert({
          user_id: user.id,
          title: title.trim(),
          actors: actors.trim() || null,
          release_date: release.trim() || null,
          media_type: type,
          rating: rating,
          notes: notes.trim() || null,
          image_url: imageUrl || null,
        });

      if (error) {
        Alert.alert('couldn\'t save', error.message);
        return;
      }

      router.replace('/(tabs)');
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.page}>
      <Header />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.imageSection}>
          <Text style={styles.label}>cover image</Text>

          {imageUrl ? (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: imageUrl }}
                style={styles.coverImage}
                resizeMode="cover"
              />
              <View style={styles.imageBottom}>
                <Pressable
                  onPress={pickImage}
                  style={styles.changeImageButton}
                  disabled={uploading}
                >
                  <Text style={styles.changeImageText}>
                    {uploading ? 'uploading...' : 'change image'}
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable
              style={styles.addImageBox}
              onPress={pickImage}
              disabled={uploading}
            >
              <View style={styles.plusCircle}>
                {uploading ? (
                  <ActivityIndicator size="small" color={COLORS.chocolate} />
                ) : (
                  <Text style={styles.plusText}>+</Text>
                )}
              </View>
              <Text style={styles.addImageTitle}>
                {uploading ? 'adding image...' : 'add an image'}
              </Text>
              <Text style={styles.addImageSubtitle}>
                tap here to choose a poster, still, or photo
              </Text>
            </Pressable>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>title</Text>
          <TextInput
            placeholder="movie / series name"
            placeholderTextColor={COLORS.taupe}
            value={title}
            onChangeText={setTitle}
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>cast</Text>
          <TextInput
            placeholder="actors (optional)"
            placeholderTextColor={COLORS.taupe}
            value={actors}
            onChangeText={setActors}
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>release date</Text>
          <TextInput
            placeholder="YYYY-MM-DD"
            placeholderTextColor={COLORS.taupe}
            value={release}
            onChangeText={setRelease}
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>kind of media</Text>
          <View style={styles.wrap}>
            {MEDIA_TYPES.map((item) => (
              <Pressable
                key={item}
                onPress={() => setType(item)}
                style={[
                  styles.chip,
                  type === item && styles.chipSelected,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    type === item && styles.chipTextSelected,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.ratingSection}>
          <Text style={styles.label}>your rating</Text>
          <Text style={styles.ratingHint}>how much did you like it?</Text>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((number) => (
              <Pressable
                key={number}
                onPress={() => setRating(number)}
                hitSlop={6}
              >
                <Text
                  style={[
                    styles.star,
                    number <= rating && styles.starSelected,
                  ]}
                >
                  {number <= rating ? '★' : '☆'}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.ratingNumber}>
            {rating === 0 ? 'not rated yet' : `${rating} / 5`}
          </Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>your thoughts</Text>
          <TextInput
            placeholder="thoughts, feelings, tiny review..."
            placeholderTextColor={COLORS.taupe}
            multiline
            value={notes}
            onChangeText={setNotes}
            style={[styles.input, styles.notes]}
            textAlignVertical="top"
          />
        </View>

        <Pressable
          onPress={save}
          disabled={busy || uploading}
          style={[
            styles.button,
            (busy || uploading) && styles.disabled,
          ]}
        >
          {busy ? (
            <ActivityIndicator size="small" color={COLORS.cream} />
          ) : (
            <Text style={styles.buttonText}>save record</Text>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 140,
  },

  imageSection: {
    marginBottom: 21,
  },

  addImageBox: {
    height: 250,
    borderRadius: 24,
    backgroundColor: COLORS.blue,
    borderWidth: 1.5,
    borderColor: 'rgba(62,54,48,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  plusCircle: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: COLORS.cream,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },

  plusText: {
    fontFamily: 'BeVietnamProRegular',
    fontSize: 30,
    color: COLORS.chocolate,
    marginTop: -2,
  },

  addImageTitle: {
    fontFamily: 'BeVietnamProBold',
    fontSize: 14,
    color: COLORS.chocolate,
  },

  addImageSubtitle: {
    fontFamily: 'BeVietnamProItalic',
    fontSize: 10,
    color: COLORS.taupe,
    textAlign: 'center',
    marginTop: 5,
  },

  imageContainer: {
    height: 300,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: COLORS.blue,
    position: 'relative',
  },

  coverImage: {
    width: '100%',
    height: '100%',
  },

  imageBottom: {
    position: 'absolute',
    bottom: 12,
    right: 12,
  },

  changeImageButton: {
    backgroundColor: COLORS.cream,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },

  changeImageText: {
    fontFamily: 'BeVietnamProBold',
    fontSize: 10,
    color: COLORS.chocolate,
  },

  field: {
    marginBottom: 14,
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

  notes: {
    height: 135,
    paddingTop: 15,
    paddingBottom: 15,
  },

  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  chip: {
    backgroundColor: COLORS.blue,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 17,
  },

  chipSelected: {
    backgroundColor: COLORS.chocolate,
  },

  chipText: {
    fontFamily: 'BeVietnamProRegular',
    fontSize: 11,
    color: COLORS.chocolate,
  },

  chipTextSelected: {
    fontFamily: 'BeVietnamProBold',
    color: COLORS.cream,
  },

  ratingSection: {
    backgroundColor: COLORS.blue,
    borderRadius: 20,
    padding: 17,
    marginTop: 3,
    marginBottom: 16,
  },

  ratingHint: {
    fontFamily: 'BeVietnamProItalic',
    fontSize: 9,
    color: COLORS.taupe,
    marginLeft: 5,
    marginTop: -3,
  },

  stars: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
    marginTop: 8,
  },

  star: {
    fontSize: 36,
    color: COLORS.taupe,
    lineHeight: 40,
  },

  starSelected: {
    color: COLORS.chocolate,
  },

  ratingNumber: {
    fontFamily: 'BeVietnamProBold',
    fontSize: 10,
    color: COLORS.taupe,
    textAlign: 'center',
    marginTop: 3,
  },

  button: {
    height: 54,
    borderRadius: 17,
    backgroundColor: COLORS.chocolate,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },

  buttonText: {
    fontFamily: 'BeVietnamProBold',
    fontSize: 12,
    color: COLORS.cream,
  },

  disabled: {
    opacity: 0.65,
  },
});