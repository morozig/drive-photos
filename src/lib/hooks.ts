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
  const [ isFinished, setFinished ] = useState(false);
  const [ isCleared, setCleared ] = useState(false);

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

    if (parentId !== parentIdRef.current || isCleared) {
      setCleared(false);
      if (parentIdRef.current) {
        setFiles([]);
        setFile(undefined);
        setPageToken(undefined);
        setFinished(false);
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
    isCleared,
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
          setFiles(prevFiles => prevFiles.concat(result.files || []));
          setFinished(!result.nextPageToken);
          setPageToken(result.nextPageToken);
        }
      }
      catch(err) {
        console.log(err);
      }
    };

    if (parentId && !isFinished) {
      run();
    }
  }, [
    parentId,
    pageToken,
    signal,
    isFinished
  ]);
  
  const clear = useCallback(() => {
    setCleared(true);
  }, []);

  const readyFiles = useMemo(() => {
    if (file && file.id && !files.find(other => other.id === file.id)) {
      return [ file ];
    } else return files;
  }, [
    file,
    files
  ]);
  return {
    files: readyFiles,
    isFinished,
    clear
  };
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

const useGrandParentId = (parent?: gapi.client.drive.File) => {
  const [ grandParentId, setGrandParentId ] = useState<string | undefined>();

  useEffect(() => {
    setGrandParentId((parent && parent.parents) ?
      parent.parents[0] : undefined
    );
  }, [
    parent,
  ]);
  
  return grandParentId;
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
  const parentIdRef = useRef<string | undefined>(parent?.id);

  useEffect(() => {
    if (parent?.id !== parentIdRef.current) {
      if (parentIdRef.current) {
        setFile(undefined);
      }
      parentIdRef.current = parent?.id;
    }
  }, [
    parent
  ]);

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
  const [ pageToken, setPageToken ] = useState<string | undefined>();
  const cacheIdRef = useRef<string | undefined>(grandParentId);
  const cacheDirectoriesRef = useRef<gapi.client.drive.File[]>([]);
  const [ isFinished, setFinished ] = useState(false);
  const signal = useAbortSignal();

  useEffect(() => {
    if (!grandParentId) {
      setDirectories([]);
      setPageToken(undefined);
      setFinished(false);
    } else if (grandParentId === cacheIdRef.current) {
      setDirectories(cacheDirectoriesRef.current);
      setPageToken(undefined);
      setFinished(true);
    }
  }, [
    grandParentId,
    signal
  ]);

  useEffect(() => {
    const run = async () => {
      if (!grandParentId) {
        return;
      }
      try {
        const result = await listDirectories({
          grandParentId,
          pageToken,
        });
        if(!signal.aborted && result) {
          setDirectories(prevDirectories => 
            prevDirectories.concat(result.files || [])
          );
          setFinished(!result.nextPageToken);
          setPageToken(result.nextPageToken);
        }
      }
      catch(err) {
        console.log(err);
      }
    };

    if (grandParentId && !isFinished &&
      grandParentId !== cacheIdRef.current
    ) {
      run();
    }
  }, [
    grandParentId,
    isFinished,
    pageToken,
    signal,
  ]);

  useEffect(() => {
    if (isFinished && grandParentId) {
      cacheDirectoriesRef.current = directories.slice();
      cacheIdRef.current = grandParentId;
    }
  }, [
    grandParentId,
    directories,
    isFinished,
  ]);
  
  return directories;
};

const clearCooldown = 5 * 60 * 1000;

const useDrive = (fileId: string, parentId: string) => {
  const {
    files,
    isFinished,
    clear
   } = useFiles(fileId, parentId);
  const parent = useDirectory(parentId);
  const grandParentId = useGrandParentId(parent);

  const directories = useDirectories(grandParentId);
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
  const prevDirFile = useEdgeFile({
    parent: prevDirectory,
    edge: DirectoryEdge.End
  });
  const nextDirFile = useEdgeFile({
    parent: nextDirectory,
    edge: DirectoryEdge.Begin
  });

  const lastClearedTimeRef = useRef(0);

  const onImageError = useCallback(() => {
    const now = new Date().getTime();
    if (now - lastClearedTimeRef.current > clearCooldown) {
      lastClearedTimeRef.current = now;
      clear();
    }
  }, [
    clear
  ]);

  return {
    isFinished,
    files,
    parent,
    prevDirFile,
    prevDirectory,
    nextDirFile,
    nextDirectory,
    onImageError
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

const useIsTouchScreen = () => {
  const isTouchScreen = useMediaQuery('(pointer:coarse)');
  return isTouchScreen;
};

let calculatedWidth: number | undefined;
const useBrowserScrollbarWidth = () => {
  const [ width, setWidth ] = useState(calculatedWidth || 0);

  useEffect(() => {
    if (calculatedWidth !== undefined) {
      return;
    }
    const outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.overflow = 'scroll';
    document.body.appendChild(outer);

    const inner = document.createElement('div');
    outer.appendChild(inner);

    const scrollbarWidth = (outer.offsetWidth - inner.offsetWidth);
    outer.parentNode?.removeChild(outer);
    setWidth(scrollbarWidth);
  }, []);

  return width;
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
  useIsTouchScreen,
  useBrowserScrollbarWidth,
};
