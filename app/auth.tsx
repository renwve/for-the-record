import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';

const COLORS = {
  blue: '#C7D3DB',
  taupe: '#A79A8A',
  cream: '#FCF7DF',
  chocolate: '#3E3630',
};

export default function Auth() {
  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [busy, setBusy] = useState(false);

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(25)).current;
  const logoScale = useRef(new Animated.Value(0.94)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(slide, {
        toValue: 0,
        friction: 8,
        tension: 45,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 7,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  async function submit() {
    if (!email || !password || (mode === 'register' && !nickname)) {
      Alert.alert('Almost there', 'Fill in all the fields before continuing.');
      return;
    }

    setBusy(true);

    const res =
      mode === 'signin'
        ? await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          })
        : await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
              data: {
                nickname: nickname.trim(),
              },
            },
          });

    setBusy(false);

    if (res.error) {
      Alert.alert(
        mode === 'signin' ? 'Couldn\'t sign in' : 'Couldn\'t create your account',
        res.error.message
      );
      return;
    }

    router.replace('/(tabs)');
  }

  function switchMode(nextMode: 'signin' | 'register') {
    if (mode === nextMode) return;

    setMode(nextMode);

    Animated.sequence([
      Animated.timing(fade, {
        toValue: 0.65,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(fade, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }

  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.heading,
            {
              opacity: fade,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <Text style={styles.logo}>for the record</Text>

          <Text style={styles.welcome}>
            {mode === 'signin' ? 'welcome back.' : 'let\'s start your archive.'}
          </Text>

          <Text style={styles.description}>
            {mode === 'signin'
              ? 'pick up where you left off.'
              : 'a little place for everything you watch.'}
          </Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.card,
            {
              opacity: fade,
              transform: [{ translateY: slide }],
            },
          ]}
        >
          <View style={styles.modeSwitch}>
            <Pressable
              onPress={() => switchMode('signin')}
              style={[
                styles.modeButton,
                mode === 'signin' && styles.modeButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.modeText,
                  mode === 'signin' && styles.modeTextActive,
                ]}
              >
                sign in
              </Text>
            </Pressable>

            <Pressable
              onPress={() => switchMode('register')}
              style={[
                styles.modeButton,
                mode === 'register' && styles.modeButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.modeText,
                  mode === 'register' && styles.modeTextActive,
                ]}
              >
                register
              </Text>
            </Pressable>
          </View>

          {mode === 'register' && (
            <View style={styles.field}>
              <Text style={styles.label}>nickname</Text>

              <TextInput
                placeholder="what should we call you?"
                placeholderTextColor="#A79A8A"
                value={nickname}
                onChangeText={setNickname}
                style={styles.input}
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>email</Text>

            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              placeholder="you@example.com"
              placeholderTextColor="#A79A8A"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>password</Text>

            <TextInput
              placeholder="••••••••"
              placeholderTextColor="#A79A8A"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              style={styles.input}
            />
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.submit,
              pressed && styles.submitPressed,
            ]}
            onPress={submit}
            disabled={busy}
          >
            <Text style={styles.submitText}>
              {busy
                ? 'one moment...'
                : mode === 'signin'
                ? 'enter the archive'
                : 'make my archive'}
            </Text>

            <Text style={styles.arrow}>→</Text>
          </Pressable>

          <Pressable
            onPress={() =>
              switchMode(mode === 'signin' ? 'register' : 'signin')
            }
            style={styles.switchAccount}
          >
            <Text style={styles.switchText}>
              {mode === 'signin' ? 'new here? ' : 'already have an archive? '}

              <Text style={styles.switchBold}>
                {mode === 'signin' ? 'register' : 'sign in'}
              </Text>
            </Text>
          </Pressable>
        </Animated.View>

        <Animated.View
          style={[
            styles.bottomNote,
            {
              opacity: fade,
            },
          ]}
        >
          <Text style={styles.bottomNoteText}>
            your watches. your thoughts. for the record.
          </Text>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },

  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingVertical: 45,
  },

  decorativeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 26,
    gap: 10,
  },

  heading: {
    alignItems: 'center',
    marginBottom: 28,
  },

  logo: {
    fontFamily: 'QilkaBold',
    fontSize: 46,
    color: COLORS.chocolate,
    letterSpacing: -1,
  },

  welcome: {
    fontFamily: 'BeVietnamProBold',
    color: COLORS.chocolate,
    fontSize: 18,
    marginTop: 15,
  },

  description: {
    fontFamily: 'BeVietnamProRegular',
    color: COLORS.taupe,
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },

  card: {
    backgroundColor: COLORS.blue,
    borderRadius: 28,
    padding: 18,
    paddingTop: 16,
  },

  modeSwitch: {
    flexDirection: 'row',
    backgroundColor: 'rgba(252,247,223,0.45)',
    borderRadius: 17,
    padding: 4,
    marginBottom: 20,
  },

  modeButton: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
    borderRadius: 13,
  },

  modeButtonActive: {
    backgroundColor: COLORS.cream,
  },

  modeText: {
    fontFamily: 'BeVietnamProRegular',
    color: COLORS.taupe,
    fontSize: 12,
  },

  modeTextActive: {
    fontFamily: 'BeVietnamProBold',
    color: COLORS.chocolate,
  },

  field: {
    marginBottom: 14,
  },

  label: {
    fontFamily: 'BeVietnamProBold',
    fontSize: 11,
    color: COLORS.chocolate,
    marginLeft: 5,
    marginBottom: 7,
    textTransform: 'lowercase',
  },

  input: {
    height: 52,
    backgroundColor: COLORS.cream,
    borderRadius: 15,
    paddingHorizontal: 16,
    fontFamily: 'BeVietnamProRegular',
    fontSize: 13,
    color: COLORS.chocolate,
  },

  submit: {
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: COLORS.chocolate,
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },

  submitPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.985 }],
  },

  submitText: {
    fontFamily: 'BeVietnamProBold',
    color: COLORS.cream,
    fontSize: 13,
  },

  arrow: {
    fontFamily: 'BeVietnamProBold',
    color: COLORS.cream,
    fontSize: 20,
    marginLeft: 10,
    marginTop: -2,
  },

  switchAccount: {
    alignItems: 'center',
    paddingVertical: 16,
  },

  switchText: {
    fontFamily: 'BeVietnamProRegular',
    fontSize: 11,
    color: COLORS.chocolate,
  },

  switchBold: {
    fontFamily: 'BeVietnamProBold',
  },

  bottomNote: {
    alignItems: 'center',
    marginTop: 28,
  },

  bottomNoteText: {
    fontFamily: 'BeVietnamProItalic',
    fontSize: 10,
    color: COLORS.taupe,
    textAlign: 'center',
  },
});