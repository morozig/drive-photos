import React from 'react';
import {
  SystemStyleObject,
} from '@material-ui/system';
import {
  Stack,
  IconButton,
  Slider,
} from '@material-ui/core';
import ZoomMinusIcon from '@material-ui/icons/Remove';
import ZoomPlusIcon from '@material-ui/icons/Add';

interface ZoomSliderProps {
  sliderValue: number;
  onSliderChange: (event: Event, value: number | number[]) => void;
  sliderScale: (value: number) => number;
  onZoomMinus: () => void;
  onZoomPlus: () => void;
  sx?: SystemStyleObject;
};

const ZoomSlider: React.FC<ZoomSliderProps> = (props) => {
  const {
    sliderValue,
    onSliderChange,
    sliderScale,
    onZoomMinus,
    onZoomPlus,
    sx
  } = props;

  return (
    <Stack
      spacing={1}
      direction='row'
      alignItems='center'
      sx={{
        position: 'absolute',
        left: '50%',
        transform: 'translate(-50%,0)',
        bottom: {
          xs: '60px',
          md: '20px',
        },
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        width: '200px',
        zIndex: 1,
        ...sx,
      }}
    >
      <IconButton
        onClick={onZoomMinus}
      >
        <ZoomMinusIcon
          color={'primary'}
        />
      </IconButton>
      <Slider
        value={sliderValue}
        onChange={onSliderChange}
        step={0.00000001}
        min={-1}
        max={1}
        valueLabelDisplay='auto'
        scale={sliderScale}
      />
      <IconButton
        onClick={onZoomPlus}
      >
        <ZoomPlusIcon
          color={'primary'}
        />
      </IconButton>
    </Stack>
  );
};

export default ZoomSlider;
