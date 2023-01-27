import Main from './Main';

const VerifierPage = async () => {
  return (
    <div className="page-layout">
      <div className="flex-col items-center justify-between space-y-10 px-2">
        <h1 className="page-top-header">Find Mission</h1>
        <Main />
      </div>
    </div>
  );
};

export default VerifierPage;
