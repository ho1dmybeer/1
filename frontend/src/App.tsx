import { Link } from 'react-router-dom'

export default function App() {
	return (
		<div style={{ padding: 32, maxWidth: 720 }}>
			<h1>Табель учета рабочего времени</h1>
			<p style={{ color: '#555', lineHeight: 1.5 }}>
				Сотрудник регистрируется, входит в систему, выбирает проект и запускает учет времени.
				Администратор смотрит рабочие смены, корректирует забытое окончание и удаляет ошибочные строки.
			</p>
			<nav style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 24 }}>
				<Link to="/register"><button type="button">Регистрация</button></Link>
				<Link to="/login"><button type="button">Вход</button></Link>
				<Link to="/admin"><button type="button">Администратор</button></Link>
			</nav>
		</div>
	)
}
