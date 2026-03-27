import Input from '@flumens/tailwind/dist/components/Input';
import TextArea from '@flumens/tailwind/dist/components/TextArea';
import type { HTMLInputTypeAttribute } from 'react';

type Props = {
  value?: string;
  label?: string;
  onChange: (value: string) => void;
  appearance?: 'multiline';
  isDisabled?: boolean;
  required?: boolean;
  placeholder?: string;
  description?: string;
  platform?: 'ios';
  inputType?: HTMLInputTypeAttribute;
};

const TextInput = ({
  value,
  label,
  onChange,
  appearance,
  isDisabled,
  required,
  placeholder,
  description,
  platform,
  inputType,
}: Props) => {
  if (appearance === 'multiline') {
    return (
      <TextArea
        onChange={onChange}
        value={value}
        isDisabled={isDisabled}
        isRequired={required}
        label={label}
        platform={platform}
        description={description}
        placeholder={placeholder}
        labelPlacement={platform === 'ios' ? 'floating' : undefined}
        className="text-input-block"
      />
    );
  }

  return (
    <Input
      onChange={onChange}
      value={value}
      isDisabled={isDisabled}
      isRequired={required}
      label={label}
      platform={platform}
      description={description}
      placeholder={placeholder}
      type={inputType || 'text'}
      className="text-input-block"
    />
  );
};

export default TextInput;
