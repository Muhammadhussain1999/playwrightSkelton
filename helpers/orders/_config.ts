import { onDemainFixturesBasePath } from "fixtures/config";

const publishersInfo = {
  basePath: `${onDemainFixturesBasePath}/publishers`,
  filename: `list.json`,
};
const dataPartnersInfo = {
  basePath: `${onDemainFixturesBasePath}/data_partners`,
  filename: `list.json`,
};
const dataPartnersSourcesInfo = {
  basePath: `${onDemainFixturesBasePath}/data_partners_sources`,
  filename: `list.json`,
};
const rankGroupsInfo = {
  basePath: `${onDemainFixturesBasePath}/rank_groups`,
  filename: `list.json`,
};

export default {
  data_partners: {
    basePath: dataPartnersInfo.basePath,
    filename: dataPartnersInfo.filename,
    filePath: `${dataPartnersInfo.basePath}/${dataPartnersInfo.filename}`,
  },
  data_partners_sources: {
    basePath: dataPartnersSourcesInfo.basePath,
    filename: dataPartnersSourcesInfo.filename,
    filePath: `${dataPartnersSourcesInfo.basePath}/${dataPartnersSourcesInfo.filename}`,
  },
  publishers: {
    basePath: publishersInfo.basePath,
    filename: publishersInfo.filename,
    filePath: `${publishersInfo.basePath}/${publishersInfo.filename}`,
  },
  rank_groups: {
    basePath: rankGroupsInfo.basePath,
    filename: rankGroupsInfo.filename,
    filePath: `${rankGroupsInfo.basePath}/${rankGroupsInfo.filename}`,
  },
};
