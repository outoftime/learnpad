import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import classnames from 'classnames';
import partial from 'lodash/partial';
import {generateTextPreview} from '../util/generatePreview';

const MAX_LENGTH = 50;

function ProjectList({currentProject, projects, onProjectSelected}) {
  const projectPreviews = projects.map((project) => {
    const preview = generateTextPreview(project);
    const isSelected =
      project.projectKey === currentProject.projectKey;

    return (
      <div
        className={classnames(
          'project-preview',
          'dashboard__menu-item',
          {'dashboard__menu-item_active': isSelected},
        )}
        key={project.projectKey}
        onClick={partial(onProjectSelected, project)}
      >
        <div className="project-preview__timestamp">
          {moment(project.updatedAt).fromNow()}
        </div>
        <div>
          {preview.slice(0, MAX_LENGTH)}
        </div>
      </div>
    );
  });

  return (
    <div className="dashboard__menu dashboard__menu_scrollable">
      {projectPreviews}
    </div>
  );
}

ProjectList.propTypes = {
  currentProject: PropTypes.object.isRequired,
  projects: PropTypes.array.isRequired,
  onProjectSelected: PropTypes.func.isRequired,
};


export default ProjectList;
