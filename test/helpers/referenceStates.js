import {fromJS, List, Map} from 'immutable';

import {Error, ErrorList, ErrorReport, User} from '../../src/records';

const sampleError = new Error({reason: 'bad-code'});
const validatingErrorList = new ErrorList({state: 'validating'});

export const user = {
  initial: new User(),
};

export const projects = {
  initial: new Map(),
};

export const errors = {
  noErrors: new ErrorReport(),

  errors: new ErrorReport().set(
    'css',
    new ErrorList({items: new List([sampleError]), state: 'validation-error'}),
  ),

  validating: new ErrorReport({
    html: validatingErrorList,
    css: validatingErrorList,
    javascript: validatingErrorList,
  }),
};

export const clients = {
  initial: fromJS({
    firebase: {exportingSnapshot: false},
    projectExports: {},
  }),
  waitingForSnapshot: fromJS({
    firebase: {exportingSnapshot: true},
    projectExports: {},
  }),
  waitingForGist: fromJS({
    firebase: {exportingSnapshot: false},
    projectExports: {gist: {status: 'waiting'}},
  }),
};
