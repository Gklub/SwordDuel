// vim: ts=4 sw=4 sts=0 noet

module.exports = {
	// transformation
	packet: {
		system: 0,
		game: 1,
	},

	system: {
		server_ready: 0,
		client_ready: 1,
		client_auth : 2,
		invalid: 3,
		role: {
			player: 0,
			panel : 1,
		},
	},

	game: {
		start: 0,
		round: 1,
		attack: 2,
		result: 3,
		over: 4,
		displayed: 5,
	},


	// server
	health: 1000,		// initial health
};

