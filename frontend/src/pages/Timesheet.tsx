import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api, getApiErrorMessage } from '../lib/api'

interface TimesheetEntry {
	id: number
	entry_date: string
	hours: number
	project?: string | null
	notes?: string | null
}

function getTodayInputValue() {
	const date = new Date()
	const offset = date.getTimezoneOffset() * 60000
	return new Date(date.getTime() - offset).toISOString().slice(0, 10)
}

function formatDate(value: string) {
	const [year, month, day] = value.split('-')
	return `${day}.${month}.${year}`
}

export default function Timesheet() {
	const navigate = useNavigate()
	const qc = useQueryClient()
	const { data, isLoading, error } = useQuery<TimesheetEntry[]>({
		queryKey: ['timesheet'],
		queryFn: async () => (await api.get('/timesheet/')).data
	})

	const [entryDate, setEntryDate] = useState<string>(getTodayInputValue())
	const [hours, setHours] = useState<string>('')
	const [project, setProject] = useState<string>('')
	const [notes, setNotes] = useState<string>('')
	const [formError, setFormError] = useState<string | null>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)

	const totalHours = useMemo(
		() => data?.reduce((total, entry) => total + entry.hours, 0) ?? 0,
		[data]
	)

	useEffect(() => {
		if (!localStorage.getItem('token')) {
			navigate('/login')
		}
	}, [navigate])

	async function onSubmit(e: FormEvent) {
		e.preventDefault()
		setFormError(null)
		setIsSubmitting(true)
		try {
			await api.post('/timesheet/', {
				entry_date: entryDate,
				hours: Number(hours),
				project: project.trim() || null,
				notes: notes.trim() || null
			})
			setHours('')
			setProject('')
			setNotes('')
			await qc.invalidateQueries({ queryKey: ['timesheet'] })
		} catch (e) {
			setFormError(getApiErrorMessage(e, 'Не удалось добавить запись'))
		} finally {
			setIsSubmitting(false)
		}
	}

	async function onDelete(entryId: number) {
		setFormError(null)
		try {
			await api.delete(`/timesheet/${entryId}`)
			await qc.invalidateQueries({ queryKey: ['timesheet'] })
		} catch (e) {
			setFormError(getApiErrorMessage(e, 'Не удалось удалить запись'))
		}
	}

	function onLogout() {
		localStorage.removeItem('token')
		navigate('/login')
	}

	if (isLoading) return <div style={{ padding: 16 }}>Загрузка...</div>
	if (error) return <div style={{ padding: 16 }}>Ошибка загрузки</div>

	return (
		<div style={{ padding: 24, maxWidth: 960 }}>
			<header style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', marginBottom: 24 }}>
				<div>
					<h2 style={{ margin: 0 }}>Табель</h2>
					<div style={{ marginTop: 8, color: '#555' }}>Итого: {totalHours.toFixed(1)} ч.</div>
				</div>
				<button type="button" onClick={onLogout}>Выйти</button>
			</header>

			<form onSubmit={onSubmit} style={{ display: 'grid', gridTemplateColumns: '160px 120px 1fr 1.4fr auto', gap: 12, alignItems: 'end', marginBottom: 12 }}>
				<label>
					<div style={{ marginBottom: 4 }}>Дата</div>
					<input type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} required style={{ width: '100%' }} />
				</label>
				<label>
					<div style={{ marginBottom: 4 }}>Часы</div>
					<input type="number" step="0.1" min="0.1" max="24" value={hours} onChange={(e) => setHours(e.target.value)} required style={{ width: '100%' }} />
				</label>
				<label>
					<div style={{ marginBottom: 4 }}>Проект</div>
					<input placeholder="Например: Сайт" value={project} onChange={(e) => setProject(e.target.value)} style={{ width: '100%' }} />
				</label>
				<label>
					<div style={{ marginBottom: 4 }}>Заметки</div>
					<input placeholder="Что было сделано" value={notes} onChange={(e) => setNotes(e.target.value)} style={{ width: '100%' }} />
				</label>
				<button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Добавление...' : 'Добавить'}</button>
			</form>

			{formError && <div style={{ color: '#b00020', marginBottom: 12 }}>{formError}</div>}

			<table style={{ borderCollapse: 'collapse', width: '100%' }}>
				<thead>
					<tr>
						<th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Дата</th>
						<th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Часы</th>
						<th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Проект</th>
						<th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Заметки</th>
						<th style={{ textAlign: 'right', borderBottom: '1px solid #ddd', padding: 8 }}>Действия</th>
					</tr>
				</thead>
				<tbody>
					{data?.length === 0 && (
						<tr>
							<td colSpan={5} style={{ color: '#666', padding: 12 }}>Записей пока нет</td>
						</tr>
					)}
					{data?.map((e) => (
						<tr key={e.id}>
							<td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{formatDate(e.entry_date)}</td>
							<td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{e.hours.toFixed(1)}</td>
							<td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{e.project || '-'}</td>
							<td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{e.notes || '-'}</td>
							<td style={{ borderBottom: '1px solid #eee', padding: 8, textAlign: 'right' }}>
								<button type="button" onClick={() => onDelete(e.id)}>Удалить</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}
