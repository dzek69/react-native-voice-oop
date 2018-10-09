# Explaination - missing information in `react-native-voice` docs

In my opinion `react-native-voice` fails to properly document available events, their meaning, triggering order that
should be expected and data received with events. Read on for missing documentation on this.

## Events list and their meaning

> Note: This was verified on Android device only. iOS experiments will be documented here later.

> Note: Nothing here is guaranted to be true, everything here is a documented result of experiments.

### start
`start` looks like a indicator that voice is
- started being recorded by device
- started being sent over to recognition server

Yes, this means `start` **is triggered twice** on successful voice recognition.
`start` is triggered once on erroneous voice recognition, when there is no Internet connection.

### end
`end` looks like indicator that sound is no longer being sent to recognition server. Recognition still happens on
server after the event is triggered.

This means `end` **is NOT triggered** on erroneous voice recognition, when there is no Internet connection.
`end` will however be triggered when there was no words recognized.
`end` will be also triggered when sending data to server was started but was interrupted (lost connection).

### volumeChanged
`volumeChanged` is triggered many times, every few ms. It is all over between other events. It's usually triggered few
times before `start`, it's triggered few times after `end` and even after `results`. Doesn't look useful.

> Note: Currently all events after `results` or `error` events are muted and unlistenable due to actions this wrapper
does to differentiate which instance should receive the event. Usually this means few `volumeChanged` events to be
skipped. This is not very useful as after `results` or `error` events voice recognition is stopped anyway.

> This may change in the future.

### partialResults
`partialResults` is usually triggered few times during recognition.

### results
`results` is the final result of recognition.

### recognized
It seems to never be triggered, `react-native-voice` notes that it should be triggered on both iOS and Android.

### error
`error` is triggered when recognition fails due to no connection or connection broken in the middle. Probably triggered
when server fails for some reason too.

## Data of events

> Note: This was verified on Android device only. iOS experiments will be documented here later.

In general - data structure of events data are always the same. So you don't need to worry that instead of object
you'll get null or object without expected `value` key but with `error` key instead.

### start
```javascript
{ error: false }
```
Always just this.

### end
```javascript
{ error: false }
```
Always just this, even when connection fails.

### volumeChanged
```javascript
{ value: VALUE_HERE }
```
In general - `VALUE_HERE` seems to be positive value when device hears something (the bigger the value - the louder 
the sound) and negative when there is silence.
However the values seems to be hardcoded into few constants:
- on silence:
    - `-2.119999885559082`
    - `-2`
- on voice:
    - `1.6000001430511475`
    - `2.8000001907348633`
    - `4`
    - `5.200000286102295`
    - `6.399999618530273`
    - `8.799999237060547`
    - `10`

### partialResults
```javascript
{ value: [""] }
```
The array length is always `1`, but the string may be empty.

### results
```javascript
{
    value: [
        "possible value number one",
        "possible value number two",
    ]
}
```
This array has length of 1 or more. If recognition server is unsure what was said - it sends few possible texts as a
whole sentence.

### recognized
It seems to never be triggered, despite `react-native-voice` notes that it should be triggered on both iOS and Android.
Anyway, accorting to original documentation it should contain always just this:
```javascript
{ error: false }
```

### error
```javascript
{ error: "1/Description" }
```
Object with `error` property that contains a string with error message in format:
- code
- slash
- description in English

Usually: `7/No match`

## Order of events

> Remember about `volumeChanged`, it may happen anytime between those events.

### In case of success:
1. `start` - triggered twice (see explanation above),
1. `partialResults`, usually triggered multiple times when partially recognized text is available,
1. `end`,
1. `partialResults` may still be triggered now, probably because while recognition stops and no data is send to server
anymore the server may still push the data for previously received voice data,
1. `results` - final results.

### In case of error (voice not recognized):
1. `start` - triggered twice (see explanation above),
1. `end`,
1. `partialResults` (with empty string, but may not be triggered)
1. `error` - final results.

### In case of error (no Internet connection since beginning):
1. `start` - triggered once,
1. `error`.

### In case of error during recognition (connection lost in the middle):
1. `start` - triggered usually twice, may be triggered once if connection is lost just after starting the recognition,
1. `partialResults`, may not be triggered if connection is lost quickly, may be triggered multiple times,
1. `end` (probably only if `start` was triggered twice),
1. `error` - usually there is few seconds gap between `end` and `error`.

### In case of `stop`ping recognition in the middle:
> Stopping means just forcing recognizer to think that nothing is being said anymore.

- If something was recognized before stopping - events will be the same as in success case.
- If nothing was recognized before stopping - events will be the same as in error.


### In case of `cancel`ling recognition in the middle:
> Cancelling means ignoring everything - stopping in the middle with no ending events being sent.

- If something was recognized before cancelling - events will be the same as in success case, but `end` and `results` will
never be triggered.
- If nothing was recognized before cancelling - only `start` event will be triggered.