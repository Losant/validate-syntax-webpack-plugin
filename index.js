const acorn = require('acorn');
const { SourceMapConsumer } = require('source-map');
// eslint-disable-next-line require-path-exists/exists
const RequestShortener = require('webpack/lib/RequestShortener');

const ERROR_SOURCE_INFO_REGEX = /\(([0-9]+):([0-9]+)\)$/;
const JS_FILE_REGEX = /\.js$/i;

const chunkFilesReducer = (acc, chunk) => acc.concat(chunk.files || []);

const test = (regExp) => (value) => regExp.test(value);

const parseFileNames = (chunks, additionalChunkAssets) =>
  chunks
    .reduce(chunkFilesReducer, [])
    .concat(additionalChunkAssets || [])
    .filter(test(JS_FILE_REGEX));

const parseAssetFileInfo = (asset) => {
  if (asset.sourceAndMap) {
    const { source, map } = asset.sourceAndMap();
    const sourceMap = new SourceMapConsumer(map);

    return { source, sourceMap };
  }

  const source = asset.source();

  return { source };
};

const buildError = (err, file, sourceMap, requestShortener) => {
  const [, errorLine, errorColumn] = ERROR_SOURCE_INFO_REGEX.exec(err.message);

  const hasSourceInfo = sourceMap && errorLine && errorColumn;
  const errorMessage = err.message.replace(ERROR_SOURCE_INFO_REGEX, '');
  const baseErrorMessage = `${file} (contains invalid syntax)\n${errorMessage}`;

  const original = hasSourceInfo && sourceMap.originalPositionFor({
    line: Number(errorLine),
    column: Number(errorColumn),
  });

  if (original && original.source) {
    const { source, line, column } = original;
    const sourcePath = requestShortener.shorten(source);

    return new Error(`${baseErrorMessage} [${sourcePath}:${line},${column}]`);
  }

  return new Error(baseErrorMessage);
};

class ValidateSyntaxWebpackPlugin {
  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    const { ecmaVersion } = this.options;
    const acornOptions = { ecmaVersion };
    const requestShortener = new RequestShortener(compiler.context);

    compiler.plugin('compilation', (compilation) => {
      compilation.plugin('after-optimize-chunk-assets', (chunks) => {
        const { assets, additionalChunkAssets } = compilation;
        const files = parseFileNames(chunks, additionalChunkAssets);

        files.forEach((file) => {
          const asset = assets[file];
          const { source, sourceMap } = parseAssetFileInfo(asset);

          try {
            acorn.parse(source, acornOptions);
          } catch (error) {
            compilation.errors.push(
              buildError(error, file, sourceMap, requestShortener)
            );
          }
        });
      });
    });
  }
}

module.exports = ValidateSyntaxWebpackPlugin;
