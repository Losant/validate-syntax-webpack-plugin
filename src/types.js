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

export type MatchPattern = string | RegExp;

export type ValidateSyntaxWebpackPluginOptions = {
  ecmaVersion: EcmaVersion,
  sourceType: SourceType,
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
