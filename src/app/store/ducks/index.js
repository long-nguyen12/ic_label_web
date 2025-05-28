import * as app from './app.duck';
import * as user from './user.duck';
import * as rerender from '@app/store/ducks/rerender.duck';
import * as video from '@app/store/ducks/video.duck';
import * as locale from '@app/store/ducks/locale.duck';

export const DUCKS = {
  app,
  user,
  rerender,
  locale,
  video,
};
