export const success = (
  res,
  message = "Success",
  data = null,
  meta = null,
  code = 200
) => {
  return res.status(code).json({
    success: true,
    message,
    data,
    meta,
  });
};
