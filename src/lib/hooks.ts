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
  isSignedIn,
  listDirectories,
  listFiles,
  signIn,
  signOut,
  subscribeToSignedInChange
} from './api';
import Screenfull from './screenfull';

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
    directoryName,
    prevDirId,
    prevDirFileId,
    nextDirId,
    nextDirFileId
  }
};

export {
  useAbortSignal,
  useIsSignedIn,
  useFiles,
  useDirectory,
  useFullScreen,
  useDrive
};
