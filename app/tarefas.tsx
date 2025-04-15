import React, { useEffect, useState } from 'react'
import {
  View, Text, TextInput, Pressable, FlatList, Modal,
  KeyboardAvoidingView, Platform, StyleSheet
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Feather } from '@expo/vector-icons'

interface Task {
  id: string
  nome: string
  descricao: string
  data: string
  feita: boolean
}

const STORAGE_KEY = '@tasks'

export default function TarefasScreen() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [nomeInserir, setNomeInserir] = useState('')
  const [descricaoInserir, setDescricaoInserir] = useState('')
  const [dataInserir, setDataInserir] = useState('')
  const [nomeEditar, setNomeEditar] = useState('')
  const [descricaoEditar, setDescricaoEditar] = useState('')
  const [dataEditar, setDataEditar] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [modalExcluirId, setModalExcluirId] = useState<string | null>(null)
  const [modalEditar, setModalEditar] = useState(false)
  const [toast, setToast] = useState('')
  const [showToast, setShowToast] = useState(false)

  useEffect(() => { loadTasks() }, [])

  const loadTasks = async () => {
    const data = await AsyncStorage.getItem(STORAGE_KEY)
    if (data) setTasks(JSON.parse(data))
  }

  const saveTasks = async (newTasks: Task[]) => {
    setTasks(newTasks)
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTasks))
  }

  const exibirToast = (mensagem: string) => {
    setToast(mensagem)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const validarData = (data: string) => {
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/
    const match = data.trim().match(regex)
    if (!match) return false
    const dia = parseInt(match[1], 10)
    const mes = parseInt(match[2], 10)
    if (dia < 1 || dia > 31) return false
    if (mes < 1 || mes > 12) return false
    return true
  }

  const handleAdd = () => {
    if (!nomeInserir.trim()) {
      exibirToast('Preencha o nome da tarefa')
      return
    }
    if (!validarData(dataInserir)) {
      exibirToast('Data inválida. Use o formato dd/mm/aaaa')
      return
    }
    const nova: Task = {
      id: Date.now().toString(),
      nome: nomeInserir.trim(),
      descricao: descricaoInserir.trim(),
      data: dataInserir.trim(),
      feita: false
    }
    saveTasks([...tasks, nova])
    setNomeInserir(''); setDescricaoInserir(''); setDataInserir('')
    exibirToast('Tarefa adicionada com sucesso!')
  }

  const handleEdit = (id: string) => {
    const t = tasks.find(t => t.id === id)
    if (t) {
      setNomeEditar(t.nome)
      setDescricaoEditar(t.descricao)
      setDataEditar(t.data)
      setEditId(t.id)
      setModalEditar(true)
    }
  }

  const handleSaveEdit = () => {
    if (!editId) return
    if (!nomeEditar.trim()) {
      exibirToast('Preencha o nome da tarefa')
      return
    }
    if (!validarData(dataEditar)) {
      exibirToast('Data inválida. Use o formato dd/mm/aaaa')
      return
    }
    const atualizada = tasks.map(t =>
      t.id === editId
        ? { ...t, nome: nomeEditar.trim(), descricao: descricaoEditar.trim(), data: dataEditar.trim() }
        : t
    )
    saveTasks(atualizada)
    setModalEditar(false)
    setEditId(null)
    exibirToast('Tarefa editada com sucesso!')
  }

  const handleDelete = (id: string) => {
    setModalExcluirId(id)
  }

  const confirmarExclusao = () => {
    if (modalExcluirId) {
      saveTasks(tasks.filter(t => t.id !== modalExcluirId))
      exibirToast('Tarefa excluída com sucesso!')
    }
    setModalExcluirId(null)
  }

  const handleToggleFeita = (id: string) => {
    saveTasks(tasks.map(t => t.id === id ? { ...t, feita: !t.feita } : t))
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.titulo}>Minhas Tarefas</Text>

      <TextInput placeholder="Nome da tarefa" value={nomeInserir} onChangeText={setNomeInserir} style={styles.input} placeholderTextColor="#94a3b8" />
      <TextInput placeholder="Descrição" value={descricaoInserir} onChangeText={setDescricaoInserir} style={styles.input} placeholderTextColor="#94a3b8" />
      <TextInput placeholder="Digite a data (dd/mm/aaaa)" value={dataInserir} onChangeText={setDataInserir} style={styles.input} placeholderTextColor="#94a3b8" />

      <Pressable onPress={handleAdd} style={[styles.botao, { backgroundColor: '#10b981', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}>
        <Feather name="plus-circle" size={18} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.botaoTexto}>Adicionar tarefa</Text>
      </Pressable>

      <Modal transparent visible={modalEditar} animationType="fade">
        <View style={styles.modalFundo}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitulo}>Editar Tarefa</Text>
            <TextInput placeholder="Nome" value={nomeEditar} onChangeText={setNomeEditar} style={styles.input} placeholderTextColor="#94a3b8" />
            <TextInput placeholder="Descrição" value={descricaoEditar} onChangeText={setDescricaoEditar} style={styles.input} placeholderTextColor="#94a3b8" />
            <TextInput placeholder="Data (dd/mm/aaaa)" value={dataEditar} onChangeText={setDataEditar} style={styles.input} placeholderTextColor="#94a3b8" />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
              <Pressable style={[styles.botao, { backgroundColor: '#10b981', flex: 1, marginRight: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }]} onPress={handleSaveEdit}>
                <Feather name="edit-2" size={16} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.botaoTexto}>Salvar</Text>
              </Pressable>
              <Pressable style={[styles.botao, { backgroundColor: '#ef4444', flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }]} onPress={() => setModalEditar(false)}>
                <Feather name="x" size={18} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.botaoTexto}>Cancelar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={!!modalExcluirId} animationType="fade">
        <View style={styles.modalFundo}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitulo}>Tem certeza que deseja excluir?</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
              <Pressable style={[styles.botao, { backgroundColor: '#ef4444', flex: 1, marginRight: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }]} onPress={confirmarExclusao}>
                <Feather name="trash-2" size={18} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.botaoTexto}>Excluir</Text>
              </Pressable>
              <Pressable style={[styles.botao, { backgroundColor: '#94a3b8', flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }]} onPress={() => setModalExcluirId(null)}>
                <Feather name="x" size={18} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.botaoTexto}>Cancelar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <FlatList
        data={tasks}
        keyExtractor={item => item.id}
        contentContainerStyle={{ gap: 10 }}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: item.feita ? '#bbf7d0' : '#e2e8f0' }]}>
            <Text style={styles.nome}>{item.nome}</Text>
            <Text style={styles.desc}>{item.descricao}</Text>
            <Text style={styles.data}>Data: {item.data}</Text>
            <View style={styles.acoes}>
              <Pressable onPress={() => handleToggleFeita(item.id)} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Feather name={item.feita ? 'x-circle' : 'check-circle'} size={16} color="#10b981" style={{ marginRight: 4 }} />
                <Text style={styles.verde}>{item.feita ? 'Desmarcar' : 'Marcar como feita'}</Text>
              </Pressable>
              <Pressable onPress={() => handleEdit(item.id)} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Feather name="edit-2" size={16} color="#3b82f6" style={{ marginRight: 4 }} />
                <Text style={styles.azul}>Editar</Text>
              </Pressable>
              <Pressable onPress={() => handleDelete(item.id)} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Feather name="trash-2" size={16} color="#ef4444" style={{ marginRight: 4 }} />
                <Text style={styles.vermelho}>Excluir</Text>
              </Pressable>
            </View>
          </View>
        )}
      />

      {showToast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toast}</Text>
          <Pressable onPress={() => setShowToast(false)}>
            <Text style={styles.toastFechar}>×</Text>
          </Pressable>
        </View>
      )}
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 20 },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#0f172a' },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 10, marginBottom: 10, backgroundColor: '#fff' },
  botao: { paddingVertical: 12, borderRadius: 8, marginBottom: 10 },
  botaoTexto: { textAlign: 'center', color: '#fff', fontWeight: 'bold' },
  card: { padding: 12, borderRadius: 8 },
  nome: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  desc: { color: '#475569' },
  data: { color: '#64748b', fontSize: 13, marginTop: 2 },
  acoes: { flexDirection: 'row', gap: 20, marginTop: 8 },
  verde: { color: '#10b981', fontWeight: 'bold' },
  azul: { color: '#3b82f6', fontWeight: 'bold' },
  vermelho: { color: '#ef4444', fontWeight: 'bold' },
  modalFundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { backgroundColor: '#fff', padding: 20, borderRadius: 12, width: '85%', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 6 },
  modalTitulo: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 12, textAlign: 'center' },
  toast: { position: 'absolute', bottom: 20, left: 20, right: 20, backgroundColor: '#1e293b', padding: 14, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 6 },
  toastText: { color: '#fff', fontSize: 14, flex: 1 },
  toastFechar: { color: '#fff', fontWeight: 'bold', marginLeft: 12, fontSize: 18 }
})
