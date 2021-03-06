// @flow

import { parse } from 'acorn';
import { SourceMapConsumer } from 'source-map';
import {
  __,
  T,
  is,
  isEmpty,
  pipe,
  flip,
  curry,
  propOr,
  propIs,
  apply,
  invoker,
  test,
  replace,
  concat,
  all,
  map,
  filter,
  reject,
  reduce,
  adjust,
  evolve,
  objOf,
  cond,
  when,
  unless,
  always,
  constructN,
} from 'ramda';

import type {
  MatchPattern,
  WebpackChunk,
  $RequestShortener,
  $SourceMapConsumer,
} from './types';

const REGEX_CHARS_REGEX = /[-[\]{}()*+?.,\\^$|#\s]/g;
const ERROR_SOURCE_INFO_REGEX = /\(([0-9]+):([0-9]+)\)$/;

const toRegExp = when(is(String), pipe(
  replace(REGEX_CHARS_REGEX, '\\$&'),
  RegExp,
));

const testMultiple = curry((patterns, val) => {
  if (!patterns || isEmpty(patterns)) {
    return val;
  }

  return pipe(
    unless(is(Array), Array.of),
    map(toRegExp),
    all(test(__, val)),
  )(patterns);
});

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
  test: ?MatchPattern,
  include: ?MatchPattern,
  exclude: ?MatchPattern,
};

export const extractMatchingFileNames = (args: ExtractMatchingFileNamesArgs) => {
  const {
    chunks,
    additionalChunkAssets,
    test: testPattern,
    include: includePattern,
    exclude: excludePattern,
  } = args;

  return pipe(
    reduce(chunkFilesReducer, []),
    concat(additionalChunkAssets || []),
    when(
      always(testPattern),
      filter(testMultiple(testPattern)),
    ),
    when(
      always(includePattern),
      filter(testMultiple(includePattern)),
    ),
    when(
      always(excludePattern),
      reject(testMultiple(excludePattern)),
    ),
  )(chunks);
};

export const extractFileSourceAndMap = cond([
  [propIs(Function, 'sourceAndMap'), pipe(
    invoker(0, 'sourceAndMap'),
    evolve({
      map: constructN(1, SourceMapConsumer),
    }),
  )],
  [T, pipe(
    invoker(0, 'source'),
    objOf('source'),
  )],
]);

type BuildErrorArgs = {
  error: Error,
  file: string,
  map: ?$SourceMapConsumer,
  requestShortener: $RequestShortener,
};

export const buildError = (args: BuildErrorArgs): Error => {
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

    return new Error(`${baseErrorMessage} [${sourcePath} ${line}:${column}]`);
  }

  return new Error(`${baseErrorMessage} [${errorLine}:${errorColumn}]`);
};
