import { Stack } from 'expo-router';

export default function DemoLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#0d1117' },
        headerTintColor: '#e6edf3',
        headerTitleStyle: { fontWeight: '600' },
        contentStyle: { backgroundColor: '#0d1117' },
      }}
    >
      <Stack.Screen name="notes" options={{ title: 'Notes Demo' }} />
    </Stack>
  );
}
