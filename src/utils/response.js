export const success = (
  res,
  {
    message = "Success",
    data = null,
    meta = null,
    code = 200,
  } = {}
) => {
  return res.status(code).json({
    success: true,
    message,
    data,
    meta,
  });
};

export const error = (
  res,
  {
    message = "Error",
    errors = null,
    code = 400,
  } = {}
) => {
  return res.status(code).json({
    success: false,
    message,
    errors,
  });
};
