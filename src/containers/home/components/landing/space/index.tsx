import React, {
  useCallback,
  useMemo,
} from 'react';
import {
  Box,
} from '@material-ui/core';
import {
  SystemStyleObject
} from '@material-ui/system';
import { useRectSize } from '../../../../main/components/thumbnails/hooks';
import { easeInOutCap, easeInOutSine } from './helpers';

const cellToSlideRatio = 2;
const numColumns = 5;
const slidePadding = 1;
const jumpCapRatio = 5;
const jumpCapFraction = 0.3;

interface SlideWithCoordinates {
  row: number;
  column: number;
  shift: number[];
  slide: JSX.Element;
};

interface SpaceProps {
  slides: JSX.Element[];
  slideHeight: number;
  jumpHeight: number;
  scrollTop: number;
  sx?: SystemStyleObject;
};

const Space: React.FC<SpaceProps> = (props) => {
  const {
    slides,
    slideHeight,
    jumpHeight,
    scrollTop,
    sx
  } = props;

  const cellSize = useMemo(() => {
    return slideHeight * cellToSlideRatio
  }, [
    slideHeight
  ]);
  const randomShift = useCallback(() => {
    return [
      Math.random() * cellSize / 2,
      Math.random() * cellSize / 2,
      Math.random() * cellSize / 2
    ];
  }, [
    cellSize
  ]);
  const slidesWithCoordinates = useMemo(() => {
    const list = [] as SlideWithCoordinates[];
    const hash = new Map<number, SlideWithCoordinates>();
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      const row = (slidePadding * 2 + 1) * i + slidePadding;
      const column = Math.floor(
        (numColumns - slidePadding * 2) * Math.random()
      ) + slidePadding;
      const key = row * numColumns + column;
      const slideWithCoordinates = {
        row,
        column,
        shift: randomShift(),
        slide
      };
      list.push(slideWithCoordinates);
      hash.set(key, slideWithCoordinates);
    }
    return {
      list,
      hash
    };
  }, [
    randomShift,
    slides
  ]);

  const cells = useMemo(() => {
    const cells = [] as JSX.Element[];
    const numRows = slides.length * (slidePadding * 2 + 1);
    for (let i = 0; i < numRows; i++) {
      for (let j = 0; j < numColumns; j++) {
        const key = i * numColumns + j;
        const slideWithCoordinates = slidesWithCoordinates.hash.get(key);
        if (slideWithCoordinates) {
          const {
            slide,
            shift
          } = slideWithCoordinates;
          const dx = cellSize * j + shift[0];
          const dy = cellSize * i + shift[1];
          const dz = shift[2];
          cells.push(
            <Box
              key={key}
              sx={{
                transform: `translate3d(${dx}px, ${dy}px, ${dz}px)`,
                position: 'absolute',
                width: '100%'
              }}
            >
              {slide}
            </Box>
          );
        } else {
          const shift = randomShift();
          const dx = cellSize * j + shift[0];
          const dy = cellSize * i + shift[1];
          const dz = shift[2];
          cells.push(
            <Box
              key={key}
              component='img'
              src={`https://picsum.photos/150/200?random=${key}`}
              loading='lazy'
              sx={{
                height: `${slideHeight}px`,
                width: 'auto',
                transform: `translate3d(${dx}px, ${dy}px, ${dz}px)`,
                position: 'absolute',
              }}
            />
          );
        }
      }
    }
    return cells;
  }, [
    slideHeight,
    cellSize,
    randomShift,
    slides.length,
    slidesWithCoordinates
  ]);

  const {
    rectSize,
    ref
  } = useRectSize();
  const calculateShift = useCallback((scrollTop: number) => {
    const scrollMax = slideHeight + jumpHeight;
    const slideIndex = Math.floor(scrollTop / scrollMax);
    const scroll = scrollTop % scrollMax;
    const scrollJump = slideHeight - rectSize.height;
    if (scroll <= scrollJump ||
      slideIndex >= slidesWithCoordinates.list.length - 1
    ) {
      const curr = slidesWithCoordinates.list[slideIndex];
      const currX = cellSize * curr.column + curr.shift[0];
      const currY = cellSize * curr.row + curr.shift[1];
      const currZ = curr.shift[2];
      return [
        -currX,
        -currY - scroll,
        -currZ
      ];
    } else {
      const prev = slidesWithCoordinates.list[slideIndex];
      const next = slidesWithCoordinates.list[slideIndex + 1];
      const prevX = cellSize * prev.column + prev.shift[0];
      const prevY = cellSize * prev.row + prev.shift[1] + scrollJump;
      const prevZ = prev.shift[2];
      const nextX = cellSize * next.column + next.shift[0];
      const nextY = cellSize * next.row + next.shift[1];
      const nextZ = next.shift[2];
      const x = easeInOutSine(scroll, scrollJump, scrollMax, prevX, nextX);
      const y = easeInOutSine(scroll, scrollJump, scrollMax, prevY, nextY);
      const z = easeInOutCap(
        scroll,
        scrollJump,
        jumpCapFraction,
        scrollMax,
        prevZ,
        slideHeight * jumpCapRatio,
        nextZ
      );

      // console.log({
      //   scroll,
      //   scrollJump,
      //   scrollMax,
      //   prev,
      //   next,
      //   prevX,
      //   prevY,
      //   prevZ,
      //   nextX,
      //   nextY,
      //   nextZ,
      //   x,
      //   y,
      //   z
      // });
      return [
        -x,
        -y,
        -z
      ];
    }
  }, [
    slideHeight,
    jumpHeight,
    rectSize.height,
    cellSize,
    slidesWithCoordinates
  ]);
  const planeShift = calculateShift(scrollTop);

  return (
    <Box
      sx={{
        ...sx,
        backgroundColor: 'black',
        perspective: '400px',
        willChange: 'transform'
      }}
      ref={ref}
    >
      <Box
        sx={{
          position: 'relative',
          transformStyle: 'preserve-3d',
          transform: `translate3d(${planeShift
            .map(shift => `${shift}px`)
            .join(',')
          })`,
        }}
      >
        {cells}
      </Box>
    </Box>
  );
};

export default Space;
