import { BigNumber } from 'ethers';
import type { MissionStruct } from 'src/types';

export {};
/**
 * Resolves normal and eth username
 * @param username - User's username
 * @returns normal or eth username
 */
export const formatUsername = (username: string | null | undefined) => {
  if (!username) return '';

  let regex = /^0x[a-fA-F0-9]{40}$/g;
  if (username.match(regex)) {
    // Skip over ENS names
    if (username.includes('.')) return username;

    return `${username.slice(0, 4)}…${username.slice(username.length - 4, username.length)}`;
  } else {
    return username;
  }
};

export const removeHandleSuffix = (handle: string | undefined) =>
  handle?.replace('.test', '')?.replace('.lens', '');

export const formatDate = (
  _updatedAt: Date | string | number,
  message: string | undefined = 'Last saved'
) =>
  `${message ? message + ' at' : ''} ${Intl.DateTimeFormat('en', { month: 'short' }).format(
    new Date(_updatedAt)
  )} ${Intl.DateTimeFormat('en', { day: '2-digit' }).format(
    new Date(_updatedAt)
  )} ${Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: 'numeric'
  }).format(new Date(_updatedAt))}`;

export const getMissionId = (mission: MissionStruct & { missionId: number }) =>
  `${mission.profileId}-${BigNumber.from(mission.missionId).toHexString()}`;
