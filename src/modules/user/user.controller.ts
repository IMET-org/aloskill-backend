import catchAsync from "@/utils/asyncHandler.js";
import ResponseHandler from "@/utils/response.js";
import { userService } from "./user.service.js";

const getUserByEmail = catchAsync(async (req, res): Promise<void> => {
  const result = await userService.getSingleUser(req);

  const { email } = result as {
      email: string;
      role: string[];
      id: string;
      displayName: string;
      profilePicture: string;
  };

  ResponseHandler.ok(res, 'Login Successful', {
    email,
  });
});

export const userController = {
  getUserByEmail,
};
