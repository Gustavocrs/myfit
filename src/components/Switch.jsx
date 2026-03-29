import {Switch as MuiSwitch} from "@mui/material";

export const Switch = ({checked, onChange}) => {
  return (
    <MuiSwitch
      checked={!!checked} // Garante que o valor seja sempre um booleano
      onChange={onChange}
      sx={{
        "& .MuiSwitch-switchBase.Mui-checked": {
          color: "#0ea5e9", // Cor do "thumb" quando ligado (Tailwind sky-500)
        },
        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
          backgroundColor: "#0ea5e9", // Cor do "track" quando ligado (Tailwind sky-500)
        },
      }}
    />
  );
};
