import {defineStore} from "pinia";
import axios from "axios";
import {useAuth} from "@/store/auth.ts";
import {computed, ref} from "vue";
import {useChat} from "@/store/chat.ts";
import {toast} from "vue3-toastify";
import 'vue3-toastify/dist/index.css'

interface FriendRequest {
	id: number
	to: {
		id: number
		username: string
	}
}

interface PendingRequests {
	id: number
	from: {
		id: number
		username: string
	}
}

interface MinimalUserInfo {
	friendshipId: number,
	friendId: number,
	username: string
}

export const useFriends = defineStore('friends', () => {
	const authStore = useAuth()
	const chatStore = useChat()

	const sentRequests = ref<FriendRequest[]>([])
	const pendingRequests = ref<PendingRequests[]>([])
	const friendsList = ref<MinimalUserInfo[]>([])

	const userId = computed(() => authStore.userId)
	const token = computed(() => authStore.token)

	async function fetchSentRequests() {
		try {
			const response = await axios.get<{ sentRequests: FriendRequest[] }>(
				'/api/friends/sent',
				{
					params: { userId: userId.value },
					headers: { Authorization: `Bearer ${token.value}` }
				}
			)
			sentRequests.value = response.data.sentRequests
		} catch (error) {
			console.error('Enable to retrieve list of requests sent: ', error)
			sentRequests.value = []
		}
	}

	async function fetchReceivedRequests() {
		try {
			const response = await axios.get<{ pendingRequests: PendingRequests[] }>(
				'/api/friends',
				{
					params: {userId: userId.value},
					headers: {Authorization: `Bearer ${token.value}`}
				}
			)
			pendingRequests.value = response.data.pendingRequests
		} catch (error) {
			console.error('Error obtaining friend requests: ', error)
		}
	}

	async function fetchFriendsList() {
		try {
			const response = await axios.get<{ friends: MinimalUserInfo[] }>(
				'/api/friends',
				{
					params: { userId: userId.value },
					headers: { Authorization: `Bearer ${token.value}` }
				}
			)
			friendsList.value = response.data.friends
		} catch (error) {
			console.error('Error fetch friends list: ', error)
		}
	}

	async function sendFriendRequest(targetId: number) {
		try {
			const { allowed, reason } = await chatStore.checkUserBlockStatus(targetId)
			if (!allowed) {
				// newMessage.value = ''
				toast.error(`${reason}`, {
					position: 'top-right',
					autoClose: 3000,
					pauseOnHover: true,
					theme: 'light'
				});
				return
			}
			await axios.post(`/api/friends/${targetId}`, {},
				{
					headers: { Authorization: `Bearer ${token.value}` }
				}
			)
			await fetchSentRequests()
		} catch (error) {
			console.error('Error sending friend request: ', error)
		}
	}

	async function acceptFriendRequest(requestId: number) {
		try {
			const { allowed, reason } = await chatStore.checkUserBlockStatus(requestId)
			if (!allowed) {
				// newMessage.value = ''
				toast.error(`${reason}`, {
					position: 'top-right',
					autoClose: 3000,
					pauseOnHover: true,
					theme: 'light'
				});
				return
			}
			await axios.patch(
				`/api/friends/${requestId}/accept`,
				{userId: userId.value},
				{
					headers: {Authorization: `Bearer ${token.value}`}
				}
			)

			await Promise.all([
				fetchSentRequests(),
				fetchReceivedRequests(),
				fetchFriendsList()
			])
		} catch (error) {
			console.error('Error when accepting friends: ', error)
		}
	}

	async function unsend(targetId: number) {
		try {
			const sentRes = await axios.get<{
				sentRequests: FriendRequest[]
			}>(`/api/friends/sent`, {
				params: { userId: authStore.userId },
				headers: { Authorization: `Bearer ${authStore.token}` },
			})
			const sentList = sentRes.data.sentRequests
			const request = sentList.find((r) => r.to.id === targetId)
			if (request) {
				await axios.delete(`/api/friends/${request.id}`, {
					params: { userId: authStore.userId },
					headers: { Authorization: `Bearer ${authStore.token}` },
				})
			}
			await fetchSentRequests()
		} catch {}
	}

	async function unfriend(targetId: number)
	{
		try {
			await axios.delete(
				`/api/friends/${targetId}`, {
					params: { userId: authStore.userId },
					headers: { Authorization: `Bearer ${authStore.token}` },
				})

			await Promise.all([
				fetchSentRequests(),
				fetchReceivedRequests(),
				fetchFriendsList()
			])
		} catch (error) {
			console.error('Error with unfriend: ', error)
		}
	}

	return {
		sentRequests,
		pendingRequests,
		friendsList,

		fetchSentRequests,
		fetchReceivedRequests,
		fetchFriendsList,
		sendFriendRequest,
		unfriend,
		unsend,
		acceptFriendRequest
	}
})
