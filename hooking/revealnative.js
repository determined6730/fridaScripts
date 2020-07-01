Java.perform(function() {
		const System = Java.use('java.lang.System');
		const Runtime = Java.use('java.lang.Runtime');
		const SystemLoad_2 = System.loadLibrary.overload('java.lang.String');
		const RuntimeLoad_2= Runtime.loadLibrary.overload('java.lang.String');
		const VMStack = Java.use('dalvik.system.VMStack');
		const ThreadDef = Java.use('java.lang.Thread');
		const ThreadObj = ThreadDef.$new();

		function stackTrace() {
		var stack = ThreadObj.currentThread().getStackTrace();
		for (var i = 0; i < stack.length; i++) {
		console.log(i + " => " + stack[i].toString());
		}
		console.log("--------------------------------------------------------------------------");
		}

		SystemLoad_2.implementation = function(library) {
		stackTrace();
		console.log("Loading dynamic library => " + library);
		try {
		const loaded = Runtime.getRuntime().loadLibrary0(VMStack.getCallingClassLoader(), library);
		if(library.includes("yourlibraryhere")) {
		// do stuff
		}
		return loaded;
		} catch(ex) {
		console.log(ex);
		}
		};
		RuntimeLoad_2.implementation = function(library) {
		stackTrace();
		console.log("Loading dynamic library => " + library);
		try {
		const loaded = Runtime.getRuntime().loadLibrary0(VMStack.getCallingClassLoader(), library);
		if(library.includes("yourlibraryhere")) {
		// do stuff
		}
		return loaded;
		} catch(ex) {
		console.log(ex);
		}
		};

});
