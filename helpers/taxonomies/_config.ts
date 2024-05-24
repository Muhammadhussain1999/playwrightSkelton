import { onDemainFixturesBasePath } from "fixtures/config";

const taxonomyInfo = {
  basePath: `${onDemainFixturesBasePath}/taxonomies`,
  filename: `list.json`,
};
const segmentInfo = {
  basePath: `${onDemainFixturesBasePath}/segments`,
  filename: `list.json`,
};

export default {
  taxonomies: {
    basePath: taxonomyInfo.basePath,
    filename: taxonomyInfo.filename,
    filePath: `${taxonomyInfo.basePath}/${taxonomyInfo.filename}`,
  },
  segments: {
    basePath: segmentInfo.basePath,
    filename: segmentInfo.filename,
    filePath: `${segmentInfo.basePath}/${segmentInfo.filename}`,
  },
};
