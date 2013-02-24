(function() {
	var u = {}; // utility functions
	u.padt = function(s) {
		return ('00' + s).slice(-2);
	};
	u.seconds = function(n) {
		var d = Math.floor(n / 86400);
		var h = Math.floor(n / 3600) % 24;
		var m = Math.floor(n / 60) % 60;
		var s = Math.floor(n) % 60;
		return [d, u.padt(h), u.padt(m), u.padt(s)].join(':');
	};
	u.bytes = function(n) {
		if (n > Math.pow(2, 50))
			return (n / Math.pow(2, 50)).toFixed(2) + ' PiB';
		if (n > Math.pow(2, 40))
			return (n / Math.pow(2, 40)).toFixed(2) + ' TiB';
		if (n > Math.pow(2, 30))
			return (n / Math.pow(2, 30)).toFixed(2) + ' GiB';
		if (n > Math.pow(2, 20))
			return (n / Math.pow(2, 20)).toFixed(2) + ' MiB';
		if (n > Math.pow(2, 10))
			return (n / Math.pow(2, 10)).toFixed(2) + ' KiB';
		return n + ' B';
	};
	u.percent = function(n) {
		return n.toFixed(1) + '%';
	};
	var h = {}; // data handlers
	h.fqdn = function(s) {
		$('#fqdn').text(s);
	};
	h.uptime = function(n) {
		$('#uptime').text(u.seconds(n));
	};
	h.cpuusage = function(n) {
		$('#cpuusage').text(u.percent(n));
		c_cpuusage_l.append(+new Date, n);
	};
	h.ramusage = function(n) {
		$('#ramusage').text(u.bytes(n[3]));
		c_ramusage_l.append(+new Date, n[2]);
	};
	var count = 0, errors = 0;
	var latency = 0;
	var wait = 1000;
	var margin = 250;
	function ping() {
		var time = +new Date;
		heartbeaton();
		$.get('raw', function(data) {
			document.title = data.fqdn;
			for (var i in data)
				h[i] && h[i](data[i]);
			// compensate for request time while allowing time for
			// the heartbeat transitions to complete
			var t = latency = new Date - time;
			++count;
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
		$('#latency').text(latency + ' ms');
		c_latency_l.append(+new Date, latency);
		$('#requests').text(count + '/' + errors);
	}
	function heartbeaton() {
		$('#heartbeat').addClass('on');
	}
	function heartbeatoff() {
		$('#heartbeat').removeClass('on');
	}
	function error() {
		++errors;
		$('#uptime').text('OFFLINE');
		update();
		setTimeout(ping, wait);
	}
	$.ajaxSetup({
		timeout: 5000,
		error: error
	});
	var smoothie_options = {
		millisPerPixel: 100
	};
	var percent_options = {
		millisPerPixel: 100,
		minValue: 0,
		maxValue: 100,
		labels: { fillStyle: 'rgba(0, 0, 0, 0)' }
	};
	var ts_options = {
		// fillStyle: 'rgba(255, 64, 64, 0.2)',
		strokeStyle: 'rgba(255, 64, 64, 1)'
	};
	var c_latency = new SmoothieChart(smoothie_options);
	c_latency.streamTo($('#c_latency')[0], 1000);
	var c_latency_l = new TimeSeries();
	c_latency.addTimeSeries(c_latency_l, ts_options);
	var c_cpuusage = new SmoothieChart(percent_options);
	c_cpuusage.streamTo($('#c_cpuusage')[0], 1000);
	var c_cpuusage_l = new TimeSeries();
	c_cpuusage.addTimeSeries(c_cpuusage_l, ts_options);
	var c_ramusage = new SmoothieChart(percent_options);
	c_ramusage.streamTo($('#c_ramusage')[0], 1000);
	var c_ramusage_l = new TimeSeries();
	c_ramusage.addTimeSeries(c_ramusage_l, ts_options);
	ping();
})();
