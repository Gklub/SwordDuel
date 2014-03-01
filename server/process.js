// vim: ts=4 sw=4 sts=0 noet

var setting = require("./setting");
var error   = require("./error"  );

var process = {};

process[setting.packet.system] = {};
process[setting.packet.game  ] = {};

var system = process[setting.packet.system];
var game   = process[setting.packet.game  ];




system[setting.system.client_auth] = function(wss, ws, msg) {
	if (!msg) return error(ws, "message expected");

	ws.role = msg.role;

	var nplayer = 0;
	for (var i in wss.clients)
		nplayer += wss.clients[i].role == setting.system.role.player;

	if (nplayer == 2)
		for (var i in wss.clients) {
			var s = wss.clients[i];
			if (s.role == setting.system.role.player)
				s.send(JSON.stringify({
					packetType: setting.packet.system,
					  dataType: setting.system.server_ready
				}));
		}
}

system[setting.system.client_ready] = function(wss, ws) {
	ws.ready = true;

	var nready = 0;
	for (var i in wss.clients)
		nready += wss.clients[i].ready;

	if (nready == 2)
		for (var i in wss.clients) {
			var s = wss.clients[i];
			if (s.role == setting.system.role.player) {
				s.send(JSON.stringify({
					packetType: setting.packet.game,
					  dataType: setting.game.start
				}));
				s.send(JSON.stringify({
					packetType: setting.packet.game,
					  dataType: setting.game.round
				}));
			}
		}
}




module.exports = process;

