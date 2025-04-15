import React, { useEffect, useState } from 'react'
import {
  View, Text, TextInput, Pressable, FlatList, Modal, StyleSheet
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'

interface Usuario {
  nome: string
  idade: string
  email: string
  senha: string
  nivel: 'adm' | 'usuario'
}

export default function AdminScreen() {
  const router = useRouter()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [modalVisible, setModalVisible] = useState(false)
  const [editIndex, setEditIndex] = useState<number | null>(null)

  const [nome, setNome] = useState('')
  const [idade, setIdade] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [nivel, setNivel] = useState<'adm' | 'usuario'>('usuario')

  const [toast, setToast] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [loggedUser, setLoggedUser] = useState<any>(null)

  useEffect(() => {
    const init = async () => {
      const user = await AsyncStorage.getItem('@logged')
      if (user) setLoggedUser(JSON.parse(user))
      carregarUsuarios()
    }
    init()
  }, [])

  const carregarUsuarios = async () => {
    const data = await AsyncStorage.getItem('@users')
    setUsuarios(data ? JSON.parse(data) : [])
  }

  const exibirToast = (msg: string) => {
    setToast(msg)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const limparForm = () => {
    setNome('')
    setIdade('')
    setEmail('')
    setSenha('')
    setNivel('usuario')
    setEditIndex(null)
  }

  const abrirModalAdicionar = () => {
    limparForm()
    setModalVisible(true)
  }

  const abrirModalEditar = (index: number) => {
    const u = usuarios[index]
    setNome(u.nome)
    setIdade(u.idade)
    setEmail(u.email)
    setSenha(u.senha)
    setNivel(u.nivel)
    setEditIndex(index)
    setModalVisible(true)
  }

  const validarEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

  const salvarUsuario = async () => {
    if (!nome || !email || !senha) return exibirToast('Preencha todos os campos obrigatórios')
    if (!validarEmail(email)) return exibirToast('Email inválido')

    const novo: Usuario = { nome, idade, email, senha, nivel }
    let atualizados = [...usuarios]

    const emailJaExiste = usuarios.some((u, i) =>
      u.email.toLowerCase() === email.toLowerCase() && i !== editIndex
    )
    if (emailJaExiste) return exibirToast('Já existe um usuário com este email')

    if (editIndex !== null) {
      atualizados[editIndex] = novo
      exibirToast('Usuário editado com sucesso!')
    } else {
      atualizados.push(novo)
      exibirToast('Usuário criado com sucesso!')
    }

    await AsyncStorage.setItem('@users', JSON.stringify(atualizados))
    setModalVisible(false)
    carregarUsuarios()
    limparForm()
  }

  const excluirUsuario = async (index: number) => {
    const filtrados = usuarios.filter((_, i) => i !== index)
    await AsyncStorage.setItem('@users', JSON.stringify(filtrados))
    carregarUsuarios()
    exibirToast('Usuário excluído com sucesso!')
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Painel de Administração</Text>

      {loggedUser?.nivel === 'adm' && (
        <View style={styles.navbar}>
          <Pressable onPress={() => router.push('/tarefas')}>
            <Text style={styles.link}>Ir para Tarefas</Text>
          </Pressable>
        </View>
      )}

      <FlatList
        data={usuarios}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={{ gap: 10 }}
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            <Text style={styles.nome}>{item.nome} ({item.nivel})</Text>
            <Text style={styles.email}>Email: {item.email}</Text>
            <Text style={styles.idade}>Idade: {item.idade}</Text>
            <View style={styles.acoes}>
              <Pressable onPress={() => abrirModalEditar(index)} style={styles.acaoBtn}>
                <Feather name="edit-2" size={16} color="#3b82f6" style={{ marginRight: 6 }} />
                <Text style={styles.azul}>Editar</Text>
              </Pressable>
              <Pressable onPress={() => excluirUsuario(index)} style={styles.acaoBtn}>
                <Feather name="trash-2" size={16} color="#ef4444" style={{ marginRight: 6 }} />
                <Text style={styles.vermelho}>Excluir</Text>
              </Pressable>
            </View>
          </View>
        )}
      />

      <Pressable style={[styles.botao, { backgroundColor: '#10b981' }]} onPress={abrirModalAdicionar}>
        <Feather name="plus-circle" size={18} color="#fff" style={{ marginRight: 6 }} />
        <Text style={styles.botaoTexto}>Adicionar Usuário</Text>
      </Pressable>

      <Pressable style={{ marginTop: 20 }} onPress={() => router.replace('/')}>
        <Text style={{ color: '#ef4444', textAlign: 'center' }}>Sair do Painel</Text>
      </Pressable>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalFundo}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitulo}>
              {editIndex !== null ? 'Editar Usuário' : 'Novo Usuário'}
            </Text>
            <TextInput style={styles.input} placeholder="Nome" value={nome} onChangeText={setNome} />
            <TextInput style={styles.input} placeholder="Idade" keyboardType="numeric" value={idade} onChangeText={setIdade} />
            <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} />
            <TextInput style={styles.input} placeholder="Senha" secureTextEntry value={senha} onChangeText={setSenha} />

            <View style={styles.selectNivel}>
              <Pressable onPress={() => setNivel('usuario')} style={[styles.nivelOpcao, nivel === 'usuario' && styles.nivelAtivo]}>
                <Text style={styles.nivelTexto}>Usuário</Text>
              </Pressable>
              <Pressable onPress={() => setNivel('adm')} style={[styles.nivelOpcao, nivel === 'adm' && styles.nivelAtivo]}>
                <Text style={styles.nivelTexto}>ADM</Text>
              </Pressable>
            </View>

            <Pressable style={[styles.botao, { backgroundColor: '#3b82f6' }]} onPress={salvarUsuario}>
              <Text style={styles.botaoTexto}>{editIndex !== null ? 'Salvar Alterações' : 'Criar Usuário'}</Text>
            </Pressable>

            <Pressable style={{ marginTop: 10 }} onPress={() => setModalVisible(false)}>
              <Text style={{ color: '#ef4444', textAlign: 'center' }}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {showToast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toast}</Text>
          <Pressable onPress={() => setShowToast(false)}>
            <Text style={styles.toastFechar}>×</Text>
          </Pressable>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  navbar: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  link: { color: '#3b82f6', fontWeight: 'bold' },
  botao: { flexDirection: 'row', padding: 12, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  botaoTexto: { color: '#fff', fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 10 },
  card: { backgroundColor: '#f1f5f9', padding: 12, borderRadius: 8 },
  nome: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  email: { color: '#334155' },
  idade: { color: '#64748b', marginBottom: 6 },
  acoes: { flexDirection: 'row', gap: 20, marginTop: 8 },
  acaoBtn: { flexDirection: 'row', alignItems: 'center' },
  azul: { color: '#3b82f6', fontWeight: 'bold' },
  vermelho: { color: '#ef4444', fontWeight: 'bold' },
  modalFundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { backgroundColor: '#fff', padding: 20, borderRadius: 12, width: '90%' },
  modalTitulo: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  selectNivel: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 10 },
  nivelOpcao: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16 },
  nivelAtivo: { backgroundColor: '#3b82f6' },
  nivelTexto: { color: '#fff', fontWeight: 'bold' },
  toast: { position: 'absolute', bottom: 20, left: 20, right: 20, backgroundColor: '#1e293b', padding: 14, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  toastText: { color: '#fff', fontSize: 14, flex: 1 },
  toastFechar: { color: '#fff', fontWeight: 'bold', marginLeft: 12, fontSize: 18 }
})
