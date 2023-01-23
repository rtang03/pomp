import TimelinedEvents from '@/Shared/TimelinedEvents';

const TimelinePage = () => {
  return (
    <>
      <div className="page-layout">
        <div className="flex-col items-center justify-between space-y-10">
          <h1 className="page-top-header px-2 md:px-0">Started</h1>
          <TimelinedEvents kind="Started" isCreatorPage isVerifier={false} />
        </div>
      </div>
    </>
  );
};

export default TimelinePage;
