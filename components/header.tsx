import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const COLORS = {
  cream: '#FCF7DF',
  chocolate: '#3E3630',
};

export default function Header() {
  return (
    <View style={styles.header}>
      <Text style={styles.logo}>for the record</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 70,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 10,
    backgroundColor: COLORS.cream,
  },
  logo: {
    fontFamily: 'QilkaBold',
    fontSize: 27,
    color: COLORS.chocolate,
    letterSpacing: -0.5,
  },
});