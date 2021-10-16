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
  ListItemIcon,
  ListItemText,
  Avatar,
  Divider,
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
import OpenFileIcon from '@material-ui/icons/InsertDriveFile';
import RecentFilesIcon from '@material-ui/icons/History';
import DownloadFileIcon from '@material-ui/icons/FileDownload';
import CloseFileIcon from '@material-ui/icons/Close';
import HelpIcon from '@material-ui/icons/HelpOutline';
import AboutIcon from '@material-ui/icons/Info';
import PolicyIcon from '@material-ui/icons/Policy';
import TermsIcon from '@material-ui/icons/Gavel';
import SignOutIcon from '@material-ui/icons/Logout';
import GoogleIcon from './GoogleIcon';
import CookiesErrorIcon from '@material-ui/icons/VisibilityOff';
import HideDrawerIcon from '@material-ui/icons/ArrowLeft';
import ShowDrawerIcon from '@material-ui/icons/ArrowRight';
import { defaultTitle, FitMode } from '../..';
import { RecentFile, useFullScreen, useIsSignedIn } from '../../../../lib/hooks';
import {
  pickFile
} from '../../../../lib/api';
import TitleTooltip from './TitleTooltip';
import { Link } from 'react-router-dom';
import CloseViewIcon from '@material-ui/icons/CancelPresentation';

interface TopbarProps {
  title: string;
  counterTitle: string;
  fitMode: FitMode;
  onFitModeChange: (fitMode: FitMode) => void;
  onOpenFile: (file: google.picker.DocumentObject) => void;
  onRecentFile: (file: RecentFile) => void;
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
  onDownloadFile: () => void;
  onCloseFile: () => void;
  onSignOut: () => void;
  isMobileDrawerOpen: boolean;
  toggleMobileDrawer: () => void;
};

