"use strict";
var work = require('webworkify');
require('regenerator-runtime');
var w = work(require('http-server'));


function start() {
window.onload = function()
{
    window.emulator = new V86Starter({
    cdrom: {"url": "../v86/images/v86-linux.iso"},
                filesystem: {
                    //"basefs": "fs.json",
                    //"baseurl": "./fsroot/",
                },
        memory_size: 64 * 1024 * 1024,
        vga_memory_size: 2 * 1024 * 1024,
//        network_relay_url: "ws://relay.widgetry.org:80",

        bios: {
            url: "../v86/bios/seabios.bin",
        },
        vga_bios: {
            url: "../v86/bios/vgabios.bin",
        },
        screen_container: document.getElementById("screen_container"), serial_container: document.getElementById("serial"),
	autostart: true
    });

document.getElementById("send").onclick = function() {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            emulator.serial0_send(xhr.responseText);
        }
    }
    xhr.open('GET', 'tcp-serial-bridge/squashfs.uuencode', true);
    xhr.send(null);
};
document.getElementById("pause").onclick = function() {
	this.notpaused = !this.notpaused;
	if (this.notpaused) emulator.stop();
	else emulator.run();
};
document.getElementById("setup").onclick = function() {
var buf = "";

emulator.add_listener("serial0-output-char", function(char) {
    buf += char;
    if (buf.slice(-1) === "\n") {
        console.log("post req");
        var parsed = JSON.parse(buf); //parse with \n but it parses anyway...
        buf = "";
        w.postMessage(parsed);
    }
});

w.addEventListener('message', function (ev) {
    if (ev.data) {
        emulator.serial0_send(JSON.stringify(ev.data) + "\n");
    }
});
};
document.getElementById("file").onfocus = function(evt) {
	evt.target.blur();
}
document.getElementById("file").onchange = function(evt) {
    for (var i = 0, f; f = evt.target.files[i]; i++) {
	(function(f){
		console.log("merging " + f.name);
        var reader = new FileReader();
        reader.onload = function(e) {
            emulator.create_file("/" + f.name, new Uint8Array(reader.result));
            console.log("merged " + f.name);
        }.bind(this);
        reader.readAsArrayBuffer(f);
	})(f);
    }
};

}
}

module.exports.start = start;