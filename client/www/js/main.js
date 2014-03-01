/**
 * Codz by PortWatcher.
 * Team: Jrooy
 * Date: 14-2-28
 * Time: 下午11:18
 */

window.addEventListener('load', function () {
	FastClick.attach(document.body);
}, false);

document.addEventListener('deviceready', function () {
	$('#server_addr').val(settings.SERVER_ADDR);

	$('#btnReady').on('click', function () {
		// tell the server that the player is ready for battle
		Socket.send(JSON.stringify({
			packetType: settings.PACKET_TYPE.PACKET_SYSTEM,
			dataType: settings.DATA_TYPE.CLIENT_READY
		}));

		$('#status').html('已准备，等待对手');
	});

	$('#btnConnect').on('click', function () {
		$('#status').html('连接至服务器中');
		$('#btnConnect').hide();

		var serverIP = $('#server_addr').val() || settings.SERVER_ADDR;
		Socket = new WebSocket('ws://' + serverIP + ':18080');

		Socket.onopen = function () {
			Socket.send(JSON.stringify({
				packetType: settings.PACKET_TYPE.PACKET_SYSTEM,
				dataType: settings.DATA_TYPE.CLIENT_AUTH,
				message: {
					role: settings.ROLE.PLAYER,
					name: $('#name').val()
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
	});
});

