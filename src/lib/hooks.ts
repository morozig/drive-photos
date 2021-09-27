import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import {
  DirectoryEdge,
  getEdgeFiles,
  getParent,
  getProfile,
  isSignedIn,
  listDirectories,
  listFiles,
  signIn,
  signOut,
  subscribeToGapiErrors,
  subscribeToSignedInChange,
  getGapiError,
  Profile,
  getFile
} from './api';
import Screenfull from './screenfull';
import { useTheme } from '@material-ui/core/styles';
import { useMediaQuery } from '@material-ui/core';

const recentLocalStorageKey = 'recent';
const recentLength = 10;

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

const useIsSignedIn = (onSignOut?: () => void) => {
  const [ signedIn, setSignedIn ] = useState(isSignedIn());
  const [ profile, setProfile ] = useState<Profile | null>(null);
  const [ gapiError, setGapiError ] = useState(getGapiError());
  const [ isCookiesError, setCookiesError ] = useState(false);
  
  useEffect(() => {
    return subscribeToSignedInChange(setSignedIn);
  }, []);

  useEffect(() => {
    return subscribeToGapiErrors(setGapiError);
  }, []);

  const toggleSignedIn = useCallback(() => {
    // console.log('toggleSignedIn');
    if (!signedIn) {
      signIn();
    } else {
      if (onSignOut) {
        onSignOut();
      }
      signOut();
    }
  }, [
    signedIn,
    onSignOut
  ]);

  useEffect(() => {
    if (signedIn) {
      const profile = getProfile();
      setProfile(profile);
    } else {
      setProfile(null);
    }
  }, [
    signedIn
  ]);

  useEffect(() => {
    if (gapiError && gapiError.details &&
      gapiError.details === 'Cookies are not enabled in current environment.'
    ) {
      setCookiesError(true);
    } else {
      setCookiesError(false);
    }
  }, [
    gapiError
  ]);

  return {
    isSignedIn: signedIn,
    toggleSignedIn,
    profile,
    isCookiesError
  };
};

const useFiles = (fileId: string, parentId: string) => {
  const [ file, setFile ] = useState<gapi.client.drive.File | undefined>();
  const [ files, setFiles ] = useState<gapi.client.drive.File[]>([]);
  const [ pageToken, setPageToken ] = useState<string | undefined>();
  const signal = useAbortSignal();
  const parentIdRef = useRef<string | undefined>(parentId);
  const isFinishedRef = useRef(false);

  useEffect(() => {
    const run = async () => {
      try {
        const file = await getFile(fileId);
        if(!signal.aborted && file) {
          setFile(file);
        }
      }
      catch(err) {
        console.log(err);
      }
    };

    if (parentId !== parentIdRef.current) {
      if (parentIdRef.current) {
        setFiles([]);
        setFile(undefined);
        setPageToken(undefined);
        isFinishedRef.current = false;
      }
      parentIdRef.current = parentId;
      if (fileId) {
        run();
      } else {
        setFile(undefined);
      }
    }
  }, [
    parentId,
    fileId,
    signal
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
        if(!signal.aborted && result) {
          setFiles(prevFiles => prevFiles.concat(result.files || []))
          isFinishedRef.current = !result.nextPageToken;
          setPageToken(result.nextPageToken);
        }
      }
      catch(err) {
        console.log(err);
      }
    };

    if (parentId && !isFinishedRef.current) {
      run();
    }
  }, [
    parentId,
    pageToken,
    signal
  ]);
  
  const readyFiles = useMemo(() => {
    if (file && file.id && !files.find(other => other.id === file.id)) {
      return [ file ];
    } else return files;
  }, [
    file,
    files
  ]);
  return readyFiles;
};

