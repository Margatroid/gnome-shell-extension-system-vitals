const St   = imports.gi.St;
const Main = imports.ui.main;
const GLib = imports.gi.GLib;

let label;

function init() {
    if (!label) {
        label = new St.Label({ text: 'Hello world' });
    }
}

function enable() {
    Main.panel._rightBox.insert_child_at_index(label, 0);
}

function disable() {
    Main.panel._rightBox.remove_child(label);
}

function Exec(argv) {
    this._init(argv);
}

Exec.prototype = {
    _init : function _init(argv) {
        this._argv = argv;
    },
    run : function run() {

    }
}