import "../styles/globals.scss";
import Layout from "../components/Layout";
import { AuthProvider } from "../contexts/AuthContext";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";

const customTheme = createTheme({
  palette: {
    primary: {
      main: "#3b40f9",
    },
    secondary: {
      main: "#f2982e",
    },
    // primaryDark: {
    //   main: "#081e85",
    // },
    background: {
      default: "#fbfffc",
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
