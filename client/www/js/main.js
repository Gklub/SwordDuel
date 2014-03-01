/**
 * Codz by PortWatcher.
 * Team: Jrooy
 * Date: 14-2-28
 * Time: 下午11:18
 */

document.addEventListener('deviceready', function () {

	Socket = new WebSocket('ws://' + settings.SERVER_ADDR + ':18080');

	Socket.onopen = function () {
		Socket.send(JSON.stringify({
			packetType: settings.PACKET_TYPE.PACKET_SYSTEM,
			dataType: settings.DATA_TYPE.CLIENT_AUTH,
			message: {
				role: settings.ROLE.PLAYER
			}
		}));

		$('#status').html('已连接至服务器，等待对手加入');
	};

	Socket.onmessage = function (event) {
		Dispatcher.dispatch(JSON.parse(event.data));
	};

	Socket.onerror = function () {
		console.log('socket error');
	};

	Socket.onclose = function () {
		$('#status').html('连接已断开');
		console.log('socket closed');
	};

	$('#btnReady').on('click', function () {
		// tell the server that the player is ready for battle
		Socket.send(JSON.stringify({
			packetType: settings.PACKET_TYPE.PACKET_SYSTEM,
			dataType: settings.DATA_TYPE.CLIENT_READY
		}));

		$('#status').html('已准备，等待对手');
	});
});

