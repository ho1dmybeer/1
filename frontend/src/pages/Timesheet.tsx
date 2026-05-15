import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { api, getApiErrorMessage } from '../lib/api'

interface WorkSession {
	id: number
	user_id: number
	user_name?: string | null
	user_email?: string | null
	project: string
	started_at: string
	lunch_started_at?: string | null
	lunch_ended_at?: string | null
	ended_at?: string | null
	notes?: string | null
	status: 'active' | 'paused' | 'completed'
	total_seconds: number
}

function parseApiDate(value: string) {
	return new Date(value.endsWith('Z') ? value : `${value}Z`)
}

function formatDateTime(value?: string | null) {
	if (!value) {
		return '-'
	}
	return parseApiDate(value).toLocaleString()
}

function formatDuration(seconds: number) {
	const safeSeconds = Math.max(0, Math.floor(seconds))
	const hours = Math.floor(safeSeconds / 3600)
	const minutes = Math.floor((safeSeconds % 3600) / 60)
	const secs = safeSeconds % 60
	return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

function getLiveSeconds(session: WorkSession | null | undefined, now: Date) {
	if (!session) {
		return 0
	}
	if (session.ended_at) {
		return session.total_seconds
	}

	const startedAt = parseApiDate(session.started_at)
	let total = Math.max(0, Math.floor((now.getTime() - startedAt.getTime()) / 1000))

	if (session.lunch_started_at) {
		const lunchStartedAt = parseApiDate(session.lunch_started_at)
		const lunchEndedAt = session.lunch_ended_at ? parseApiDate(session.lunch_ended_at) : now
		total -= Math.max(0, Math.floor((lunchEndedAt.getTime() - lunchStartedAt.getTime()) / 1000))
	}

	return Math.max(0, total)
}

export default function Timesheet() {
	const navigate = useNavigate()
	const qc = useQueryClient()
	const [now, setNow] = useState(new Date())
	const [project, setProject] = useState('')
	const [notes, setNotes] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)

	const currentQuery = useQuery<WorkSession | null>({
		queryKey: ['work-session-current'],
		queryFn: async () => (await api.get('/work-sessions/current')).data
	})

	const historyQuery = useQuery<WorkSession[]>({
		queryKey: ['work-sessions-my'],
		queryFn: async () => (await api.get('/work-sessions/my')).data
	})

	useEffect(() => {
		if (!localStorage.getItem('token')) {
			navigate('/login')
		}
	}, [navigate])

	useEffect(() => {
		const id = window.setInterval(() => setNow(new Date()), 1000)
		return () => window.clearInterval(id)
	}, [])

	const current = currentQuery.data
	const liveSeconds = useMemo(() => getLiveSeconds(current, now), [current, now])

	async function refresh() {
		await qc.invalidateQueries({ queryKey: ['work-session-current'] })
		await qc.invalidateQueries({ queryKey: ['work-sessions-my'] })
	}

	async function runAction(action: () => Promise<void>, fallback: string) {
		setError(null)
		setIsSubmitting(true)
		try {
			await action()
			await refresh()
		} catch (e) {
			setError(getApiErrorMessage(e, fallback))
		} finally {
			setIsSubmitting(false)
		}
	}

	async function onStart(e: FormEvent) {
		e.preventDefault()
		await runAction(async () => {
			await api.post('/work-sessions/start', { project })
			setProject('')
			setNotes('')
		}, 'Не удалось начать работу')
	}

	async function onLunchStart() {
		await runAction(async () => {
			await api.post('/work-sessions/lunch/start')
		}, 'Не удалось поставить паузу')
	}

	async function onLunchEnd() {
		await runAction(async () => {
			await api.post('/work-sessions/lunch/end')
		}, 'Не удалось продолжить работу')
	}

	async function onFinish(e: FormEvent) {
		e.preventDefault()
		await runAction(async () => {
			await api.post('/work-sessions/finish', { notes })
			setNotes('')
		}, 'Не удалось закончить работу')
	}

	function onLogout() {
		localStorage.removeItem('token')
		navigate('/login')
	}

	if (currentQuery.isLoading || historyQuery.isLoading) {
		return <div style={{ padding: 24 }}>Загрузка...</div>
	}

	return (
		<div style={{ padding: 24, maxWidth: 1060 }}>
			<header style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', marginBottom: 24 }}>
				<div>
					<Link to="/"><button type="button">Домашняя страница</button></Link>
					<h2 style={{ marginBottom: 4 }}>Рабочий день</h2>
					<div style={{ color: '#555' }}>Запустите учет времени, поставьте одну паузу на обед и завершите работу в конце дня.</div>
				</div>
				<button type="button" onClick={onLogout}>Выход</button>
			</header>

			{error && <div style={{ color: '#b00020', marginBottom: 12 }}>{error}</div>}

			{!current ? (
				<form onSubmit={onStart} style={{ display: 'flex', gap: 12, alignItems: 'end', marginBottom: 24 }}>
					<label style={{ flex: 1 }}>
						<div style={{ marginBottom: 4 }}>Проект</div>
						<input required placeholder="Например: Сайт компании" value={project} onChange={(e) => setProject(e.target.value)} style={{ width: '100%' }} />
					</label>
					<button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Запуск...' : 'Начать работу'}</button>
				</form>
			) : (
				<section style={{ border: '1px solid #ddd', padding: 16, marginBottom: 24 }}>
					<h3 style={{ marginTop: 0 }}>{current.project}</h3>
					<div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(140px, 1fr))', gap: 12, marginBottom: 16 }}>
						<div><strong>Статус</strong><br />{current.status === 'paused' ? 'Обед' : 'В работе'}</div>
						<div><strong>Начало</strong><br />{formatDateTime(current.started_at)}</div>
						<div><strong>Обед</strong><br />{current.lunch_started_at ? `${formatDateTime(current.lunch_started_at)} - ${formatDateTime(current.lunch_ended_at)}` : '-'}</div>
						<div><strong>Время</strong><br />{formatDuration(liveSeconds)}</div>
					</div>

					<div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
						{!current.lunch_started_at && <button type="button" onClick={onLunchStart} disabled={isSubmitting}>Пауза на обед</button>}
						{current.lunch_started_at && !current.lunch_ended_at && <button type="button" onClick={onLunchEnd} disabled={isSubmitting}>Продолжить работу</button>}
					</div>

					<form onSubmit={onFinish} style={{ display: 'flex', gap: 12, alignItems: 'end' }}>
						<label style={{ flex: 1 }}>
							<div style={{ marginBottom: 4 }}>Комментарий</div>
							<input placeholder="Необязательно" value={notes} onChange={(e) => setNotes(e.target.value)} style={{ width: '100%' }} />
						</label>
						<button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Сохранение...' : 'Закончить работу'}</button>
					</form>
				</section>
			)}

			<h3>Мои записи</h3>
			<table style={{ borderCollapse: 'collapse', width: '100%' }}>
				<thead>
					<tr>
						<th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Дата</th>
						<th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Проект</th>
						<th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Начало</th>
						<th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Конец</th>
						<th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Итого</th>
						<th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Комментарий</th>
					</tr>
				</thead>
				<tbody>
					{historyQuery.data?.length === 0 && (
						<tr><td colSpan={6} style={{ padding: 12, color: '#666' }}>Записей пока нет</td></tr>
					)}
					{historyQuery.data?.map((session) => (
						<tr key={session.id}>
							<td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{parseApiDate(session.started_at).toLocaleDateString()}</td>
							<td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{session.project}</td>
							<td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{formatDateTime(session.started_at)}</td>
							<td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{formatDateTime(session.ended_at)}</td>
							<td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{formatDuration(session.total_seconds)}</td>
							<td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{session.notes || '-'}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}
