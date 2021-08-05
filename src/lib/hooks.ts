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
  subscribeToSignedInChange
} from './api';
import Screenfull from './screenfull';
import { useTheme } from '@material-ui/core/styles';
import { useMediaQuery } from '@material-ui/core';

const localStorageKey = 'recent';
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

const useIsSignedIn = (onSignOut: () => void) => {
  const [ signedIn, setSignedIn ] = useState(isSignedIn());
  const [ profile, setProfile ] = useState<any | null>(null);
  const [ gapiError, setGapiError ] = useState<any | null>(null);
  const [ isCookiesError, setCookiesError ] = useState(false);
  
  useEffect(() => {
    return subscribeToSignedInChange(setSignedIn);
  }, []);

  useEffect(() => {
    return subscribeToGapiErrors(setGapiError);
  }, []);

  const toggleSignedIn = useCallback(() => {
    console.log('toggleSignedIn');
    if (!signedIn) {
      signIn();
    } else {
      onSignOut();
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

const useDirectory = (parentId?: string) => {
  const [ directory, setDirectory ] = useState<any | null>(null);
  const signal = useAbortSignal();

  useEffect(() => {
    const run = async () => {
      if (!parentId) {
        return;
      }
      try {
        const directory = await getParent(parentId);
        if(!signal.aborted) {
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

interface UseEdgeFileIdOptions {
  parentId?: string;
  edge: DirectoryEdge;
};

const useEdgeFileId = (options: UseEdgeFileIdOptions) => {
  const {
    parentId,
    edge
  } = options;
  const [ edgeFileId, setEdgeFileId ] = useState('');
  const signal = useAbortSignal();

  useEffect(() => {
    const run = async () => {
      if (!parentId) {
        return;
      }
      try {
        const edgeFiles = await getEdgeFiles({
          parentId,
          edge
        });
        if(!signal.aborted){
          if (edgeFiles.length) {
            setEdgeFileId(edgeFiles[0].id);
          } else {
            setEdgeFileId('');
          }
        }
      }
      catch(err) {
        console.log(err);
      }
    };

    if (parentId) {
      run();
    } else {
      setEdgeFileId('');
    }
  }, [
    parentId,
    edge,
    signal
  ]);
  
  return edgeFileId;
};

const useDirectories = (grandParentId?: string) => {
  const [ directories, setDirectories ] = useState<any[]>([]);
  const signal = useAbortSignal();

  useEffect(() => {
    const run = async () => {
      if (!grandParentId) {
        return;
      }
      try {
        const result = await listDirectories(grandParentId);
        if(!signal.aborted) {
          setDirectories(result.files)
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

const useDrive = (parentId?: string) => {
  const [ prevDirId, setPrevDirId ] = useState('');
  const [ nextDirId, setNextDirId ] = useState('');
  
  const prevDirFileId = useEdgeFileId({
    parentId: prevDirId,
    edge: DirectoryEdge.End
  });
  const files = useFiles(parentId);
  const nextDirFileId = useEdgeFileId({
    parentId: nextDirId,
    edge: DirectoryEdge.Begin
  });
  const directory = useDirectory(parentId);
  const directories = useDirectories(
    directory ?
      directory.parents[0] :
      ''
  );
  const directoryIndex = useMemo(() => {
    return directories.findIndex(sibling => sibling.id === parentId);
  }, [
    parentId,
    directories
  ]);
  const directoryId = useMemo(() => {
    return directory ? (directory.id as string || '') : '';
  }, [
    directory
  ]);
  const directoryName = useMemo(() => {
    return directory ? (directory.name as string || '') : '';
  }, [
    directory
  ]);

  useEffect(() => {
    if (directoryIndex >= 0) {
      const prev = directories[directoryIndex - 1];
      setPrevDirId(prev ? prev.id : '');
      const next = directories[directoryIndex + 1];
      setNextDirId(next ? next.id : '');
    }
  }, [
    directories,
    directoryIndex
  ]);

  return {
    files,
    directoryId,
    directoryName,
    prevDirId,
    prevDirFileId,
    nextDirId,
    nextDirFileId
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
    const recentJson = localStorage.getItem(localStorageKey);
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
  const clear = useCallback(() => {
    setRecentFiles([]);
  }, []);

  useEffect(() => {
    if (recentFiles.length > 0) {
      const recentJson = JSON.stringify(recentFiles);
  
      if (recentJson !== recentJsonRef.current) {
        localStorage.setItem(localStorageKey, recentJson);
        recentJsonRef.current = recentJson;
      }
    } else {
      if (localStorage.getItem(localStorageKey)) {
        localStorage.removeItem(localStorageKey);
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
  useIsSmallScreen
};
