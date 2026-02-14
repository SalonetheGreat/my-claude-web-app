import { Platform, StyleSheet, View, Text } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Claude Web App</Text>
      <Text style={styles.subtitle}>
        A playground built with Expo (React Native), running on iOS, Android & Web.
      </Text>
      <View style={styles.card}>
        <Text style={styles.cardText}>
          Edit <Text style={styles.code}>app/index.tsx</Text> to build something awesome.
        </Text>
        <Text style={styles.deployNote}>
          Auto-deployed via Vercel + Cloudflare Pages on every push.
        </Text>
      </View>
      <Text style={styles.platform}>
        Running on: {Platform.OS}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#0d1117',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#e6edf3',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#8b949e',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  card: {
    backgroundColor: '#161b22',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 480,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  cardText: {
    fontSize: 15,
    color: '#c9d1d9',
    lineHeight: 22,
    marginBottom: 12,
  },
  code: {
    fontFamily: Platform.select({ web: 'monospace', default: undefined }),
    backgroundColor: '#21262d',
    color: '#79c0ff',
    fontSize: 14,
  },
  deployNote: {
    fontSize: 13,
    color: '#58a6ff',
    fontStyle: 'italic',
  },
  platform: {
    marginTop: 24,
    fontSize: 13,
    color: '#484f58',
  },
});
