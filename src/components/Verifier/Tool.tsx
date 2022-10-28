import { useAppContext } from '@components/AppContext';
import { VerifierNavMenu } from '@components/Shared/Navbar/TopNavMenu';
import { LinkTextButton } from '@components/UI/Button';
import type { NextPageWithLayout } from '@pages/_app';
import { elog } from '@utils/consoleLog';
import { Form, Formik } from 'formik';
import { useState } from 'react';

const Tool: NextPageWithLayout = () => {
  const { dev } = useAppContext();
  const [pkce, setPkce] = useState<{ code_verifier: string; code_challenge: string }>();
  const [error, setError] = useState<Error>();

  return (
    <>
      <VerifierNavMenu />
      <div className="mx-auto max-w-screen-lg grow px-2">
        <div className="flex-col items-center justify-between">
          <h1 className="page-top-header hidden md:block">Generate challenge</h1>
          <div className="space-y-6">
            <h2 className="page-section-title">
              <Formik
                initialValues={{}}
                onSubmit={async (_, { setSubmitting }) => {
                  setSubmitting(true);
                  await fetch('/api/generateChallenge')
                    .then(async (res) => {
                      if (res.ok) {
                        return res.json();
                      } else {
                        dev && elog('[Verifier]', await res.text());
                        setError(new Error('fail to generate pkce-challenge'));
                      }
                    })
                    .then((json) => json && setPkce(json));
                  setSubmitting(false);
                }}
              >
                {({ isSubmitting, submitForm }) => (
                  <Form>
                    <div>
                      <LinkTextButton
                        disabled={isSubmitting}
                        text={'Generate Challenge'}
                        handleClick={() => submitForm()}
                      />
                    </div>
                  </Form>
                )}
              </Formik>
            </h2>
            {pkce && (
              <>
                <div>
                  <h2 className="page-section-title">Verifier</h2>
                  <div className="text-[10px] md:text-base">{pkce.code_verifier}</div>
                </div>
                <div>
                  <h2 className="page-section-title">Challenge</h2>
                  <div className="text-[10px] md:text-base">{pkce.code_challenge}</div>
                </div>
              </>
            )}
            {error && <div>Something bad happens.</div>}
          </div>
        </div>
      </div>
    </>
  );
};

Tool.getLayout = (page) => <>{page}</>;

export default Tool;
