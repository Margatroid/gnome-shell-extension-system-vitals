const St       = imports.gi.St;
const Main     = imports.ui.main;
const GLib     = imports.gi.GLib;
const Gio      = imports.gi.Gio;
const Mainloop = imports.mainloop;

let label;
let updater;
let loopId;

function init() {
    if (!label) {
        label = new St.Label({ text: 'Hello world' });
    }

    updater = new Updater();
}

function enable() {
    Main.panel._rightBox.insert_child_at_index(label, 0);

    // Start main loop.
    loopId = Mainloop.timeout_add_seconds(1, updater.update);
}

function disable() {
    Main.panel._rightBox.remove_child(label);

    // Disconnect timer.
    Mainloop.source_remove(loopId);
}

function Exec(argv) {
    this._init(argv);
}

Exec.prototype = {
    _init : function _init(argv) {
        this._argv = argv;
    },
    run : function run() {
        let [res, pid, in_fd, out_fd, err_fd] =
            GLib.spawn_async_with_pipes(
                null,
                ['cat', '/proc/stat'],
                null,
                GLib.SpawnFlags.SEARCH_PATH,
                null
            );

        let out_reader = new Gio.DataInputStream({ base_stream: new Gio.UnixInputStream({fd: out_fd}) });
        let [out, size] = out_reader.read_line(null);
        label.set_text(out.toString());
    }
}

function Updater() {}

Updater.prototype = {
    update : function update() {
        let foo = new Exec('grr');
        foo.run();
        return true;
    }
}