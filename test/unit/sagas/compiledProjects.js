import test from 'tape';
import {testSaga} from 'redux-saga-test-plan';
import {
  validatedSource as validatedSourceSaga,
} from '../../../src/sagas/compiledProjects';
import {getCurrentProject, getErrors} from '../../../src/selectors';
import {projectCompiled} from '../../../src/actions';
import generatePreview from '../../../src/util/generatePreview';
import {errors} from '../../helpers/referenceStates';
import {project as projectFactory} from '../../helpers/factory';

test('validatedSource', (t) => {
  t.test('with errors', (assert) => {
    testSaga(validatedSourceSaga).
      next().select(getErrors).
      next(errors.errors.toJS()).isDone();

    assert.end();
  });

  t.test('with no errors', (assert) => {
    const clock = sinon.useFakeTimers();
    const project = projectFactory();
    const preview = {source: '<html></html>'};

    testSaga(validatedSourceSaga).
      next().select(getErrors).
      next(errors.noErrors.toJS()).select(getCurrentProject).
      next(project).call(
        generatePreview,
        project,
        {
          nonBlockingAlertsAndPrompts: true,
          targetBaseTop: true,
          propagateErrorsToParent: true,
          lastRefreshTimestamp: Date.now(),
        },
      ).
      next(preview).put(projectCompiled(preview, Date.now()));

    clock.restore();
    assert.end();
  });
});
