const AvatarModel = require("@server/models/AvatarModel.js");
const BaseModel = require("@server/models/BaseModel.js");
const FollowModel = require("@server/models/FollowModel.js");
const GroupModel = require("@server/models/GroupModel.js");
const InterfaceCaseModel = require("@server/models/InterfaceCaseModel.js");
const InterfaceCatModel = require("@server/models/InterfaceCatModel.js");
const InterfaceColModel = require("@server/models/InterfaceColModel.js");
const InterfaceModel = require("@server/models/InterfaceModel.js");
const LogModel = require("@server/models/LogModel.js");
const StorageModel = require("@server/models/StorageModel.js");
const ProjectModel = require("@server/models/ProjectModel.js");
const TokenModel = require("@server/models/TokenModel.js");
const UserModel = require("@server/models/UserModel.js");
//
module.exports = {
  AvatarModel: AvatarModel,
  BaseModel: BaseModel,
  FollowModel: FollowModel,
  GroupModel: GroupModel,
  InterfaceCaseModel: InterfaceCaseModel,
  InterfaceCatModel: InterfaceCatModel,
  InterfaceColModel: InterfaceColModel,
  InterfaceModel: InterfaceModel,
  LogModel: LogModel,
  ProjectModel: ProjectModel,
  StorageModel: StorageModel,
  TokenModel: TokenModel,
  UserModel: UserModel
}
