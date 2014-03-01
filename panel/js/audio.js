/**
 * Codz by PortWatcher.
 * Team: Jrooy
 * Date: 14-3-1
 * Time: 下午6:20
 */

var Audio = {
	player1SwipeAudio: document.getElementsByTagName("audio")[0],
	player2SwipeAudio: document.getElementsByTagName("audio")[1],
	knockAudio: document.getElementsByTagName("audio")[2]
};

Audio.play1P = function () {
	this.player1SwipeAudio.play();
};

Audio.play2P = function () {
	this.player2SwipeAudio.play();
};

Audio.playKnock = function () {
	this.knockAudio.play();
};