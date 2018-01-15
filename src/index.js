// @flow

import { merge } from 'ramda';

/* eslint-disable require-path-exists/exists */
// $FlowIgnore
import RequestShortener from 'webpack/lib/RequestShortener';
/* eslint-enable require-path-exists/exists */

import type {
  WebpackCompiler,
  ValidateSyntaxWebpackPluginOptions,
} from './types';

import {
  parseFileSyntax,
  extractMatchingFileNames,
  extractFileSourceAndMap,
  buildError,
} from './utils';

const JS_FILE_REGEX = /\.js$/i;

const defaultOptions = {
  ecmaVersion: 5,
  sourceType: 'script',
  include: JS_FILE_REGEX,
  exclude: null,
};

class ValidateSyntaxWebpackPlugin {
  options: ValidateSyntaxWebpackPluginOptions

  constructor(options: ValidateSyntaxWebpackPluginOptions): void {
    this.options = merge(defaultOptions, options);
  }

  apply(compiler: WebpackCompiler): void {
    const {
      ecmaVersion,
      sourceType,
      include,
      exclude,
    } = this.options;

    const parseFile = parseFileSyntax({ ecmaVersion, sourceType });
    const requestShortener = new RequestShortener(compiler.context);

    compiler.plugin('compilation', (compilation) => {
      compilation.plugin('after-optimize-chunk-assets', (chunks) => {
        const { assets, additionalChunkAssets } = compilation;

        const files = extractMatchingFileNames({
          chunks,
          additionalChunkAssets,
          include,
          exclude,
        });

        files.forEach((file) => {
          const asset = assets[file];
          const { source, map } = extractFileSourceAndMap(asset);

          try {
            parseFile(source);
          } catch (error) {
            compilation.errors.push(
              buildError({ error, file, map, requestShortener })
            );
          }
        });
      });
    });
  }
}

module.exports = ValidateSyntaxWebpackPlugin;
