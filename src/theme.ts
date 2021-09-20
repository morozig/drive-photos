import { createTheme } from '@material-ui/core/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#ffffff',
      contrastText: '#595959'
    },
    secondary: {
      main: '#3476dd',
      contrastText: '#ffffff'
    }
  },
  components: {
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  }
});

export default theme;