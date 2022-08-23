import "../styles/globals.scss";
import Layout from "../components/Layout";
import { AuthProvider } from "../contexts/AuthContext";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";

const customTheme = createTheme({
  palette: {
    primary: {
      main: "#f2982e",
    },
    secondary: {
      main: "#081e85",
    },
    // primaryDark: {
    //   main: "#081e85",
    // },
    background: {
      default: "#b4d9ff", //!old color #3b40f9
      paper: "#fbfffc",
    },
  },
});

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <ThemeProvider theme={customTheme}>
        <CssBaseline />
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default MyApp;
