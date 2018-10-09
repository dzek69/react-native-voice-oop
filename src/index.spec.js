import VoiceToText, { EVENTS } from "./index";
import Voice from "./../test/mocks/node_modules/@dzek69/react-native-voice";

describe("VoiceToText", () => {
    beforeEach(() => {
        Voice.reset();
    });

    it("starts the recognition", () => {
        const voice = new VoiceToText();

        Voice.start.calls.must.be.empty();
        voice.start("my locale", "unused stuff");
        Voice.start.calls.must.eql([
            ["my locale"],
        ]);

        voice.destroy();
    });

    it("receives all the known events with data after start", () => {
        const eventsReceived = [];

        const voice = new VoiceToText();
        voice.addEventListener(EVENTS.start, (data) => eventsReceived.push(["start", data]));
        voice.addEventListener(EVENTS.end, (data) => eventsReceived.push(["end", data]));
        voice.addEventListener(EVENTS.volumeChanged, (data) => eventsReceived.push(["volumeChanged", data]));
        voice.addEventListener(EVENTS.partialResults, (data) => eventsReceived.push(["partialResults", data]));
        voice.addEventListener(EVENTS.results, (data) => eventsReceived.push(["results", data]));
        voice.addEventListener(EVENTS.recognized, (data) => eventsReceived.push(["recognized", data]));
        voice.addEventListener(EVENTS.error, (data) => eventsReceived.push(["error", data]));

        voice.start();
        Voice.trigger("start", { a: 5 });
        Voice.trigger("volumeChanged", 11);
        Voice.trigger("unknown", { b: 6 });
        Voice.trigger("partialResults", ["voice"]);
        Voice.trigger("end", { c: 4 });
        Voice.trigger("recognized", "something");
        Voice.trigger("results", ["voice", "voice2"]);

        eventsReceived.must.eql([
            ["start", { a: 5 }],
            ["volumeChanged", 11],
            ["partialResults", ["voice"]],
            ["end", { c: 4 }],
            ["recognized", "something"],
            ["results", ["voice", "voice2"]],
        ]);

        voice.destroy();
    });

    it("receives no the events after destroy", () => {
        const eventsReceived = [];

        const voice = new VoiceToText();
        voice.addEventListener(EVENTS.start, () => eventsReceived.push("start"));

        voice.start();
        voice.destroy();

        Voice.trigger("start", {});

        eventsReceived.must.eql([]);
    });

    it("receives no events from another started instance", () => {
        const eventsReceived = [];

        const voice = new VoiceToText();
        const voiceAnother = new VoiceToText();
        voice.addEventListener(EVENTS.start, () => eventsReceived.push("start"));

        voiceAnother.start();
        Voice.trigger("start", {});

        eventsReceived.must.eql([]);

        voice.destroy();
        voiceAnother.destroy();
    });

    it("allows to attach multiple listeners from the same instance", () => {
        const eventsReceived = [];

        const voice = new VoiceToText();
        voice.addEventListener(EVENTS.start, () => eventsReceived.push("start"));
        voice.addEventListener(EVENTS.start, () => eventsReceived.push("start2"));

        voice.start();
        Voice.trigger("start", {});
        Voice.trigger("random", {});
        Voice.trigger("results", {});

        eventsReceived.must.eql([
            "start", "start2",
        ]);

        voice.destroy();
    });

    it("sends no more events after `results` final event has been send", () => {
        const eventsReceived = [];

        const voice = new VoiceToText();
        voice.addEventListener(EVENTS.results, (data) => eventsReceived.push(["results", data]));
        voice.addEventListener(EVENTS.recognized, (data) => eventsReceived.push(["recognized", data]));

        voice.start();
        Voice.trigger("recognized", "something");
        Voice.trigger("results", ["voice", "voice2"]);
        Voice.trigger("recognized", "something");

        eventsReceived.must.eql([
            ["recognized", "something"],
            ["results", ["voice", "voice2"]],
        ]);

        voice.destroy();
    });

    it("sends no more events after `error` final event has been send", () => {
        const eventsReceived = [];

        const voice = new VoiceToText();
        voice.addEventListener(EVENTS.recognized, (data) => eventsReceived.push(["recognized", data]));
        voice.addEventListener(EVENTS.error, (data) => eventsReceived.push(["error", data]));

        voice.start();
        Voice.trigger("recognized", "something");
        Voice.trigger("error", { error: "info" });
        Voice.trigger("recognized", "something");

        eventsReceived.must.eql([
            ["recognized", "something"],
            ["error", { error: "info" }],
        ]);

        voice.destroy();
    });

    it("doesn't allow to start if another instance in in progress", () => {
        const voice = new VoiceToText();
        const voiceAnother = new VoiceToText();

        voiceAnother.start();
        (() => {
            voice.start();
        }).must.throw();

        voice.destroy();
        voiceAnother.destroy();
    });

    it("allow to start multiple times on same instance", () => {
        const voice = new VoiceToText();

        voice.start();
        (() => {
            voice.start();
        }).must.not.throw();

        voice.destroy();
    });

    it("allows to stop recognition (multiple times allowed)", () => {
        const voice = new VoiceToText();

        voice.start();
        Voice.stop.calls.must.be.empty();
        voice.stop();
        Voice.stop.calls.must.eql([
            [],
        ]);
        voice.stop();
        Voice.stop.calls.must.eql([
            [], [],
        ]);

        voice.destroy();
    });

    it("allows to cancel recognition (multiple times allowed)", () => {
        const voice = new VoiceToText();

        voice.start();
        Voice.cancel.calls.must.be.empty();
        voice.cancel();
        Voice.cancel.calls.must.eql([
            [],
        ]);
        voice.cancel();
        Voice.cancel.calls.must.eql([
            [], [],
        ]);

        voice.destroy();
    });

    it("allows to start from another instance after stopping first but only after final events", () => {
        const voice = new VoiceToText();
        const voiceAnother = new VoiceToText();

        voice.start();
        voice.stop();
        (() => {
            voiceAnother.start();
        }).must.throw();

        Voice.trigger("results");
        (() => {
            voiceAnother.start();
        }).must.not.throw();

        voice.destroy();
        voiceAnother.destroy();
    });

    it("allows to start from another instance after cancelling first", () => {
        const voice = new VoiceToText();
        const voiceAnother = new VoiceToText();

        voice.start();
        voice.cancel();
        (() => {
            voiceAnother.start();
        }).must.not.throw();

        voice.destroy();
        voiceAnother.destroy();
    });

    it("allows to check if voice is available", () => {
        Voice.mockedIsAvailable = false;
        VoiceToText.isAvailable().must.be.false();

        Voice.mockedIsAvailable = true;
        VoiceToText.isAvailable().must.be.true();
    });

    it("allows to check if recognizing now", () => {
        Voice.mockedIsRecognizing = false;
        VoiceToText.isRecognizing().must.be.false();

        Voice.mockedIsRecognizing = true;
        VoiceToText.isRecognizing().must.be.true();
    });

    it("allows to remove single event listeners", () => {
        const eventsReceived = [];

        const voice = new VoiceToText();

        const listener1 = () => eventsReceived.push("1");
        const listener2 = () => eventsReceived.push("2");
        const listener3 = () => eventsReceived.push("3");

        voice.addEventListener(EVENTS.start, listener1);
        voice.addEventListener(EVENTS.start, listener2);
        voice.addEventListener(EVENTS.start, listener3);

        voice.start();
        Voice.trigger("start", {});

        eventsReceived.must.eql([
            "1", "2", "3",
        ]);

        voice.removeEventListener(EVENTS.start, listener2);
        Voice.trigger("start", {});

        eventsReceived.must.eql([
            "1", "2", "3", "1", "3",
        ]);

        voice.destroy();
    });

    it("doesn't allow to stop from another instance", () => {
        const voice = new VoiceToText();
        const voiceAnother = new VoiceToText();

        voice.start();
        (() => {
            voiceAnother.stop();
        }).must.throw();

        Voice.trigger("results");
        voiceAnother.start();
        (() => {
            voice.stop();
        }).must.throw();
        Voice.trigger("results");
        (() => {
            voice.stop();
        }).must.not.throw();

        voice.destroy();
        voiceAnother.destroy();
    });

    it("doesn't allow to cancel from another instance", () => {
        const voice = new VoiceToText();
        const voiceAnother = new VoiceToText();

        voice.start();
        (() => {
            voiceAnother.stop();
        }).must.throw();

        Voice.trigger("results");
        voiceAnother.start();
        (() => {
            voice.stop();
        }).must.throw();
        Voice.trigger("results");
        (() => {
            voice.stop();
        }).must.not.throw();

        voice.destroy();
        voiceAnother.destroy();
    });
});
