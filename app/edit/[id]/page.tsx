import Main from './Main';

const EditMissionPage = async ({ params }: { params: { id: string } }) => {
  return (
    <div className="mx-auto max-w-screen-lg grow px-0">
      <Main id={params.id} />
    </div>
  );
};

export default EditMissionPage;
