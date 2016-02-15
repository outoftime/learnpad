var isEmpty = require('lodash/isEmpty');
var debounce = require('lodash/debounce');

var Storage = require('../services/Storage');
var validate = require('../validations/client');

function generateProjectKey() {
  var date = new Date();
  return (date.getTime() * 1000 + date.getMilliseconds()).toString();
}

function getCurrentProject(state) {
  var projectKey = state.currentProject.get('projectKey');
  if (projectKey) {
    return state.projects.get(projectKey);
  }
}

var showErrorsAfterDebounce = debounce(function(dispatch) {
  dispatch({type: 'ERROR_DEBOUNCE_FINISHED'});
}, 1000);

function validateSource(dispatch, language, source, enabledLibraries) {
  dispatch({
    type: 'VALIDATING_SOURCE',
    payload: {
      language: language,
    },
  });

  validate(language, source, enabledLibraries.toJS()).then(function(errors) {
    dispatch({
      type: 'VALIDATED_SOURCE',
      payload: {
        language: language,
        errors: errors,
      },
    });

    if (!isEmpty(errors)) {
      showErrorsAfterDebounce(dispatch);
    }
  });
}

function validateAllSources(dispatch, project) {
  var enabledLibraries = project.get('enabledLibraries');
  project.get('sources').forEach(function(source, language) {
    validateSource(dispatch, language, source, enabledLibraries);
  });
}

exports.createProject = function() {
  return function(dispatch, getState) {
    dispatch({
      type: 'PROJECT_CREATED',
      payload: {
        projectKey: generateProjectKey(),
      },
    });

    var state = getState();
    var projectKey = state.currentProject.get('projectKey');
    var project = state.projects.get(projectKey);

    Storage.save(project.toJS());
    Storage.setCurrentProjectKey(projectKey);
  };
};

exports.loadCurrentProjectFromStorage = function() {
  return function(dispatch, getState) {
    Storage.getCurrentProjectKey().then(function(projectKey) {
      if (projectKey) {
        Storage.load(projectKey).then(function(project) {
          dispatch({
            type: 'CURRENT_PROJECT_LOADED_FROM_STORAGE',
            payload: {project: project},
          });

          validateAllSources(dispatch, getCurrentProject(getState()));
        });
      } else {
        exports.createProject()(dispatch, getState);
      }
    });
  };
};

exports.updateProjectSource = function(projectKey, language, newValue) {
  return function(dispatch, getState) {
    dispatch({
      type: 'PROJECT_SOURCE_EDITED',
      payload: {
        projectKey: projectKey,
        language: language,
        newValue: newValue,
      },
    });

    var currentProject = getCurrentProject(getState());
    Storage.save(currentProject.toJS());

    validateSource(
      dispatch,
      language,
      newValue,
      currentProject.get('enabledLibraries')
    );
  };
};

exports.changeCurrentProject = function(projectKey) {
  return function(dispatch, getState) {
    dispatch({
      type: 'CURRENT_PROJECT_CHANGED',
      payload: {projectKey: projectKey},
    });

    Storage.setCurrentProjectKey(projectKey);

    validateAllSources(dispatch, getCurrentProject(getState()));
  };
};

exports.toggleLibrary = function(projectKey, libraryKey) {
  return function(dispatch, getState) {
    dispatch({
      type: 'PROJECT_LIBRARY_TOGGLED',
      payload: {
        projectKey: projectKey,
        libraryKey: libraryKey,
      },
    });

    validateAllSources(dispatch, getCurrentProject(getState()));
  };
};

exports.loadAllProjects = function() {
  return function(dispatch) {
    return Storage.all().then(function(projects) {
      projects.forEach(function(project) {
        dispatch({
          type: 'PROJECT_LOADED_FROM_STORAGE',
          payload: {project: project},
        });
      });
    });
  };
};

exports.addRuntimeError = function(error) {
  return {
    type: 'RUNTIME_ERROR_ADDED',
    payload: {error: error},
  };
};

exports.clearRuntimeErrors = function() {
  return {
    type: 'RUNTIME_ERRORS_CLEARED',
  };
};
