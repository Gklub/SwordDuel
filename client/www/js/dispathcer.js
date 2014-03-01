/**
 * Codz by PortWatcher.
 * Team: Jrooy
 * Date: 14-3-1
 * Time: 上午10:34
 */

Dispatcher = {
	dispatch: function (packet) {
		console.dir(packet);
		switch (packet.packetType) {
			case settings.PACKET_TYPE.PACKET_SYSTEM :
			  this.dispatchSystemPacket(packet);
				break;

			case settings.PACKET_TYPE.PACKET_GAME :
				this.dispatchGamePacket(packet);
				break;

			default :
			  console.log('unknown packet type');
				break;
		}
	},

	dispatchSystemPacket: function (packet) {
		switch (packet.dataType) {
			case settings.DATA_TYPE.SERVER_READY :
			  alert('server ready');
				$('#btnReady').attr('disabled', null);
			  $('#btnReady').show();
				$('#status').html('对手已加入，请准备');
				break;

			case settings.DATA_TYPE.INVALID :
				break;

			default :
				console.log('unknown system data type');
				break;
		}
	},

	dispatchGamePacket: function (packet) {
		switch (packet.dataType) {
			case settings.DATA_TYPE.GAME_START :
				$('#status').html('决斗开始');
				$('#btnReady').hide();
				break;

			case settings.DATA_TYPE.ROUND_START :
				$('#status').html('请快速挥动手机，力量越大，伤害越大');

				var accelerations = [];
				var x = 0;
			  var start = false;
			  var last = 0;
			  var current = 0;
			  var sent = false;

				//	collect x every 0.03 seconds
			  if (!sent) {
				  var watchId = navigator.accelerometer.watchAcceleration(function (acceleration) {
					  acceleration.x = Math.abs(acceleration.x);

					  last = current;
					  current = acceleration.x;

					  // 10 is gravity, uh.. a little greater than gravity
					  if (Math.abs(current - last) > 10) {
						  start = true;
					  }

					  if (!start) {
						  return;
					  }

					  accelerations.push(acceleration.x);

					  if (Math.abs(current - last) <= 2 && watchId) {
						  start = false;
						  navigator.accelerometer.clearWatch(watchId);
						  watchId = null;

						  navigator.notification.vibrate(500);

						  // count max x
						  accelerations.forEach(function (acceleration) {
							  if (acceleration > x) {
								  x = acceleration;
							  }
						  });

						  $('#status').html('等待结果');

						  // send the max x to the server
						  Socket.send(JSON.stringify({
							  packetType: settings.PACKET_TYPE.PACKET_GAME,
							  dataType: settings.DATA_TYPE.ATTACK,
							  message: {
								  a: x
							  }
						  }));

						  sent = true;
					  }
				  }, function () {
					  alert('error');
				  }, { frequency: 30 });
			  }

				break;

			case settings.DATA_TYPE.GAME_OVER :
				$('#status').html('游戏结束');
				$('#btnReady').show();
				break;

			default :
				console.log('unkown game data type');
				break;
		}
	}
};
