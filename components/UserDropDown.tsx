import { Avatar, Menu, MenuItem, Zoom } from "@mui/material";
import { blue } from "@mui/material/colors";
import Link from "next/link";
import React, { MouseEvent, useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import styles from "../styles/userdd.module.scss";

const UserDropDown = () => {
  const { signout, currUser } = useAuth();
  const [anchor, setAnchor] = useState<HTMLElement>();
  const open = Boolean(anchor);

  const handleClick = (e: MouseEvent<HTMLElement>) => {
    setAnchor(e.currentTarget);
  };
  const handleClose = () => {
    setAnchor(null);
  };

  return (
    <>
      {currUser?.displayName && (
        <>
          <Avatar
            sx={{ bgcolor: blue[200] }}
            alt={currUser?.displayName}
            src={currUser?.photoURL}
            onClick={handleClick}
            className={styles.avatar}
          >
            {currUser?.displayName.charAt(0)}
          </Avatar>
          <Menu
            open={open}
            anchorEl={anchor}
            onClose={handleClose}
            TransitionComponent={Zoom}
            PaperProps={{ className: styles.dropDown }}
            anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
            transformOrigin={{ vertical: "top", horizontal: "center" }}
          >
            <MenuItem classes={{ gutters: styles.item }} onClick={handleClose}>
              <Link href={`/profile`} locale={false} prefetch>
                My profile
              </Link>
            </MenuItem>
            <MenuItem classes={{ gutters: styles.item }} onClick={handleClose}>
              <Link href={`/settings`} locale={false} prefetch>
                Settings
              </Link>
            </MenuItem>
            <MenuItem onClick={signout} classes={{ gutters: styles.item }}>
              Logout
            </MenuItem>
          </Menu>
        </>
      )}
    </>
  );
};

export default UserDropDown;
