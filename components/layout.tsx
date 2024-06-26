import { Box, createTheme, PaletteMode, ThemeProvider } from "@mui/material";
import Container from "@mui/material/Container";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import Navbar from "./navbar";
import { getDesignTokens } from "../styles/theme";
import { useRouter } from "next/router";
import { SpeedInsights } from "@vercel/speed-insights/next";

interface Props {
  children: React.ReactNode;
}

interface RootState {
    theme: {
      darkMode:boolean
    };
}


export default function Layout({ children }: Props) {
  const [mode, setMode] = useState<PaletteMode>("light");
  const router = useRouter();
  const currentRoute:string = router.pathname;
  const colorMode:Boolean = useSelector((state: RootState) => state.theme.darkMode);
  useMemo(() => {
    setMode((prevMode: PaletteMode) =>
      prevMode === "light" ? "dark" : "light"
    );
  }, [colorMode]);


  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);
  return (
    <ThemeProvider theme={theme}>
      {currentRoute !== "/signin" && <Navbar />}
      <Box component="main">
        <Container disableGutters maxWidth={"xl"} component="main">
          {children}
            <SpeedInsights/>
        </Container>
      </Box>
    </ThemeProvider>
  );
}