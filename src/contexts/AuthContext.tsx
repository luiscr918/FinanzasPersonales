import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, type User } from 'firebase/auth'
import { auth } from '../lib/firebase'

interface AuthValue { user: User | null; loading: boolean; error: string; login: (email: string, password: string) => Promise<void>; logout: () => Promise<void>; reset: (email: string) => Promise<void> }
const AuthContext = createContext<AuthValue | undefined>(undefined)

const authMessage = (error: unknown) => {
  const code = error instanceof Error ? error.message : ''
  if (code.includes('invalid-credential')) return 'Correo o contraseña incorrectos.'
  if (code.includes('too-many-requests')) return 'Demasiados intentos. Espera unos minutos.'
  return 'No fue posible completar la operación.'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => onAuthStateChanged(auth, value => { setUser(value); setLoading(false) }), [])
  const login = async (email: string, password: string) => { setError(''); try { await signInWithEmailAndPassword(auth, email, password) } catch (e) { const message = authMessage(e); setError(message); throw e } }
  const reset = async (email: string) => { setError(''); try { await sendPasswordResetEmail(auth, email) } catch (e) { setError(authMessage(e)); throw e } }
  return <AuthContext.Provider value={{ user, loading, error, login, logout: () => signOut(auth), reset }}>{children}</AuthContext.Provider>
}
export const useAuth = () => { const value = useContext(AuthContext); if (!value) throw new Error('useAuth debe usarse dentro de AuthProvider'); return value }
