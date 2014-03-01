/**
 * Codz by PortWatcher.
 * Team: Jrooy
 * Date: 14-3-1
 * Time: 下午6:21
 */

var Socket = new WebSocket('ws://' + settings.SERVER_ADDR + ':18080');

Socket.onopen = function () {
	console.log('connection has been established');
	Socket.send(JSON.stringify({
		packetType: settings.PACKET_TYPE.PACKET_SYSTEM,
		dataType: settings.DATA_TYPE.CLIENT_AUTH,
		message: {
			role: settings.ROLE.PANEL
		}
	}));
	console.log('role has been authed');
};

Socket.onmessage = function (event) {
	var packet = JSON.parse(event.data);

	if (packet.packetType === settings.PACKET_TYPE.PACKET_SYSTEM && packet.dataType === settings.DATA_TYPE.INVALID) {
		console.log('receive invalid from server');
		return;
	}

	console.dir(packet);
	switch (packet.dataType) {
		case settings.DATA_TYPE.GAME_START :
		  console.log('game start');
//		 initialize full hp for 2 players
			Player.set1HP(packet.message.health);
			Player.set2HP(packet.message.health);
			Player.full = packet.message.health;

			break;

		case settings.DATA_TYPE.RESULT :
		  console.log('one result');
			var isPlayer1 = packet.message.player;
			var hp = packet.message.health;

			if (isPlayer1) {
				Player.set1HP(hp);
			} else {
				Player.set2HP(hp);
			}

			break;

		case settings.DATA_TYPE.GAME_OVER :
		  console.log('game over');
			var isPlayer2Dead = packet.message.player;

			if (isPlayer2Dead) {
				Player.set2HP(0);
			} else {
				Player.set1HP(0);
			}

			Director.over(isPlayer2Dead);

			break;

		default :
			console.log('unknown data type');
			break;
	}
};

Socket.onerror = function () {
	console.log('socket error');
};

Socket.onclose = function () {
	console.log('socket close');
};
