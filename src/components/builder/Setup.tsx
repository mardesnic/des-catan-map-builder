import { useState } from 'react';
import {
  FormControl,
  Button,
  FormGroup,
  FormControlLabel,
  Radio,
  RadioGroup,
  Container as MuiContainer,
  Paper as MuiPaper,
} from '@mui/material';
import { Box, styled } from '@mui/system';
import { MAP_SIZES } from '../../const';
import { MAP_SIZE, MapSettings } from '../../hooks/useCatanMap';

type Props = {
  onSubmit: (values: MapSettings) => void;
  settings: MapSettings;
};

const Content = styled(Box)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
    paddingBlock: theme.spacing(2),
    paddingInline: theme.spacing(0),
  },
}));

const Paper = styled(MuiPaper)(({ theme }) => ({
  paddingInline: theme.spacing(3),
  paddingBlock: theme.spacing(1),
  color: theme.palette.text.primary,
  position: 'relative',
}));

const SubmitButton = styled(Button)(() => ({
  alignSelf: 'center',
  marginLeft: 'auto',
}));

export const Setup: React.FC<Props> = ({ onSubmit, settings }) => {
  const [size, setSize] = useState(settings.size);

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = { size };
    onSubmit(values);
  };

  const handleFormChange = (size: MAP_SIZE) => {
    setSize(size);
    const values = { size };
    onSubmit(values);
  };

  return (
    <MuiContainer maxWidth='xs'>
      <Content>
        <Paper>
          <form onSubmit={handleFormSubmit}>
            <FormControl fullWidth margin='normal'>
              <FormGroup row>
                <RadioGroup
                  row
                  aria-label='map-size'
                  name='mapSize'
                  value={size}
                  onChange={(e) => handleFormChange(e.target.value as MAP_SIZE)}
                >
                  {MAP_SIZES.map((size) => (
                    <FormControlLabel
                      key={size}
                      value={size}
                      control={<Radio color='secondary' />}
                      label={size}
                      labelPlacement='top'
                    />
                  ))}
                </RadioGroup>
                <SubmitButton
                  variant='contained'
                  color='primary'
                  type='submit'
                  size='large'
                >
                  Shuffle
                </SubmitButton>
              </FormGroup>
            </FormControl>
          </form>
        </Paper>
      </Content>
    </MuiContainer>
  );
};
