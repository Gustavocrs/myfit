import React from "react";
import {Backdrop, CircularProgress} from "@mui/material";

/**
 * Componente global de Loading (Overlay).
 * Utiliza MUI Backdrop para sobrepor a interface com um z-index alto.
 */
const Loading = ({open = true, message = "Carregando..."}) => {
  return (
    <Backdrop
      sx={{color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1}}
      open={open}
    >
      <div className="flex flex-col items-center justify-center gap-4">
        <CircularProgress color="inherit" size={60} thickness={4} />
        {message && (
          <span className="text-lg font-semibold tracking-wide animate-pulse">
            {message}
          </span>
        )}
      </div>
    </Backdrop>
  );
};

export default Loading;
