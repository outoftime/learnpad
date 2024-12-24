import i18next from 'i18next';
import Channel from 'jschannel';
import bindAll from 'lodash-es/bindAll';
import constant from 'lodash-es/constant';
import PropTypes from 'prop-types';
import React from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';

import {CompiledProject as CompiledProjectRecord} from '../records';
import bowser, { innerWidth } from '../services/bowser';
import {sourceDelimiter} from '../util/compileProject';
import {createError} from '../util/errorUtils';
import retryingFailedImports from '../util/retryingFailedImports';

const sandboxOptions = [
  'allow-forms',
  'allow-popups',
  'allow-popups-to-escape-sandbox',
  'allow-scripts',
  'allow-top-navigation',
].join(' ');

let nextId = 1;

class PreviewFrame extends React.Component {
  constructor(props) {
    super(props);

    const {
      compiledProject: {source},
    } = props;

    const isWindowSmall = innerWidth < 1366;
    const increaseIFrameBodyFont = `<style>
    body {
       font-size: 1.5em;
    }
    </style>`;

    bindAll(this, '_attachToFrame', '_handleInfiniteLoop');

    this.render = constant(
      <div className="preview__frame-container">
        <iframe
          className="preview__frame"
          name={`preview-frame-${nextId++}`}
          ref={this._attachToFrame}
          sandbox={sandboxOptions}
          srcDoc={source + (isWindowSmall ? increaseIFrameBodyFont : "")}
        />
      </div>,
    );
  }

  componentDidUpdate({consoleEntries: prevConsoleEntries}) {
    const {consoleEntries, isActive} = this.props;

    if (this._channel && isActive) {
      for (const [key, {expression}] of consoleEntries) {
        if (!prevConsoleEntries.has(key) && expression) {
          this._evaluateConsoleExpression(key, expression);
        }
      }
    }
  }

  async _evaluateConsoleExpression(key, expression) {
    const {hasExpressionStatement} = await retryingFailedImports(() =>
      import(
        /* webpackChunkName: "mainAsync" */
        '../util/javascript'
      ),
    );
    // eslint-disable-next-line prefer-reflect
    this._channel.call({
      method: 'evaluateExpression',
      params: expression,
      success: printedResult => {
        this.props.onConsoleValue(
          key,
          hasExpressionStatement(expression) ? printedResult : null,
          this.props.compiledProject.compiledProjectKey,
        );
      },
      error: (name, message) => {
        const normalizedError = createError({name, message});

        this.props.onConsoleError(
          key,
          this.props.compiledProject.compiledProjectKey,
          {
            name,
            reason: normalizedError.type,
            text: normalizedError.message,
            raw: normalizedError.message,
            type: 'error',
          },
        );
      },
    });
  }

  _runtimeErrorLineOffset() {
    const firstSourceLine =
      this.props.compiledProject.source.split('\n').indexOf(sourceDelimiter) +
      2;

    return firstSourceLine - 1;
  }

  async _handleErrorMessage(error) {
    const normalizedError = createError(error);
    const lineOffset = this._runtimeErrorLineOffset();

    if (error.line < lineOffset) {
      this.props.onRuntimeError({
        reason: normalizedError.type,
        text: normalizedError.message,
        raw: normalizedError.message,
        row: 0,
        column: 0,
        type: 'error',
      });
      return;
    }

    const oneIndexedSourceLine = error.line - lineOffset;

    if (error.message === 'Loop Broken!') {
      this._handleInfiniteLoop(oneIndexedSourceLine);
      return;
    }

    let oneIndexedOriginalLine = bowser.is('Safari') ? 1 : oneIndexedSourceLine;

    let {column} = error;
    if (this.props.compiledProject.sourceMap) {
      const {SourceMapConsumer} = await retryingFailedImports(() =>
        import(
          /* webpackChunkName: "mainAsync" */
          'source-map'
        ),
      );

      const smc = new SourceMapConsumer(this.props.compiledProject.sourceMap);
      const result = smc.originalPositionFor({
        line: oneIndexedSourceLine,
        column: error.column,
      });

      if (result.line !== null && result.column !== null) {
        oneIndexedOriginalLine = result.line;
        ({column} = result);
      }
    }

    this.props.onRuntimeError({
      reason: normalizedError.type,
      text: normalizedError.message,
      raw: normalizedError.message,
      row: oneIndexedOriginalLine - 1,
      column,
      type: 'error',
    });
  }

  _handleInfiniteLoop(line) {
    const message = i18next.t('errors.javascriptRuntime.infinite-loop');
    this.props.onRuntimeError({
      reason: 'infinite-loop',
      text: message,
      raw: message,
      row: line - 1,
      column: 0,
      type: 'error',
    });
  }

  _handleConsoleLog(printedValue) {
    const {compiledProjectKey} = this.props.compiledProject;
    this.props.onConsoleLog(printedValue, compiledProjectKey);
  }

  _handleSave() {
    this.props.onSave();
  }

  _attachToFrame(frame) {
    if (!frame) {
      if (this._channel) {
        this._channel.destroy();
        Reflect.deleteProperty(this, '_channel');
      }
      return;
    }

    this._channel = Channel.build({
      window: frame.contentWindow,
      origin: '*',
      onReady() {
        frame.classList.add('preview__frame_loaded');
      },
    });

    this._channel.bind('error', (_trans, params) => {
      if (this.props.isActive) {
        this._handleErrorMessage(params);
      }
    });
    this._channel.bind('log', (_trans, params) => {
      if (this.props.isActive) {
        this._handleConsoleLog(params);
      }
    });
    this._channel.bind('save', () => {
      if (this.props.isActive) {
        this._handleSave();
      }
    });
  }
}

PreviewFrame.propTypes = {
  compiledProject: PropTypes.instanceOf(CompiledProjectRecord).isRequired,
  consoleEntries: ImmutablePropTypes.iterable.isRequired,
  isActive: PropTypes.bool.isRequired,
  onConsoleError: PropTypes.func.isRequired,
  onConsoleLog: PropTypes.func.isRequired,
  onConsoleValue: PropTypes.func.isRequired,
  onRuntimeError: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default PreviewFrame;
