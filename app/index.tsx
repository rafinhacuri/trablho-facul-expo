import React, { useState } from 'react'
import { View, Text, TextInput, Pressable, Modal, StyleSheet } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'

export default function LoginScreen() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [admExiste, setAdmExiste] = useState(false)

  const [nomeNovo, setNomeNovo] = useState('')
  const [idadeNovo, setIdadeNovo] = useState('')
  const [emailNovo, setEmailNovo] = useState('')
  const [senhaNovo, setSenhaNovo] = useState('')
  const [senhaConfirmar, setSenhaConfirmar] = useState('')
  const [nivel, setNivel] = useState<'usuario' | 'adm'>('usuario')
  const [erro, setErro] = useState('')

  const login = async () => {
    const data = await AsyncStorage.getItem('@users')
    const usuarios = data ? JSON.parse(data) : []
    const user = usuarios.find((u: any) => u.email === email && u.senha === senha)
    if (!user) return setErro('Credenciais inválidas')
    await AsyncStorage.setItem('@logged', JSON.stringify(user))
    router.replace('/tarefas')
  }

  const abrirModal = async () => {
    const data = await AsyncStorage.getItem('@users')
    const usuarios = data ? JSON.parse(data) : []
    const existe = usuarios.some((u: any) => u.nivel === 'adm')
    setAdmExiste(existe)
    setModalVisible(true)
  }

  const criarUsuario = async () => {
    if (!nomeNovo || !idadeNovo || !emailNovo || !senhaNovo || !senhaConfirmar) {
      setErro('Preencha todos os campos')
      return
    }

    if (senhaNovo !== senhaConfirmar) {
      setErro('Senhas não coincidem')
      return
    }

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!regex.test(emailNovo.trim())) {
      setErro('Email inválido')
      return
    }

    const data = await AsyncStorage.getItem('@users')
    const usuarios = data ? JSON.parse(data) : []

    const emailExiste = usuarios.some((u: any) => u.email.toLowerCase() === emailNovo.toLowerCase())
    if (emailExiste) {
      setErro('Já existe um usuário com esse email')
      return
    }

    const novo = {
      nome: nomeNovo,
      idade: idadeNovo,
      email: emailNovo,
      senha: senhaNovo,
      nivel: admExiste ? 'usuario' : nivel
    }

    await AsyncStorage.setItem('@users', JSON.stringify([...usuarios, novo]))
    setModalVisible(false)
    setNomeNovo(''); setIdadeNovo(''); setEmailNovo(''); setSenhaNovo(''); setSenhaConfirmar('')
    setNivel('usuario'); setErro('')
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Login</Text>
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Senha" secureTextEntry value={senha} onChangeText={setSenha} />
      <Pressable style={styles.botao} onPress={login}>
        <Text style={styles.botaoTexto}>Entrar</Text>
      </Pressable>

      <Pressable onPress={abrirModal}>
        <Text style={{ color: '#3b82f6', marginTop: 10 }}>Criar nova conta</Text>
      </Pressable>

      {erro ? <Text style={{ color: 'red', marginTop: 10 }}>{erro}</Text> : null}

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalFundo}>
          <View style={styles.modalCard}>
            <Text style={styles.titulo}>Criar Conta</Text>
            <TextInput style={styles.input} placeholder="Nome" value={nomeNovo} onChangeText={setNomeNovo} />
            <TextInput style={styles.input} placeholder="Idade" keyboardType="numeric" value={idadeNovo} onChangeText={setIdadeNovo} />
            <TextInput style={styles.input} placeholder="Email" value={emailNovo} onChangeText={setEmailNovo} />
            <TextInput style={styles.input} placeholder="Senha" secureTextEntry value={senhaNovo} onChangeText={setSenhaNovo} />
            <TextInput style={styles.input} placeholder="Confirmar senha" secureTextEntry value={senhaConfirmar} onChangeText={setSenhaConfirmar} />

            {!admExiste && (
              <View style={styles.selectNivel}>
                <Pressable onPress={() => setNivel('usuario')} style={[styles.nivelOpcao, nivel === 'usuario' && styles.nivelAtivo]}>
                  <Text style={styles.nivelTexto}>Usuário</Text>
                </Pressable>
                <Pressable onPress={() => setNivel('adm')} style={[styles.nivelOpcao, nivel === 'adm' && styles.nivelAtivo]}>
                  <Text style={styles.nivelTexto}>ADM</Text>
                </Pressable>
              </View>
            )}

            <Pressable style={[styles.botao, { marginTop: 10 }]} onPress={criarUsuario}>
              <Text style={styles.botaoTexto}>Criar Conta</Text>
            </Pressable>
            <Pressable onPress={() => { setModalVisible(false); setErro('') }}>
              <Text style={{ color: '#ef4444', marginTop: 10 }}>Cancelar</Text>
            </Pressable>
            {erro ? <Text style={{ color: 'red', marginTop: 10 }}>{erro}</Text> : null}
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 10 },
  botao: { backgroundColor: '#10b981', padding: 12, borderRadius: 8 },
  botaoTexto: { textAlign: 'center', color: '#fff', fontWeight: 'bold' },
  modalFundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { backgroundColor: '#fff', padding: 20, borderRadius: 12, width: '90%' },
  selectNivel: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 10 },
  nivelOpcao: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10 },
  nivelAtivo: { backgroundColor: '#3b82f6' },
  nivelTexto: { color: '#fff', fontWeight: 'bold' }
})
