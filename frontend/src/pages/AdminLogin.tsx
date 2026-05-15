import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, getApiErrorMessage } from '../lib/api'

export default function AdminLogin() {
	const navigate = useNavigate()
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState<string | null>(null)

	async function onSubmit(e: FormEvent) {
		e.preventDefault()
		setError(null)
		try {
			const res = await api.post('/admin/login', { username, password })
			localStorage.setItem('adminToken', res.data.access_token)
			localStorage.removeItem('token')
			navigate('/admin/dashboard')
		} catch (e) {
			setError(getApiErrorMessage(e, 'Ошибка входа администратора'))
		}
	}

	return (
		<div style={{ padding: 24, maxWidth: 460 }}>
			<Link to="/"><button type="button">Домашняя страница</button></Link>
			<h2>Администратор</h2>
			<form onSubmit={onSubmit}>
				<input placeholder="Имя" required value={username} onChange={(e) => setUsername(e.target.value)} style={{ display: 'block', marginBottom: 8, width: '100%' }} />
				<input placeholder="Пароль" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} style={{ display: 'block', marginBottom: 8, width: '100%' }} />
				{error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
				<button type="submit">Войти</button>
			</form>
		</div>
	)
}
