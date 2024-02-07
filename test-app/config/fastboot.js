module.exports = function () {
  return {
    buildSandboxGlobals(defaultGlobals) {
      return Object.assign({}, defaultGlobals, {
        TextEncoder:
          typeof TextEncoder !== 'undefined'
            ? TextEncoder
            : require('util').TextEncoder,
        AbortController,
        navigator: {},
        Response:
          typeof Response !== 'undefined'
            ? Response
            : // eslint-disable-next-line n/no-missing-require
              require('node-fetch').Response,
        ReadableStream:
          typeof ReadableStream !== 'undefined'
            ? ReadableStream
            : require('node:stream/web').ReadableStream,
        WritableStream:
          typeof WritableStream !== 'undefined'
            ? WritableStream
            : require('node:stream/web').WritableStream,
        TransformStream:
          typeof TransformStream !== 'undefined'
            ? TransformStream
            : require('node:stream/web').TransformStream,
        Headers: typeof Headers !== 'undefined' ? Headers : undefined,
      });
    },
  };
};
