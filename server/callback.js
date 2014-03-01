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

	if (msg.role === undefined) return error(ws, "role expected");
	ws.role = msg.role;

	if (msg.role == setting.system.role.player) {
		if (msg.name === undefined) return error(ws, "name expected");
		ws.name = msg.name;
	}

	var nplayer = 0;
	var npanel  = 0;
	for (var i in wss.clients) {
		nplayer += (wss.clients[i].role == setting.system.role.player);
		npanel  += (wss.clients[i].role == setting.system.role.panel );
	}

	// notify player: you can press "start" now
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

	var names = [];
	for (var i in wss.clients) {
		var s = wss.clients[i];
		if (s.role == setting.system.role.player)
			names.push(s.name);
	}

	// notify panel : game start
	// notify player: game start, new round
	if (names.length == 2) {
		var start_pkt = JSON.stringify({
			packetType: setting.packet.game,
			  dataType: setting.game.start,
			message: {
				health: setting.health,
				names : names,
			},
		});

		var round_pkt = JSON.stringify({
			packetType: setting.packet.game,
			  dataType: setting.game.round,
		});

		for (var i in wss.clients) {
			var s = wss.clients[i];
			s.send(start_pkt);
			if (s.role == setting.system.role.player)
				s.send(round_pkt);
		}
	}
}

game[setting.game.attack] = function(wss, ws, msg) {
	if (!msg) return error(ws, "message expected");
	if (msg.a === undefined) return error(ws, "acceleration (a) expected");

	ws.a = msg.a;

	var ss = [];	// sockets of those who have acceleration values
	var players = [];
	for (var i in wss.clients) {
		var s = wss.clients[i];
		if (s.a)
			ss.push(s);
		if (s.role == setting.system.role.player)
			players.push(s);
	}
	var playerid = Number(players[1] == ws);

	for (var i in wss.clients) {
		var s = wss.clients[i];
		if (s.role == setting.system.role.panel)
			s.send(JSON.stringify({
				packetType: setting.packet.game,
				  dataType: setting.game.attack,
				message: {
					player: playerid,
					damage: ws.a,
				}
			}));
	}

	if (ss.length == 2) {
		var dh = 150*Math.log(Math.abs(ss[0].a-ss[1].a) + 1);	// delta health
		var defeat = Number(ss[0].a > ss[1].a);
		var die = (ss[defeat].health -= dh) <= 0;

		var over_pkt = JSON.stringify({
			packetType: setting.packet.game,
			  dataType: setting.game.over,
			message: {
				player: defeat,
			}
		});

		var result_pkt = JSON.stringify({
			packetType: setting.packet.game,
			  dataType: setting.game.result,
			message: {
				player: defeat,
				health: ss[defeat].health,
			}
		});

		ss[0].a = ss[1].a = undefined;

		// notify panel: update the loser's health, or game over if die
		for (var i in wss.clients) {
			var s = wss.clients[i];
			if (die) {
				s.ready = undefined;
				s.send(over_pkt);
			}
			else if (s.role == setting.system.role.panel)
				s.send(result_pkt);
		}
	}
}

game[setting.game.displayed] = function(wss, ws) {
	ws.displayed = true;

	// check if all displayed
	for (var i in wss.clients) {
		var s = wss.clients[i];
		if (s.role == setting.system.role.panel && !s.displayed) return;
	}

	// reset
	for (var i in wss.clients)
		wss.clients[i].displayed = undefined;

	// notify clients: new round
	for (var i in wss.clients) {
		var s = wss.clients[i];
		if (s.role == setting.system.role.player) {
			s.send(JSON.stringify({
				packetType: setting.packet.game,
				  dataType: setting.game.round,
			}));
		}
	}
}




module.exports = callback;

