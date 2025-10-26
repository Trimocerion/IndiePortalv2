import { Box, CircularProgress } from "@mui/material";

/**
 * A component that displays a circular progress indicator to signify a page is loading.
 * @returns {React.ReactElement} The rendered page loader component.
 */
export default function PageLoader() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <CircularProgress />
    </Box>
  );
}
