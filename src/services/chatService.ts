import axios from 'axios'

export function fetchConv(userId: number) {
	return axios
		.get('/api/chat/conversations', {
			params: { userId },
			withCredentials: true
		})
		.then(res => res.data as Array<{
			userId: number
			content: string
			createdAt: string
		}>)
}

export function sendMessage(
	senderId: number,
	receiverId: number,
	content: string
){
	return axios
		.post(
			'/api/chat/messages',
			{ senderId, receiverId, content },
			{ withCredentials: true }
		)
		.then(res => res.data)
}

export function fetchMessages(
	userId: number,
	otherId: number,
	take = 1,
	skip = 0
): Promise<Array<{ id: number; senderId: number; content: string; time: string }>> {
	return axios
		.get(`/api/chat/messages/${otherId}`, {
			params: { userId, take, skip },
			withCredentials: true
		})
		.then(res => res.data)
}
