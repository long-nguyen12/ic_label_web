export const colors = {
  inputRequire: '#00000073',
  title: '#4759ba',
};

export const notify = {
  errorRequired: 'Xin vui lòng điền đầy đủ thông tin!',
  // errorApi: "Phiên làm việc của bạn đã hết hạn! Xin vui lòng đăng nhập lại.",
  errorApi: 'MES_DEFAULT',
  loadingTitle: 'Hệ thống đang xử lý!',
  loadingContent: 'Xin vui lòng chờ trong giây lát...',
};

export function formatNumber(value) {
  return value?.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}

export function convertDigitIn(str) {
  return str.split("-").reverse().join("-");
}
