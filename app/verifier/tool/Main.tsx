'use client';

import { useAppContext } from '@components/AppContext';
import { elog } from '@utils/consoleLog';
import { Form, Formik } from 'formik';
import type { FC } from 'react';
import { useState } from 'react';

import { LinkTextButton } from '../../UI/Button';

const ToolMain: FC = () => {
  const { dev } = useAppContext();
  const [pkce, setPkce] = useState<{ code_verifier: string; code_challenge: string }>();
  const [error, setError] = useState<Error>();

  return (
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
  );
};

export default ToolMain;