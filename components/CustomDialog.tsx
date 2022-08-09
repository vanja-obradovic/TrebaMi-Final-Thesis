import {
  CircularProgress,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogActions,
  DialogTitle,
} from "@mui/material";
import React from "react";

import styles from "../styles/customDialog.module.scss";

interface dialogProps {
  children: React.ReactNode;
  dialogClose: (state?: boolean) => void;
  dialogOpen: boolean;
  contentText?: string;
  nativeContentText?: JSX.Element;
  title: string;
  dialogLoading: boolean;
}

const CustomDialog = (props: dialogProps) => {
  const {
    children,
    dialogClose,
    dialogOpen,
    contentText,
    title,
    dialogLoading,
    nativeContentText,
  } = props;

  return (
    <Dialog
      open={dialogOpen}
      onClose={() => dialogClose(false)}
      classes={{ paper: styles.dialog }}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {contentText ? (
          <DialogContentText>{contentText}</DialogContentText>
        ) : (
          nativeContentText
        )}
        {children}
      </DialogContent>
      <DialogActions classes={{ root: styles.dialogActions }}>
        <button onClick={() => dialogClose(false)}>Cancel</button>
        {dialogLoading && <CircularProgress size="4.5vmin" />}
        <button onClick={() => dialogClose(true)}>Confirm</button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomDialog;
