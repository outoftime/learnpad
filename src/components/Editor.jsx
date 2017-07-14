import React from 'react';
import PropTypes from 'prop-types';
import ACE from 'brace';
import bindAll from 'lodash/bindAll';
import get from 'lodash/get';
import throttle from 'lodash/throttle';
import noop from 'lodash/noop';

import 'brace/ext/searchbox';
import 'brace/mode/html';
import 'brace/mode/css';
import 'brace/mode/javascript';
import 'brace/theme/monokai';

const RESIZE_THROTTLE = 250;
const NORMAL_FONTSIZE = 14;
const LARGE_FONTSIZE = 20;

function createSessionWithoutWorker(source, language) {
  const session = ACE.createEditSession(source, null);
  session.setUseWorker(false);
  session.setMode(`ace/mode/${language}`);
  return session;
}

class Editor extends React.Component {
  constructor() {
    super();

    this._handleWindowResize = throttle(() => {
      if (this._editor) {
        this._resizeEditor();
      }
    }, RESIZE_THROTTLE);

    bindAll(this, '_handleWindowResize', '_resizeEditor', '_setupEditor');
  }

  componentDidMount() {
    this._focusRequestedLine(this.props.requestedFocusedLine);
    this._toggleEditorTextSize(this.props.textSizeIsLarge);
    window.addEventListener('resize', this._handleWindowResize);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.projectKey !== this.props.projectKey) {
      this._startNewSession(nextProps.source);
    } else if (nextProps.source !== this.props.source &&
        nextProps.source !== this._editor.getValue()) {
      this._editor.setValue(nextProps.source);
    }

    this._focusRequestedLine(nextProps.requestedFocusedLine);
    this._toggleEditorTextSize(nextProps.textSizeIsLarge);

    if (nextProps.percentageOfHeight !== this.props.percentageOfHeight) {
      requestAnimationFrame(this._resizeEditor);
    }

    this._editor.getSession().setAnnotations(nextProps.errors);
  }

  shouldComponentUpdate() {
    return false;
  }

  componentWillUnmount() {
    this._editor.destroy();
    window.removeEventListener('resize', this._handleWindowResize);
  }

  _focusRequestedLine(requestedFocusedLine) {
    if (get(requestedFocusedLine, 'language') !== this.props.language) {
      return;
    }

    this._editor.moveCursorTo(
      requestedFocusedLine.line,
      requestedFocusedLine.column,
    );

    this._scrollToLine(requestedFocusedLine.line);

    this._editor.clearSelection();
    this._editor.focus();
    this.props.onRequestedLineFocused();
  }

  _resizeEditor() {
    this._editor.resize();
  }

  _scrollToLine(lineNumber) {
    const shouldCenterVertically = true;
    const shouldAnimate = true;
    this._editor.scrollToLine(
      lineNumber,
      shouldCenterVertically,
      shouldAnimate,
      noop,
    );
  }

  _setupEditor(containerElement) {
    if (containerElement) {
      this._editor = ACE.edit(containerElement);
      this._editor.$blockScrolling = Infinity;
      this._startNewSession(this.props.source);
      this._disableAutoClosing();
      this._resizeEditor();
      this._editor.on('focus', this._resizeEditor);
      this._editor.setOptions({
        fontFamily: 'Inconsolata',
        fontSize: '14px',
      });
    } else {
      this._editor.destroy();
    }
  }

  _toggleEditorTextSize(textSizeIsLarge) {
    if (textSizeIsLarge) {
      this._editor.setFontSize(LARGE_FONTSIZE);
    } else {
      this._editor.setFontSize(NORMAL_FONTSIZE);
    }
  }

  _disableAutoClosing() {
    this._editor.setBehavioursEnabled(false);
  }

  _startNewSession(source) {
    const session = createSessionWithoutWorker(source, this.props.language);
    session.setUseWrapMode(true);
    session.on('change', () => {
      this.props.onInput(this._editor.getValue());
    });
    session.setAnnotations(this.props.errors);
    this._editor.setSession(session);
    this._editor.moveCursorTo(0, 0);
    this._resizeEditor();
  }

  render() {
    return (
      <div
        className="editors__editor"
        ref={this._setupEditor}
      />
    );
  }
}

Editor.propTypes = {
  errors: PropTypes.array.isRequired,
  language: PropTypes.string.isRequired,
  percentageOfHeight: PropTypes.number.isRequired,
  projectKey: PropTypes.string.isRequired,
  requestedFocusedLine: PropTypes.object,
  source: PropTypes.string.isRequired,
  textSizeIsLarge: PropTypes.bool.isRequired,
  onInput: PropTypes.func.isRequired,
  onRequestedLineFocused: PropTypes.func.isRequired,
};

Editor.defaultProps = {
  requestedFocusedLine: null,
  textSizeIsLarge: false,
};

export default Editor;
