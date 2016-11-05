import css from 'css';
import esprima from 'esprima';
import htmllint from 'htmllint';
import HTMLInspector from 'html-inspector';
import {JSHINT as jshint} from 'jshint';
import prettyCSS from 'PrettyCSS';
import Slowparse from 'slowparse/src';
import SlowparseHTMLParser from 'slowparse/src/HTMLParser';
import stylelint from '../util/minimalStylelint';

SlowparseHTMLParser.prototype.omittableCloseTagHtmlElements = [];

export {
  css,
  esprima,
  htmllint,
  HTMLInspector,
  jshint,
  prettyCSS,
  Slowparse,
  stylelint,
};
