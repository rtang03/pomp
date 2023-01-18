'use client';

import { Form, Formik } from 'formik';
import type { FC, ReactNode } from 'react';

type Props = {
  saveToCloud: (arg: any) => Promise<any>;
  submitButton: (isSubmitting: boolean) => ReactNode;
};

const NewItem: FC<Props> = ({ submitButton, saveToCloud }) => (
  <Formik
    initialValues={{}}
    onSubmit={async (_, { setSubmitting }) => {
      setSubmitting(true);
      const payload = {};
      await saveToCloud(payload);
      setSubmitting(false);
    }}
  >
    {({ isSubmitting }) => <Form>{submitButton(isSubmitting)}</Form>}
  </Formik>
);

export default NewItem;
