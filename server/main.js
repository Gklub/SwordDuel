// vim: ts=4 sw=4 sts=0 noet

var setting  = require("./setting" );
var callback = require("./callback");
var error    = require("./error"   );

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
		var cb = callback[pkt.packetType];
		if (!cb) return error(ws, "invalid packetType");
		cb = cb[pkt.dataType];
		if (!cb) return error(ws, "invalid dataType");
		cb(wss, ws, pkt.message);
	});

	ws.on('close', function() {
		console.log("closed");
	});
});

