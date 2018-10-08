const createSpy = (cb) => {
    const fakeMethod = (...args) => {
        fakeMethod.calls.push(args);
        if (cb) {
            return cb();
        }
    };
    fakeMethod.calls = [];
    fakeMethod.reset = () => {
        fakeMethod.calls.length = 0;
    };
    return fakeMethod;
};

module.exports = createSpy;
