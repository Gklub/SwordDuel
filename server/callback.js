// vim: ts=4 sw=4 sts=0 noet

var setting = require("./setting");
var error   = require("./error"  );

var callback = {};

callback[setting.packet.system] = {};
callback[setting.packet.game  ] = {};

var system = callback[setting.packet.system];
var game   = callback[setting.packet.game  ];




system[setting.system.client_auth] = function(wss, ws, msg) {
	if (!msg) return error(ws, "message expected");

	ws.role = msg.role;

	var nplayer = 0;
	var npanel  = 0;
	for (var i in wss.clients) {
		nplayer += (wss.clients[i].role == setting.system.role.player);
		npanel  += (wss.clients[i].role == setting.system.role.panel );
	}

	if (nplayer == 2 && npanel)
		for (var i in wss.clients) {
			var s = wss.clients[i];
			if (s.role == setting.system.role.player) {
				s.health = setting.health;
				s.send(JSON.stringify({
					packetType: setting.packet.system,
					  dataType: setting.system.server_ready,
				}));
			}
		}
}

system[setting.system.client_ready] = function(wss, ws) {
	ws.ready = true;

	var nready = 0;
	for (var i in wss.clients) {
		var s = wss.clients[i];
		nready += (s.role == setting.system.role.player && s.ready);
	}

	if (nready == 2)
		for (var i in wss.clients) {
			var s = wss.clients[i];
			s.send(JSON.stringify({
				packetType: setting.packet.game,
				  dataType: setting.game.start,
			}));
			if (s.role == setting.system.role.player) {
				s.send(JSON.stringify({
					packetType: setting.packet.game,
					  dataType: setting.game.round,
				}));
			}
		}
}

game[setting.game.attack] = function(wss, ws, msg) {
	if (!msg) return error(ws, "message expected");
	if (!msg.a) return error(ws, "acceleration (a) expected");

	ws.a = msg.a;

	var ss = Array();	// sockets of who has acceleration value
	for (var i in wss.clients)
		if (wss.clients[i].a)
			ss.push(wss.clients[i]);

	if (ss.length == 2)
		var dh = Math.abs(ss[0].a - ss[1].a);	// delta health
		var defeat = Number(ss[0].a > ss[1].a);
		ss[defeat].health -= dh;

		for (var i in wss.clients) {
			var s = wss.clients[i];
			if (s.role == setting.system.role.panel) {
				s.send(JSON.stringify({
					packetType: setting.packet.game,
					  dataType: setting.game.result,
					message: {
						player: defeat,
						health: ss[defeat].health,
					}
				}));
			}
		}
}




module.exports = callback;

