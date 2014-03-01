// vim: ts=4 sw=4 sts=0 noet

var setting = require("./setting");
var process = require("./process");
var error   = require("./error"  );

// create websokect server
var wss = require("ws").Server;
wss = new wss({ port: 18080 });




wss.on('connection', function(ws) {
	ws.on('message', function(msg) {
		// get json object from msg
		var pkt;
		try {
			pkt = JSON.parse(msg);
		}
		catch (e) {
			console.log(e);
			return error(ws, "json string expected");
		}

		// XXX DEBUG
		console.log(pkt);

		// dispatch packet
		var proc = process[pkt.packetType];
		if (!proc) return error(ws, "invalid packetType");
		proc = proc[pkt.dataType];
		if (!proc) return error(ws, "invalid dataType");
		proc(wss, ws, pkt.message);
	});
});

