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
import { FitMode } from '../../App';
import { useFullScreen, useIsSignedIn } from '../../lib/hooks';
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
  onFirstImage: () => void;
  onPrevImage: () => void;
  onNextImage: () => void;
  onLastImage: () => void;
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
    onFirstImage,
    onPrevImage,
    onNextImage,
    onLastImage
  } = props;
  const [ isMenuOpen, setMenuOpen ] = useState(false);
  const menuRef = useRef<HTMLButtonElement>(null);
  const {
    isEnabled: isFullscreenEnabled,
    isFullscreen
  } = useFullScreen();

  const {
    isSignedIn,
    toggleSignedIn
  } = useIsSignedIn();

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
      onOpenFile(doc);
    }
  }, [
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
          onClick={toggleSignedIn}
        >
          {isSignedIn ? 'Sign Out' : 'Sign In'}
        </MenuItem>
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