var include= [
]
var exclude= [
]

var color = {
	reset: "\x1b[39;49;00m", black: "0;01", blue: "4;01", cyan: "6;01", gray: "7;11", green: "2;01", purple: "5;01", red: "1;01", yellow: "3;01",
	light: { black: "0;11", blue: "4;11", cyan: "6;11", gray: "7;01", green: "2;11", purple: "5;11", red: "1;11", yellow: "3;11" }
};

// script inspired by https://github.com/0xdea/frida-scripts/tree/master/android-snippets
var log = function (input, kwargs) {
	kwargs = kwargs || {};
	var loglevel = kwargs['l'] || 'log', colorprefix = '\x1b[3', colorsuffix = 'm';
	if (typeof input === 'object')
		input = json.stringify(input, null, kwargs['i'] ? 2 : null);
	if (kwargs['c'])
		input = colorprefix + kwargs['c'] + colorsuffix + input + color.reset;
	console[loglevel](input);
};

var printbacktrace = function () {
	java.perform(function() {
			var android_util_log = java.use('android.util.log'), java_lang_exception = java.use('java.lang.exception');
			// getting stacktrace by throwing an exception
			log(android_util_log.getstacktracestring(java_lang_exception.$new()), { c: color.gray });
			});
};

function traceclass(targetclass) {
	var hook;
	try {
		hook = java.use(targetclass);

	} catch (e) {
		console.error("trace class failed", e);
		return;
	}

	var methods = hook.class.getdeclaredmethods();
	hook.$dispose();

	var parsedmethods = [];
	methods.foreach(function (method) {
			var methodstr = method.tostring();
			var methodreplace = methodstr.replace(targetclass + ".", "token").match(/\stoken(.*)\(/)[1];
			//if ( methodreplace.search("loadlibrary") > 0 ) {
			parsedmethods.push(methodreplace);
			//	console.log("[debug]" + methodreplace);
			//}
			});

	uniqby(parsedmethods, json.stringify).foreach(function (targetmethod) {
			tracemethod(targetclass + '.' + targetmethod);
			});
}

function tracemethod(targetclassmethod) {
	var delim = targetclassmethod.lastindexof('.');
	if (delim === -1)
		return;

	var targetclass = targetclassmethod.slice(0, delim);
	var targetmethod = targetclassmethod.slice(delim + 1, targetclassmethod.length);

	var hook = java.use(targetclass);
	try{
		var overloadcount = hook[targetmethod].overloads.length;



		log({ tracing: targetclassmethod, overloaded: overloadcount }, { c: color.green });
		for (var i = 0; i < overloadcount; i++) {
			hook[targetmethod].overloads[i].implementation = function () {
				var log = { '#': targetclassmethod, args: [] };

				for (var j = 0; j < arguments.length; j++) {
					var arg = arguments[j];
					// quick&dirty fix for java.io.stringwriter char[].tostring() impl because frida prints [object object]
					if (j === 0 && arguments[j]) {
						if (arguments[j].tostring() === '[object object]') {
							var s = [];
							for (var k = 0, l = arguments[j].length; k < l; k++) {
								s.push(arguments[j][k]);
							}
							arg = s.join('');
						}
					}
					log.args.push({ i: j, o: arg, s: arg ? arg.tostring(): 'null'});
				}

				var retval;
				try {
					retval = this[targetmethod].apply(this, arguments); // might crash (frida bug?)
					log.returns = { val: retval, str: retval ? retval.tostring() : null };
				} catch (e) {
					console.error(e);
				}
				log(log, { c: color.blue });
				return retval;
			}
		}}
	catch(error){
		console.log("error");
	}
}

// remove duplicates from array
function uniqby(array, key) {
	var seen = {};
	return array.filter(function (item) {
			var k = key(item);
			return seen.hasownproperty(k) ? false : (seen[k] = true);
			});
}


function enumallclasses() {
	var allclasses = [];
	var classes = java.enumerateloadedclassessync();

	classes.foreach(function(aclass) {
			try {
			var classname = aclass.replace(/\//g, ".");
			} catch (err) {}
			allclasses.push(classname);
			});

	return allclasses;
}

function enumclassloaders(){
	var allclassloaders = []
		var classloaders = java.enumerateclassloaderssync()

		classloaders.foreach(function(cl) {
				allclassloaders.push(cl);
				});

	return allclassloaders;
}

function enumdexclasses(apk_path) {
	var basedexclassloader = java.use("dalvik.system.basedexclassloader");
	var dexfile = java.use("dalvik.system.dexfile");
	var df = dexfile.$new(apk_path);
	var en = df.entries()

		var dexclasses = []
		while(en.hasmoreelements()){
			dexclasses.push(en.nextelement());
		}

	return dexclasses;
}

function findclasses(pattern) {
	var allclasses = enumallclasses();
	var foundclasses = [];

	allclasses.foreach(function(aclass) {
			try {
			if (aclass.match(pattern)) {
			foundclasses.push(aclass);
			}
			} catch (err) {}
			});

	return foundclasses;
}

function enummethods(targetclass) {
	var hook = java.use(targetclass);
	var ownmethods = hook.class.getdeclaredmethods();
	hook.$dispose;

	return ownmethods;
}

function enumlibso(lib_name){
	exports = module.enumerateexportssync(lib_name);
	var foundobj = []
		for(i=0; i<exports.length; i++){
			foundobj.push(string(exports[i].name) + " : " + string(exports[i].address))
		}
	return foundobj
}

settimeout(function() {
		java.perform(function() {
				var sendback = ''
				var classname_return = ''
				var methods_return = ''
				var enum_signature = '-enummmmmmmmm-'

				// enumerate all classes
				console.log("get classes");
				var a = enumallclasses();
				//console.log(a)
				a.foreach(function(s) {
						if (s){classname_return += json.stringify(s) + '\n'}
						});
				sendback = enum_signature + classname_return
				var class_array = sendback.split("\n")
				//console.log(typeof(class_array))
				var i;
				var target_class =[];
				for ( i = 0; i < class_array.length; i++ ){
				//if ( class_array[i].indexof(".") == -1  || class_array[i].length < 6)
				//	continue;
					if ( class_array[i].search("telephony") > -1 )
						continue;
					if ( class_array[i].search("com.android") != -1 ) 
						target_class.push(class_array[i].replace(/\"/g,""))
				}
				console.log("done filtering");
				target_class.foreach(traceclass);
		});
}, 0);
