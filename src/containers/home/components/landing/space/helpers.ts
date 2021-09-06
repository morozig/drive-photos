const easeInOutSine = (
  time: number, 
  timeFrom: number,
  timeTo: number,
  valFrom: number,
  valTo: number,
) => -(valTo - valFrom) / 2 * (
  Math.cos(Math.PI * (time - timeFrom) / (timeTo - timeFrom)) - 1
) + valFrom;

const easeInOutCap = (
  time: number, 
  timeFrom: number,
  timeCapFraction: number,
  timeTo: number,
  valFrom: number,
  valCap: number,
  valTo: number,
) => {
  const timeCap = timeFrom + (timeTo - timeFrom) * timeCapFraction;

  // console.log({
  //   time, 
  //   timeFrom,
  //   timeCap,
  //   timeTo,
  //   valFrom,
  //   valCap,
  //   valTo
  // });
  if (time < timeCap) {
    return easeInOutSine(time, timeFrom, timeCap, valFrom, valCap);
  } else if (time < timeTo - timeCap) {
    return valCap;
  } else {
    return easeInOutSine(time, timeTo - timeCap, timeTo, valCap, valTo);
  }
};

export {
  easeInOutSine,
  easeInOutCap
};
