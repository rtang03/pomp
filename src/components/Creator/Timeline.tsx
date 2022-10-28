import { useAppContext } from '@components/AppContext';
import { CreatorNavMenu } from '@components/Shared/Navbar/TopNavMenu';
import TimelinedEvents from '@components/Shared/TimelinedEvents';
import Loader from '@components/UI/Loader';
import type { NextPageWithLayout } from '@pages/_app';
import Custom404 from '@pages/404';

const TimelinePage: NextPageWithLayout = () => {
  const { user, isAuthenticating } = useAppContext();

  if (isAuthenticating) return <Loader className="h-[800-px]" />;
  if (!user && !isAuthenticating) return <Custom404 />;

  return (
    <>
      <CreatorNavMenu />
      <div className="page-layout">
        <div className="flex-col items-center justify-between space-y-10">
          <h1 className="page-top-header px-2 md:px-0">Started</h1>
          <TimelinedEvents kind="Started" isCreatorPage isVerifier={false} />
        </div>
      </div>
    </>
  );
};

TimelinePage.getLayout = (page) => <>{page}</>;

export default TimelinePage;
