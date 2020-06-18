Java.perform(function () {
	// we create a javascript wrapper for MainActivity
	var Activity = Java.use('com.erev0s.jniapp.MainActivity');
	// replace the Jniint implementation
	Activity.Jniint.implementation = function () {
		// console.log is used to report information back to us
		console.log("Inside Jniint now...");
		// return this number of our choice
		return 80085
	};
});
