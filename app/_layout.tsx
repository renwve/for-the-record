import { Stack } from 'expo-router';
import { AuthProvider } from '../components/AuthProvider';
import { StatusBar } from 'expo-status-bar';

export default function Layout() {
  return <AuthProvider><StatusBar style="dark" /><Stack screenOptions={{ headerShown: false }} /></AuthProvider>;
}
