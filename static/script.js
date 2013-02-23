(function() {
	var transforms = {
		uptime: td2str
	};
	var count = 0, count_err = 0;
	var avglat = 0;
	var wait = 1000;
	var margin = 250;
	function ping() {
		var time = +new Date;
		heartbeaton();
		$.get('raw', function(data) {
			document.title = data.fqdn;
			for (var i in data)
				$('#' + i).text(transforms[i] ?
					transforms[i](data[i]) : data[i]);
			// compensate for request time while allowing time for
			// the heartbeat transitions to complete
			var t = new Date - time;
			avglat = (avglat * count + t) / ++count;
			update();
			if (t <= margin) {
				setTimeout(heartbeatoff, margin - t);
				setTimeout(ping, wait - t);
			} else if (t <= wait - margin) {
				heartbeatoff();
				setTimeout(ping, wait - t);
			} else {
				heartbeatoff();
				setTimeout(ping, margin);
			}
		});
	}
	function update() {
		$('#avglat').text(avglat.toFixed(2) + ' ms');
		$('#requests').text(count + ' (' + count_err + ')');
	}
	function heartbeaton() {
		$('#heartbeat').addClass('on');
	}
	function heartbeatoff() {
		$('#heartbeat').removeClass('on');
	}
	function error() {
		++count_err;
		$('#uptime').text('OFFLINE');
		update();
		setTimeout(ping, wait);
	}
	function pad(string) {
		return ('00' + string).slice(-2);
	}
	function td2str(seconds) {
		var d = Math.floor(seconds / 86400);
		var h = Math.floor(seconds / 3600) % 24;
		var m = Math.floor(seconds / 60) % 60;
		var s = Math.floor(seconds) % 60;
		return [d, pad(h), pad(m), pad(s)].join(':');
	}
	$.ajaxSetup({
		timeout: 5000,
		error: error
	});
	ping();
})();
