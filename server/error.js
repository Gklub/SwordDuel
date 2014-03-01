// vim: ts=4 sw=4 sts=0 noet

var setting = require("./setting");

module.exports = function(ws, desc) {
	ws.send(JSON.stringify({
		packetType: setting.packet.system,
		  dataType: setting.system.invalid,
		message: {
			description: desc,
		}
	}));
	ws.close();
}

