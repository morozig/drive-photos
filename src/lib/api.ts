import Observable from './observable';
import './Picker.css';

const driveInfoScope = 'https://www.googleapis.com/auth/drive.metadata.readonly';
const driveFileScope = 'https://www.googleapis.com/auth/drive.readonly';
const scope = [
  driveInfoScope,
  driveFileScope
].join(' ');
const discoveryDocs = [
  'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
];
const apiKey = process.env.NODE_ENV === 'production' ?
  'AIzaSyDAXtOKqc3gYjmuoxZAqQHnBm-xTQi1-Mw' :
    process.env.REACT_APP_GAPI_KEY;
const clientId = '321539141956-kn4i96a10682t0l8agfo5158fln9ai5d.apps.googleusercontent.com';
const pickerTimeout = 50 * 60 * 1000;
// const pickerTimeout = 0.5 * 60 * 1000;

const signedInObservable = new Observable<boolean>();
const gapiErrorsObservable = new Observable<any>();
let GoogleAuth: gapi.auth2.GoogleAuth | undefined;
const gapiReadyObservable = new Observable<void>();
let picker: google.picker.Picker | undefined;
let pickerCreatedTime = 0;
let lastPickerNavHidden = true;
const pickObservable = new Observable<google.picker.ResponseObject>();
let gapiError = null as null | any;

