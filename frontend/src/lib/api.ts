import axios from 'axios'

export const api = axios.create({ baseURL: '/api' })

export function getApiErrorMessage(error: unknown, fallback: string): string {
	if (!axios.isAxiosError(error)) {
		return fallback
	}

	const detail = error.response?.data?.detail
	if (typeof detail === 'string') {
		return detail
	}

	if (Array.isArray(detail)) {
		return detail
			.map((item) => {
				if (typeof item === 'string') {
					return item
				}
				if (item && typeof item === 'object' && 'msg' in item) {
					return String(item.msg)
				}
				return null
			})
			.filter(Boolean)
			.join('. ') || fallback
	}

	return fallback
}

api.interceptors.request.use((config) => {
	const isAdminRequest = config.url?.startsWith('/admin')
	const token = localStorage.getItem(isAdminRequest ? 'adminToken' : 'token')
	if (token) {
		config.headers = config.headers ?? {}
		config.headers.Authorization = `Bearer ${token}`
	}
	return config
})
