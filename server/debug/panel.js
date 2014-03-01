// vim: ts=4 sw=4 sts=0 noet

var setting = require("../setting");

// create websokect client
var ws = require("ws");
ws = new ws('ws://127.0.0.1:18080');




ws.on('open', function() {
	console.log('connected.');
	ws.send(JSON.stringify({
		packetType: setting.packet.system,
		  dataType: setting.system.client_auth,
		message: {
			role: setting.system.role.panel,
		}
	}));
});

var healths;

ws.on('message', function(msg) {
	var pkt = JSON.parse(msg);
	console.log("received:", pkt);

	var print_health = function(damages) {
		if (damages === undefined) damages = [ 0, 0 ];
		var s = ">>> \033[1;31m" + damages[0].toFixed(2) + "\033[0m >>> " +
				"1 HP \033[1;35m" + parseInt(healths[0]) + "\033[0m  --  " +
				"\033[1;35m" + parseInt(healths[1]) + "\033[0m HP 2 <<< " +
				"\033[1;31m" + damages[1].toFixed(2) + "\033[0m <<<";
		console.log(s);
	}

	if (	pkt.packetType == setting.packet.game &&
			pkt.  dataType == setting.game.start) {
		healths = [ pkt.message.health, pkt.message.health ];
		console.log("new game:");
		print_health();
	}

	if (	pkt.packetType == setting.packet.game &&
			pkt.  dataType == setting.game.result) {
		var player = pkt.message.player;
		var health = pkt.message.health;
		var damages = pkt.message.damages;
		healths[player] = health;

		print_health(damages);

		ws.send(JSON.stringify({
			packetType: setting.packet.game,
			  dataType: setting.game.displayed,
		}));
	}

	if (	pkt.packetType == setting.packet.game &&
			pkt.  dataType == setting.game.over) {
		var player = pkt.message.player;
		healths[player] = 0;

		print_health();
		console.log(">>>>>>>> \033[1;34m", "player" + (2-player) + " won!", "\033[0m <<<<<<<<");
	}
});

