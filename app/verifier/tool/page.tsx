import Main from './Main';

const ToolPage = async () => {
  return (
    <div className="mx-auto max-w-screen-lg grow px-2">
      <div className="flex-col items-center justify-between">
        <h1 className="page-top-header hidden md:block">Generate challenge</h1>
        <Main />
      </div>
    </div>
  );
};

export default ToolPage;
