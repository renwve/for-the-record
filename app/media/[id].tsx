import React, { useEffect, useState } from 'react';
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
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase';
import { MEDIA_TYPES, Media } from '../../lib/types';
import Header from '../../components/header';

const COLORS = {
  blue: '#C7D3DB',
  taupe: '#A79A8A',
  cream: '#FCF7DF',
  chocolate: '#3E3630',
};

const MEDIA_BUCKET = 'media';

export default function MediaDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [media, setMedia] = useState<Media | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    loadMedia();
  }, [id]);

  async function loadMedia() {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        Alert.alert('Couldn\'t load record', error.message);
        router.back();
        return;
      }

      setMedia(data);
    } finally {
      setLoading(false);
    }
  }

  function updateMedia(key: keyof Media, value: any) {
    if (!media) return;
    setMedia({ ...media, [key]: value });
  }

  async function pickImage() {
    if (!media) return;

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Photo access needed',
          'Please allow photo access so you can change the cover image.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.85,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      setUploadingImage(true);

      const response = await fetch(asset.uri);
      const blob = await response.blob();
      const fileExt = asset.fileName?.split('.').pop() || 'jpg';
      const fileName = `${media.id}-${Date.now()}.${fileExt}`;
      const filePath = `${media.id}/${fileName}`;

      const { error: uploadError } = await supabase
        .storage
        .from(MEDIA_BUCKET)
        .upload(filePath, blob, {
          contentType: asset.mimeType || 'image/jpeg',
          upsert: true,
        });

      if (uploadError) {
        Alert.alert('Couldn\'t upload image', uploadError.message);
        return;
      }

      const { data: publicUrlData } = supabase
        .storage
        .from(MEDIA_BUCKET)
        .getPublicUrl(filePath);

      const imageUrl = publicUrlData.publicUrl;
      updateMedia('image_url' as keyof Media, imageUrl);
    } catch (error: any) {
      Alert.alert(
        'Couldn\'t change image',
        error?.message || 'Something went wrong while selecting the image.'
      );
    } finally {
      setUploadingImage(false);
    }
  }

  async function saveChanges() {
    if (!media) return;

    if (!media.title?.trim()) {
      Alert.alert('Missing title', 'Your record needs a title.');
      return;
    }

    try {
      setBusy(true);

      const { error } = await supabase
        .from('media')
        .update({
          title: media.title.trim(),
          actors: media.actors?.trim() || null,
          release_date: media.release_date?.trim() || null,
          media_type: media.media_type,
          rating: Number(media.rating ?? 0),
          notes: media.notes?.trim() || null,
          image_url: (media as any).image_url || null,
        })
        .eq('id', media.id);

      if (error) {
        Alert.alert('Couldn\'t save', error.message);
        return;
      }

      setEditing(false);
      await loadMedia();
    } finally {
      setBusy(false);
    }
  }

  function confirmDelete() {
    Alert.alert(
      'delete this record?',
      'this cannot be undone.',
      [
        { text: 'cancel', style: 'cancel' },
        { text: 'delete', style: 'destructive', onPress: deleteMedia },
      ]
    );
  }

  async function deleteMedia() {
    if (!media) return;

    try {
      setBusy(true);

      const { error } = await supabase
        .from('media')
        .delete()
        .eq('id', media.id);

      if (error) {
        Alert.alert('Couldn\'t delete', error.message);
        return;
      }

      router.replace('/(tabs)');
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingPage}>
        <ActivityIndicator size="small" color={COLORS.taupe} />
      </View>
    );
  }

  if (!media) {
    return (
      <View style={styles.loadingPage}>
        <Text style={styles.errorText}>record not found</Text>
      </View>
    );
  }

  const rating = Number(media.rating ?? 0);
  const imageUrl = (media as any).image_url;

  if (editing) {
    return (
      <View style={styles.page}>
        <Header />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <Pressable onPress={() => setEditing(false)} style={styles.backButton}>
            <Text style={styles.backText}>‹ cancel editing</Text>
          </Pressable>

          <Pressable
            onPress={pickImage}
            disabled={uploadingImage || busy}
            style={styles.editImage}
          >
            {imageUrl ? (
              <Image
                source={{ uri: imageUrl }}
                style={styles.poster}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.emptyPoster}>
                <Text style={styles.emptyPosterText}>no cover image</Text>
              </View>
            )}

            <View style={styles.imageOverlay}>
              {uploadingImage ? (
                <ActivityIndicator size="small" color={COLORS.cream} />
              ) : (
                <>
                  <View style={styles.cameraCircle}>
                    <Text style={styles.cameraIcon}>✎</Text>
                  </View>
                  <Text style={styles.changeImageText}>change image</Text>
                </>
              )}
            </View>
          </Pressable>

          <View style={styles.field}>
            <Text style={styles.label}>title</Text>
            <TextInput
              style={styles.input}
              value={media.title}
              onChangeText={(value) => updateMedia('title', value)}
              placeholder="movie / series name"
              placeholderTextColor={COLORS.taupe}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>cast</Text>
            <TextInput
              style={styles.input}
              value={media.actors ?? ''}
              onChangeText={(value) => updateMedia('actors', value)}
              placeholder="actors"
              placeholderTextColor={COLORS.taupe}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>release date</Text>
            <TextInput
              style={styles.input}
              value={media.release_date ?? ''}
              onChangeText={(value) => updateMedia('release_date', value)}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={COLORS.taupe}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>kind of media</Text>
            <View style={styles.wrap}>
              {MEDIA_TYPES.map((item) => (
                <Pressable
                  key={item}
                  onPress={() => updateMedia('media_type', item)}
                  style={[
                    styles.chip,
                    media.media_type === item && styles.chipSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      media.media_type === item && styles.chipTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.ratingBox}>
            <Text style={styles.label}>your rating</Text>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((number) => (
                <Pressable key={number} onPress={() => updateMedia('rating', number)}>
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
              style={[styles.input, styles.notes]}
              value={media.notes ?? ''}
              onChangeText={(value) => updateMedia('notes', value)}
              placeholder="thoughts, feelings, tiny review..."
              placeholderTextColor={COLORS.taupe}
              multiline
              textAlignVertical="top"
            />
          </View>

          <Pressable
            style={[
              styles.saveButton,
              (busy || uploadingImage) && styles.disabled,
            ]}
            onPress={saveChanges}
            disabled={busy || uploadingImage}
          >
            {busy ? (
              <ActivityIndicator size="small" color={COLORS.cream} />
            ) : (
              <Text style={styles.saveButtonText}>save changes</Text>
            )}
          </Pressable>

          <Pressable style={styles.deleteButton} onPress={confirmDelete} disabled={busy}>
            <Text style={styles.deleteText}>delete record</Text>
          </Pressable>

          <View style={styles.bottomSpace} />
        </ScrollView>
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
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>‹ back</Text>
        </Pressable>

        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.heroPoster}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.heroPosterEmpty}>
            <Text style={styles.heroPosterEmptyText}>no cover</Text>
          </View>
        )}

        <Text style={styles.title}>{media.title}</Text>

        <View style={styles.typePill}>
          <Text style={styles.typePillText}>{media.media_type}</Text>
        </View>

        <View style={styles.viewRating}>
          <View style={styles.viewStars}>
            {[1, 2, 3, 4, 5].map((number) => (
              <Text
                key={number}
                style={[
                  styles.viewStar,
                  number <= rating && styles.viewStarFilled,
                ]}
              >
                {number <= rating ? '★' : '☆'}
              </Text>
            ))}
          </View>
          <Text style={styles.viewRatingNumber}>{rating}/5</Text>
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>about this record</Text>

          {media.actors ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>cast</Text>
              <Text style={styles.detailValue}>{media.actors}</Text>
            </View>
          ) : null}

          {media.release_date ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>released</Text>
              <Text style={styles.detailValue}>{media.release_date}</Text>
            </View>
          ) : null}

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>media</Text>
            <Text style={styles.detailValue}>{media.media_type}</Text>
          </View>
        </View>

        <View style={styles.thoughtsCard}>
          <Text style={styles.sectionTitle}>your thoughts</Text>
          {media.notes ? (
            <Text style={styles.notesText}>{media.notes}</Text>
          ) : (
            <Text style={styles.noNotes}>
              you didn't leave any thoughts for this one yet.
            </Text>
          )}
        </View>

        <View style={styles.actions}>
          <Pressable style={styles.editButton} onPress={() => setEditing(true)}>
            <Text style={styles.editButtonText}>edit record</Text>
          </Pressable>

          <Pressable style={styles.deleteButton} onPress={confirmDelete}>
            <Text style={styles.deleteText}>delete record</Text>
          </Pressable>
        </View>

        <Text style={styles.footer}>part of your little media archive ♡</Text>

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

  errorText: {
    fontFamily: 'BeVietnamProRegular',
    color: COLORS.taupe,
    fontSize: 12,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 140,
  },

  backButton: {
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },

  backText: {
    fontFamily: 'BeVietnamProRegular',
    color: COLORS.taupe,
    fontSize: 12,
  },

  heroPoster: {
    width: '100%',
    height: 390,
    borderRadius: 26,
    marginTop: 8,
    backgroundColor: COLORS.blue,
  },

  heroPosterEmpty: {
    width: '100%',
    height: 390,
    borderRadius: 26,
    marginTop: 8,
    backgroundColor: COLORS.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroPosterEmptyText: {
    fontFamily: 'BeVietnamProItalic',
    fontSize: 12,
    color: COLORS.taupe,
  },

  title: {
    fontFamily: 'BeVietnamProBold',
    fontSize: 31,
    color: COLORS.chocolate,
    marginTop: 20,
    letterSpacing: -0.7,
  },

  typePill: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.blue,
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 8,
  },

  typePillText: {
    fontFamily: 'BeVietnamProBold',
    fontSize: 10,
    color: COLORS.chocolate,
  },

  viewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 13,
    marginBottom: 20,
  },

  viewStars: {
    flexDirection: 'row',
    gap: 1,
  },

  viewStar: {
    fontSize: 23,
    color: COLORS.taupe,
  },

  viewStarFilled: {
    color: COLORS.chocolate,
  },

  viewRatingNumber: {
    fontFamily: 'BeVietnamProBold',
    fontSize: 11,
    color: COLORS.taupe,
    marginLeft: 9,
  },

  detailsCard: {
    backgroundColor: COLORS.blue,
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
  },

  sectionTitle: {
    fontFamily: 'BeVietnamProBold',
    fontSize: 12,
    color: COLORS.chocolate,
    marginBottom: 14,
  },

  detailRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(62,54,48,0.08)',
  },

  detailLabel: {
    width: 82,
    fontFamily: 'BeVietnamProBold',
    fontSize: 10,
    color: COLORS.taupe,
  },

  detailValue: {
    flex: 1,
    fontFamily: 'BeVietnamProRegular',
    fontSize: 11,
    color: COLORS.chocolate,
    lineHeight: 17,
  },

  thoughtsCard: {
    backgroundColor: '#F8F0D4',
    borderRadius: 22,
    padding: 18,
    marginBottom: 18,
  },

  notesText: {
    fontFamily: 'BeVietnamProRegular',
    fontSize: 13,
    color: COLORS.chocolate,
    lineHeight: 21,
  },

  noNotes: {
    fontFamily: 'BeVietnamProItalic',
    fontSize: 11,
    color: COLORS.taupe,
    lineHeight: 17,
  },

  actions: {
    gap: 8,
  },

  editButton: {
    height: 52,
    borderRadius: 17,
    backgroundColor: COLORS.chocolate,
    alignItems: 'center',
    justifyContent: 'center',
  },

  editButtonText: {
    fontFamily: 'BeVietnamProBold',
    fontSize: 12,
    color: COLORS.cream,
  },

  deleteButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },

  deleteText: {
    fontFamily: 'BeVietnamProRegular',
    fontSize: 11,
    color: COLORS.taupe,
  },

  footer: {
    fontFamily: 'BeVietnamProItalic',
    fontSize: 10,
    color: COLORS.taupe,
    textAlign: 'center',
    marginTop: 8,
  },

  editImage: {
    width: '100%',
    height: 280,
    borderRadius: 24,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 20,
    backgroundColor: COLORS.blue,
    position: 'relative',
  },

  poster: {
    width: '100%',
    height: '100%',
  },

  emptyPoster: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyPosterText: {
    fontFamily: 'BeVietnamProItalic',
    color: COLORS.taupe,
    fontSize: 11,
  },

  imageOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 72,
    backgroundColor: 'rgba(62,54,48,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  cameraCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.cream,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  cameraIcon: {
    fontFamily: 'BeVietnamProBold',
    fontSize: 15,
    color: COLORS.chocolate,
  },

  changeImageText: {
    fontFamily: 'BeVietnamProBold',
    fontSize: 11,
    color: COLORS.cream,
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
    height: 145,
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

  ratingBox: {
    backgroundColor: COLORS.blue,
    borderRadius: 20,
    padding: 17,
    marginBottom: 16,
  },

  stars: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
    marginTop: 5,
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

  saveButton: {
    height: 54,
    borderRadius: 17,
    backgroundColor: COLORS.chocolate,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
  },

  saveButtonText: {
    fontFamily: 'BeVietnamProBold',
    fontSize: 12,
    color: COLORS.cream,
  },

  disabled: {
    opacity: 0.6,
  },

  bottomSpace: {
    height: 35,
  },
});