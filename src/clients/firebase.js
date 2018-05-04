import Cookies from 'js-cookie';
import get from 'lodash/get';
import isNil from 'lodash/isNil';
import isNull from 'lodash/isNull';
import values from 'lodash/values';
import uuid from 'uuid/v4';
import {getGapi} from '../services/gapi';
import {
  auth,
  database,
  githubAuthProvider,
  googleAuthProvider,
} from '../services/appFirebase';

const VALID_SESSION_UID_COOKIE = 'firebaseAuth.validSessionUid';
const SESSION_TTL_MS = 5 * 60 * 1000;

export function onAuthStateChanged(listener) {
  const unsubscribe = auth.onAuthStateChanged(async(user) => {
    if (isNull(user)) {
      listener(null);
    } else {
      listener(await userCredentialForUserData(user));
    }
  });
  return unsubscribe;
}

function workspace(uid) {
  return database.ref(`workspaces/${uid}`);
}

const snapshots = database.ref('snapshots');
const assignments = database.ref('assignments');

async function getCurrentProjectKey(uid) {
  const event =
    await workspace(uid).child('currentProjectKey').once('value');
  return event.val();
}

export async function setCurrentProjectKey(uid, projectKey) {
  await workspace(uid).child('currentProjectKey').set(projectKey);
}

export async function loadAllProjects(uid) {
  const projects = await workspace(uid).child('projects').once('value');
  return values(projects.val() || {});
}

async function loadProject(uid, projectKey) {
  const event =
    await workspace(uid).child('projects').child(projectKey).once('value');
  return event.val();
}

export async function createProjectSnapshot(project) {
  const snapshotKey = uuid().toString();

  await snapshots.child(snapshotKey).set(project);
  return snapshotKey;
}

export async function loadProjectSnapshot(snapshotKey) {
  const event = await snapshots.child(snapshotKey).once('value');
  return event.val();
}

export async function loadCurrentProject(uid) {
  const projectKey = await getCurrentProjectKey(uid);
  if (projectKey) {
    return loadProject(uid, projectKey);
  }
  return null;
}

async function saveProject(uid, project) {
  await workspace(uid).child('projects').child(project.projectKey).
    setWithPriority(project, -Date.now());
}

export async function saveCurrentProject(uid, project) {
  return Promise.all([
    saveProject(uid, project),
    setCurrentProjectKey(uid, project.projectKey),
  ]);
}

async function userCredentialForUserData(user) {
  const path = providerPath(user.uid, user.providerData[0].providerId);
  const [credentialEvent, providerInfoEvent] = await Promise.all([
    database.ref(`authTokens/${path}`).once('value'),
    database.ref(`providerInfo/${path}`).once('value'),
  ]);
  const credential = credentialEvent.val();
  const additionalUserInfo = providerInfoEvent.val();
  if (isNil(credential)) {
    await auth.signOut();
    return null;
  }

  return {user, credential, additionalUserInfo};
}

export async function signIn(provider) {
  const originalOnerror = window.onerror;
  window.onerror = message => message.toLowerCase().includes('network error');
  try {
    let userCredential;
    if (provider === 'github') {
      userCredential = await auth.signInWithPopup(githubAuthProvider);
    } else if (provider === 'google') {
      const gapi = await getGapi();
      const googleUser = await gapi.auth2.getAuthInstance().signIn();
      const credential =
        googleAuthProvider.credential(googleUser.getAuthResponse().id_token);
      userCredential =
        await auth.signInAndRetrieveDataWithCredential(credential);
    }
    await saveUserCredential(userCredential);
    return userCredential;
  } finally {
    setTimeout(() => {
      window.onerror = originalOnerror;
    });
  }
}

export async function signOut() {
  const gapi = await getGapi();
  await gapi.auth2.getAuthInstance().signOut();
  return auth.signOut();
}

async function saveUserCredential({
  user: {uid},
  credential,
  additionalUserInfo,
}) {
  await Promise.all([
    saveProviderInfo(uid, additionalUserInfo),
    saveCredentials(uid, credential),
  ]);
}

async function saveCredentials(uid, credential) {
  await database.
    ref(`authTokens/${providerPath(uid, credential.providerId)}`).
    set(credential);
}

async function saveProviderInfo(uid, providerInfo) {
  await database.
    ref(`providerInfo/${providerPath(uid, providerInfo.providerId)}`).
    set(providerInfo);
}

function providerPath(uid, providerId) {
  return `${uid}/${providerId.replace('.', '_')}`;
}

export function startSessionHeartbeat() {
  setInterval(setSessionUid, 1000);
}

export function getSessionUid() {
  return Cookies.get(VALID_SESSION_UID_COOKIE);
}

export function setSessionUid() {
  const uid = get(auth, 'currentUser.uid');
  if (!isNil(uid)) {
    Cookies.set(
      VALID_SESSION_UID_COOKIE,
      uid,
      {expires: new Date(Date.now() + SESSION_TTL_MS)},
    );
  }
}

export async function createProjectAssignment(
  assignmentKey,
  snapshotKey,
  assignment,
  assignerId,
) {
  await assignments.child(assignmentKey).set({
    courseId: assignment.courseId,
    id: assignment.id,
    snapshotKey,
    alternateLink: assignment.alternateLink || null,
    assignerId,
    assignmentKey,
  });
}

export async function loadAllAssignments(projects) {
  const promises = projects.filter(project => project.assignmentKey).
    map(project => loadProjectAssignment(project.assignmentKey));
  const allAssignments = await Promise.all(promises);
  return allAssignments;
}

export async function loadProjectAssignment(assignmentKey) {
  const event = await assignments.child(assignmentKey).once('value');
  return event.val();
}

export async function updateAssignmentSnapshot(
  assignmentKey,
  snapshotKey,
) {
  await assignments.child(assignmentKey).child('snapshotKey').set(
    snapshotKey,
  );
}