const useDirectory = (parentId?: string) => {
  const [
    directory,
    setDirectory
  ] = useState<gapi.client.drive.File | undefined>(undefined);
  const signal = useAbortSignal();
  const parentIdRef = useRef<string | undefined>(parentId);

  useEffect(() => {
    if (parentId !== parentIdRef.current) {
      if (parentIdRef.current) {
        setDirectory(undefined);
      }
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
        const directory = await getParent(parentId);
        if(!signal.aborted && directory) {
          setDirectory(directory);
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
    parentId,
    signal
  ]);
  
  return directory;
};

const useFullScreen = () => {
  const [ isFullscreen, setFullscreen ] = useState(Screenfull.isFullscreen);
  const [ isEnabled ] = useState(Screenfull.isEnabled);

  useEffect(() => {
    if (!Screenfull.isEnabled) {
      return;
    }
    const run = () => {
      const isFullscreen = Screenfull.isFullscreen;
      setFullscreen(isFullscreen);
    };
    run();
    Screenfull.on('change', run);
    return () => {
      Screenfull.off('change', run);
    };
  }, []);

  const toggleFullScreen = useCallback((div?: HTMLDivElement | null) => {
    const run = async () => {
      if (!Screenfull.isEnabled) {
        return;
      }

      try {
        Screenfull.toggle(div || undefined);
      }
      catch (err) {
        console.log(err);
      }
    };
    run();
  }, []);

  return {
    isEnabled,
    isFullscreen,
    toggleFullScreen
  };
};

interface UseEdgeFileOptions {
  parent: gapi.client.drive.File | undefined;
  edge: DirectoryEdge;
};

const useEdgeFile = (options: UseEdgeFileOptions) => {
  const {
    parent,
    edge
  } = options;
  const [ file, setFile ] = useState<gapi.client.drive.File | undefined>();
  const signal = useAbortSignal();

  useEffect(() => {
    const run = async () => {
      if (!parent || !parent.id) {
        return;
      }
      try {
        const edgeFiles = await getEdgeFiles({
          parentId: parent.id,
          edge
        });
        if(!signal.aborted){
          if (edgeFiles && edgeFiles.length && edgeFiles[0]) {
            setFile(edgeFiles[0]);
          } else {
            setFile(undefined);
          }
        }
      }
      catch(err) {
        console.log(err);
      }
    };

    if (parent && parent.id) {
      run();
    } else {
      setFile(undefined);
    }
  }, [
    parent,
    edge,
    signal
  ]);
  
  return file;
};

const useDirectories = (grandParentId?: string) => {
  const [
    directories,
    setDirectories
  ] = useState<gapi.client.drive.File[]>([]);
  const signal = useAbortSignal();

  useEffect(() => {
    const run = async () => {
      if (!grandParentId) {
        return;
      }
      try {
        const result = await listDirectories(grandParentId);
        if(!signal.aborted && result) {
          setDirectories(result.files || [])
        }
      }
      catch(err) {
        console.log(err);
      }
    };

    if (grandParentId) {
      run();
    }
  }, [
    grandParentId,
    signal
  ]);
  
  return directories;
};

const useDrive = (fileId: string, parentId: string) => {
  const files = useFiles(fileId, parentId);
  const parent = useDirectory(parentId);
  const directories = useDirectories(
    (parent && parent.parents) ?
      parent.parents[0] :
      ''
  );
  const directoryIndex = useMemo(() => {
    return directories.findIndex(sibling => sibling.id === parentId);
  }, [
    parentId,
    directories
  ]);
  const prevDirectory = useMemo(() => {
    return directories[directoryIndex - 1] ?
      directories[directoryIndex - 1] : undefined;
  }, [
    directories,
    directoryIndex
  ]);
  const nextDirectory = useMemo(() => {
    return directories[directoryIndex + 1] ?
      directories[directoryIndex + 1] : undefined;
  }, [
    directories,
    directoryIndex
  ]);
  const prevFile = useEdgeFile({
    parent: prevDirectory,
    edge: DirectoryEdge.End
  });
  const nextFile = useEdgeFile({
    parent: nextDirectory,
    edge: DirectoryEdge.Begin
  });

  return {
    files,
    parent,
    prevFile,
    prevDirectory,
    nextFile,
    nextDirectory
  }
};


export interface RecentFile {
  id: string;
  parentId: string;
  title: string;
};

const useRecentFiles = () => {
  const [ recentFiles, setRecentFiles ] = useState<RecentFile[]>([]);
  const recentJsonRef = useRef<string | null>(null);

  useEffect(() => {
    const recentJson = localStorage.getItem(recentLocalStorageKey);
    recentJsonRef.current = recentJson;

    if (recentJson) {
      setRecentFiles(JSON.parse(recentJson));
    }
  }, []);

  const replace = useCallback((file: RecentFile) => {
    setRecentFiles(
      current => [file].concat(current.slice(1))
    );
  }, []);
  const shift = useCallback((file: RecentFile) => {
    setRecentFiles(
      current => [file].concat(current.slice(0, recentLength - 1))
    );
  }, []);
  const remove = useCallback((file: RecentFile) => {
    setRecentFiles(
      current => current.filter(other => other.id !== file.id)
    );
  }, []);
  const clear = useCallback(() => {
    setRecentFiles([]);
  }, []);

  useEffect(() => {
    if (recentFiles.length > 0) {
      const recentJson = JSON.stringify(recentFiles);
  
      if (recentJson !== recentJsonRef.current) {
        localStorage.setItem(recentLocalStorageKey, recentJson);
        recentJsonRef.current = recentJson;
      }
    } else {
      if (localStorage.getItem(recentLocalStorageKey)) {
        localStorage.removeItem(recentLocalStorageKey);
        recentJsonRef.current = null
      }
    }
  }, [
    recentFiles
  ]);

  return {
    recentFiles,
    replace,
    shift,
    remove,
    clear
  };
};

const useIsSmallScreen = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  return isSmallScreen;
};

export {
  useAbortSignal,
  useIsSignedIn,
  useFiles,
  useDirectory,
  useFullScreen,
  useDrive,
  useRecentFiles,
  useIsSmallScreen,
};
