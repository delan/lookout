Lookout
=======

Lightweight, web-based server monitoring.

The Python backend uses Flask and Tornado to serve JSON data thanks to psutil,
while the frontend uses Smoothie Charts for the live graphs.

Running directly from source
----------------------------

To run Lookout from source, install Python 2.7, pip and a C compiler. Windows
users should use MSVC++ 2008 (not even a newer version) for the least headaches.

Then install dependencies with `pip install -r requirements.txt`.

Finally, run `lookout.py` to start monitoring. You can optionally supply the
port to listen on as the first argument (e.g. `lookout.py 8080`), but the
default is port 80.

Skype users, please note that port 80 and 443 are taken by default; you will
need to turn off "Use 80 and 443 for incoming connections" and restart Skype to
use those ports.

How to build a standalone executable
------------------------------------

Werkzeug does some crazy import magic that breaks PyInstaller's module
detection, so please rename or delete werkzeug's `__init__.py` to disable this.

Download PyInstaller and in this directory, run
`path/to/pyinstaller.py -F lookout.spec`.

The resulting executable will be found as `dist/lookout.exe`. Run it to start
monitoring, again with an optional port argument.
