/**
 * Codz by PortWatcher.
 * Team: Jrooy
 * Date: 14-3-1
 * Time: 上午10:53
 */

(function (param) {
	var uid = 1;
	var Jas = function(){
		this.map = {};
		this.rmap = {};
	};
	var indexOf = Array.prototype.indexOf || function(obj){
		for (var i=0, len=this.length; i<len; ++i){
			if (this[i] === obj) return i;
		}
		return -1;
	};
	var fire = function(callback, thisObj, message){
		setTimeout(function(){
			callback.call(thisObj, message);
		}, 0);
	};
	Jas.prototype = {
		waitFor: function(resources, callback, thisObj){
			var map = this.map, rmap = this.rmap;
			if (typeof resources === 'string') resources = [resources];
			var id = (uid++).toString(16); // using hex
			map[id] = {
				waiting: resources.slice(0), // clone Array
				callback: callback,
				thisObj: thisObj
			};

			for (var i = 0, len = resources.length; i < len; ++i){
				var res = resources[i],
				 list = rmap[res] || (rmap[res] = []);
				list.push(id);
			}
			return this;
		},
		trigger: function(resources, message) {
			if (!resources) return this;
			var map = this.map, rmap = this.rmap;
			if (typeof resources === 'string') resources = [resources];
			for (var i = 0, len = resources.length; i < len; ++i){
				var res = resources[i];
				if (typeof rmap[res] === 'undefined') continue;
				this._release(res, rmap[res], message); // notify each callback waiting for this resource
				delete rmap[res]; // release this resource
			}
			return this;
		},
		_release: function(res, list, message) {
			var map = this.map, rmap = this.rmap;
			for (var i=0, len=list.length; i<len; ++i){
				var uid = list[i], mapItem = map[uid], waiting = mapItem.waiting,
				 pos = indexOf.call(waiting, res);
				waiting.splice(pos, 1); // remove
				if (waiting.length === 0){ // no more depends
					fire(mapItem.callback, mapItem.thisObj, message); // fire the callback asynchronously
					delete map[uid];
				}
			}
		}
	};
	param.Jas = Jas; // Jas is JavaScript Asynchronous (callings) Synchronizer
})(window);

EventEmitter = new Jas();

