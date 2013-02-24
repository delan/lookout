import flask, os, sys, time, psutil, json, socket
from tornado.wsgi import WSGIContainer
from tornado.httpserver import HTTPServer
from tornado.ioloop import IOLoop

if getattr(sys, 'frozen', None):
	basedir = sys._MEIPASS
else:
	basedir = os.path.dirname(__file__)

app = flask.Flask(__name__, static_folder=os.path.join(basedir, 'static'))

@app.route('/')
def hello():
	return flask.send_from_directory(app.static_folder, 'index.html')

@app.route('/raw')
def raw():
	diskused = 0
	disktotal = 0
	for i in psutil.disk_partitions():
		try:
			x = psutil.disk_usage(i.device)
			diskused += x.used
			disktotal += x.total
		except OSError:
			pass
	o = json.dumps({
		'uptime':	time.time() - psutil.BOOT_TIME,
		'fqdn':		socket.getfqdn(),
		'cpuusage':	psutil.cpu_percent(0),
		'ramusage':	psutil.virtual_memory(),
		'diskio':	psutil.disk_io_counters(),
		'diskusage':	[diskused, disktotal]
	})
	return flask.Response(o, mimetype='application/json')

if __name__ == '__main__':
	server = HTTPServer(WSGIContainer(app))
	server.listen(80)
	IOLoop.instance().start()
