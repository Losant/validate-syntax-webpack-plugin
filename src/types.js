type EcmaVersion =
  | 6
  | 7
  | 8
  | 2016
  | 2017
  | 2018;

type SourceType =
  | 'script'
  | 'module';

export type MatchPattern =
  | string
  | RegExp
  | Array<string | RegExp>;

export type $SourceMapConsumer = {
  originalPositionFor: (args: { line: number, column: number }) => {
    source: string,
    line: number,
    column: number,
  },
};

export type $RequestShortener = {
  shorten: (source: string) => string,
};

export type ValidateSyntaxWebpackPluginOptions = {
  ecmaVersion: EcmaVersion,
  sourceType: SourceType,
  test?: ?MatchPattern,
  include?: ?MatchPattern,
  exclude?: ?MatchPattern,
};

export type WebpackChunk = {
  files: Array<string>,
};

export type WebpackAssetFile = {
  source: () => string,
  sourceAndMap?: () => { source: string, map: string },
};

export type WebpackCompilationCallback = (chunks: Array<WebpackChunk>) => void;

export type WebpackCompilation = {
  errors: Array<Error>,
  assets: { [key: string]: WebpackAssetFile },
  additionalChunkAssets: Array<WebpackAssetFile>,
  plugin(hook: string, callback: WebpackCompilationCallback): void,
};

export type WebpackCompilerCallback = (compilation: WebpackCompilation) => void;

export type WebpackCompiler = {
  context: string,
  plugin(hook: string, callback: WebpackCompilerCallback): void,
};
