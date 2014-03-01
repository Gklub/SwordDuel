/**
 * Codz by PortWatcher.
 * Team: Jrooy
 * Date: 14-2-28
 * Time: 下午11:19
 */

settings = {
	PACKET_TYPE: {
		PACKET_SYSTEM: 0,
		PACKET_GAME: 1
	},

	DATA_TYPE: {
		SERVER_READY: 0,
		CLIENT_READY: 1,
		CLIENT_AUTH: 2,
		INVALID: 3,

		GAME_START: 0,
		ROUND_START: 1,
		ATTACK: 2,
		RESULT: 3,
		GAME_OVER: 4
	},

	ROLE: {
		PLAYER: 0,
		PANEL: 1
	},

	SERVER_ADDR: localStorage.getItem('IP')
};