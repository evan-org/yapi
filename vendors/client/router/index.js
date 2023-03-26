import { AddProject, Follows, Group, Home, Login, Project, User } from "client/pages";

export const AppRoute = {
  home: {
    path: "/",
    component: Home
  },
  login: {
    path: "/login",
    component: Login
  },
  group: {
    path: "/group",
    component: Group
  },
  project: {
    path: "/project/:id",
    component: Project
  },
  user: {
    path: "/user",
    component: User
  },
  follow: {
    path: "/follow",
    component: Follows
  },
  addProject: {
    path: "/add-project",
    component: AddProject
  }
};
