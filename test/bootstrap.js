require("@babel/polyfill");
require("@babel/register")({
    extends: "./.babelrc",
    ignore: [],
});
const must = require("must/register");

const mockery = require("mockery");
const { join } = require("path");

mockery.enable({
    warnOnReplace: false,
    warnOnUnregistered: false,
});
mockery.registerSubstitute("@dzek69/react-native-voice", join(
    __dirname,
    "mocks/node_modules/@dzek69/react-native-voice.js",
));

global.must = must;
