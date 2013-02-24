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
	u.bytes = function(n, decimal) {
		var base = decimal ? 10 : 2;
		var exp = decimal ? 3 : 10;
		var units = decimal ? ['B', 'KB', 'MB', 'GB', 'TB', 'PB'] :
		                      ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'];
		for (i = 5; i >= 0; i--)
			if (n >= Math.pow(base, i * exp) - 1)
				return (n / Math.pow(base, i * exp)).
					toFixed(2) + ' ' + units[i];
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
		$('#ramusage').text(u.bytes(n[0] - n[1]));
		c_ramusage_l.append(+new Date, n[2]);
	};
	h.diskio = function(n) {
		$('#diskr').text(u.bytes(n[2], 1));
		$('#diskw').text(u.bytes(n[3], 1));
		if (h.diskio.lastr != undefined) {
			var rs = n[2] - (h.diskio.lastr || 0);
			var ws = n[3] - (h.diskio.lastw || 0);
			$('#diskrs').text(u.bytes(rs, 1) + '/s');
			$('#diskws').text(u.bytes(ws, 1) + '/s');
			c_diskrs_l.append(+new Date, rs / 1048576);
			c_diskws_l.append(+new Date, ws / 1048576);
		}
		h.diskio.lastr = n[2];
		h.diskio.lastw = n[3];
	};
	h.diskusage = function(n) {
		$('#disku').text(u.bytes(n[0], 1));
		$('#diskt').text(u.bytes(n[1], 1));
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
	var c_diskrs = new SmoothieChart(smoothie_options);
	c_diskrs.streamTo($('#c_diskrs')[0], 1000);
	var c_diskrs_l = new TimeSeries();
	c_diskrs.addTimeSeries(c_diskrs_l, ts_options);
	var c_diskws = new SmoothieChart(smoothie_options);
	c_diskws.streamTo($('#c_diskws')[0], 1000);
	var c_diskws_l = new TimeSeries();
	c_diskws.addTimeSeries(c_diskws_l, ts_options);
	ping();
})();
