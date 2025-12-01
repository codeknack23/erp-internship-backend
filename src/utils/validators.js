const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i;

const isValidGST = (gst) => {
  if (!gst) return false;
  gst = gst.trim();  // Remove leading/trailing spaces
  return gstRegex.test(gst);
};

module.exports = { isValidGST };
