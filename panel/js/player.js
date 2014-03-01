/**
 * Codz by PortWatcher.
 * Team: Jrooy
 * Date: 14-3-1
 * Time: 下午6:20
 */

var Player = {
	full: null,
	player1HP: null,
	player2HP: null,

	player1Bar: $('#1PHP'),
	player2Bar: $('#2PHP')
};

Player.set1HP = function (hp) {
	this.player1HP = hp;
	this.player1Bar.attr('style', 'width:' + Player.player1HP / Player.full * 100 + '%;');
};

Player.set2HP = function (hp) {
	this.player2HP = hp;
	this.player2Bar.attr('style', 'width:' + Player.player2HP / Player.full * 100 + '%;');
};
