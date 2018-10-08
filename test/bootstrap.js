const mockery = require("mockery");
const { join } = require("path");

mockery.enable({
    warnOnReplace: false,
    warnOnUnregistered: false,
});
mockery.registerSubstitute("@dzek69/react-native-voice", join(
    __dirname,
    "mocks/node_modules/@dzek69/react-native-voice.js"
));