import frida, sys

def on_message(message, data):
    if message['type'] == 'send':
        print("[*] {0}".format(message['payload']))
    else:
        print(message)

jscode = """
Java.perform(function () {
    var MainActivity = Java.use('com.yourapp.MainActivity');
    MainActivity.onClick.implementation = function (v) {
        send('onClick');
        this.onClick(v);

        this.m.value = 0;
        this.n.value = 1;
        this.cnt.value = 999;

        // Log to the console that it's done, and we should have the flag!
        console.log('Done:' + JSON.stringify(this.cnt));
    };
});
"""

process = frida.get_usb_device().attach('com.your.app')
script = process.create_script(jscode)
script.on('message', on_message)
script.load()
sys.stdin.read()
