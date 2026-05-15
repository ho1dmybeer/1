import { FormEvent, useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { api, getApiErrorMessage } from '../lib/api'

interface WorkSession {
	id: number
	user_name?: string | null
	user_email?: string | null
	project: string
	started_at: string
	lunch_started_at?: string | null
	lunch_ended_at?: string | null
	ended_at?: string | null
	notes?: string | null
	total_seconds: number
	status: string
}

interface RowState {
	project: string
	started_at: string
	lunch_started_at: string
	lunch_ended_at: string
	ended_at: string
	notes: string
}

function parseApiDate(value: string) {
	return new Date(value.endsWith('Z') ? value : `${value}Z`)
}

function toDatetimeLocal(value?: string | null) {
	if (!value) {
		return ''
	}
	const date = parseApiDate(value)
	const offset = date.getTimezoneOffset() * 60000
	return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

function fromDatetimeLocal(value: string) {
	return value ? new Date(value).toISOString() : null
}

function formatDuration(seconds: number) {
	const safeSeconds = Math.max(0, Math.floor(seconds))
	const hours = Math.floor(safeSeconds / 3600)
	const minutes = Math.floor((safeSeconds % 3600) / 60)
	return `${hours} ч ${minutes} мин`
}

function getRowState(session: WorkSession): RowState {
	return {
		project: session.project,
		started_at: toDatetimeLocal(session.started_at),
		lunch_started_at: toDatetimeLocal(session.lunch_started_at),
		lunch_ended_at: toDatetimeLocal(session.lunch_ended_at),
		ended_at: toDatetimeLocal(session.ended_at),
		notes: session.notes || ''
	}
}

function EditableRow({ session }: { session: WorkSession }) {
	const qc = useQueryClient()
	const [error, setError] = useState<string | null>(null)
	const [row, setRow] = useState<RowState>(() => getRowState(session))

	useEffect(() => {
		setRow(getRowState(session))
	}, [session])

	async function onSave(e: FormEvent) {
		e.preventDefault()
		setError(null)
		try {
			await api.patch(`/admin/work-sessions/${session.id}`, {
				project: row.project,
				started_at: fromDatetimeLocal(row.started_at),
				lunch_started_at: fromDatetimeLocal(row.lunch_started_at),
				lunch_ended_at: fromDatetimeLocal(row.lunch_ended_at),
				ended_at: fromDatetimeLocal(row.ended_at),
				notes: row.notes || null
			})
			await qc.invalidateQueries({ queryKey: ['admin-work-sessions'] })
		} catch (e) {
			setError(getApiErrorMessage(e, 'Не удалось сохранить строку'))
		}
	}

	async function onDelete() {
		setError(null)
		try {
			await api.delete(`/admin/work-sessions/${session.id}`)
			await qc.invalidateQueries({ queryKey: ['admin-work-sessions'] })
		} catch (e) {
			setError(getApiErrorMessage(e, 'Не удалось удалить строку'))
		}
	}

	return (
		<tr>
			<td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{session.user_name || session.user_email || '-'}</td>
			<td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{parseApiDate(session.started_at).toLocaleDateString()}</td>
			<td style={{ borderBottom: '1px solid #eee', padding: 8 }}><input value={row.project} onChange={(e) => setRow({ ...row, project: e.target.value })} /></td>
			<td style={{ borderBottom: '1px solid #eee', padding: 8 }}><input type="datetime-local" value={row.started_at} onChange={(e) => setRow({ ...row, started_at: e.target.value })} /></td>
			<td style={{ borderBottom: '1px solid #eee', padding: 8 }}><input type="datetime-local" value={row.lunch_started_at} onChange={(e) => setRow({ ...row, lunch_started_at: e.target.value })} /></td>
			<td style={{ borderBottom: '1px solid #eee', padding: 8 }}><input type="datetime-local" value={row.lunch_ended_at} onChange={(e) => setRow({ ...row, lunch_ended_at: e.target.value })} /></td>
			<td style={{ borderBottom: '1px solid #eee', padding: 8 }}><input type="datetime-local" value={row.ended_at} onChange={(e) => setRow({ ...row, ended_at: e.target.value })} /></td>
			<td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{formatDuration(session.total_seconds)}</td>
			<td style={{ borderBottom: '1px solid #eee', padding: 8 }}><input value={row.notes} onChange={(e) => setRow({ ...row, notes: e.target.value })} /></td>
			<td style={{ borderBottom: '1px solid #eee', padding: 8 }}>
				<form onSubmit={onSave} style={{ display: 'flex', gap: 6 }}>
					<button type="submit">Сохранить</button>
					<button type="button" onClick={onDelete}>Удалить</button>
				</form>
				{error && <div style={{ color: '#b00020' }}>{error}</div>}
			</td>
		</tr>
	)
}

export default function AdminDashboard() {
	const navigate = useNavigate()
	const [error, setError] = useState<string | null>(null)
	const query = useQuery<WorkSession[]>({
		queryKey: ['admin-work-sessions'],
		queryFn: async () => (await api.get('/admin/work-sessions')).data
	})

	useEffect(() => {
		if (!localStorage.getItem('adminToken')) {
			navigate('/admin')
		}
	}, [navigate])

	useEffect(() => {
		if (query.error) {
			setError(getApiErrorMessage(query.error, 'Не удалось загрузить данные администратора'))
		}
	}, [query.error])

	function onLogout() {
		localStorage.removeItem('adminToken')
		navigate('/admin')
	}

	return (
		<div style={{ padding: 24, maxWidth: 1280 }}>
			<header style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', marginBottom: 24 }}>
				<div>
					<Link to="/"><button type="button">Домашняя страница</button></Link>
					<h2>Администратор табеля</h2>
					<div style={{ color: '#555' }}>Здесь можно поставить забытое окончание работы, изменить проект или удалить ошибочную строку.</div>
				</div>
				<button type="button" onClick={onLogout}>Выход</button>
			</header>
			{error && <div style={{ color: '#b00020', marginBottom: 12 }}>{error}</div>}
			{query.isLoading ? (
				<div>Загрузка...</div>
			) : (
				<table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14 }}>
					<thead>
						<tr>
							<th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Имя</th>
							<th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Дата</th>
							<th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Проект</th>
							<th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Начало</th>
							<th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Обед начало</th>
							<th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Обед конец</th>
							<th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Окончание</th>
							<th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Итого</th>
							<th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Комментарий</th>
							<th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Действия</th>
						</tr>
					</thead>
					<tbody>
						{query.data?.length === 0 && <tr><td colSpan={10} style={{ padding: 12, color: '#666' }}>Записей пока нет</td></tr>}
						{query.data?.map((session) => <EditableRow key={session.id} session={session} />)}
					</tbody>
				</table>
			)}
		</div>
	)
}
