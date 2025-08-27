import { FormEvent, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

interface TimesheetEntry {
	id: number
	entry_date: string
	hours: number
	project?: string | null
	notes?: string | null
}

export default function Timesheet() {
	const qc = useQueryClient()
	const { data, isLoading, error } = useQuery<TimesheetEntry[]>({
		queryKey: ['timesheet'],
		queryFn: async () => (await api.get('/timesheet/')).data
	})

	const [entryDate, setEntryDate] = useState<string>('')
	const [hours, setHours] = useState<number>(0)
	const [project, setProject] = useState<string>('')
	const [notes, setNotes] = useState<string>('')

	async function onSubmit(e: FormEvent) {
		e.preventDefault()
		await api.post('/timesheet/', { entry_date: entryDate, hours, project, notes })
		setHours(0)
		setProject('')
		setNotes('')
		await qc.invalidateQueries({ queryKey: ['timesheet'] })
	}

	if (isLoading) return <div style={{ padding: 16 }}>Загрузка...</div>
	if (error) return <div style={{ padding: 16 }}>Ошибка загрузки</div>

	return (
		<div style={{ padding: 16 }}>
			<h2>Табель</h2>
			<form onSubmit={onSubmit} style={{ marginBottom: 16 }}>
				<input type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} required />
				<input type="number" step="0.1" min="0" value={hours} onChange={(e) => setHours(parseFloat(e.target.value))} required style={{ marginLeft: 8 }} />
				<input placeholder="Проект" value={project} onChange={(e) => setProject(e.target.value)} style={{ marginLeft: 8 }} />
				<input placeholder="Заметки" value={notes} onChange={(e) => setNotes(e.target.value)} style={{ marginLeft: 8, width: 240 }} />
				<button type="submit" style={{ marginLeft: 8 }}>Добавить</button>
			</form>

			<table>
				<thead>
					<tr>
						<th>Дата</th>
						<th>Часы</th>
						<th>Проект</th>
						<th>Заметки</th>
					</tr>
				</thead>
				<tbody>
					{data?.map((e) => (
						<tr key={e.id}>
							<td>{new Date(e.entry_date).toLocaleDateString()}</td>
							<td>{e.hours}</td>
							<td>{e.project}</td>
							<td>{e.notes}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}
