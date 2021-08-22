import React, {
} from 'react';
import {
  Box,
  Paper,
  Typography,
} from '@material-ui/core';

const Landing: React.FC = () => {
  
  return (
    <Box>
      <Paper>
        <Box>
          <Typography>
            {'Drive Photos'}
          </Typography>
        </Box>
        <Box>
          <Typography>
            {'Online image viewer for Google Drive.'}
          </Typography>
        </Box>
      </Paper>
      <Paper>
        <Box>
          <Typography>
            {'Access your photos anywhere.'}
          </Typography>
        </Box>
        <Box>
          <Typography>
            {'All devices are supported.'}
          </Typography>
        </Box>
      </Paper>
      <Paper>
        <Box>
          <Typography>
            {'Free and open source.'}
          </Typography>
        </Box>
        <Box>
          <Typography>
            {'No server, all personal data stays in your browser.'}
          </Typography>
        </Box>
      </Paper>
      <Paper>
        <Box>
          <Typography>
            {'Image preloading for fast transition.'}
          </Typography>
        </Box>
        <Box>
          <Typography>
            {'Fullscreen and slideshow modes.'}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Landing;
