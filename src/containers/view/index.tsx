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
  SwipeableDrawer
} from '@material-ui/core';
import { useDrive, useIsSmallScreen, useRecentFiles } from '../../lib/hooks';
import Thumbnails from './components/thumbnails';
import Viewer, { ViewerRef } from './components/viewer';
import Topbar from './components/topbar';


const drawerWidth = 260;
const preloadCount = 3;
export const defaultTitle = 'Drive Photos';

export enum FitMode {
  Best = 1,
  Width,
  Height,
  Original
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
    files,
    directoryId,
    directoryName,
    prevDirId,
    prevDirFileId,
    nextDirId,
    nextDirFileId
  } = useDrive(parentId);

  const {
    recentFiles,
    replace,
    shift,
    clear
  } = useRecentFiles();
  const fileJustOpenedRef = useRef(false);

  const onOpenFile = useCallback((file: any) => {
    setFileId(file.id);
    setParentId(file.parentId);
    setIsScrollToBottom(false);
    fileJustOpenedRef.current = true;
  }, []);

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
    const title = (directoryName && fileName) ? 
      `${directoryName}/${fileName}` : '';
    const documentTitle = title ?
      `${title} | ${defaultTitle}` : defaultTitle;
    setTitle(title || defaultTitle);
    document.title = documentTitle;
    if (activeFile && directoryId && title) {
      const recentFile = {
        id: activeFile.id,
        parentId: directoryId,
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
    directoryId,
    directoryName,
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
      !!prevDirFileId
    )
  }, [
    activeIndex,
    files.length,
    prevDirFileId
  ]);
  const isNextImageEnabled = useMemo(() => {
    if (activeIndex < 0 || files.length < 0) {
      return false;
    }
    return (
      activeIndex < files.length - 1 ||
      !!nextDirFileId
    )
  }, [
    activeIndex,
    files.length,
    nextDirFileId
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
    if (files[newIndex]) {
      setFileId(files[newIndex].id);
      setIsScrollToBottom(false);
    }
  }, [
    files
  ]);
  const onPrevImage = useCallback(() => {
    const newIndex = activeIndex - 1;
    if (files[newIndex]) {
      setFileId(files[newIndex].id);
      setIsScrollToBottom(true);
    } else {
      if (prevDirId && prevDirFileId) {
        setFileId(prevDirFileId);
        setParentId(prevDirId);
        setIsScrollToBottom(true);
      }
    }
  }, [
    activeIndex,
    files,
    prevDirId,
    prevDirFileId
  ]);
  const onNextImage = useCallback(() => {
    const newIndex = activeIndex + 1;
    if (files[newIndex]) {
      setFileId(files[newIndex].id);
      setIsScrollToBottom(false);
    } else {
      if (nextDirId && nextDirFileId) {
        setFileId(nextDirFileId);
        setParentId(nextDirId);
        setIsScrollToBottom(false);
      }
    }
  }, [
    activeIndex,
    files,
    nextDirId,
    nextDirFileId
  ]);
  const onLastImage = useCallback(() => {
    const newIndex = files.length - 1;
    if (files[newIndex]) {
      setFileId(files[newIndex].id);
      setIsScrollToBottom(false);
    }
  }, [
    files
  ]);

  const onSelect = useCallback((fileId: string) => {
    setFileId(fileId);
    setIsScrollToBottom(false);
  }, []);
  useEffect(() => {
    if (!isSlideshowEnabled && isSlideshowPlaying) {
      setSlideshowPlaying(false);
    }
  }, [
    isSlideshowEnabled,
    isSlideshowPlaying
  ]);
  const onToggleSlideshowPlaying = useCallback(() => {
    setSlideshowPlaying(current => !current);
  }, []);
  const onDownloadFile = useCallback(() => {
    const activeFile = files[activeIndex];
    if (activeFile) {
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
  }, []);
  const onSignOut = useCallback(() => {
    onCloseFile();
    clear();
    localStorage.clear();
  }, [
    onCloseFile,
    clear
  ]);

  const viewFiles = useMemo(() => {
    if (activeIndex < 0 || files.length <= 0) {
      return [];
    }
    const activeFile = files[activeIndex];
    const preloadFiles = new Set<any>();
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
    return [activeFile].concat(Array.from(preloadFiles));
  }, [
    activeIndex,
    files,
    visibleThumbnails
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
        {files.length > 0 &&
          <Viewer
            fitMode={fitMode}
            files={viewFiles}
            onPrevImage={onPrevImage}
            onNextImage={onNextImage}
            onFitModeChange={setFitMode}
            isScrollToBottom={isScrollToBottom}
            isSlideshowEnabled={isSlideshowEnabled}
            isSlideshowPlaying={isSlideshowPlaying}
            onToggleSlideshowPlaying={onToggleSlideshowPlaying}
            sx={{
              flexGrow: 1
            }}
            ref={viewerRef}
          />
        }
      </Box>
    </Box>
  );
}

export default View;
