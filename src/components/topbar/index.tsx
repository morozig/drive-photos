import React, {
  useState,
  useRef,
  useCallback,
} from 'react';
import {
  Box,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  ToggleButtonGroup,
  Tooltip,
  ToggleButton,
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import FitBestIcon from '@material-ui/icons/CropDin';
import FitWidthIcon from '@material-ui/icons/CropPortrait';
import FitHeightIcon from '@material-ui/icons/CropLandscape';
import FitOriginalIcon from '@material-ui/icons/CropOriginal';
import FullscreenEnterIcon from '@material-ui/icons/Fullscreen';
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';
import FirstImageIcon from '@material-ui/icons/FirstPage';
import LastImageIcon from '@material-ui/icons/LastPage';
import PrevImageIcon from '@material-ui/icons/NavigateBefore';
import NextImageIcon from '@material-ui/icons/NavigateNext';
import StartSlideshowIcon from '@material-ui/icons/PlayArrow';
import EndSlideshowIcon from '@material-ui/icons/Pause';
import { FitMode } from '../../App';
import { RecentFile, useFullScreen, useIsSignedIn } from '../../lib/hooks';
import {
  pickFile
} from '../../lib/api';
import TitleTooltip from './TitleTooltip';

interface TopbarProps {
  title: string;
  counterTitle: string;
  fitMode: FitMode;
  onFitModeChange: (fitMode: FitMode) => void;
  onOpenFile: (file: any) => void;
  fullscreenButtonActive?: boolean;
  onToggleFullscreen: () => void;
  isFirstImageEnabled?: boolean;
  isPrevImageEnabled?: boolean;
  isNextImageEnabled?: boolean;
  isLastImageEnabled?: boolean;
  isSlideshowEnabled?: boolean;
  isSlideshowPlaying?: boolean;
  onToggleSlideshowPlaying: () => void;
  onFirstImage: () => void;
  onPrevImage: () => void;
  onNextImage: () => void;
  onLastImage: () => void;
  recentFiles: RecentFile[];
  onSignOut: () => void;
  onCloseFile: () => void;
};

const Topbar: React.FC<TopbarProps> = (props) => {
  const {
    title,
    counterTitle,
    fitMode,
    onFitModeChange,
    onOpenFile,
    fullscreenButtonActive,
    onToggleFullscreen,
    isFirstImageEnabled,
    isPrevImageEnabled,
    isNextImageEnabled,
    isLastImageEnabled,
    isSlideshowEnabled,
    isSlideshowPlaying,
    onToggleSlideshowPlaying,
    onFirstImage,
    onPrevImage,
    onNextImage,
    onLastImage,
    recentFiles,
    onSignOut,
    onCloseFile
  } = props;
  const [ isMenuOpen, setMenuOpen ] = useState(false);
  const menuRef = useRef<HTMLButtonElement>(null);
  const [ isRecentMenuOpen, setRecentMenuOpen ] = useState(false);
  const recentMenuRef = useRef<HTMLLIElement>(null);
  const {
    isEnabled: isFullscreenEnabled,
    isFullscreen
  } = useFullScreen();

  const {
    isSignedIn,
    toggleSignedIn
  } = useIsSignedIn(onSignOut);

  const handleMenuClose = useCallback(() => {
    setMenuOpen(false);
  }, []);
  const handleMenuClick = useCallback(() => {
    setMenuOpen(current => !current);
  }, []);
  const onOpenClick = useCallback(async () => {
    handleMenuClose();
    const doc = await pickFile();
    if (doc) {
      onOpenFile(doc);
    }
  }, [
    handleMenuClose,
    onOpenFile
  ]);

  const handleRecentMenuClose = useCallback(() => {
    setRecentMenuOpen(false);
  }, []);
  const handleRecentMenuClick = useCallback(() => {
    setRecentMenuOpen(current => !current);
  }, []);
  const onRecentFileClick = useCallback((recentFile: RecentFile) => {
    handleRecentMenuClose();
    handleMenuClose();
    onOpenFile(recentFile);
  }, [
    handleRecentMenuClose,
    handleMenuClose,
    onOpenFile
  ]);

  return (
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
          onClick={handleRecentMenuClick}
          disabled={recentFiles.length === 0}
          ref={recentMenuRef}
        >
          {'Recent Files'}
        </MenuItem>
        {fullscreenButtonActive ?
          <MenuItem
            onClick={onCloseFile}
          >
            {'Close File'}
          </MenuItem> :
          null
        }
        <MenuItem
          onClick={toggleSignedIn}
        >
          {isSignedIn ? 'Sign Out' : 'Sign In'}
        </MenuItem>
      </Menu>
      <Menu
        anchorEl={recentMenuRef.current}
        open={isRecentMenuOpen}
        onClose={handleRecentMenuClose}
        PaperProps={{
          sx: {
            maxWidth: '400px'
          }
        }}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
      >
        {recentFiles.map((recentFile, i) => (
          <MenuItem
            key={i}
            onClick={() => onRecentFileClick(recentFile)}
          >
            <Typography
              noWrap
            >
              {recentFile.title}
            </Typography>
          </MenuItem>
        ))}
      </Menu>
      <TitleTooltip
        text={title}
        sx={{
          flexGrow: 1
        }}
      />
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
      <Tooltip
        title='First Image (Home)'
      >
        <span>
          <IconButton
            size='large'
            color='inherit'
            aria-label='first-image'
            disabled={!isFirstImageEnabled}
            onClick={onFirstImage}
          >
            <FirstImageIcon/>
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip
        title='Previous Image (Left Arrow)'
      >
        <span>
          <IconButton
            size='large'
            color='inherit'
            aria-label='prev-image'
            disabled={!isPrevImageEnabled}
            onClick={onPrevImage}
          >
            <PrevImageIcon/>
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip
        title={isSlideshowPlaying ?
          'End Slideshow (Space)' :
          'Start Slideshow (Space)'
        }
      >
        <span>
          <IconButton
            size='large'
            color='inherit'
            aria-label='next-image'
            disabled={!isSlideshowEnabled}
            onClick={onToggleSlideshowPlaying}
          >
            {isSlideshowPlaying ?
              <EndSlideshowIcon/> :
              <StartSlideshowIcon/>
            }
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip
        title='Next Image (Right Arrow)'
      >
        <span>
          <IconButton
            size='large'
            color='inherit'
            aria-label='next-image'
            disabled={!isNextImageEnabled}
            onClick={onNextImage}
          >
            <NextImageIcon/>
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip
        title='Last Image (End)'
      >
        <span>
          <IconButton
            size='large'
            color='inherit'
            aria-label='last-image'
            disabled={!isLastImageEnabled}
            onClick={onLastImage}
          >
            <LastImageIcon/>
          </IconButton>
        </span>
      </Tooltip>
      <ToggleButtonGroup
        value={fitMode}
        exclusive
        onChange={(e, value) => onFitModeChange(value)}
      >
        <ToggleButton
          value={FitMode.Best}
          aria-label='best-fit'
          sx={{
            p: 0
          }}
        >
          <Tooltip
            title='Best Fit'
          >
            <Box
              sx={{
                height: 'min-content',
                width: 'min-content',
                p: '11px',
                display: 'grid',
                alignContent: 'center',
                justifyContent: 'center'
              }}
            >
              <FitBestIcon/>
            </Box>
          </Tooltip>
        </ToggleButton>
        <ToggleButton
          value={FitMode.Width}
          aria-label='fit-width'
          sx={{
            p: 0
          }}
        >
          <Tooltip
            title='Fit Width'
          >
            <Box
              sx={{
                height: 'min-content',
                width: 'min-content',
                p: '11px',
                display: 'grid',
                alignContent: 'center',
                justifyContent: 'center'
              }}
            >
              <FitWidthIcon/>
            </Box>
          </Tooltip>
        </ToggleButton>
        <ToggleButton
          value={FitMode.Height}
          aria-label='fit-height'
          sx={{
            p: 0
          }}
        >
          <Tooltip
            title='Fit Height'
          >
            <Box
              sx={{
                height: 'min-content',
                width: 'min-content',
                p: '11px',
                display: 'grid',
                alignContent: 'center',
                justifyContent: 'center'
              }}
            >
              <FitHeightIcon/>
            </Box>
          </Tooltip>
        </ToggleButton>
        <ToggleButton
          value={FitMode.Original}
          aria-label='fit-original'
          sx={{
            p: 0
          }}
        >
          <Tooltip
            title='Original Size'
          >
            <Box
              sx={{
                height: 'min-content',
                width: 'min-content',
                p: '11px',
                display: 'grid',
                alignContent: 'center',
                justifyContent: 'center'
              }}
            >
              <FitOriginalIcon/>
            </Box>
          </Tooltip>
        </ToggleButton>
      </ToggleButtonGroup>
      {isFullscreenEnabled &&
        <Tooltip
          title={isFullscreen ?
            'Exit Fullscreen' :
            'Enter Fullscreen'
          }
        >
          <span>
            <IconButton
              size='large'
              edge='end'
              color='inherit'
              aria-label='fullscreen'
              disabled={!fullscreenButtonActive}
              onClick={onToggleFullscreen}
            >
              {isFullscreen ?
                <FullscreenExitIcon /> :
                <FullscreenEnterIcon />
              }
            </IconButton>
          </span>
        </Tooltip>
      }
    </Toolbar>
  );
};

export default Topbar;