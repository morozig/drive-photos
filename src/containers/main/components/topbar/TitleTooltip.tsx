import React, {
  useRef,
  useEffect,
  useState
} from 'react';
import {
  Tooltip,
  Typography
} from '@material-ui/core';
import {
  SystemStyleObject
} from '@material-ui/system'

interface TitleTooltipProps {
  text: string;
  sx?: SystemStyleObject;
};

const TitleTooltip: React.FC<TitleTooltipProps> = (props) => {
  const {
    text,
    sx
  } = props;

  const ref = useRef<HTMLDivElement>(null);
  const [ isOverflow, setOverflow ] = useState(false);

  useEffect(() => {
    const div = ref.current;
    const check = () => {
      if (div) {
        const isOverflow = div.scrollWidth > div.offsetWidth;
        setOverflow(isOverflow);
      }
    };
    if (div && text) {
      check();
    } else {
      setOverflow(false);
    }
  }, [
    text
  ]);

  return (
    <Tooltip
      title={text}
      disableHoverListener={!isOverflow}
    >
      <Typography
        variant='h6'
        component='div'
        noWrap
        sx={sx}
        ref={ref}
      >
        <span>
          {text}
        </span>
      </Typography>
    </Tooltip>
  );
};

export default TitleTooltip;