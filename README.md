# react-native-tts-oop

A tiny wrapper on react-native-voice which enables OOP style usage of this Speech To Text library. Prevents memory leaks
and problems with usage from multiple components.

However the goal of this package is NOT to fix some usability issues (triggering `start` twice - probably could be
splitted into two events, triggering empty partial results, see documentation for more details).

## Install & Use

See [documentation](https://dzek69.github.io/react-native-voice-oop/tutorial-A1-Installation.html).

## Features

- Prevents memory leaks
- Fixes problems with using the library from multiple components
- 100% unit tested

## TODO

- Method that will allow to queue `start` calls from multiple instances?
- Pass after-results events (nothing useful) to last instance?
- Allow force-stop/cancel from another instance?

## License

MIT
