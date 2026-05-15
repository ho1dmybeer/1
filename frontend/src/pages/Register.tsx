import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, getApiErrorMessage } from '../lib/api'

export default function Register() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [fullName, setFullName] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState<string | null>(null)

	async function onSubmit(e: FormEvent) {
		e.preventDefault()
		setError(null)
		setSuccess(null)
		try {
			await api.post('/auth/register', { email, password, full_name: fullName })
			setSuccess('Регистрация успешна. Теперь вернитесь на домашнюю страницу и нажмите "Вход".')
			setEmail('')
			setPassword('')
			setFullName('')
		} catch (e) {
			setError(getApiErrorMessage(e, 'Ошибка регистрации'))
		}
	}

	return (
		<div style={{ padding: 24, maxWidth: 460 }}>
			<Link to="/"><button type="button">Домашняя страница</button></Link>
			<h2>Регистрация</h2>
			<form onSubmit={onSubmit}>
				<input placeholder="Имя" required value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ display: 'block', marginBottom: 8, width: '100%' }} />
				<input placeholder="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={{ display: 'block', marginBottom: 8, width: '100%' }} />
				<input placeholder="Пароль" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} style={{ display: 'block', marginBottom: 8, width: '100%' }} />
				{error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
				{success && <div style={{ color: 'green', marginBottom: 8 }}>{success}</div>}
				<button type="submit">Зарегистрироваться</button>
			</form>
		</div>
	)
}
