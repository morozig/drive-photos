import React, {
  useState,
  useRef,
  useCallback,
  useMemo
} from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Drawer,
  IconButton,
  Menu,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import { useDirectory, useFiles, useIsSignedIn } from './lib/hooks';
import {
  pickFile
} from './lib/api';
import Thumbnails from './components/thumbnails';
import Viewer from './components/viewer';
import FitBestIcon from '@material-ui/icons/CropDin';
import FitWidthIcon from '@material-ui/icons/CropPortrait';
import FitHeightIcon from '@material-ui/icons/CropLandscape';
import FitOriginalIcon from '@material-ui/icons/CropOriginal';
import { useEffect } from 'react';


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
  const [ isMenuOpen, setMenuOpen ] = useState(false);
  const menuRef = useRef<HTMLButtonElement>(null);
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
    isSignedIn,
    toggleSignedIn
  } = useIsSignedIn();
  const files = useFiles(parentId);
  const directory = useDirectory(parentId);


  const handleMenuClose = useCallback(() => {
    setMenuOpen(false);
  }, []);
  const handleMenuClick = useCallback(() => {
    setMenuOpen(current => !current);
  }, []);
  const onOpenClick = useCallback(async () => {
    setMenuOpen(false);
    const doc = await pickFile();
    if (doc) {
      setFileId(doc.id);
      setParentId(doc.parentId);
      setIsScrollToBottom(false);
    }
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
    const dirName = directory ? directory.name : '';
    const fileName = activeFile ? activeFile.name : '';
    const title = (dirName && fileName) ? 
      `${dirName}/${fileName}` : '';
    const documentTitle = title ?
      `${title} | ${defaultTitle}` : defaultTitle;
    setTitle(title || defaultTitle);
    document.title = documentTitle;
  }, [
    activeIndex,
    directory,
    files
  ]);

  const counterTitle = useMemo(() => {
    return (activeIndex >= 0 && files.length > 0) ?
      `${activeIndex + 1}/${files.length}` : '';
  }, [
    activeIndex,
    files
  ]);

  const onNext = useCallback(() => {
    const newIndex = activeIndex + 1;
    if (files[newIndex]) {
      setFileId(files[newIndex].id);
      setIsScrollToBottom(false);
    }
  }, [
    activeIndex,
    files
  ]);

  const onPrev = useCallback(() => {
    const newIndex = activeIndex - 1;
    if (files[newIndex]) {
      setFileId(files[newIndex].id);
      setIsScrollToBottom(true);
    }
  }, [
    activeIndex,
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

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position='fixed' sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            size='large'
            edge='start'
            color='inherit'
            aria-label='menu'
            sx={{ mr: 2 }}
            ref={menuRef}
            onClick={handleMenuClick}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            anchorEl={menuRef.current}
            open={isMenuOpen}
            onClose={handleMenuClose}
            MenuListProps={{
              'aria-labelledby': 'basic-button',
            }}
          >
            <MenuItem
              onClick={onOpenClick}
            >
              {'Open File'}
            </MenuItem>
            <MenuItem
              onClick={toggleSignedIn}
            >
              {isSignedIn ? 'Sign Out' : 'Sign In'}
            </MenuItem>
          </Menu>
          <Box
            sx={{
              flexGrow: 1,
              overflow: 'hidden'
            }}
          >
            <Typography
              variant='h6'
              noWrap
              sx={{
                textOverflow: 'ellipsis'
              }}
            >
              {title}
            </Typography>
          </Box>
          {!!counterTitle &&
            <Box
              sx={{
                m: 1
              }}
            >
              <Typography variant='body1' noWrap>
                {counterTitle}
              </Typography>
            </Box>
          }
          <ToggleButtonGroup
            value={fitMode}
            exclusive
            onChange={(e, value) => setFitMode(value)}
          >
            <ToggleButton
              value={FitMode.Best}
              aria-label='best fit'
            >
              <FitBestIcon />
            </ToggleButton>
            <ToggleButton
              value={FitMode.Width}
              aria-label='fit width'
            >
              <FitWidthIcon />
            </ToggleButton>
            <ToggleButton
              value={FitMode.Height}
              aria-label='fit height'
            >
              <FitHeightIcon />
            </ToggleButton>
            <ToggleButton
              value={FitMode.Original}
              aria-label='fit original'
            >
              <FitOriginalIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </Toolbar>
      </AppBar>
      <Drawer
        variant='permanent'
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Thumbnails
          files={files}
          fileId={fileId}
          onSelect={onSelect}
          onVisibleFiles={setVisibleThumbnails}
          sx={{
            height: '100%'
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
            onPrev={onPrev}
            onNext={onNext}
            isScrollToBottom={isScrollToBottom}
            sx={{
              flexGrow: 1
            }}
          />
        }
      </Box>
    </Box>
  );
}

export default App;
