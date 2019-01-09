import {
  faChevronDown,
  faChevronUp,
  faExternalLinkAlt,
  faSyncAlt,
} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import get from 'lodash-es/get';
import partial from 'lodash-es/partial';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import React from 'react';
import classnames from 'classnames';

import PreviewFrame from './PreviewFrame';

export default function Preview({
  compiledProjects,
  consoleEntries,
  currentProjectKey,
  isOpen,
  showingErrors,
  onConsoleError,
  onConsoleLog,
  onConsoleValue,
  onPopOutProject,
  onRefreshClick,
  onRuntimeError,
  onToggleVisible,
}) {
  if (showingErrors) {
    return null;
  }

  const projectFrames = compiledProjects.map((compiledProject, key) => (
    <PreviewFrame
      compiledProject={compiledProject}
      consoleEntries={consoleEntries}
      isActive={key === compiledProjects.keySeq().last()}
      key={compiledProject.compiledProjectKey}
      onConsoleError={onConsoleError}
      onConsoleLog={onConsoleLog}
      onConsoleValue={onConsoleValue}
      onRuntimeError={onRuntimeError}
    />
  ));

  const mostRecentCompiledProject = compiledProjects.last();
  const title = get(mostRecentCompiledProject, 'title', '');
  return (
    <div
      className={classnames(
        'preview',
        'output__item',
        {output__item_collapsed: !isOpen},
      )}
    >
      <div className="preview__title-bar">
        <span className="preview__button preview__button_pop-out">
          <FontAwesomeIcon
            icon={faExternalLinkAlt}
            onClick={onPopOutProject}
          />
        </span>
        {title}
        <span className="preview__button preview__button_toggle-visibility">
          <FontAwesomeIcon
            icon={isOpen ? faChevronDown : faChevronUp}
            onClick={partial(onToggleVisible, currentProjectKey)}
          />
        </span>
        <span className="preview__button preview__button_reset">
          <FontAwesomeIcon icon={faSyncAlt} onClick={onRefreshClick} />
        </span>
      </div>
      {projectFrames}
    </div>
  );
}

Preview.propTypes = {
  compiledProjects: ImmutablePropTypes.iterable.isRequired,
  consoleEntries: ImmutablePropTypes.iterable.isRequired,
  currentProjectKey: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  showingErrors: PropTypes.bool.isRequired,
  onConsoleError: PropTypes.func.isRequired,
  onConsoleLog: PropTypes.func.isRequired,
  onConsoleValue: PropTypes.func.isRequired,
  onPopOutProject: PropTypes.func.isRequired,
  onRefreshClick: PropTypes.func.isRequired,
  onRuntimeError: PropTypes.func.isRequired,
  onToggleVisible: PropTypes.func.isRequired,
};
