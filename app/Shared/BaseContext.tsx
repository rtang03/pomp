import { FirebaseApp } from '@firebase/app';
import { type Dispatch, createContext, useContext } from 'react';

export type TContext = {
  devMode: boolean;
  setDevMode: Dispatch<boolean>;
  fbApp: FirebaseApp | undefined;
  setFbApp: Dispatch<any>;
};

export const BaseContext = createContext<TContext>({
  devMode: true,
  setDevMode: () => {},
  fbApp: undefined,
  setFbApp: () => {}
});

const useBaseContext = () => useContext(BaseContext);

export default useBaseContext;
