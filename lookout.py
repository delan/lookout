import flask
app = flask.Flask(__name__)

import sys, time, psutil, json, socket
from tornado.wsgi import WSGIContainer
from tornado.httpserver import HTTPServer
from tornado.ioloop import IOLoop

@app.route('/')
def hello():
	return flask.send_from_directory(app.static_folder, 'index.html')

@app.route('/raw')
def raw():
	o = json.dumps({
		'uptime':	time.time() - psutil.BOOT_TIME,
		'fqdn':		socket.getfqdn(),
		'cpuusage':	psutil.cpu_percent(0),
		'ramusage':	psutil.virtual_memory()
	})
	return flask.Response(o, mimetype='application/json')

if __name__ == '__main__':
	server = HTTPServer(WSGIContainer(app))
	server.listen(80)
	IOLoop.instance().start()
