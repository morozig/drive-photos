import {
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';
import {
  isSignedIn,
  listFiles,
  signIn,
  signOut,
  subscribeToSignedInChange
} from './api';

const useAbortSignal = () => {
  const abortControllerRef = useRef(new AbortController());

  useEffect(() => {
    const abortController = abortControllerRef.current;
    return () => {
      abortController.abort();
    };
  }, []);

  return abortControllerRef.current.signal;
};

const useIsSignedIn = () => {
  const [ signedIn, setSignedIn ] = useState(isSignedIn());
  
  useEffect(() => {
    return subscribeToSignedInChange(setSignedIn);
  }, []);

  const toggleSignedIn = useCallback(() => {
    console.log('toggleSignedIn');
    if (!signedIn) {
      signIn();
    } else {
      signOut();
    }
  }, [
    signedIn
  ]);

  return {
    isSignedIn: signedIn,
    toggleSignedIn
  };
};

const useFiles = (parentId?: string) => {
  const [ files, setFiles ] = useState<any[]>([]);
  const [ pageToken, setPageToken ] = useState<string | undefined>();
  const signal = useAbortSignal();
  const parentIdRef = useRef<string | undefined>(parentId);

  useEffect(() => {
    if (parentId !== parentIdRef.current) {
      setFiles([]);
      parentIdRef.current = parentId;
    }
  }, [
    parentId
  ]);

  useEffect(() => {
    const run = async () => {
      if (!parentId) {
        return;
      }
      try {
        const result = await listFiles({
          parentId,
          pageToken
        });
        if(!signal.aborted) {
          setFiles(prevFiles => prevFiles.concat(result.files))
          if (result.nextPageToken) {
            setPageToken(result.nextPageToken);
          }
        }
      }
      catch(err) {
        console.log(err);
      }
    };

    if (parentId) {
      run();
    }
  }, [
    pageToken,
    parentId,
    signal
  ]);
  
  return files;
};

export {
  useAbortSignal,
  useIsSignedIn,
  useFiles
};
