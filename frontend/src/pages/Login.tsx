import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

export default function Login() {
	const navigate = useNavigate()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState<string | null>(null)

	async function onSubmit(e: FormEvent) {
		e.preventDefault()
		setError(null)
		try {
			const params = new URLSearchParams()
			params.set('username', email)
			params.set('password', password)
			const res = await api.post('/auth/login', params, {
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
			})
			localStorage.setItem('token', res.data.access_token)
			navigate('/timesheet')
		} catch (e: any) {
			setError(e?.response?.data?.detail ?? 'Ошибка входа')
		}
	}

	return (
		<div style={{ padding: 16, maxWidth: 420 }}>
			<h2>Вход</h2>
			<form onSubmit={onSubmit}>
				<input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ display: 'block', marginBottom: 8, width: '100%' }} />
				<input placeholder="Пароль" type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ display: 'block', marginBottom: 8, width: '100%' }} />
				{error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
				<button type="submit">Войти</button>
			</form>
		</div>
	)
}
