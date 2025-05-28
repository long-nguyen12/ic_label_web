export const actionTypes = {
  SetRerenderAnhViTri: 'Rerender/SetRerenderAnhViTri',
  SetRerenderKetQua: 'Rerender/SetRerenderKetQua',
  SetRerenderProvider: 'Rerender/SetRerenderProvider',
};

const initialState = {
  stateRerenderAnhViTri: 0,
  stateRerenderKetQua: 0,
  rerenderProvider: 0,
};
export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SetRerenderAnhViTri: {
      const { stateRerenderAnhViTri } = state;
      return Object.assign({}, state, { stateRerenderAnhViTri: stateRerenderAnhViTri + 1 });
    }
    case actionTypes.SetRerenderKetQua: {
      const { stateRerenderKetQua } = state;
      return Object.assign({}, state, { stateRerenderKetQua: stateRerenderKetQua + 1 });
    }
    case actionTypes.SetRerenderProvider: {
      const { rerenderProvider } = state;
      return Object.assign({}, state, { rerenderProvider: rerenderProvider + 1 });
    }

    default:
      return state;
  }
};

export const actions = {
  rerenderAnhViTri: () => ({ type: actionTypes.SetRerenderAnhViTri }),
  rerenderKetQua: () => ({ type: actionTypes.SetRerenderKetQua }),
};

export function* saga() {
}
