import { Slot, useRouter, useSegments } from 'expo-router'
import React, { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function Layout() {
  const router = useRouter()
  const segments = useSegments()
  const [isReady, setIsReady] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const checkLogin = async () => {
      const data = await AsyncStorage.getItem('@logged')
      const current = data ? JSON.parse(data) : null
      setUser(current)
      setIsReady(true)

      const inLogin = (segments[0] as string) === '' || (segments[0] as string) === 'index'
      const inAdmin = (segments[0] as string) === 'admin'
      const inTarefas = segments[0] === 'tarefas'

      if (!current && !inLogin) router.replace('/')
      if (current && inLogin) router.replace('/tarefas')
      if (current?.nivel !== 'adm' && inAdmin) router.replace('/tarefas')
    }

    checkLogin()
  }, [segments])

  if (!isReady) return null

  return <Slot />
}
