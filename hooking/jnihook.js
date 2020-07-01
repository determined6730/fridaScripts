Process.enumerateModules()
	.filter(function(m) {//console.log(m["name"]);
			return m["name"].toLowerCase().indexOf("libnetsdk") != -1;
			})
	.forEach(function(mod) {console.log("----------------");
		console.log(JSON.stringify(mod));
		mod.enumerateExports().forEach(function(exp) {
				if (exp.name.toLowerCase().indexOf("login") != -1) {
					console.log(exp.name);
				}//console.log(exp.name)
				})
		});



console.log("---------------------------------------")
var moduleName = "libnetsdk.so";
var nativeFuncAddr = 0x75e85c1000;

// _Z18build_login_packetPhiPKcS1_iPvPjihiiiii
//Interceptor.attach(Module.findExportByName(null, "build_login_packet"), {
Interceptor.attach(Module.findExportByName(moduleName, "_Z18build_login_packetPhiPKcS1_iPvPjihiiiii"), {
	onEnter: function(args) {
		console.log("testing")
		//this.lib = Memory.readUtf8String(args[0]);
		//console.log("test==> " + this.lib);
	},
	onLeave: function(retval) {
		//if (this.lib.endsWith(moduleName)) {
			console.log(retval);
			//var baseAddr = Module.findBaseAddress(moduleName);
			//Interceptor.attach(baseAddr.add(nativeFuncAddr), {
			//	onEnter: function(args) {
			//		console.log("hook invoked");
					//console.log(JSON.stringify({
						//a1: args[1].toInt32(),
						//a2: Memory.readUtf8String(Memory.readPointer(args[2])),
						//a3: Boolean(args[3])
					//}, null, '\t'));
			//	}
			//});
		//}
	}
});
