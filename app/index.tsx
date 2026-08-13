import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../components/AuthProvider';

const COLORS = {
  blue: '#C7D3DB',
  taupe: '#A79A8A',
  cream: '#FCF7DF',
  chocolate: '#3E3630',
};

export default function Index() {
  const { session, loading } = useAuth();

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.92)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;

  const dotOne = useRef(new Animated.Value(0)).current;
  const dotTwo = useRef(new Animated.Value(0)).current;
  const dotThree = useRef(new Animated.Value(0)).current;

  const [finished, setFinished] = React.useState(false);

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 7,
          tension: 45,
          useNativeDriver: true,
        }),
      ]),

      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    const animateDot = (value: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(value, {
            toValue: 1,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animateDot(dotOne, 0);
    animateDot(dotTwo, 180);
    animateDot(dotThree, 360);

    const timer = setTimeout(() => {
      setFinished(true);
    }, 1900);

    return () => clearTimeout(timer);
  }, []);

  if (finished && !loading) {
    if (session) {
      return <Redirect href="/(tabs)" />;
    }

    return <Redirect href="/auth" />;
  }

  return (
    <View style={styles.page}>
      <View style={styles.center}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <Text style={styles.logo}>for the record</Text>

          <Animated.Text
            style={[
              styles.subtitle,
              {
                opacity: subtitleOpacity,
              },
            ]}
          >
            a little place for everything you watched.
          </Animated.Text>
        </Animated.View>

        <View style={styles.dots}>
          <Animated.View
            style={[
              styles.dot,
              {
                opacity: dotOne.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.25, 1],
                }),
                transform: [
                  {
                    scale: dotOne.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.75, 1.15],
                    }),
                  },
                ],
              },
            ]}
          />

          <Animated.View
            style={[
              styles.dot,
              {
                opacity: dotTwo.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.25, 1],
                }),
                transform: [
                  {
                    scale: dotTwo.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.75, 1.15],
                    }),
                  },
                ],
              },
            ]}
          />

          <Animated.View
            style={[
              styles.dot,
              {
                opacity: dotThree.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.25, 1],
                }),
                transform: [
                  {
                    scale: dotThree.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.75, 1.15],
                    }),
                  },
                ],
              },
            ]}
          />
        </View>
      </View>

      <Text style={styles.footer}>
        keep your little cinema history.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: COLORS.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },

  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoContainer: {
    alignItems: 'center',
  },

  logo: {
    fontFamily: 'QilkaBold',
    fontSize: 48,
    color: COLORS.chocolate,
    letterSpacing: -1.5,
  },

  subtitle: {
    fontFamily: 'BeVietnamProRegular',
    color: COLORS.taupe,
    fontSize: 13,
    marginTop: 12,
    textAlign: 'center',
  },

  dots: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 32,
  },

  dot: {
    width: 7,
    height: 7,
    borderRadius: 10,
    backgroundColor: COLORS.taupe,
  },

  footer: {
    position: 'absolute',
    bottom: 38,
    fontFamily: 'BeVietnamProItalic',
    fontSize: 11,
    color: COLORS.taupe,
  },
});