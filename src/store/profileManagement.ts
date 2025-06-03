import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import { useLang } from "@/composables/useLang.ts";
import { useAuth } from '@/store/auth'
import { useFriends } from "@/store/friends.ts";

interface UserFull {
	id: number,
	username: string,
	avatar: string
}

export const useProfileManagement = defineStore('profileManagement', () => {
	const authStore = useAuth()
	const friendsStore = useFriends()
	const { t } = useLang()

	const profileUser = ref<any | null>(null)
	const profileImage = ref<string | null>(null)
	const isBlocked = ref<boolean>(false)
	const friendUsers = ref<UserFull[]>([])

	const isOwner = computed(() => profileUser.value?.id === authStore.userId);
	const profileBio = computed(() =>
		profileUser.value?.biography || t('profile.noBio')
	);
	const winRatio = computed(() => {
		const total = nbWin.value + nbLoose.value;
		return total > 0 ? (nbWin.value / total) * 100 : 0;
	});
	const lastGames = computed(() => {
		const user = profileUser.value;
		if (!user) return [];

		const allMatches = [
			...(user.MatchesAsPlayer1 ?? []).map((match: any) => ({
				id: match.id,
				opponent: match.player2Name ?? 'Unknown',
				score: `${match.player1Score}-${match.player2Score}`,
				result: match.player1Score > match.player2Score ? 'Victoire' : 'Défaite',
				game: 'Pong',
				playedAt: new Date(match.playedAt)
			})),
			...(user.MatchesAsPlayer2 ?? []).map((match: any) => ({
				id: match.id,
				opponent: match.player1Name ?? 'Unknown',
				score: `${match.player2Score}-${match.player1Score}`,
				result: match.player2Score > match.player1Score ? 'Victoire' : 'Défaite',
				game: 'Pong',
				playedAt: new Date(match.playedAt)
			}))
		];

		return allMatches.sort((a, b) => b.playedAt.getTime() - a.playedAt.getTime()).slice(0, 5);
	});
    const nbWin = computed(() => {
        const user = profileUser.value;
        if (!user) return 0;
    
        const winsAsPlayer1 = (user.MatchesAsPlayer1 ?? []).filter(
            (m: any) => m.player1Score > m.player2Score
        ).length;
    
        const winsAsPlayer2 = (user.MatchesAsPlayer2 ?? []).filter(
            (m: any) => m.player2Score > m.player1Score
        ).length;
    
        return winsAsPlayer1 + winsAsPlayer2;
    });
    const nbLoose = computed(() => {
        const user = profileUser.value;
        if (!user) return 0;
    
        const lossesAsPlayer1 = (user.MatchesAsPlayer1 ?? []).filter(
            (m: any) => m.player1Score < m.player2Score
        ).length;
    
        const lossesAsPlayer2 = (user.MatchesAsPlayer2 ?? []).filter(
            (m: any) => m.player2Score < m.player1Score
        ).length;
    
        return lossesAsPlayer1 + lossesAsPlayer2;
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

	async function getAvatar(userId: number | undefined) {
		try {
			const res = await axios.get(`/api/users/${userId}/avatar`)
			return res.data
		} catch (error) {
			console.error('Error with getAvatar: ', error)
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

	// TODO (later) show friends list

	return {
		profileUser,
		profileImage,
		isBlocked,
		friendUsers,

		isOwner,
		profileBio,
		nbWin,
		nbLoose,
		winRatio,
		lastGames,
		nbFriends,

		loadProfile,
		toggleBlock,
		fetchBlockedStatus,
		getAvatar
	}
})
