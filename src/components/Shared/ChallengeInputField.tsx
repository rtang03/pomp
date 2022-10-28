import Input from '@components/UI/Input';
import { type FC, type ReactNode } from 'react';

type Props = { setFieldValue: any; disabled: boolean; prefix?: ReactNode };

const ChallengeInputField: FC<Props> = ({ setFieldValue, disabled, prefix }) => {
  return (
    <div>
      <h2 className="page-section-title text-start">Challenge</h2>
      <Input
        prefix={prefix}
        disabled={disabled}
        autoComplete="off"
        className="text-[10px] placeholder:text-[8px] focus:ring-0 md:text-sm md:placeholder:text-sm"
        id="challenge"
        name="challenge"
        placeholder="CUZX5qE8Wvye6kS_SasIsa8MMxacJftmWdsIA_iKp3I"
        type="text"
        setFieldValue={setFieldValue}
      />
    </div>
  );
};

export default ChallengeInputField;
