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

class VoiceToText {
    constructor() {
        this.destroy = this.destroy.bind(this);
        this._ee = new EventEmitter();
        this._onVoiceEvent = this._onVoiceEvent.bind(this);
    }

    addEventListener(eventName, listener) {
        this._ee.addListener(eventName, listener);
    }

    removeEventListener(eventName, listener) {
        this._ee.removeListener(eventName, listener);
    }

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

    stop() {
        if (instanceManager.isCurrentOrNull(this)) {
            Voice.stop();
            return;
        }

        throw new Error(
            "Another instance is recognizing right now.",
        );
    }

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

    _onVoiceEvent(name, data) {
        this._ee.emit(name, data);
        if (FINAL_EVENTS.includes(name)) {
            instanceManager.clear();
        }
    }

    destroy() {
        this._ee.removeAllListeners();

        if (instanceManager.isCurrent(this)) {
            instanceManager.clear();
        }
    }
}
VoiceToText.isAvailable = Voice.isAvailable.bind(Voice);
VoiceToText.isRecognizing = Voice.isRecognizing.bind(Voice);

export default VoiceToText;
export {
    EVENTS,
};
