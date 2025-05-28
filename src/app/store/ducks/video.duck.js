export const actionTypes = {
  Video: 'App/Video',
  SetVideo: 'App/SetVideo',
  GetVideo: 'App/GetVideo',
  ClearVideo: 'App/ClearVideo',
};

const initialState = {
  locationVideo: null,
};
export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.ClearVideo: {
      return Object.assign({}, state, { locationVideo: null });
    }
    case actionTypes.SetVideo: {
      const locationVideo = action.payload?.data;
      return Object.assign({}, state, { locationVideo });
    }
    default:
      return state;
  }
};

export const actions = {
  video: (data) => ({ type: actionTypes.Video, payload: { data } }),
  setVideo: (data) => ({ type: actionTypes.SetVideo, payload: { data } }),
  clearVideo: () => ({ type: actionTypes.ClearVideo, payload: { locationVideo: null } }),
};

export function* saga() {
}