export interface Profile {
  imageUrl: string;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const onSignedInChanged = (isSignedIn: boolean) => {
  // console.log('onSignedInChanged', isSignedIn);
  signedInObservable.push(isSignedIn);
  if (!isSignedIn) {
    picker = undefined;
    pickObservable.unsubscribe(onPick);
  }
};

const onGapiLoaded = async () => {
  try {
    await gapi.client.init({
      apiKey,
      clientId,
      scope,
      discoveryDocs
    });
    GoogleAuth = gapi.auth2.getAuthInstance();
    // console.log(gapi.auth2, GoogleAuth, GoogleAuth.isSignedIn, google);
    onSignedInChanged(GoogleAuth.isSignedIn.get());
    GoogleAuth.isSignedIn.listen(onSignedInChanged);
    gapiReadyObservable.push();
  }
  catch (err) {
    console.log(err);
    gapiErrorsObservable.push(err);
    gapiError = err;
  }
};

let checkScopesPromise: Promise<void> | undefined;

const checkScopes = () => new Promise<void>((resolve, reject) => {
  if (!GoogleAuth) {
    reject(new Error('not authed'));
    return;
  }
  const user = GoogleAuth.currentUser.get();
  const authResponse = user.getAuthResponse(true);
  const scope = authResponse.scope;
  const hasInfoScope = scope.includes(driveInfoScope);
  const hasFileScope = scope.includes(driveFileScope);
  if (hasInfoScope && hasFileScope) {
    resolve();
    return;
  }
  if (!checkScopesPromise) {
    checkScopesPromise = new Promise<void>((resolve, reject) => {
      const options = new gapi.auth2.SigninOptionsBuilder();
      options.setScope(''.concat(
        !hasInfoScope ? `${driveInfoScope} ` : ' ',
        !hasFileScope ? `${driveFileScope} ` : ' ',
      ));
      user.grant(options).then(
        () => {
          checkScopesPromise = undefined;
          // console.log('checkScopes granted');
          const authResponse = user.getAuthResponse(true);
          const scope = authResponse.scope;
          const hasInfoScope = scope.includes(driveInfoScope);
          const hasFileScope = scope.includes(driveFileScope);
          if (hasInfoScope && hasFileScope) {
            resolve();
            return;
          } else {
            reject(new Error('access not granted'));
          }
        },
        (err) => {
          checkScopesPromise = undefined;
          // console.log('checkScopes rejected');
          reject(err);
        }
      );
    });
  }
  checkScopesPromise
    .then(resolve)
    .catch(reject);
});

const onPick = (response: google.picker.ResponseObject) => {
  // console.log('onPick', response);
  pickObservable.push(response);
};

const createPicker = () => {
  if (!GoogleAuth) {
    throw new Error('not authed');
  }
  if (!apiKey) {
    throw new Error('set gapi key');
  }
  const user = GoogleAuth.currentUser.get();
  const authResponse = user.getAuthResponse(true);
  const accessToken = authResponse.access_token;
  const now = new Date().getTime();
  pickerCreatedTime = now;

  console.log('create picker', {
    now,
    lastPickerNavHidden,
    picker
  });

  const view = new google.picker.DocsView(google.picker.ViewId.DOCS_IMAGES)
    .setMimeTypes('image/apng,image/avif,image/gif,image/jpeg,image/png,image/svg+xml,image/webp')
    .setIncludeFolders(true)
    .setParent('root');
  
  const builder = new google.picker.PickerBuilder()
    .addView(view)
    .setOAuthToken(accessToken)
    .setDeveloperKey(apiKey)
    .setCallback(onPick);
  if (lastPickerNavHidden) {
    builder.enableFeature(google.picker.Feature.NAV_HIDDEN);
  }
  picker = builder.build();
  lastPickerNavHidden = !lastPickerNavHidden;
  // console.log({picker});

};

const checkPickerTimeout = async () => {
  if (picker) {
    const now = new Date().getTime();
    const diff = now - pickerCreatedTime;
    const isTimedOut = diff > pickerTimeout;
    // console.log({now, pickerCreatedTime, diff, isTimedOut});
    if (isTimedOut) {
      picker.setVisible(false);
      picker.dispose();
      pickObservable.unsubscribeAll();
      await sleep (100);
      picker = undefined;
      createPicker();
    }
  } else {
    createPicker();
  }
};

// console.log(gapi);

const isSignedIn = () => {
  return !!GoogleAuth &&
    GoogleAuth.isSignedIn.get() as boolean;
};
export type SignedInChangeHandler = (isSignedIn: boolean) => void;

const subscribeToSignedInChange = (onChange: SignedInChangeHandler) => {
  signedInObservable.subscribe(onChange);
  return () => signedInObservable.unsubscribe(onChange);
};

const signIn = () => {
  if (GoogleAuth) {
    GoogleAuth.signIn();
  } else {
    gapiReadyObservable.once(
      () => {
        if (GoogleAuth) {
          GoogleAuth.signIn();
        }
      }
    );
  }
};
const signOut = () => {
  if (GoogleAuth) {
    GoogleAuth.signOut();
  }
};
const pickFile = () => new Promise<google.picker.DocumentObject | null>(
  (resolve, reject) => {
    const onThisPick = (response: google.picker.ResponseObject) => {
      if (response.action === 'picked') {
        const doc = response.docs[0];
        pickObservable.unsubscribe(onThisPick);
        resolve(doc);
      } else if (response.action === 'cancel') {
        pickObservable.unsubscribe(onThisPick);
        resolve(null);
      }
    };

    // console.log('started pick', new Date().getTime());

    checkScopes()
      .then(checkPickerTimeout)
      .then(() => {
        if (picker) {
          picker.setVisible(true);
        } else {
          reject(new Error('No Picker'));
        }
    
        pickObservable.subscribe(onThisPick);
      })
      .catch(reject);
  }
);

const getFile = async (fileId: string) => {
  await checkScopes();
  const result = await gapi.client.drive.files.get({
    fileId,
    // fields: '*'
    fields: 'id, name, thumbnailLink, webContentLink, imageMediaMetadata/*',
  });
  return result.result;
};

export interface ListFilesOptions {
  parentId: string;
  pageToken?: string;
};

const listFiles = async (options: ListFilesOptions) => {
  const {
    parentId,
    pageToken
  } = options;
  await checkScopes();
  const result = await gapi.client.drive.files.list({
    q: `'${parentId}' in parents and mimeType contains 'image/'`,
    fields: 'nextPageToken, files(id, name, thumbnailLink, webContentLink, imageMediaMetadata/*)',
    // fields: '*',
    pageSize: 1000,
    orderBy: 'name_natural',
    pageToken
  });
  // console.log({result});
  return result.result;
};

export enum DirectoryEdge {
  Begin = 1,
  End
};
interface GetEdgeFileOptions {
  parentId: string;
  edge: DirectoryEdge;
};

const getEdgeFiles = async (options: GetEdgeFileOptions) => {
  const {
    parentId,
    edge
  } = options;
  await checkScopes();
  const result = await gapi.client.drive.files.list({
    q: `'${parentId}' in parents and mimeType contains 'image/'`,
    fields: 'files(id, name)',
    pageSize: 1,
    orderBy: edge === DirectoryEdge.Begin ?
      'name_natural' : 'name_natural desc'
  });
  return (
    result.result && result.result.files ?
      result.result.files : []
  );
};

const getParent = async (parentId: string) => {
  await checkScopes();
  const result = await gapi.client.drive.files.get({
    fileId: parentId,
    fields: '*'
  });
  return result.result;
};

const listDirectories = async (grandParentId: string) => {
  await checkScopes();
  const result = await gapi.client.drive.files.list({
    q: `'${grandParentId}' in parents and mimeType = 'application/vnd.google-apps.folder'`,
    // fields: 'files(id, name, thumbnailLink, webContentLink, imageMediaMetadata/*)',
    fields: '*',
    pageSize: 1000,
    orderBy: 'name_natural'
  });
  // console.log({result});
  return result.result;
};

const getProfile = () => {
  if (!GoogleAuth) {
    return null;
  }
  const user = GoogleAuth.currentUser.get();
  const profile = user.getBasicProfile();
  const imageUrl = profile.getImageUrl();
  return {
    imageUrl
  } as Profile;
};

export type GapiErrorHandler = (error: any) => void;
const subscribeToGapiErrors = (onError: GapiErrorHandler) => {
  gapiErrorsObservable.subscribe(onError);
  return () => gapiErrorsObservable.unsubscribe(onError);
};
const getGapiError = () => gapiError;

gapi.load('client:auth2:picker', onGapiLoaded);

export {
  isSignedIn,
  signIn,
  signOut,
  subscribeToSignedInChange,
  pickFile,
  getFile,
  listFiles,
  getParent,
  getEdgeFiles,
  listDirectories,
  getProfile,
  subscribeToGapiErrors,
  getGapiError
};
