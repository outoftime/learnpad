import {combineReducers} from 'redux-immutable';
import reduceReducers from 'reduce-reducers';
import user from './user';
import projects, {reduceRoot as reduceRootForProjects} from './projects';
import console from './console';
import currentProject from './currentProject';
import errors from './errors';
import ui from './ui';
import clients from './clients';
import compiledProjects from './compiledProjects';
import assignments from './assignments';

const reduceRoot = combineReducers({
  user,
  projects,
  currentProject,
  errors,
  ui,
  clients,
  compiledProjects,
  console,
  assignments,
});

export default reduceReducers(
  reduceRoot,
  reduceRootForProjects,
);
