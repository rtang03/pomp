import AddRole from '@components/Admin/AddRole';
import { useAppContext } from '@components/AppContext';
import { PlayerNavMenu } from '@components/Shared/Navbar/TopNavMenu';
import Loader from '@components/UI/Loader';
import type { NextPageWithLayout } from '@pages/_app';
import Custom404 from '@pages/404';
import { useAccount } from 'wagmi';

const Admin: NextPageWithLayout = () => {
  const { user, isAuthenticating } = useAppContext();
  const { address } = useAccount();

  if (isAuthenticating) return <Loader className="h-[800-px]" />;
  if (!user && !isAuthenticating) return <Custom404 />;

  return (
    <>
      <PlayerNavMenu />
      <div className="page-layout">
        <div className="container items-center justify-start">
          <div className="page-main">
            <h1 className="page-top-header">Admin</h1>
            <AddRole kind={'CREATOR'} />
            <AddRole kind={'VERIFIER'} />
          </div>
        </div>
      </div>
    </>
  );
};

Admin.getLayout = (page) => <>{page}</>;

export default Admin;
