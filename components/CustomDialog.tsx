import {
  CircularProgress,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogActions,
  DialogTitle,
  Button,
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
  dialogLoading?: boolean;
  dialogStyle?: string;
  dialogContentStyle?: string;
  isStepperDialog?: boolean;
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
    dialogStyle,
    dialogContentStyle,
    isStepperDialog,
  } = props;

  return (
    <Dialog
      open={dialogOpen}
      onClose={() => dialogClose(false)}
      classes={{ paper: [styles.dialog, dialogStyle].join(" ") }}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent classes={{ root: dialogContentStyle }}>
        {contentText ? (
          <DialogContentText>{contentText}</DialogContentText>
        ) : (
          nativeContentText
        )}
        {!isStepperDialog //TODO srediti ovo kako treba
          ? children
          : React.isValidElement(children)
          ? React.cloneElement(children, {
              closeDialog: dialogClose,
              dialogLoading: dialogLoading,
            })
          : null}
      </DialogContent>
      {!isStepperDialog && (
        <DialogActions classes={{ root: styles.dialogActions }}>
          <Button
            onClick={() => dialogClose(false)}
            color="error"
            variant="contained"
            disabled={dialogLoading}
          >
            Otkazi
          </Button>
          {dialogLoading && <CircularProgress size="4.5vmin" />}
          <Button
            onClick={() => dialogClose(true)}
            color="success"
            variant="contained"
            disabled={dialogLoading}
          >
            Potvrdi
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default CustomDialog;
