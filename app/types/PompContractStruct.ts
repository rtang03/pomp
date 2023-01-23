export type ProfileStruct = {
  missionCount: number;
  handle: string;
  owner: string;
};

export const isProfileStruct = (input: any): input is ProfileStruct & Record<string, any> =>
  input.missionCount !== undefined && input.handle !== undefined && input.owner !== undefined;

export enum MissionState {
  nftDeposited,
  aborted,
  completed,
  verified,
  failed
}

export type MissionStruct = {
  owner: string;
  profileId: string | null;
  tokenId: string | null;
  starttime: number;
  endtime: number;
  verifier: string;
  challengeHash: string;
  state: MissionState;
  creator: string;
};

export const isMissionStruct = (input: any): input is MissionStruct & Record<string, any> =>
  input.owner !== undefined &&
  input.profileId !== undefined &&
  input.tokenId !== undefined &&
  input.starttime !== undefined &&
  input.endtime !== undefined &&
  input.verifier !== undefined &&
  input.challengeHash !== undefined &&
  input.state !== undefined &&
  input.creator !== undefined;
