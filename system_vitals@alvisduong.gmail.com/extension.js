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
        label = new St.Label({ text: 'Loading...' });
    }

    updater = new Updater();
}

function enable() {
    if (!label) {
        label = label = new St.Label({ text: 'Reloading...' });
    }

    if (!updater) {
        updater = new Updater();
    }

    Main.panel._rightBox.insert_child_at_index(label, 0);

    // Start main loop.
    loopId = Mainloop.timeout_add_seconds(1, function() {
        updater.update();
        return true;
    });
}

function disable() {
    Main.panel._rightBox.remove_child(label);

    // Disconnect timer.
    Mainloop.source_remove(loopId);
}

function Updater() {
    this._totalCpuTime = 0;
    this._totalIdleTime = 0;
}

Updater.prototype = {
    update: function update() {
        label.set_text(this.updateCPU());
    },
    updateCPU : function updateCPU() {
        let exec     = new Exec(['cat', '/proc/stat']);
        let cpuTimes = exec.run().split(' ');

        cpuTimes.shift();
        cpuTimes.shift();

        let currentIdleTime     = cpuTimes[3];
        let currentTotalCpuTime = cpuTimes.reduce(function(x, y) {
            return parseInt(x) + parseInt(y);
        }, 0);

        let idleTimeDifference  = currentIdleTime - this._totalIdleTime;
        let totalTimeDifference = currentTotalCpuTime - this._totalCpuTime;

        let usage =
            (totalTimeDifference - idleTimeDifference) / totalTimeDifference;

        this._totalIdleTime = currentIdleTime;
        this._totalCpuTime  = currentTotalCpuTime;

        return (usage * 100).toFixed(1);
    }
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
                this._argv,
                null,
                GLib.SpawnFlags.SEARCH_PATH,
                null
            );

        let out_reader = new Gio.DataInputStream(
            { base_stream: new Gio.UnixInputStream({ fd: out_fd }) }
        );
        let [out, size] = out_reader.read_line(null);

        return out.toString();
    }
}