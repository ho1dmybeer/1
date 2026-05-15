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

const cellStyle = { borderBottom: '1px solid #eee', padding: 8, verticalAlign: 'top' } as const
const headCellStyle = { textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8, whiteSpace: 'nowrap' } as const
const textInputStyle = { width: '100%', minWidth: 0 } as const
const dateInputStyle = { width: '100%', minWidth: 156 } as const

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
			<td style={cellStyle}>{session.user_name || session.user_email || '-'}</td>
			<td style={cellStyle}>{parseApiDate(session.started_at).toLocaleDateString()}</td>
			<td style={cellStyle}><input value={row.project} onChange={(e) => setRow({ ...row, project: e.target.value })} style={textInputStyle} /></td>
			<td style={cellStyle}><input type="datetime-local" value={row.started_at} onChange={(e) => setRow({ ...row, started_at: e.target.value })} style={dateInputStyle} /></td>
			<td style={cellStyle}><input type="datetime-local" value={row.lunch_started_at} onChange={(e) => setRow({ ...row, lunch_started_at: e.target.value })} style={dateInputStyle} /></td>
			<td style={cellStyle}><input type="datetime-local" value={row.lunch_ended_at} onChange={(e) => setRow({ ...row, lunch_ended_at: e.target.value })} style={dateInputStyle} /></td>
			<td style={cellStyle}><input type="datetime-local" value={row.ended_at} onChange={(e) => setRow({ ...row, ended_at: e.target.value })} style={dateInputStyle} /></td>
			<td style={{ ...cellStyle, whiteSpace: 'nowrap' }}>{formatDuration(session.total_seconds)}</td>
			<td style={cellStyle}><input value={row.notes} onChange={(e) => setRow({ ...row, notes: e.target.value })} style={textInputStyle} /></td>
			<td style={cellStyle}>
				<form onSubmit={onSave} style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
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
		<div style={{ padding: 24, width: '100%', maxWidth: '100%' }}>
			<header style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
				<div style={{ minWidth: 0 }}>
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
				<div style={{ width: '100%', maxWidth: '100%', overflowX: 'auto' }}>
					<table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 1120, fontSize: 14 }}>
						<colgroup>
							<col style={{ width: 150 }} />
							<col style={{ width: 100 }} />
							<col style={{ width: 150 }} />
							<col style={{ width: 175 }} />
							<col style={{ width: 175 }} />
							<col style={{ width: 175 }} />
							<col style={{ width: 175 }} />
							<col style={{ width: 90 }} />
							<col style={{ width: 160 }} />
							<col style={{ width: 150 }} />
						</colgroup>
						<thead>
							<tr>
								<th style={headCellStyle}>Имя</th>
								<th style={headCellStyle}>Дата</th>
								<th style={headCellStyle}>Проект</th>
								<th style={headCellStyle}>Начало</th>
								<th style={headCellStyle}>Обед начало</th>
								<th style={headCellStyle}>Обед конец</th>
								<th style={headCellStyle}>Окончание</th>
								<th style={headCellStyle}>Итого</th>
								<th style={headCellStyle}>Комментарий</th>
								<th style={headCellStyle}>Действия</th>
							</tr>
						</thead>
						<tbody>
							{query.data?.length === 0 && <tr><td colSpan={10} style={{ padding: 12, color: '#666' }}>Записей пока нет</td></tr>}
							{query.data?.map((session) => <EditableRow key={session.id} session={session} />)}
						</tbody>
					</table>
				</div>
			)}
		</div>
	)
}
