import { onDemainFixturesBasePath } from "fixtures/config";

const usersInfo = {
  basePath: `${onDemainFixturesBasePath}/users`,
  filename: `list.json`,
};

export default {
  users: {
    basePath: usersInfo.basePath,
    filename: usersInfo.filename,
    filePath: `${usersInfo.basePath}/${usersInfo.filename}`,
  },
};
