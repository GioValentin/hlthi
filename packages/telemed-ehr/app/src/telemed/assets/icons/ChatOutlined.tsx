import React, { FC } from 'react';
import { SvgIcon, SvgIconProps } from '@mui/material';

export const ChatOutlinedIcon: FC<SvgIconProps> = (props) => {
  return (
    <SvgIcon {...props}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 4h16v12H5.17L4 17.17zm0-2c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm2 10h8v2H6zm0-3h12v2H6zm0-3h12v2H6z"></path>
      </svg>
    </SvgIcon>
  );
};