import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  StyleSheet,
  View,
  Pressable,
  Text,
} from 'react-native';

const COLORS = {
  blue: '#C7D3DB',
  taupe: '#A79A8A',
  cream: '#FCF7DF',
  chocolate: '#3E3630',
};

function FloatingTabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.tabBar}>
        <Pressable
          onPress={() => navigation.navigate('index')}
          style={styles.tab}
        >
          <Ionicons
            name={state.index === 0 ? 'home' : 'home-outline'}
            size={20}
            color={state.index === 0 ? COLORS.chocolate : COLORS.taupe}
          />
          <Text
            style={[
              styles.label,
              state.index === 0 && styles.labelActive,
            ]}
          >
            home
          </Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate('new')}
          style={styles.newTab}
        >
          <View
            style={[
              styles.plusButton,
              state.index === 1 && styles.plusButtonFocused,
            ]}
          >
            <Ionicons name="add" size={28} color={COLORS.chocolate} />
          </View>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate('profile')}
          style={styles.tab}
        >
          <Ionicons
            name={state.index === 2 ? 'person' : 'person-outline'}
            size={20}
            color={state.index === 2 ? COLORS.chocolate : COLORS.taupe}
          />
          <Text
            style={[
              styles.label,
              state.index === 2 && styles.labelActive,
            ]}
          >
            profile
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'home' }} />
      <Tabs.Screen name="new" options={{ title: '' }} />
      <Tabs.Screen name="profile" options={{ title: 'profile' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 22,
    alignItems: 'center',
  },

  tabBar: {
    width: 220,
    height: 64,
    backgroundColor: COLORS.cream,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(167,154,138,0.22)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.chocolate,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },

  tab: {
    width: 65,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },

  newTab: {
    width: 65,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -12,
  },

  plusButton: {
    width: 50,
    height: 50,
    borderRadius: 18,
    backgroundColor: COLORS.blue,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.cream,
    shadowColor: COLORS.chocolate,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },

  plusButtonFocused: {
    backgroundColor: COLORS.taupe,
  },

  label: {
    fontFamily: 'BeVietnamProBold',
    fontSize: 9,
    color: COLORS.taupe,
  },

  labelActive: {
    color: COLORS.chocolate,
  },
});