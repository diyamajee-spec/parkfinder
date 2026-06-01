import User from "../models/User.js";


export const getAllAdminUser = async (req, res) => {
  const users = await User.find().select("-password"); // remove password
  res.json({ success: true, data: users });
}
export const updateAdminUser =  async (req, res) => {
  const { name, email, role } = req.body;
  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    { name, email, role },
    { new: true }
  ).select("-password");
  res.json({ success: true, data: updatedUser });
}
export const deleteAdminUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "User deleted" });
}