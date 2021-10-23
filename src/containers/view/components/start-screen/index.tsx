import React, {
  useCallback,
} from 'react';
import {
  SystemStyleObject,
} from '@material-ui/system';
import {
  Box,
  Button,
} from '@material-ui/core';
import OpenFileIcon from '@material-ui/icons/InsertDriveFile';
import { useIsSignedIn } from '../../../../lib/hooks';
import { pickFile } from '../../../../lib/api';
import GoogleIcon from '../topbar/GoogleIcon';

interface StartScreenProps {
  onOpenFile: (file: google.picker.DocumentObject) => void;
  sx?: SystemStyleObject;
};

const StartScreen: React.FC<StartScreenProps> = (props) => {
  const {
    onOpenFile,
    sx
  } = props;

  const {
    isSignedIn,
    toggleSignedIn
  } = useIsSignedIn();

  const onOpenClick = useCallback(async () => {
    try {
      const doc = await pickFile();
      if (doc) {
        onOpenFile(doc);
      }
    }
    catch (err) {
      console.log(err);
    }
  }, [
    onOpenFile
  ]);

  return (
    <Box sx={{
      ...sx,
      display: 'grid',
      justifyContent: 'center',
      alignContent: 'center',
    }}>
      {isSignedIn ?
        <Button
          onClick={onOpenClick}
          variant={'contained'}
          color='secondary'
          startIcon={<OpenFileIcon/>}
        >
          {'Open File'}
        </Button> :
        <Button
          onClick={toggleSignedIn}
          variant={'contained'}
          color='secondary'
          startIcon={
            <Box
              sx={{
                bgcolor: 'white',
                height: '44px',
                width: '44px',
                display: 'grid',
                justifyContent: 'center',
                alignContent: 'center',
              }}
            >
              <GoogleIcon/>
            </Box>
          }
          sx={{
            textTransform: 'none',
            padding: '1px 8px 1px 5px',
            borderRadius: '2px',
            overflow: 'hidden'
          }}
        >
          {'Sign in with Google'}
        </Button>
      }
    </Box>
  );
};

export default StartScreen;