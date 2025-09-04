import moment from 'moment-timezone';

export const convertRelativeTz = (
  publishTime: string,
  userTimezone: string,
) => {
  try {
    const zonedISO = moment.tz(publishTime, userTimezone).format();
    return zonedISO;
  } catch (error) {
    console.error('Error converting timezone:', error);
    return null;
  }
};
