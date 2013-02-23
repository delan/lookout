(function() {
	var transforms = {
		uptime: td2str,
		cpuusage: function(a) {
			return a.map(pc2str).map(padpc).join(' ');
		},
		ramusage: function(a) {
			var x = b2str(a[1]);
			var y = b2str(a[0]);
			var p = pc2str(a[2]);
			return x + '/' + y + ' (' + p + ')';
		},
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
	function padpc(string) {
		//      'abc.d%'
		return ('      ' + string).slice(-6);
	}
	function td2str(seconds) {
		var d = Math.floor(seconds / 86400);
		var h = Math.floor(seconds / 3600) % 24;
		var m = Math.floor(seconds / 60) % 60;
		var s = Math.floor(seconds) % 60;
		return [d, pad(h), pad(m), pad(s)].join(':');
	}
	function pc2str(percentage) {
		return percentage + '%';
	}
	function b2str(bytes) {
		if (bytes > Math.pow(2, 50))
			return (bytes / Math.pow(2, 50)).toFixed(2) + ' PiB';
		if (bytes > Math.pow(2, 40))
			return (bytes / Math.pow(2, 40)).toFixed(2) + ' TiB';
		if (bytes > Math.pow(2, 30))
			return (bytes / Math.pow(2, 30)).toFixed(2) + ' GiB';
		if (bytes > Math.pow(2, 20))
			return (bytes / Math.pow(2, 20)).toFixed(2) + ' MiB';
		if (bytes > Math.pow(2, 10))
			return (bytes / Math.pow(2, 10)).toFixed(2) + ' KiB';
		return bytes + ' B';
	}
	$.ajaxSetup({
		timeout: 5000,
		error: error
	});
	ping();
})();
