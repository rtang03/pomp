'use client';

import { useMissionByChallenge } from '@hooks/useProfileMissionQuery';
import { Form, Formik } from 'formik';
import { motion } from 'framer-motion';
import { type FC, useState } from 'react';
import { MIN_CHALLENGE_LENGTH } from 'src/constants';
import * as Yup from 'yup';

import ChallengeInputField from '../Shared/ChallengeInputField';
import SingleTMissionCard from '../Shared/SingleTMissionCard';
import { NoFeedFound } from '../UI/EmptyState';

const SearchByChallenge: FC = () => {
  const [challenge, setChallenge] = useState<string>();
  const { mission, isFetching, isError } = useMissionByChallenge(challenge as string, !challenge);

  return (
    <div className="flex-col space-y-6">
      <h2 className="page-section-title opacity-50">Search By Challenge</h2>
      <Formik
        initialValues={{ challenge: '' }}
        validationSchema={Yup.object().shape({
          challenge: Yup.string()
            .min(MIN_CHALLENGE_LENGTH, 'Code challenge too short')
            .required('Required')
        })}
        onSubmit={async ({ challenge }, { setSubmitting }) => {
          setSubmitting(true);
          setChallenge(challenge);
          setSubmitting(false);
        }}
      >
        {({ isSubmitting, setFieldValue }) => (
          <Form className="pb-10">
            <ChallengeInputField
              disabled={isSubmitting || isFetching}
              setFieldValue={setFieldValue}
              prefix={
                <motion.button
                  disabled={isSubmitting || isFetching}
                  type="submit"
                  whileTap={{ scale: 0.95 }}
                  className="md:w-32"
                >
                  <span className="hidden md:block">Search</span>
                  <span className="block md:hidden">⌘</span>
                </motion.button>
              }
            />
            {isError && <div>Something bad happens</div>}
          </Form>
        )}
      </Formik>
      {mission && mission.missionId !== 0 && (
        <SingleTMissionCard mission={mission} isVerifier isCreatorPage={false} />
      )}
      {mission && mission.missionId === 0 && (
        <NoFeedFound title="No data returned" animate={false} />
      )}
    </div>
  );
};

export default SearchByChallenge;
