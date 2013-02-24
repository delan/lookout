Run `lookout.py` to start the monitoring server. By default, the monitor will be
accessible on port 80 from any interface. On Linux, this is a privileged port so
you will need to run it as root.

Windows users, install python, pip and MSVC++ 2008.

Linux users, install the following packages or their equivalents:

	build-essential python python-dev python-pip

Using pyinstaller to create a standalone executable:

1. delete or rename werkzeug's `__init__.py` to disable the broken import magic
2. run `path/to/pyinstaller/pyinstaller.py -F lookout.spec`
3. executable will be found in the `dist` directory
