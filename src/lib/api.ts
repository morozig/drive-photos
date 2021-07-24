import Observable from './observable';
import './Picker.css';

const scope = [
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/drive.readonly'
].join(' ');
const discoveryDocs = [
  'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
];
const apiKey = 'AIzaSyDAXtOKqc3gYjmuoxZAqQHnBm-xTQi1-Mw';
const clientId = '321539141956-kn4i96a10682t0l8agfo5158fln9ai5d.apps.googleusercontent.com';

const gapi = (window as any).gapi;
const signedInObservable = new Observable<boolean>();
let GoogleAuth: any
let google: any;
const gapiReadyObservable = new Observable<void>();
let picker: any;
const pickObservable = new Observable<any>();
const pickerReadyObservable = new Observable<void>();

const onSignedInChanged = (isSignedIn: boolean) => {
  console.log('onSignedInChanged', isSignedIn);
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
    console.log(gapi.auth2, GoogleAuth, GoogleAuth.isSignedIn, google);
    onSignedInChanged(GoogleAuth.isSignedIn.get());
    GoogleAuth.isSignedIn.listen(onSignedInChanged);
    gapiReadyObservable.push();
  }
  catch (err) {
    console.log(err);
  }
};

const onPick = (e: any) => {
  console.log('onPick', e);
  pickObservable.push(e);
};

const createPicker = () => {
  const user = GoogleAuth.currentUser.get();
  const authResponse = user.getAuthResponse(true);
  const accessToken = authResponse.access_token;

  const view = new google.picker.DocsView(google.picker.ViewId.DOCS_IMAGES)
    .setIncludeFolders(true)
    .setParent('root');
  
  picker = new google.picker.PickerBuilder()
    .addView(view)
    .setOAuthToken(accessToken)
    .setDeveloperKey(apiKey)
    .setCallback(onPick)
    .build();
  console.log({picker});
};

console.log(gapi);

const isSignedIn = () => {
  return !!GoogleAuth &&
    GoogleAuth.isSignedIn.get() as boolean;
};
export type signedInChangeHandler = (isSignedIn: boolean) => void;

const subscribeToSignedInChange = (onChange: signedInChangeHandler) => {
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
      q: `'${parentId}' in parents`,
      fields: 'files(id, name, thumbnailLink, webContentLink)',
      pageSize: 1000,
      orderBy: 'name',
      pageToken
    });
    console.log({result});
    return result.result;
  }
  catch(err) {
    console.log(err);
  }
};

gapi.load('client:auth2:picker', onGapiLoaded);

export {
  isSignedIn,
  signIn,
  signOut,
  subscribeToSignedInChange,
  pickFile,
  getFile,
  listFiles
};
