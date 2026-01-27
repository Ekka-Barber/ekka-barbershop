import { TIME } from '@shared/constants/time';

export const SIDEBAR_COOKIE_NAME = 'sidebar:state';
export const SIDEBAR_COOKIE_MAX_AGE =
  TIME.SECONDS_PER_MINUTE *
  TIME.SECONDS_PER_MINUTE *
  TIME.HOURS_PER_DAY *
  TIME.DAYS_PER_WEEK;
export const SIDEBAR_KEYBOARD_SHORTCUT = 'b';

export const SIDEBAR_WIDTH = '16rem';
export const SIDEBAR_WIDTH_MOBILE = '75vw';
export const SIDEBAR_WIDTH_ICON = '3rem';
