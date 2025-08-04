// test controller
export const testController = (req, res) => {
  res.status(200).send({
    message: "Test Route",
    success: true,
  });
};
