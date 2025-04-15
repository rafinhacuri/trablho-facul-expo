import { View, Text, Pressable } from 'react-native';
import { Link } from 'expo-router';

export default function Home() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f1f5f9' }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#0f172a', marginBottom: 20 }}>Bem-vindo à Agenda</Text>
      <Link href="/tarefas" asChild>
        <Pressable style={{ backgroundColor: '#3b82f6', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 5 }}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Ver Tarefas</Text>
        </Pressable>
      </Link>
    </View>
  );
}
