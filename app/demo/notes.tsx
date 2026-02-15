import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8787';

interface Note {
  id: number;
  content: string;
  created_at: string;
}

export default function NotesDemo() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/notes`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }
      const data: Note[] = await res.json();
      setNotes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  async function addNote() {
    if (!newNote.trim()) return;
    setError(null);
    try {
      const res = await fetch(`${API_URL}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newNote.trim() }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }
      setNewNote('');
      await fetchNotes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add note');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Notes</Text>
      <Text style={styles.description}>
        CRUD via Cloudflare Worker + Supabase (PostgreSQL)
      </Text>
      <Text style={styles.apiUrl}>API: {API_URL}</Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={newNote}
          onChangeText={setNewNote}
          placeholder="Write a note..."
          placeholderTextColor="#484f58"
          onSubmitEditing={addNote}
        />
        <Pressable style={styles.addButton} onPress={addNote}>
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable style={styles.refreshButton} onPress={fetchNotes}>
        <Text style={styles.refreshText}>Refresh</Text>
      </Pressable>

      {loading ? (
        <ActivityIndicator color="#58a6ff" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={styles.noteCard}>
              <Text style={styles.noteContent}>{item.content}</Text>
              <Text style={styles.noteDate}>
                {new Date(item.created_at).toLocaleString()}
              </Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>No notes yet. Add one above!</Text>
          }
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#0d1117',
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#e6edf3',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#8b949e',
    marginBottom: 4,
  },
  apiUrl: {
    fontSize: 12,
    color: '#484f58',
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#30363d',
    backgroundColor: '#161b22',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#e6edf3',
    fontSize: 15,
  },
  addButton: {
    backgroundColor: '#238636',
    borderRadius: 8,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  refreshButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  refreshText: {
    color: '#58a6ff',
    fontSize: 14,
  },
  error: {
    color: '#f85149',
    fontSize: 13,
    marginBottom: 12,
  },
  list: {
    gap: 8,
    paddingBottom: 40,
  },
  noteCard: {
    backgroundColor: '#161b22',
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  noteContent: {
    color: '#e6edf3',
    fontSize: 15,
    lineHeight: 22,
  },
  noteDate: {
    color: '#484f58',
    fontSize: 12,
    marginTop: 6,
  },
  empty: {
    color: '#484f58',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 14,
  },
});
