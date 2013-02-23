import tornado.httpserver, tornado.wsgi, tornado.ioloop, lookout
server = tornado.httpserver.HTTPServer(tornado.wsgi.WSGIContainer(lookout.app))
server.listen(80)
tornado.ioloop.IOLoop.instance().start()
