/// <reference path="../.sst/platform/config.d.ts" />

export function createUploadsBucket(): sst.aws.Bucket {
  return new sst.aws.Bucket('Uploads');
}
