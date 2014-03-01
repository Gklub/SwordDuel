/**
 * Codz by PortWatcher.
 * Team: Jrooy
 * Date: 14-3-1
 * Time: 下午7:12
 */

var Director = {
	over: function (isPlayer1Win) {
		if (isPlayer1Win) {
			this.toggleResult('1p');
		} else {
			this.toggleResult('2p');
		}
	},

	waitingModal: new $.UIkit.modal.Modal("#waitingModal"),
	resultModal: new $.UIkit.modal.Modal("#resultModal"),

	toggleWaiting: function () {
		if ( this.waitingModal.isActive() ) {
			this.waitingModal.hide();
		} else {
			this.waitingModal.show();
		}
	},
	toggleResult: function (player) {
		$('#player').html(player);

		if ( this.resultModal.isActive() ) {
			this.resultModal.hide();
		} else {
			this.resultModal.show();
		}
	}
};