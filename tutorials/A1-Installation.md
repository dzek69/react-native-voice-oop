# How to install `react-native-voice-oop`

## Important - `react-native-voice` is broken now

Currently `react-native-voice` causes release builds to fail with newest react-native version. A fixed fork is used
instead - [@dzek69/react-native-voice](https://github.com/dzek69/react-native-voice).

## Steps required to install

> Remember to use react-native without Expo, ie. project started with `react-native init`. See
[React native documentation][1] (select `Building Projects with Native Code`). This is due to usage of Voice Recognition
itself (not this particular library), which is not supported by Expo (yet).

1. `npm install @dzek69/react-native-voice react-native-voice-oop --save`
1. `react-native link`

## Next steps

See {@tutorial A2-How-to-use}.

[1]: https://facebook.github.io/react-native/docs/getting-started