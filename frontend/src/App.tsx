import { Link } from 'react-router-dom'

export default function App() {
	return (
		<div style={{ padding: 16 }}>
			<h1>Time Tracker</h1>
			<nav style={{ display: 'flex', gap: 12 }}>
				<Link to="/login">Вход</Link>
				<Link to="/register">Регистрация</Link>
				<Link to="/timesheet">Табель</Link>
			</nav>
		</div>
	)
}
