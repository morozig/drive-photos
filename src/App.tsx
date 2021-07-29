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
  Drawer
} from '@material-ui/core';
import { useDrive } from './lib/hooks';
import Thumbnails from './components/thumbnails';
import Viewer, { ViewerRef } from './components/viewer';
import Topbar from './components/topbar';


const drawerWidth = 260;
const preloadCount = 3;
const defaultTitle = 'Drive Photos';

export enum FitMode {
  Best = 1,
  Width,
  Height,
  Original
}

const App: React.FC = () => {
  const [ fitMode, setFitMode ] = useState<FitMode>(FitMode.Best);
  const [ parentId, setParentId ] = useState('');
  const [ fileId, setFileId ] = useState('');
  const [ isScrollToBottom, setIsScrollToBottom ] = useState(false);
  const [ title, setTitle ] = useState(defaultTitle);
  const [
    visibleThumbnails,
    setVisibleThumbnails
  ] = useState<number[]>([]);

  const {
    files,
    directoryName,
    prevDirId,
    prevDirFileId,
    nextDirId,
    nextDirFileId
  } = useDrive(parentId);

  const onOpenFile = useCallback((file: any) => {
    setFileId(file.id);
    setParentId(file.parentId);
    setIsScrollToBottom(false);
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
  }, [
    activeIndex,
    directoryName,
    files
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
          onFirstImage={onFirstImage}
          onPrevImage={onPrevImage}
          onNextImage={onNextImage}
          onLastImage={onLastImage}
        />
      </AppBar>
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

export default App;
