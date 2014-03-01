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
		  Director.toggleWaiting();
//		 initialize full hp for 2 players
			Player.full = packet.message.health;
			Player.set1HP(packet.message.health);
			Player.set2HP(packet.message.health);

		  var names = packet.message.names;
		  Player.set1Name(names[0]);
		  Player.set2Name(names[1]);

			break;
		case settings.DATA_TYPE.ATTACK :
		  var isPlayer1 = !packet.message.player;
		  var damage = packet.message.damage;

		  Director.displayDamage(isPlayer1, damage);

		  if (isPlayer1) {
			  Audio.play1P();
		  } else {
			  Audio.play2P();
		  }
			break;

		case settings.DATA_TYPE.RESULT :
		  Audio.playKnock();
		  console.log('one result');
			var isPlayer1 = !packet.message.player;
			var hp = packet.message.health;

			if (isPlayer1) {
				Player.set1HP(hp);
			} else {
				Player.set2HP(hp);
			}

		  Director.shake(isPlayer1);

		  setTimeout(function () {
				Socket.send(JSON.stringify({
					packetType: settings.PACKET_TYPE.PACKET_GAME,
					dataType: settings.DATA_TYPE.DISPLAY_OVER
				}));
		  }, 2000);

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

$(function () {
	Director.toggleWaiting();
});