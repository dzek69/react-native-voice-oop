# How to use `react-native-voice-oop`

This library exports default {@link VoiceToText} class and {@link EVENTS} object with events names.

In the opposite to `react-native-voice` this library aims to allow typical OOP style and discourage using of globals.

See `start` method for full featured example.

## Constructor

> Constructor takes no arguments.

Example:

```javascript
import VoiceToText from "react-native-voice-oop";

const voice = new VoiceToText();
```

## destroy

> `destroy` takes no arguments.

It is very important to destroy instance when it is not needed anymore. This prevents memory leaks.


Example:

```javascript
import React from "react";
import VoiceToText from "react-native-voice-oop";

class MyElement extends React.Component {
    componentDidMount() {
        this.voice = new VoiceToText();
    }

    componentWillUnmount() {
        this.voice.destroy();
        this.voice = null;
    }
}
```

If this particular instance started voice recognition - it will be cancelled, results and future events of that
recognition will be completely ignored. You don't need to detach listeners (see below).

## addEventListener

> Arguments list:
> - {string} eventName - event name to listen too. Use @{link EVENTS} exported constant to provide with event name,
> - {function} listener - function to be invoked when event happens.

You can attach multiple listeners to the same event.

Example:

```javascript
import React from "react";
import VoiceToText from "react-native-voice-oop";

class MyElement extends React.Component {
    componentDidMount() {
        this.voice = new VoiceToText();
        this.voice.addEventListener("results", this.handleVoiceResults.bind(this));
        // ^ it is safe to use `bind` there, as `destroy` will remove all listeners for you
    }
    
    handleVoiceResults({ value }) {
        this.setState({
            text: value[0],
        });
    }
    
    // remember to destroy on unmount
}
```

## removeEventListener

> Arguments list:
> - {string} eventName - event name. Use @{link EVENTS} exported constant to provide with event name,
> - {function} listener - function that should be removed from listeners of specified event.

Remember that `fn.bind()` creates each NEW function each time. Therefore this won't work as expected:

Bad example:

```javascript
import React from "react";
import VoiceToText from "react-native-voice-oop";

class MyElement extends React.Component {
    componentDidMount() {
        this.voice = new VoiceToText();
    }
    
    addListeners() {
        this.voice.addEventListener("results", this.handleVoiceResults.bind(this));
    }
    
    removeListeners() {
        this.voice.addEventListener("results", this.handleVoiceResults.bind(this));
        // ^ wrong, .bind will return new function, another one that returned in `addListeners`, so listener won't be
        // removed
    }
    
    // remember to destroy on unmount
}
```

Good example:

```javascript
import React from "react";
import VoiceToText from "react-native-voice-oop";

class MyElement extends React.Component {
    componentDidMount() {
        this.voice = new VoiceToText();
        this.boundHandleVoiceResults = this.handleVoiceResults.bind(this)
    }
    
    addListeners() {
        this.voice.addEventListener("results", this.boundHandleVoiceResults);
    }
    
    removeListeners() {
        this.voice.addEventListener("results", this.boundHandleVoiceResults);
    }
    
    // remember to destroy on unmount
}
```

## start

> Arguments list:
> - {string} locale - locale in which you expect the voice to be recognized. On Android voice recognizer may try to
handle different locales anyway.

Starts recognizing.

> Throws an error - if another instance is already recognizing. Use static `VoiceToText.isRecognizing();` method to
check if recognizing is in progress.

Example:

```jsx
import React from "react";
import { Text, View } from "react-native";
import VoiceToText, { EVENTS } from "react-native-voice-oop";

class MyElement extends React.Component {
    constructor() {
        super();
        this.state = {
            text: "",
        };
        
        this.handlePress = this.handlePress.bind(this);
    }
    
    componentDidMount() {
        this.voice = new VoiceToText();
        this.voice.addEventListener(EVENTS.results, this.handleResults.bind(this));
    }
    
    handleResults({ value }) {
        this.setState({
            text: value[0],
        });
    }
    
    handlePress() {
        if (!VoiceToText.isRecognizing()) {
            this.voice.start();
        }
    }
    
    render() {
        <View>
            <Text onPress={this.handlePress}>Start!</Text>
            <Text>Recognized text: {this.state.text}</Text>
        </View>
         
    }
}
```

## stop

> `stop` takes no arguments.

Stops recognizing. If something was recognized before stopping - `results` event will be triggered.
If nothing was recognized - `error` event will be triggered.

See {@tutorial A3-Events} for more information.

Example:

```javascript
import React from "react";
import VoiceToText from "react-native-voice-oop";

class MyElement extends React.Component {
    componentDidMount() {
        this.voice = new VoiceToText();
    }
    
    handleStartPress() {
        this.voice.start();
    }

    handleStopPress() {
        this.voice.stop();
    }
}

```
## cancel

> `cancel` takes no arguments.

Cancels recognizing. Partial results will be discarded and no `results` or `error` event will occur.

See {@tutorial A3-Events} for more information.

Example:

```javascript
import React from "react";
import VoiceToText from "react-native-voice-oop";

class MyElement extends React.Component {
    componentDidMount() {
        this.voice = new VoiceToText();
    }
    
    handleStartPress() {
        this.voice.start();
    }

    handleCancelPress() {
        this.voice.cancel();
    }
}
```
