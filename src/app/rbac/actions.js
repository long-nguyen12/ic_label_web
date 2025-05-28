import { ACTIONS } from '@app/rbac/commons';

const actions = {};
ACTIONS.map(resource => {
  actions[resource.code] = {
    code: resource.code,
    description: resource.description,
  };
});

export default actions;

// function createAction(code, description) {
//   return {
//     code: code,
//     description: description,
//   };
// }
// export default {
//   ALL: createAction('ALL', 'Tất cả'),
//   CREATE: createAction('CREATE', 'Thêm mới'),
//   READ: createAction('READ', 'Xem'),
//   UPDATE: createAction('UPDATE', 'Chỉnh sửa'),
//   DELETE: createAction('DELETE', 'Xóa'),
// };
