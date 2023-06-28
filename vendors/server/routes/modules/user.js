import Router from "koa-router";
import { Container } from "typedi";
import { UserService } from "../../models/modules/user";

export const userRouter = new Router();

userRouter.get("/", async(ctx) => {
  ctx.body = {
    txt: "hello aQiang",
  };
});

userRouter.get("/userlist", async(ctx) => {
  const userService = Container.get(UserService);
  ctx.body = {
    userList: await userService.findAll(),
  };
});
