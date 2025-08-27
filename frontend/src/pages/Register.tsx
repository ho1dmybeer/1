import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

export default function Register() {
	const navigate = useNavigate()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [fullName, setFullName] = useState('')
	const [error, setError] = useState<string | null>(null)

	async function onSubmit(e: FormEvent) {
		e.preventDefault()
		setError(null)
		try {
			await api.post('/auth/register', { email, password, full_name: fullName })
			navigate('/login')
		} catch (e: any) {
			setError(e?.response?.data?.detail ?? 'Ошибка регистрации')
		}
	}

	return (
		<div style={{ padding: 16, maxWidth: 420 }}>
			<h2>Регистрация</h2>
			<form onSubmit={onSubmit}>
				<input placeholder="Имя" value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ display: 'block', marginBottom: 8, width: '100%' }} />
				<input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ display: 'block', marginBottom: 8, width: '100%' }} />
				<input placeholder="Пароль" type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ display: 'block', marginBottom: 8, width: '100%' }} />
				{error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
				<button type="submit">Зарегистрироваться</button>
			</form>
		</div>
	)
}
