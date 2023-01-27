import Main from './Main';

const ProfilePage = async () => {
  return (
    <div className="page-layout">
      <div className="flex-col items-center justify-between">
        <h1 className="page-top-header">Profile</h1>
        <Main />
      </div>
    </div>
  );
};

export default ProfilePage;
