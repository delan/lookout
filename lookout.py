import flask
app = flask.Flask(__name__)

import sys, time, psutil, json, socket

@app.route('/')
def hello():
	return flask.send_from_directory(app.static_folder, 'index.html')

@app.route('/raw')
def raw():
	o = json.dumps({
		'uptime':	time.time() - psutil.BOOT_TIME,
		'fqdn':		socket.getfqdn()
	})
	return flask.Response(o, mimetype='application/json')

if __name__ == '__main__':
	host = '::'
	port = 9797
	if len(sys.argv) >= 3:
		host = sys.argv[2]
	if len(sys.argv) >= 2:
		port = int(sys.argv[1])
	app.run(host=host, port=port)
