import { Box, createTheme, PaletteMode, ThemeProvider } from "@mui/material";
import Container from "@mui/material/Container";
import { useEffect, useMemo, useState } from "react";
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

/**
 * The main layout component for the application.
 * It provides the theme and renders the navbar and children.
 * @param {object} props - The props for the component.
 * @param {React.ReactNode} props.children - The children to render within the layout.
 * @returns {React.ReactElement} The rendered layout component.
 */
export default function Layout({ children }: Props) {
  const [mode, setMode] = useState<PaletteMode>("light");
  const router = useRouter();
  const currentRoute:string = router.pathname;
  const colorMode:Boolean = useSelector((state: RootState) => state.theme.darkMode);
  useEffect(() => {
    setMode(colorMode ? "dark" : "light");
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