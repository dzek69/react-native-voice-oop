import EventEmitter from "eventemitter3";
import Voice from "@dzek69/react-native-voice";

const instanceManager = { // eslint-disable-line object-shorthand
    _instance: null,
    _callback: null,
    set(instance, callback) {
        if (!instance) {
            this._instance = null;
            this._callback = null;
            return;
        }
        this._instance = instance;
        this._callback = callback;
    },
    get() {
        if (!this._instance) {
            return null;
        }
        return {
            instance: this._instance,
            callback: this._callback,
        };
    },
    clear() {
        this.set(null);
    },
    isCurrent(instance) {
        return this._instance === instance;
    },
    isCurrentOrNull(instance) {
        return !this._instance || this._instance === instance;
    },
};

/**
 * `start`, `end`, and `recognized` events data
 *
 * @typedef {Object} NoErrorData
 * @param {false} error
 */

/**
 * `volumeChanged` event data
 *
 * @typedef {Object} VolumeChangedData
 * @param {number} value
 */

/**
 * `partialResults` and `results` event data
 *
 * @typedef {Object} ResultsData
 * @param {Array<string>} value
 */

/**
 * `error` event data
 *
 * @typedef {Object} ErrorData
 * @param {string} error
 */

/**
 * @typedef {string} VoiceEvent
 */

/**
 * List of available events
 * @enum {VoiceEvent}
 */
const EVENTS = {
    start: "start",
    end: "end",
    volumeChanged: "volumeChanged",
    partialResults: "partialResults",
    results: "results",
    recognized: "recognized",
    error: "error",
};

const redirectEvent = (eventName, data) => {
    const current = instanceManager.get();
    if (!current) {
        return;
    }
    current.callback(eventName, data);
};

Voice.onSpeechStart = (data) => redirectEvent(EVENTS.start, data);
Voice.onSpeechEnd = (data) => redirectEvent(EVENTS.end, data);
Voice.onSpeechVolumeChanged = (data) => redirectEvent(EVENTS.volumeChanged, data);
Voice.onSpeechPartialResults = (data) => redirectEvent(EVENTS.partialResults, data);
Voice.onSpeechResults = (data) => redirectEvent(EVENTS.results, data);
Voice.onSpeechRecognized = (data) => redirectEvent(EVENTS.recognized, data);
Voice.onSpeechError = (data) => redirectEvent(EVENTS.error, data);

const FINAL_EVENTS = [EVENTS.error, EVENTS.results];

const METHODS = [
    "addEventListener", "removeEventListener", "start", "stop", "cancel", "_onVoiceEvent", "destroy",
];

/**
 * @class VoiceToText
 */
class VoiceToText {
    constructor() {
        this._ee = new EventEmitter();
        this._destroyed = false;

        METHODS.forEach((fn) => {
            const isPrivate = fn.substr(0, 1) === "_";
            if (isPrivate) {
                this[fn] = this[fn].bind(this);
                return;
            }
            const cb = this[fn];
            this[fn] = (...args) => {
                this._checkDestroyed();
                return cb.apply(this, args);
            };
        });
    }

    /**
     * Adds listener for specified event
     *
     * @param {VoiceEvent} eventName
     * @param {function} listener
     * @throws {Error} if called on destroyed instance
     */
    addEventListener(eventName, listener) {
        this._ee.addListener(eventName, listener);
    }

    /**
     * Removed specified listener from specified event
     *
     * @param {VoiceEvent} eventName
     * @param {function} listener
     * @throws {Error} if called on destroyed instance
     */
    removeEventListener(eventName, listener) {
        this._ee.removeListener(eventName, listener);
    }

    /**
     * Starts recognizing
     *
     * @param {string} locale
     * @throws {Error} if another instance is already recognizing (same instance is allowed to restart recognizing)
     * or when called on destroyed instance
     */
    start(locale) {
        if (instanceManager.isCurrentOrNull(this)) {
            instanceManager.set(this, this._onVoiceEvent);
            Voice.start(locale);
            return;
        }

        throw new Error(
            "Another instance is recognizing right now.",
        );
    }

    /**
     * Stops recognizing, it should cause `results` or `error` event to be send
     *
     * @throws {Error} if another instance started recognition (repeating stop when nothing is recognizing is allowed)
     * or when called on destroyed instance
     */
    stop() {
        if (instanceManager.isCurrentOrNull(this)) {
            Voice.stop();
            return;
        }

        throw new Error(
            "Another instance is recognizing right now.",
        );
    }

    /**
     * Cancels recognizing, no `results` or `error` events will be send.
     *
     * @throws {Error} if another instance started recognition (repeating cancel when nothing is recognizing is allowed)
     * or when called on destroyed instance
     */
    cancel() {
        if (instanceManager.isCurrentOrNull(this)) {
            Voice.cancel();
            instanceManager.clear();
            return;
        }

        throw new Error(
            "Another instance is recognizing right now.",
        );
    }

    /**
     * Handler of global recognition event
     *
     * @param {VoiceEvent} name
     * @param {NoErrorData|VolumeChangedData|ResultsData|ErrorData} data
     * @private
     */
    _onVoiceEvent(name, data) {
        this._ee.emit(name, data);
        if (FINAL_EVENTS.includes(name)) {
            instanceManager.clear();
        }
    }

    /**
     * Checks if instance was already destroyed
     *
     * @throws {Error} when called on destroyed instance
     * @private
     */
    _checkDestroyed() {
        if (this._destroyed) {
            throw new Error("Instance destroyed. You cannot use methods on it anymore. Create another one.");
        }
    }

    /**
     * Destroys the instance, removes listener, cancels recognition
     *
     * @throws {Error} if called on destroyed instance
     */
    destroy() {
        this._destroyed = true;
        this._ee.removeAllListeners();

        if (instanceManager.isCurrent(this)) {
            instanceManager.clear();
            Voice.cancel();
        }
    }
}

/**
 * Checks if voice recognition is available on current system.
 *
 * @type {function}
 */
VoiceToText.isAvailable = Voice.isAvailable.bind(Voice);

/**
 * Checks if voice recognition is in progress (on any instance).
 *
 * @type {function}
 */
VoiceToText.isRecognizing = Voice.isRecognizing.bind(Voice);

export default VoiceToText;
export {
    EVENTS,
};
