import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import { useLang } from "@/composables/useLang.ts";
import { useAuth } from '@/store/auth'
import { useFriends } from "@/store/friends.ts";

export const useProfileManagement = defineStore('profileManagement', () => {
	const authStore = useAuth()
	const friendsStore = useFriends()
	const { t } = useLang()

	const profileUser = ref<any | null>(null)
	const profileImage = ref<string | null>(null)
	const isBlocked = ref<boolean>(false)

	const isOwner = computed(() => profileUser.value?.id === authStore.userId);
	const profileBio = computed(() =>
		profileUser.value?.biography || t('profile.noBio')
	);
	const nbWin = computed(() => profileUser.value?.stats?.wins ?? 0);
	const nbLoose = computed(() => profileUser.value?.stats?.losses ?? 0);
	const nbTotal = computed(() => {
		const total = nbWin.value + nbLoose.value;
		return total > 0 ? (nbWin.value / total) * 100 : 0;
	});
	const lastGames = computed(() => {
		const user = profileUser.value;
		if (!user) return [];

		const allMatches = [
			...(user.MatchesAsPlayer1 ?? []).map((match: any) => ({
				id: match.id,
				opponent: match.player2?.username ?? 'Unknown',
				score: `${match.player1Score}-${match.player2Score}`,
				result: match.player1Score > match.player2Score ? 'Victoire' : 'Défaite',
				game: 'Pong',
				playedAt: new Date(match.playedAt)
			})),
			...(user.MatchesAsPlayer2 ?? []).map((match: any) => ({
				id: match.id,
				opponent: match.player1?.username ?? 'Unknown',
				score: `${match.player2Score}-${match.player1Score}`,
				result: match.player2Score > match.player1Score ? 'Victoire' : 'Défaite',
				game: 'Pong',
				playedAt: new Date(match.playedAt)
			}))
		];

		return allMatches.sort((a, b) => b.playedAt.getTime() - a.playedAt.getTime()).slice(0, 5);
	});
	const nbFriends = computed(() => {
		const user = profileUser.value;
		if (!user) return 0;

		const sent = user.sentRequests?.filter((f: any) => f.status === 'ACCEPTED') ?? [];
		const received = user.receivedRequests?.filter((f: any) => f.status === 'ACCEPTED') ?? [];

		const all = [...sent, ...received];
		const uniqueIds = new Set(all.map(f =>
			f.userId === user.id ? f.friendId : f.userId
		));
		return uniqueIds.size;
	});

	async function loadProfile(userId: number) {
		try {
			const data = await authStore.fetchUserById(userId);
			if (data) {
				profileUser.value = data;
				profileImage.value = `/api/users/${userId}/avatar`;
			} else {
				profileUser.value = null
				profileImage.value = null
			}
			await Promise.all([
				friendsStore.fetchSentRequests(),
				friendsStore.fetchReceivedRequests(),
				friendsStore.fetchFriendsList()
			])
		} catch (error) {
			console.error('Error load profile: ', error)
			profileUser.value = null
			profileImage.value = null
		}
	}

	async function toggleBlock(userId: number) {
		const url = '/api/chat/block'
		const method = isBlocked.value ? 'delete' : 'post'
		const body = {
			blockerId: authStore.userId,
			blockedId: userId,
		}

		try {
			await axios({
				method,
				url,
				data: body,
				headers: { Authorization: `Bearer ${authStore.token}` },
			})
			isBlocked.value = !isBlocked.value
		} catch (error) {
			console.error('Failed to toggle block status', error)
		}
	}

	async function fetchBlockedStatus(userId: number) {
		if (!authStore.userId) {
			isBlocked.value = false
			return
		}
		try {
			const res = await axios.get(`/api/chat/block`, {
				params: { userId: authStore.userId },
				headers: { Authorization: `Bearer ${authStore.token}` },
			})
			console.log("Blocked users :", res.data);
			isBlocked.value = res.data.some((user: any) => user.id === userId)
		} catch (err) {
			console.error('Error fetching blocked users:', err)
		}
	}

	return {
		profileUser,
		profileImage,
		isBlocked,

		isOwner,
		profileBio,
		nbWin,
		nbLoose,
		nbTotal,
		lastGames,
		nbFriends,

		loadProfile,
		toggleBlock,
		fetchBlockedStatus
	}
})
