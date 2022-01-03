import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect
} from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  Drawer,
  SwipeableDrawer,
} from '@material-ui/core';
import {
  RecentFile,
  useDrive,
  useIsSmallScreen,
  useRecentFiles,
} from '../../lib/hooks';
import Thumbnails from './components/thumbnails';
import Viewer, { ViewerRef } from './components/viewer';
import Topbar from './components/topbar';
import StartScreen from './components/start-screen';

const drawerWidth = 260;
const preloadCount = 3;
export const defaultTitle = 'Drive Photos';

export interface FileEntry {
  id: string;
  parentId: string;
};

export enum FitMode {
  Best = 1,
  Width,
  Height,
  Original,
  Manual
}

const View: React.FC = () => {
  const [ fitMode, setFitMode ] = useState<FitMode>(FitMode.Best);
  const [ parentId, setParentId ] = useState('');
  const [ fileId, setFileId ] = useState('');
  const [ isScrollToBottom, setIsScrollToBottom ] = useState(false);
  const [ title, setTitle ] = useState(defaultTitle);
  const [ isSlideshowPlaying, setSlideshowPlaying ] = useState(false);
  const [
    visibleThumbnails,
    setVisibleThumbnails
  ] = useState<number[]>([]);
  const [ isMobileDrawerOpen, setMobileDrawerOpen ] = useState(false);

  const toggleMobileDrawer = useCallback(() => {
    setMobileDrawerOpen(current => !current);
  }, []);
  const isSmallScreen = useIsSmallScreen();

  const {
    isFinished,
    files,
    parent,
    prevDirFile,
    prevDirectory,
    nextDirFile,
    nextDirectory,
    onImageError,
  } = useDrive(fileId, parentId);

  const {
    recentFiles,
    replace,
    shift,
    remove,
    clear
  } = useRecentFiles();
  const fileJustOpenedRef = useRef(false);

  const onOpenFile = useCallback((file: FileEntry) => {
    setFileId(file.id);
    setParentId(file.parentId);
    setIsScrollToBottom(false);
    fileJustOpenedRef.current = true;
  }, []);
  const onRecentFile = useCallback((file: RecentFile) => {
    setFileId(file.id);
    setParentId(file.parentId);
    setIsScrollToBottom(false);
    remove(file);
    fileJustOpenedRef.current = true;
  }, [
    remove
  ]);

  const activeIndex = useMemo(() => {
    if (fileId && files.length > 0) {
      return files.findIndex(file => file.id === fileId);
    } else {
      return -1;
    }
  }, [
    fileId,
    files
  ]);

  useEffect(() => {
    const activeFile = files[activeIndex];
    const fileName = activeFile ? activeFile.name : '';
    if (parent && parent.name && fileName) {
      const title = `${parent.name}/${fileName}`;
      const documentTitle = `${title} | ${defaultTitle}`;
      setTitle(title);
      document.title = documentTitle;
      const recentFile = {
        id: activeFile.id || '',
        parentId: parent.id || '',
        title
      };
      if (fileJustOpenedRef.current) {
        shift(recentFile);
        fileJustOpenedRef.current = false;
      } else {
        replace(recentFile);
      }
    }
  }, [
    activeIndex,
    parent,
    files,
    replace,
    shift
  ]);

  const counterTitle = useMemo(() => {
    return (activeIndex >= 0 && files.length > 0) ?
      `${activeIndex + 1}/${files.length}` : '';
  }, [
    activeIndex,
    files
  ]);

  const isFirstImageEnabled = useMemo(() => {
    if (activeIndex < 0 || files.length < 0) {
      return false;
    }
    return (activeIndex > 0);
  }, [
    activeIndex,
    files.length
  ]);
  const isPrevImageEnabled = useMemo(() => {
    if (activeIndex < 0 || files.length < 0) {
      return false;
    }
    return (
      activeIndex > 0 ||
      (isFinished && !!prevDirFile)
    )
  }, [
    isFinished,
    activeIndex,
    files.length,
    prevDirFile
  ]);
  const isNextImageEnabled = useMemo(() => {
    if (activeIndex < 0 || files.length < 0) {
      return false;
    }
    return (
      activeIndex < files.length - 1 ||
      (isFinished && !!nextDirFile)
    )
  }, [
    isFinished,
    activeIndex,
    files.length,
    nextDirFile
  ]);
  const isLastImageEnabled = useMemo(() => {
    if (activeIndex < 0 || files.length < 0) {
      return false;
    }
    return (activeIndex < files.length - 1);
  }, [
    activeIndex,
    files.length
  ]);
  const isSlideshowEnabled = useMemo(() => {
    return isNextImageEnabled;
  }, [
    isNextImageEnabled
  ]);

  const onFirstImage = useCallback(() => {
    const newIndex = 0;
    if (files[newIndex] && files[newIndex].id) {
      setFileId(files[newIndex].id || '');
      setIsScrollToBottom(false);
    }
  }, [
    files
  ]);
  const onPrevImage = useCallback(() => {
    const newIndex = activeIndex - 1;
    if (files[newIndex] && files[newIndex].id) {
      setFileId(files[newIndex].id || '');
      setIsScrollToBottom(true);
    } else {
      if (isFinished && prevDirectory && prevDirFile) {
        setFileId(prevDirFile.id || '');
        setParentId(prevDirectory.id || '');
        setIsScrollToBottom(true);
        if (prevDirectory.name && prevDirFile.name) {
          const title = `${prevDirectory.name}/${prevDirFile.name}`;
          setTitle(title);
          const documentTitle = `${title} | ${defaultTitle}`;
          document.title = documentTitle;
        }
      }
    }
  }, [
    isFinished,
    activeIndex,
    files,
    prevDirectory,
    prevDirFile
  ]);
  const onNextImage = useCallback(() => {
    const newIndex = activeIndex + 1;
    if (files[newIndex] && files[newIndex].id) {
      setFileId(files[newIndex].id || '');
      setIsScrollToBottom(false);
    } else {
      if (isFinished && nextDirectory && nextDirFile) {
        setFileId(nextDirFile.id || '');
        setParentId(nextDirectory.id || '');
        setIsScrollToBottom(false);
        if (nextDirectory.name && nextDirFile.name) {
          const title = `${nextDirectory.name}/${nextDirFile.name}`;
          setTitle(title);
          const documentTitle = `${title} | ${defaultTitle}`;
          document.title = documentTitle;
        }
      }
    }
  }, [
    isFinished,
    activeIndex,
    files,
    nextDirectory,
    nextDirFile
  ]);
  const onLastImage = useCallback(() => {
    const newIndex = files.length - 1;
    if (files[newIndex] && files[newIndex].id) {
      setFileId(files[newIndex].id || '');
      setIsScrollToBottom(false);
    }
  }, [
    files
  ]);

  const onSelect = useCallback((fileId: string) => {
    setFileId(fileId);
    setIsScrollToBottom(false);
  }, []);

  const wasSlideshowPlayingRef = useRef(false);
  useEffect(() => {
    if (!isSlideshowEnabled && isSlideshowPlaying) {
      wasSlideshowPlayingRef.current = true;
      setSlideshowPlaying(false);
    }
  }, [
    isSlideshowEnabled,
    isSlideshowPlaying,
  ]);
  useEffect(() => {
    if (isSlideshowEnabled && !isSlideshowPlaying &&
      wasSlideshowPlayingRef.current === true
    ) {
      wasSlideshowPlayingRef.current = false;
      setSlideshowPlaying(true);
    }
  }, [
    isSlideshowEnabled,
    isSlideshowPlaying,
  ]);

  const onToggleSlideshowPlaying = useCallback(() => {
    setSlideshowPlaying(current => !current);
  }, []);
  const onDownloadFile = useCallback(() => {
    const activeFile = files[activeIndex];
    if (activeFile && activeFile.name && activeFile.webContentLink) {
      const name = activeFile.name;
      const url = activeFile.webContentLink;
      const a = document.createElement('a');
      a.download = name;
      a.href = url;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }, [
    activeIndex,
    files
  ]);
  const onCloseFile = useCallback(() => {
    setFileId('');
    setParentId('');
    setIsScrollToBottom(false);
    setTitle(defaultTitle);
    document.title = defaultTitle;
  }, []);
  const onSignOut = useCallback(() => {
    onCloseFile();
    clear();
    localStorage.clear();
  }, [
    onCloseFile,
    clear
  ]);

  const {
    activeFile,
    canPrev,
    prevFile,
    canNext,
    nextFile,
    preloadFiles
  } = useMemo(() => {
    if (activeIndex < 0 || files.length <= 0) {
      return {
        activeFile: undefined,
        canPrev: false,
        prevFile: undefined,
        canNext: false,
        nextFile: undefined,
        preloadFiles: [] as gapi.client.drive.File[]
      }
    }
    const activeFile = files[activeIndex];
    const prevFile = files[activeIndex - 1];
    const nextFile = files[activeIndex + 1];
    const preloadFiles = new Set<gapi.client.drive.File>();
    for (let i = 1; i <= preloadCount; i++) {
      const file = files[activeIndex + i];
      if (file) {
        preloadFiles.add(file);
      }
    }
    for (let i = 1; i <= preloadCount; i++) {
      const file = files[activeIndex - i];
      if (file) {
        preloadFiles.add(file);
      }
    }
    for (let i = 0; i < preloadCount; i++) {
      const file = files[i];
      if (file) {
        preloadFiles.add(file);
      }
    }
    for (let i = files.length - 1; i >= files.length - preloadCount; i--) {
      const file = files[i];
      if (file) {
        preloadFiles.add(file);
      }
    }
    for (let i of visibleThumbnails) {
      const file = files[i];
      if (file) {
        preloadFiles.add(file);
      }
    }
    preloadFiles.delete(activeFile);
    preloadFiles.delete(prevFile);
    preloadFiles.delete(nextFile);

    return {
      activeFile,
      canPrev: !!prevFile || !!prevDirFile,
      prevFile,
      canNext: !!nextFile || !!nextDirFile,
      nextFile,
      preloadFiles: Array.from(preloadFiles)
    };
  }, [
    activeIndex,
    files,
    visibleThumbnails,
    prevDirFile,
    nextDirFile
  ]);

  const viewerRef = useRef<ViewerRef>(null);
  const onToggleFullscreen = useCallback(() => {
    if (viewerRef.current) {
      viewerRef.current.toggleFullscreen();
    }
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Home': {
          onFirstImage();
          break;
        }
        case 'ArrowLeft': {
          onPrevImage();
          break;
        }
        case 'ArrowRight': {
          onNextImage();
          break;
        }
        case 'End': {
          onLastImage();
          break;
        }
        case ' ': {
          onToggleSlideshowPlaying();
          break;
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [
    onFirstImage,
    onPrevImage,
    onNextImage,
    onLastImage,
    onToggleSlideshowPlaying
  ]);

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position='fixed' sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Topbar
          title={title}
          counterTitle={counterTitle}
          fitMode={fitMode}
          onFitModeChange={setFitMode}
          onOpenFile={onOpenFile}
          onRecentFile={onRecentFile}
          fullscreenButtonActive={files.length > 0}
          onToggleFullscreen={onToggleFullscreen}
          isFirstImageEnabled={isFirstImageEnabled}
          isPrevImageEnabled={isPrevImageEnabled}
          isNextImageEnabled={isNextImageEnabled}
          isLastImageEnabled={isLastImageEnabled}
          isSlideshowEnabled={isSlideshowEnabled}
          isSlideshowPlaying={isSlideshowPlaying}
          onToggleSlideshowPlaying={onToggleSlideshowPlaying}
          onFirstImage={onFirstImage}
          onPrevImage={onPrevImage}
          onNextImage={onNextImage}
          onLastImage={onLastImage}
          recentFiles={recentFiles}
          onDownloadFile={onDownloadFile}
          onCloseFile={onCloseFile}
          onSignOut={onSignOut}
          isMobileDrawerOpen={isMobileDrawerOpen}
          toggleMobileDrawer={toggleMobileDrawer}
        />
      </AppBar>
      {isSmallScreen ?
        <SwipeableDrawer
          anchor='left'
          open={isMobileDrawerOpen}
          onOpen={toggleMobileDrawer}
          onClose={toggleMobileDrawer}
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: 'border-box'
            },
            display: 'flex',
            flexDirection: 'column'
          }}
          ModalProps={{
            keepMounted: true,
          }}
        >
          <Toolbar />
          <Thumbnails
            files={files}
            fileId={fileId}
            onSelect={onSelect}
            onVisibleFiles={setVisibleThumbnails}
            onImageError={onImageError}
            sx={{
              flexGrow: 1
            }}
          />
        </SwipeableDrawer> :
        <Drawer
          variant='permanent'
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: 'border-box'
            },
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Toolbar />
          <Thumbnails
            files={files}
            fileId={fileId}
            onSelect={onSelect}
            onVisibleFiles={setVisibleThumbnails}
            onImageError={onImageError}
            sx={{
              flexGrow: 1
            }}
          />
        </Drawer>
      }
      <Box component='main' sx={{
        flexGrow: 1,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Toolbar />
        {fileId ?
          <Viewer
            fitMode={fitMode}
            fileId={fileId}
            file={activeFile}
            canPrev={canPrev}
            prevFile={prevFile}
            canNext={canNext}
            nextFile={nextFile}
            preloadFiles={preloadFiles}
            onPrevImage={onPrevImage}
            onNextImage={onNextImage}
            onFitModeChange={setFitMode}
            isScrollToBottom={isScrollToBottom}
            isSlideshowEnabled={isSlideshowEnabled}
            isSlideshowPlaying={isSlideshowPlaying}
            onToggleSlideshowPlaying={onToggleSlideshowPlaying}
            onImageError={onImageError}
            sx={{
              flexGrow: 1
            }}
            ref={viewerRef}
          /> :
          <StartScreen
            onOpenFile={onOpenFile}
            sx={{
              flexGrow: 1
            }}
          />
        }
      </Box>
    </Box>
  );
}

export default View;
