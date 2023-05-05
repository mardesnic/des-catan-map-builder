import React from 'react';
import {
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  ButtonBase,
} from '@mui/material';
import { Box } from '@mui/system';
import GitHubIcon from '@mui/icons-material/GitHub';
import TwitterIcon from '@mui/icons-material/Twitter';
import Language from '@mui/icons-material/Language';
import { styled } from '@mui/system';
import { EMAIL, GITHUB, NAME, WEBSITE, TWITTER } from '../../const';

const DrawerContent = styled(Box)(({ theme }) => ({
  width: 300,
  maxWidth: '70vw',
  padding: theme.spacing(2),
}));

const CustomAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(10),
  height: theme.spacing(10),
}));

export const CustomDrawer: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose,
}) => {
  return (
    <Drawer anchor='right' open={open} onClose={onClose}>
      <DrawerContent>
        <List>
          <ListItem>
            <CustomAvatar alt={NAME} src='assets/avatar.jpeg' />
          </ListItem>
          <ListItem>
            <ListItemText primary={NAME} secondary={EMAIL} />
          </ListItem>
          <Box my={2}>
            <Divider />
          </Box>
          <ListItem>
            <ButtonBase component='a' href={WEBSITE}>
              <ListItemIcon>
                <Language />
              </ListItemIcon>
              <ListItemText primary='Website' />
            </ButtonBase>
          </ListItem>
          <ListItem>
            <ButtonBase component='a' href={GITHUB} target='_blank'>
              <ListItemIcon>
                <GitHubIcon />
              </ListItemIcon>
              <ListItemText primary='GitHub' />
            </ButtonBase>
          </ListItem>
          <ListItem>
            <ButtonBase component='a' href={TWITTER} target='_blank'>
              <ListItemIcon>
                <TwitterIcon />
              </ListItemIcon>
              <ListItemText primary='Twitter' />
            </ButtonBase>
          </ListItem>
        </List>
      </DrawerContent>
    </Drawer>
  );
};
