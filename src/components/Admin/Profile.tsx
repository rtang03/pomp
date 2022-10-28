import { useAppContext } from '@components/AppContext';
import Loader from '@components/UI/Loader';
import { doc } from '@firebase/firestore';
import { elog } from '@utils/consoleLog';
import { useEffect, useRef } from 'react';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import toast from 'react-hot-toast';
import type { UserProfile } from 'src/types';

const Profile = () => {
  const { firestore, user } = useAppContext();
  const mounted = useRef<boolean>(false);
  const [profile, loading, error] = useDocumentData<UserProfile>(
    doc(firestore as any, 'profiles', user?.uid as string) as any,
    {
      snapshotListenOptions: { includeMetadataChanges: true }
    }
  );

  useEffect(() => {
    if (error && !mounted.current) {
      mounted.current = true;
      elog('[Profile]', error);
      toast.error('Something bad happens');
    }
  }, [error]);

  return (
    <>
      {loading ? (
        <Loader className="h-[500px]" />
      ) : (
        <>{profile && user && <div className="ml-10">{user.uid}</div>}</>
      )}
    </>
  );
};

export default Profile;