const Topbar: React.FC<TopbarProps> = (props) => {
  const {
    title,
    counterTitle,
    fitMode,
    onFitModeChange,
    onOpenFile,
    onRecentFile,
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
    onDownloadFile,
    onCloseFile,
    onSignOut,
    isMobileDrawerOpen,
    toggleMobileDrawer
  } = props;
  const [ isMenuOpen, setMenuOpen ] = useState(false);
  const menuRef = useRef<HTMLButtonElement>(null);
  const [ isRecentMenuOpen, setRecentMenuOpen ] = useState(false);
  const recentMenuRef = useRef<HTMLLIElement>(null);
  const [ isHelpMenuOpen, setHelpMenuOpen ] = useState(false);
  const helpMenuRef = useRef<HTMLButtonElement>(null);
  const [ isProfileMenuOpen, setProfileMenuOpen ] = useState(false);
  const profileMenuRef = useRef<HTMLButtonElement>(null);
  const {
    isEnabled: isFullscreenEnabled,
    isFullscreen
  } = useFullScreen();

  const {
    isSignedIn,
    toggleSignedIn,
    profile,
    isCookiesError
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
  const onDrawerClick = useCallback(() => {
    toggleMobileDrawer();
    handleMenuClose();
  }, [
    toggleMobileDrawer,
    handleMenuClose
  ]);
  const onDownloadClick = useCallback(() => {
    onDownloadFile();
    handleMenuClose();
  }, [
    handleMenuClose,
    onDownloadFile
  ]);
  const onCloseClick = useCallback(() => {
    onCloseFile();
    handleMenuClose();
  }, [
    onCloseFile,
    handleMenuClose
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
    onRecentFile(recentFile);
  }, [
    handleRecentMenuClose,
    handleMenuClose,
    onRecentFile
  ]);
  const handleHelpMenuClose = useCallback(() => {
    setHelpMenuOpen(false);
  }, []);
  const handleHelpMenuClick = useCallback(() => {
    setHelpMenuOpen(current => !current);
  }, []);
  const handleProfileMenuClose = useCallback(() => {
    setProfileMenuOpen(false);
  }, []);
  const handleProfileMenuClick = useCallback(() => {
    setProfileMenuOpen(current => !current);
  }, []);
  const onSignOutClick = useCallback(() => {
    handleProfileMenuClose();
    toggleSignedIn();
  }, [
    handleProfileMenuClose,
    toggleSignedIn
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
      >
        <MenuItem
          onClick={onDrawerClick}
          sx={{
            display: { xs: 'flex', md: 'none' }
          }}
        >
          <ListItemIcon>
            {isMobileDrawerOpen ?
              <HideDrawerIcon/> :
              <ShowDrawerIcon/>
            }
          </ListItemIcon>
          <ListItemText>
            {isMobileDrawerOpen ?
              'Hide Thumbnails' :
              'Show Thumbnails'
            }
          </ListItemText>
        </MenuItem>
        {!isSignedIn &&
          <MenuItem
            onClick={toggleSignedIn}
          >
            <ListItemIcon>
              <GoogleIcon/>
            </ListItemIcon>
            <ListItemText>
              {'Sign in with Google'}
            </ListItemText>
          </MenuItem>
        }
        {isSignedIn &&
          <MenuItem
            onClick={onOpenClick}
          >
            <ListItemIcon>
              <OpenFileIcon/>
            </ListItemIcon>
            <ListItemText>
              {'Open File'}
            </ListItemText>
          </MenuItem>
        }
        {isSignedIn &&
          <MenuItem
            onClick={handleRecentMenuClick}
            disabled={recentFiles.length === 0}
            ref={recentMenuRef}
          >
            <ListItemIcon>
              <RecentFilesIcon/>
            </ListItemIcon>
            <ListItemText>
              {'Recent Files'}
            </ListItemText>
          </MenuItem>
        }
        {fullscreenButtonActive &&
          <MenuItem
            onClick={onDownloadClick}
          >
            <ListItemIcon>
              <DownloadFileIcon/>
            </ListItemIcon>
            <ListItemText>
              {'Download File'}
            </ListItemText>
          </MenuItem>
        }
        {fullscreenButtonActive &&
          <MenuItem
            onClick={onCloseClick}
          >
            <ListItemIcon>
              <CloseFileIcon/>
            </ListItemIcon>
            <ListItemText>
              {'Close File'}
            </ListItemText>
          </MenuItem>
        }
        <Divider
          sx={{
            display: { xs: 'flex', md: 'none' }
          }}
        />
        <MenuItem
          disabled={!fullscreenButtonActive}
          onClick={() => {
            onFirstImage();
            handleMenuClose();
          }}
          sx={{
            display: { xs: 'flex', md: 'none' }
          }}
        >
          <ListItemIcon>
            <FirstImageIcon/>
          </ListItemIcon>
          <ListItemText>
            {'First Image'}
          </ListItemText>
        </MenuItem>
        <MenuItem
          disabled={!fullscreenButtonActive}
          onClick={() => {
            onToggleSlideshowPlaying();
            handleMenuClose();
          }}
          sx={{
            display: { xs: 'flex', md: 'none' }
          }}
        >
          <ListItemIcon>
            {isSlideshowPlaying ?
              <EndSlideshowIcon/> :
              <StartSlideshowIcon/>
            }
          </ListItemIcon>
          <ListItemText>
            {isSlideshowPlaying ?
              'End Slideshow' :
              'Start Slideshow'
            }
          </ListItemText>
        </MenuItem>
        <MenuItem
          disabled={!fullscreenButtonActive}
          onClick={() => {
            onLastImage();
            handleMenuClose();
          }}
          sx={{
            display: { xs: 'flex', md: 'none' }
          }}
        >
          <ListItemIcon>
            <LastImageIcon/>
          </ListItemIcon>
          <ListItemText>
            {'Last Image'}
          </ListItemText>
        </MenuItem>
        <Divider
          sx={{
            display: { xs: 'flex', md: 'none' }
          }}
        />
        <MenuItem
          onClick={() => {
            onFitModeChange(FitMode.Best);
            handleMenuClose();
          }}
          sx={{
            display: { xs: 'flex', md: 'none' },
            backgroundColor: fitMode === FitMode.Best ?
              'rgba(0, 0, 0, 0.08)' : undefined
          }}
        >
          <ListItemIcon>
            <FitBestIcon/>
          </ListItemIcon>
          <ListItemText>
            {'Best Fit'}
          </ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            onFitModeChange(FitMode.Width);
            handleMenuClose();
          }}
          sx={{
            display: { xs: 'flex', md: 'none' },
            backgroundColor: fitMode === FitMode.Width ?
              'rgba(0, 0, 0, 0.08)' : undefined
          }}
        >
          <ListItemIcon>
            <FitWidthIcon/>
          </ListItemIcon>
          <ListItemText>
            {'Fit Width'}
          </ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            onFitModeChange(FitMode.Height);
            handleMenuClose();
          }}
          sx={{
            display: { xs: 'flex', md: 'none' },
            backgroundColor: fitMode === FitMode.Height ?
              'rgba(0, 0, 0, 0.08)' : undefined
          }}
        >
          <ListItemIcon>
            <FitHeightIcon/>
          </ListItemIcon>
          <ListItemText>
            {'Fit Height'}
          </ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            onFitModeChange(FitMode.Original);
            handleMenuClose();
          }}
          sx={{
            display: { xs: 'flex', md: 'none' },
            backgroundColor: fitMode === FitMode.Original ?
              'rgba(0, 0, 0, 0.08)' : undefined
          }}
        >
          <ListItemIcon>
            <FitOriginalIcon/>
          </ListItemIcon>
          <ListItemText>
            {'Original Size'}
          </ListItemText>
        </MenuItem>
        <Divider
          sx={{
            display: { xs: 'flex', md: 'none' }
          }}
        />
        <MenuItem
          disabled={!fullscreenButtonActive}
          onClick={() => {
            onToggleFullscreen();
            handleMenuClose();
          }}
          sx={{
            display: { xs: 'flex', md: 'none' }
          }}
        >
          <ListItemIcon>
            {isFullscreen ?
              <FullscreenExitIcon /> :
              <FullscreenEnterIcon/>
            }
          </ListItemIcon>
          <ListItemText>
            {isFullscreen ?
              'Exit Fullscreen' :
              'Enter Fullscreen'
            }
          </ListItemText>
        </MenuItem>
        <MenuItem
          component={Link}
          to={'/'}
          onClick={() => {
            document.title = defaultTitle;
          }}
        >
          <ListItemIcon>
            <CloseViewIcon/>
          </ListItemIcon>
          <ListItemText>
            {'Close View'}
          </ListItemText>
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
        <Box
          sx={{
            display: { xs: 'none', md: 'block' }
          }}
        >
          <IconButton
            size='large'
            color='inherit'
            aria-label='first-image'
            disabled={!isFirstImageEnabled}
            onClick={onFirstImage}
          >
            <FirstImageIcon/>
          </IconButton>
        </Box>
      </Tooltip>
      <Tooltip
        title='Previous Image (Left Arrow)'
      >
        <Box>
          <IconButton
            size='large'
            color='inherit'
            aria-label='prev-image'
            disabled={!isPrevImageEnabled}
            onClick={onPrevImage}
            sx={{
              p: { xs: '6px', md: '12px'}
            }}
          >
            <PrevImageIcon/>
          </IconButton>
        </Box>
      </Tooltip>
      <Tooltip
        title={isSlideshowPlaying ?
          'End Slideshow (Space)' :
          'Start Slideshow (Space)'
        }
      >
        <Box
          sx={{
            display: { xs: 'none', md: 'block' }
          }}
        >
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
        </Box>
      </Tooltip>
      <Tooltip
        title='Next Image (Right Arrow, Scroll Below, Click)'
      >
        <Box>
          <IconButton
            size='large'
            color='inherit'
            aria-label='next-image'
            disabled={!isNextImageEnabled}
            onClick={onNextImage}
            sx={{
              p: { xs: '6px', md: '12px'}
            }}
          >
            <NextImageIcon/>
          </IconButton>
        </Box>
      </Tooltip>
      <Tooltip
        title='Last Image (End)'
      >
        <Box
          sx={{
            display: { xs: 'none', md: 'block' }
          }}
        >
          <IconButton
            size='large'
            color='inherit'
            aria-label='last-image'
            disabled={!isLastImageEnabled}
            onClick={onLastImage}
          >
            <LastImageIcon/>
          </IconButton>
        </Box>
      </Tooltip>
      <ToggleButtonGroup
        value={fitMode}
        exclusive
        onChange={(e, value) => {
          if (value) {
            onFitModeChange(value)
          }
        }
        }
        sx={{
          display: { xs: 'none', md: 'flex' }
        }}
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
          <Box
            sx={{
              display: { xs: 'none', md: 'block' }
            }}
          >
            <IconButton
              size='large'
              color='inherit'
              aria-label='fullscreen'
              disabled={!fullscreenButtonActive}
              onClick={onToggleFullscreen}
            >
              {isFullscreen ?
                <FullscreenExitIcon /> :
                <FullscreenEnterIcon/>
              }
            </IconButton>
          </Box>
        </Tooltip>
      }
      <Tooltip
        title='Terms And Conditions'
      >
        <IconButton
          size='large'
          color='inherit'
          aria-label='terms-and-policy'
          edge={isSignedIn ? undefined : 'end'}
          ref={helpMenuRef}
          onClick={handleHelpMenuClick}
          sx={{
            p: { xs: '6px', md: '12px'}
          }}
        >
          <HelpIcon/>
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={helpMenuRef.current}
        open={isHelpMenuOpen}
        onClose={handleHelpMenuClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem
          component='a'
          href={`${process.env.PUBLIC_URL}/about.html`}
        >
          <ListItemIcon>
            <AboutIcon/>
          </ListItemIcon>
          <ListItemText>
            {'About'}
          </ListItemText>
        </MenuItem>
        <MenuItem
          component='a'
          href={`${process.env.PUBLIC_URL}/privacy.html`}
        >
          <ListItemIcon>
            <PolicyIcon/>
          </ListItemIcon>
          <ListItemText>
            {'Privacy Policy'}
          </ListItemText>
        </MenuItem>
        <MenuItem
          component='a'
          href={`${process.env.PUBLIC_URL}/terms.html`}
        >
          <ListItemIcon>
            <TermsIcon/>
          </ListItemIcon>
          <ListItemText>
            {'Terms And Conditions'}
          </ListItemText>
        </MenuItem>
      </Menu>
      {isSignedIn && profile &&
        <IconButton
          size='large'
          edge='end'
          color='inherit'
          aria-label='terms-and-policy'
          ref={profileMenuRef}
          onClick={handleProfileMenuClick}
          sx={{
            p: '6px'
          }}
        >
          <Avatar
            src={profile.imageUrl}
            sx={{
              width: 32,
              height: 32
            }}
          />
        </IconButton>
      }
      <Menu
        anchorEl={profileMenuRef.current}
        open={isProfileMenuOpen}
        onClose={handleProfileMenuClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem
          onClick={onSignOutClick}
        >
          <ListItemIcon>
            <SignOutIcon/> 
          </ListItemIcon>
          <ListItemText>
            {'Sign Out'}
          </ListItemText>
        </MenuItem>
      </Menu>
      {!isSignedIn && isCookiesError &&
        <Tooltip
          title={`You need to enable 3rd party cookies.
            Click "eye" icon at the end of address bar`}
        >
          <CookiesErrorIcon
            color='error'
            sx={{
              ml: '12px',
              mr: '-6px'
            }}
          />
        </Tooltip>
      }
    </Toolbar>
  );
};

export default Topbar;