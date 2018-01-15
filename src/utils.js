// @flow

import { parse } from 'acorn';
import { SourceMapConsumer } from 'source-map';
import {
  T,
  is,
  pipe,
  flip,
  propOr,
  propSatisfies,
  apply,
  invoker,
  concat,
  replace,
  test,
  filter,
  reject,
  reduce,
  adjust,
  evolve,
  objOf,
  cond,
  when,
  always,
  construct,
} from 'ramda';

import type {
  WebpackChunk,
  MatchPattern,
} from './types';

const ERROR_SOURCE_INFO_REGEX = /\(([0-9]+):([0-9]+)\)$/;

const chunkFilesReducer = pipe(
  Array.of,
  adjust(propOr([], 'files'), 1),
  apply(concat),
);

// NOTE: flip() returns a curried function
export const parseFileSyntax = flip(parse);

type ExtractMatchingFileNamesArgs = {
  chunks: Array<WebpackChunk>,
  additionalChunkAssets: Array<String>,
  include: ?MatchPattern,
  exclude: ?MatchPattern,
};

export const extractMatchingFileNames = (args: ExtractMatchingFileNamesArgs) => {
  const {
    chunks,
    additionalChunkAssets,
    include,
    exclude,
  } = args;

  return pipe(
    reduce(chunkFilesReducer, []),
    concat(additionalChunkAssets || []),
    when(
      always(include),
      filter(test(include)),
    ),
    when(
      always(exclude),
      reject(test(exclude)),
    ),
  )(chunks);
};

export const extractFileSourceAndMap = cond([
  [
    propSatisfies(is(Function), 'sourceAndMap'),
    pipe(
      invoker(0, 'sourceAndMap'),
      evolve({
        map: construct(SourceMapConsumer),
      }),
    ),
  ],
  [
    T,
    pipe(
      invoker(0, 'source'),
      objOf('source'),
    ),
  ],
]);

type BuildErrorArgs = {
  error: Error,
  file: string,
  map: ?{
    originalPositionFor: ({ line: number, column: number }) => {
      source: string,
      line: number,
      column: number,
    },
  },
  requestShortener: {
    shorten: (source: string) => string,
  },
};

export const buildError = (args: BuildErrorArgs) => {
  const { error, file, map, requestShortener } = args;

  const baseErrorMessage = pipe(
    replace(ERROR_SOURCE_INFO_REGEX, ''),
    concat(`${file} (contains invalid syntax)\n`),
  )(error.message);

  const [, errorLine, errorColumn] = ERROR_SOURCE_INFO_REGEX.exec(error.message);
  const hasSourceInfo = errorLine && errorColumn;

  const original = hasSourceInfo && map && map.originalPositionFor({
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
