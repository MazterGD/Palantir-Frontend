export const isMobileDevice = () =>
  /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
  (window.matchMedia && window.matchMedia("(max-width: 768px)").matches);

export const getDeviceScaling = () => (isMobileDevice() ? 1 : 2);
