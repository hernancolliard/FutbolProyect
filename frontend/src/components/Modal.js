import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";

const Modal = ({ isOpen, onClose, children }) => {
  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent>{children}</DialogContent>
    </Dialog>
  );
};

export default Modal;
