import { DocumentData } from '@firebase/firestore';

export interface UserProfile extends DocumentData {
  wallet: string;
}
