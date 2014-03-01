/**
 * Codz by PortWatcher.
 * Team: Jrooy
 * Date: 14-3-1
 * Time: 下午7:12
 */

var Director = {
	waitingModal: new $.UIkit.modal.Modal("#waitingModal"),
	resultModal: new $.UIkit.modal.Modal("#resultModal"),

	over: function (isPlayer1Win) {
		if (isPlayer1Win) {
			this.toggleResult(Player.name1);
		} else {
			this.toggleResult(Player.name2);
		}
	},

	toggleWaiting: function () {
		if (this.waitingModal.isActive()) {
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
	},

	displayDamage: function (isPlayer1, damage) {

		var damageDOM = $('<span class="damage">' + parseInt(damage) + '</span>');

		if (isPlayer1) {
			$('#1PDamage .damage').remove();
			$('#1PDamage').append(damageDOM);

			$('#1PDamage .damage').animate({
				'font-size': '7em'
			}, 90);
		} else {
			$('#2PDamage .damage').remove();
			$('#2PDamage').append(damageDOM);

			$('#2PDamage .damage').animate({
				'font-size': '7em'
			}, 90);
		}
	}

//	shake: function (isPlayer1) {
//		if (isPlayer1) {
//			var HPbar = document.getElementById('1P');
//		}	else {
//			var HPbar = document.getElementById('2P');
//		}
//		var a=['top','left'],b=0;
//		var u = setInterval(function () {
//			HPbar.style[a[b%2]]=(b++)%4<2?0:4;
//			if (b > 15) {
//				clearInterval(u);
//				b = 0
//			}
//		},32)
//	}
};