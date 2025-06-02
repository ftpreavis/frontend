import {defineStore} from "pinia";
import axios from "axios";
import {useAuth} from "@/store/auth.ts";
import {computed, ref} from "vue";

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
	id: number,
	username: string
}

export const useFriends = defineStore('friends', () => {
	const authStore = useAuth()

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
		// try {
		// 	await axios.delete(
		// 		`/api/friends/${targetId}`,
		// 		{userId: userId.value},
		// 		{
		// 			headers: {Authorization: `Bearer ${token.value}`}
		// 		}
		// 	)
		// 	await Promise.all([
		// 		fetchSentRequests(),
		// 		fetchReceivedRequests(),
		// 		fetchFriendsList()
		// 	])
		// } catch {
		//
		// }
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
