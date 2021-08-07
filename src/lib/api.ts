import Observable from './observable';
import './Picker.css';

const scope = [
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/drive.readonly'
].join(' ');
const discoveryDocs = [
  'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
];
const apiKey = process.env.REACT_APP_GAPI_KEY ||
  'AIzaSyDAXtOKqc3gYjmuoxZAqQHnBm-xTQi1-Mw';
const clientId = '321539141956-kn4i96a10682t0l8agfo5158fln9ai5d.apps.googleusercontent.com';

const gapi = (window as any).gapi;
const signedInObservable = new Observable<boolean>();
const gapiErrorsObservable = new Observable<any>();
let GoogleAuth: any
let google: any;
const gapiReadyObservable = new Observable<void>();
let picker: any;
const pickObservable = new Observable<any>();
const pickerReadyObservable = new Observable<void>();

const onSignedInChanged = (isSignedIn: boolean) => {
  // console.log('onSignedInChanged', isSignedIn);
  signedInObservable.push(isSignedIn);
  if (isSignedIn) {
    createPicker();
    pickerReadyObservable.push();
  } else {
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
    google = (window as any).google;
    // console.log(gapi.auth2, GoogleAuth, GoogleAuth.isSignedIn, google);
    onSignedInChanged(GoogleAuth.isSignedIn.get());
    GoogleAuth.isSignedIn.listen(onSignedInChanged);
    gapiReadyObservable.push();
  }
  catch (err) {
    console.log(err);
    gapiErrorsObservable.push(err);
  }
};

const onPick = (e: any) => {
  // console.log('onPick', e);
  pickObservable.push(e);
};

const createPicker = () => {
  const user = GoogleAuth.currentUser.get();
  const authResponse = user.getAuthResponse(true);
  const accessToken = authResponse.access_token;

  const view = new google.picker.DocsView(google.picker.ViewId.DOCS_IMAGES)
    .setMimeTypes('image/apng,image/avif,image/gif,image/jpeg,image/png,image/svg+xml,image/webp')
    .setIncludeFolders(true)
    .setParent('root');
  
  picker = new google.picker.PickerBuilder()
    .enableFeature(google.picker.Feature.NAV_HIDDEN)
    .addView(view)
    .setOAuthToken(accessToken)
    .setDeveloperKey(apiKey)
    .setCallback(onPick)
    .build();
  // console.log({picker});
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
const pickFile = () => new Promise<any>(
  (resolve, reject) => {
    const onThisPick = (e: any) => {
      if (e.action === 'picked') {
        const doc = e.docs[0];
        pickObservable.unsubscribe(onThisPick);
        resolve(doc);
      } else if (e.action === 'cancel') {
        pickObservable.unsubscribe(onThisPick);
        resolve(null);
      }
    };

    if (picker) {
      picker.setVisible(true);
    } else {
      pickerReadyObservable.once(() => {
        if (picker) {
          picker.setVisible(true);
        } else {
          reject(new Error('No Picker'));
        }
      });
    }

    pickObservable.subscribe(onThisPick);
  }
);

const getFile = async (fileId: string) => {
  try {
    const result = await gapi.client.drive.files.get({
      fileId,
      fields: '*'
    });
    return result.result;
  }
  catch(err) {
    console.log(err);
  }
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
  try {
    const result = await gapi.client.drive.files.list({
      q: `'${parentId}' in parents and mimeType contains 'image/'`,
      fields: 'files(id, name, thumbnailLink, webContentLink, imageMediaMetadata/*)',
      // fields: '*',
      pageSize: 1000,
      orderBy: 'name',
      pageToken
    });
    // console.log({result});
    return result.result;
  }
  catch(err) {
    console.log(err);
  }
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
  try {
    const result = await gapi.client.drive.files.list({
      q: `'${parentId}' in parents and mimeType contains 'image/'`,
      fields: 'files(id, name)',
      pageSize: 1,
      orderBy: edge === DirectoryEdge.Begin ?
        'name' : 'name desc'
    });
    return (
      result.result ?
        result.result.files as any[] : []
    );
  }
  catch(err) {
    console.log(err);
    return [];
  }
};

const getParent = async (parentId: string) => {
  try {
    const result = await gapi.client.drive.files.get({
      fileId: parentId,
      fields: '*'
    });
    return result.result;
  }
  catch(err) {
    console.log(err);
  }
};

const listDirectories = async (grandParentId: string) => {
  try {
    const result = await gapi.client.drive.files.list({
      q: `'${grandParentId}' in parents and mimeType = 'application/vnd.google-apps.folder'`,
      // fields: 'files(id, name, thumbnailLink, webContentLink, imageMediaMetadata/*)',
      fields: '*',
      pageSize: 1000,
      orderBy: 'name'
    });
    // console.log({result});
    return result.result;
  }
  catch(err) {
    console.log(err);
  }
};

const getProfile = () => {
  const user = GoogleAuth.currentUser.get();
  const profile = user.getBasicProfile();
  const imageUrl = profile.getImageUrl();
  return {
    imageUrl
  };
};

export type GapiErrorHandler = (error: any) => void;
const subscribeToGapiErrors = (onError: GapiErrorHandler) => {
  gapiErrorsObservable.subscribe(onError);
  return () => gapiErrorsObservable.unsubscribe(onError);
};

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
  subscribeToGapiErrors
};
