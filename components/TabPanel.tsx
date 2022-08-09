import { Box } from "@mui/system";
import React from "react";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, index, value } = props;

  return <div>{index === value && <Box>{children}</Box>}</div>;
};

export default TabPanel;
