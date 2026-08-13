import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { MEDIA_TYPES, Media } from '../../lib/types';
import Header from '../../components/header';

const COLORS = {
  blue: '#C7D3DB',
  taupe: '#A79A8A',
  cream: '#FCF7DF',
  chocolate: '#3E3630',
};

export default function Home() {
  const [media, setMedia] = useState<Media[]>([]);
  const [q, setQ] = useState('');
  const [type, setType] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setRefreshing(true);

      const { data, error } = await supabase
        .from('media')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.log('Media loading error:', error);
        return;
      }

      setMedia(data ?? []);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const filteredMedia = media.filter((item) => {
    const matchesType = type === 'All' || item.media_type === type;
    const matchesSearch = item.title.toLowerCase().includes(q.toLowerCase());
    return matchesType && matchesSearch;
  });

  function renderRating(rating: number | null | undefined) {
    if (rating === null || rating === undefined || Number(rating) === 0) {
      return '—';
    }

    const rounded = Math.round(Number(rating));
    return '★'.repeat(rounded) + '☆'.repeat(5 - rounded);
  }

  return (
    <View style={styles.page}>
      <Header />

      <FlatList
        data={filteredMedia}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={load}
            tintColor={COLORS.taupe}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View>
            <View style={styles.searchWrapper}>
              <Text style={styles.searchIcon}>⌕</Text>
              <TextInput
                placeholder="search your records..."
                placeholderTextColor={COLORS.taupe}
                value={q}
                onChangeText={setQ}
                style={styles.search}
              />
            </View>

            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={['All', ...MEDIA_TYPES]}
              keyExtractor={(item) => item}
              contentContainerStyle={styles.filters}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => setType(item)}
                  style={[
                    styles.chip,
                    type === item && styles.chipOn,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      type === item && styles.chipTextOn,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              )}
            />

            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>your archive</Text>
                <Text style={styles.sectionSubtitle}>
                  {filteredMedia.length === 1
                    ? '1 little record'
                    : `${filteredMedia.length} little records`}
                </Text>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyIconText}>+</Text>
            </View>
            <Text style={styles.emptyTitle}>nothing here yet</Text>
            <Text style={styles.emptyText}>
              tap + and make your first record.
            </Text>
            <Pressable
              style={styles.emptyButton}
              onPress={() => router.push('/(tabs)/new')}
            >
              <Text style={styles.emptyButtonText}>make a record</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => {
          const imageUrl = (item as any).image_url;

          return (
            <Pressable
              style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed,
              ]}
              onPress={() =>
                router.push({
                  pathname: '/media/[id]',
                  params: { id: item.id },
                })
              }
            >
              {imageUrl ? (
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.cardImageEmpty}>
                  <Text style={styles.cardImageEmptyText}>♡</Text>
                </View>
              )}

              <View style={styles.cardContent}>
                <View style={styles.cardTop}>
                  <View style={styles.cardText}>
                    <Text style={styles.mediaTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <View style={styles.metaRow}>
                      <View style={styles.typePill}>
                        <Text style={styles.typePillText}>
                          {item.media_type}
                        </Text>
                      </View>
                      {item.release_date ? (
                        <Text style={styles.release}>
                          {item.release_date.slice(0, 4)}
                        </Text>
                      ) : null}
                    </View>
                  </View>

                  <Text style={styles.rating}>
                    {renderRating(item.rating)}
                  </Text>
                </View>

                {item.notes ? (
                  <Text numberOfLines={2} style={styles.notes}>
                    {item.notes}
                  </Text>
                ) : (
                  <Text style={styles.noNotes}>no thoughts added</Text>
                )}

                <View style={styles.viewRow}>
                  <Text style={styles.viewText}>view record</Text>
                  <Text style={styles.arrow}>→</Text>
                </View>
              </View>
            </Pressable>
          );
        }}
      />
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

  searchWrapper: {
    position: 'relative',
    justifyContent: 'center',
    marginBottom: 2,
  },

  searchIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 2,
    fontFamily: 'BeVietnamProRegular',
    fontSize: 20,
    color: COLORS.taupe,
  },

  search: {
    height: 52,
    backgroundColor: COLORS.blue,
    borderRadius: 16,
    paddingLeft: 44,
    paddingRight: 16,
    fontFamily: 'BeVietnamProRegular',
    fontSize: 12,
    color: COLORS.chocolate,
  },

  filters: {
    gap: 8,
    paddingVertical: 13,
  },

  chip: {
    backgroundColor: COLORS.blue,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 17,
  },

  chipOn: {
    backgroundColor: COLORS.chocolate,
  },

  chipText: {
    fontFamily: 'BeVietnamProRegular',
    fontSize: 10,
    color: COLORS.chocolate,
  },

  chipTextOn: {
    fontFamily: 'BeVietnamProBold',
    color: COLORS.cream,
  },

  sectionHeader: {
    marginTop: 15,
    marginBottom: 12,
    paddingHorizontal: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
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

  card: {
    backgroundColor: COLORS.blue,
    borderRadius: 22,
    marginBottom: 12,
    overflow: 'hidden',
    flexDirection: 'row',
    minHeight: 170,
  },

  cardPressed: {
    opacity: 0.82,
  },

  cardImage: {
    width: 108,
    height: 170,
    backgroundColor: COLORS.taupe,
  },

  cardImageEmpty: {
    width: 108,
    height: 170,
    backgroundColor: COLORS.taupe,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardImageEmptyText: {
    fontSize: 22,
    color: COLORS.cream,
    opacity: 0.75,
  },

  cardContent: {
    flex: 1,
    padding: 15,
    justifyContent: 'space-between',
  },

  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },

  cardText: {
    flex: 1,
  },

  mediaTitle: {
    fontFamily: 'BeVietnamProBold',
    fontSize: 17,
    lineHeight: 21,
    color: COLORS.chocolate,
    letterSpacing: -0.2,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
    gap: 7,
  },

  typePill: {
    backgroundColor: COLORS.cream,
    borderRadius: 11,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  typePillText: {
    fontFamily: 'BeVietnamProBold',
    fontSize: 8,
    color: COLORS.chocolate,
  },

  release: {
    fontFamily: 'BeVietnamProRegular',
    fontSize: 9,
    color: COLORS.taupe,
  },

  rating: {
    fontFamily: 'BeVietnamProRegular',
    fontSize: 10,
    letterSpacing: 0.5,
    color: COLORS.chocolate,
    marginTop: 2,
  },

  notes: {
    fontFamily: 'BeVietnamProRegular',
    fontSize: 10,
    lineHeight: 16,
    color: COLORS.chocolate,
    marginTop: 10,
    opacity: 0.8,
  },

  noNotes: {
    fontFamily: 'BeVietnamProItalic',
    fontSize: 9,
    color: COLORS.taupe,
    marginTop: 10,
  },

  viewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 9,
    borderTopWidth: 1,
    borderTopColor: 'rgba(62,54,48,0.08)',
  },

  viewText: {
    fontFamily: 'BeVietnamProBold',
    fontSize: 9,
    color: COLORS.taupe,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },

  arrow: {
    fontFamily: 'BeVietnamProRegular',
    fontSize: 15,
    color: COLORS.chocolate,
  },

  emptyCard: {
    backgroundColor: COLORS.blue,
    borderRadius: 24,
    paddingHorizontal: 25,
    paddingVertical: 35,
    alignItems: 'center',
    marginTop: 3,
  },

  emptyIcon: {
    width: 55,
    height: 55,
    borderRadius: 19,
    backgroundColor: COLORS.cream,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },

  emptyIconText: {
    fontFamily: 'BeVietnamProRegular',
    fontSize: 27,
    color: COLORS.chocolate,
  },

  emptyTitle: {
    fontFamily: 'BeVietnamProBold',
    fontSize: 15,
    color: COLORS.chocolate,
  },

  emptyText: {
    fontFamily: 'BeVietnamProItalic',
    fontSize: 10,
    lineHeight: 16,
    color: COLORS.taupe,
    textAlign: 'center',
    marginTop: 5,
  },

  emptyButton: {
    backgroundColor: COLORS.chocolate,
    borderRadius: 15,
    paddingHorizontal: 17,
    paddingVertical: 11,
    marginTop: 17,
  },

  emptyButtonText: {
    fontFamily: 'BeVietnamProBold',
    fontSize: 10,
    color: COLORS.cream,
  },
});