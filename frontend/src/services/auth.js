import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
} from 'amazon-cognito-identity-js';
import config from '../config';

const userPool = new CognitoUserPool({
  UserPoolId: config.COGNITO_USER_POOL_ID,
  ClientId: config.COGNITO_CLIENT_ID,
});

export function signUp(email, password, name) {
  return new Promise((resolve, reject) => {
    const attributes = [
      new CognitoUserAttribute({ Name: 'email', Value: email }),
      new CognitoUserAttribute({ Name: 'name', Value: name }),
    ];

    userPool.signUp(email, password, attributes, null, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

export function confirmSignUp(email, code) {
  const cognitoUser = new CognitoUser({
    Username: email,
    Pool: userPool,
  });

  return new Promise((resolve, reject) => {
    cognitoUser.confirmRegistration(code, true, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

export function signIn(email, password) {
  const cognitoUser = new CognitoUser({
    Username: email,
    Pool: userPool,
  });

  const authDetails = new AuthenticationDetails({
    Username: email,
    Password: password,
  });

  return new Promise((resolve, reject) => {
    cognitoUser.authenticateUser(authDetails, {
      onSuccess: (session) => {
        resolve(session);
      },
      onFailure: (err) => {
        reject(err);
      },
    });
  });
}

export function signOut() {
  const currentUser = userPool.getCurrentUser();
  if (currentUser) {
    currentUser.signOut();
  }
}

export function getCurrentUser() {
  return userPool.getCurrentUser();
}

export function getSession() {
  const currentUser = getCurrentUser();
  if (!currentUser) return Promise.reject(new Error('No user'));

  return new Promise((resolve, reject) => {
    currentUser.getSession((err, session) => {
      if (err) {
        reject(err);
      } else {
        resolve(session);
      }
    });
  });
}

export function getIdToken() {
  return getSession().then((session) => session.getIdToken().getJwtToken());
}

export function getUserAttributes() {
  const currentUser = getCurrentUser();
  if (!currentUser) return Promise.reject(new Error('No user'));

  return new Promise((resolve, reject) => {
    currentUser.getSession((err) => {
      if (err) {
        reject(err);
        return;
      }
      currentUser.getUserAttributes((err, attributes) => {
        if (err) {
          reject(err);
        } else {
          const attrs = {};
          attributes.forEach((attr) => {
            attrs[attr.getName()] = attr.getValue();
          });
          resolve(attrs);
        }
      });
    });
  });
}
