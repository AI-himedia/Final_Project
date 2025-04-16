// utils/serviceUtils.js

export const getServiceType = (codes) => {
  return codes
    .map((code) => {
      switch (code) {
        case 1:
          return '문자';
        case 2:
          return '전화';
        default:
          return `알 수 없음 (${code})`;
      }
    })
    .join(', ');
};
