import clsx from 'clsx';
import { DateTimeInput } from '@flumens';

type Props = any;

const DateTimeInputBlock = ({
  onChange,
  label,
  isDisabled,
  max,
  required,
  value,
}: Props) => {
  return (
    <DateTimeInput
      value={value}
      onChange={onChange}
      label={label}
      disabled={isDisabled}
      max={max}
      autoFocus={false}
      usePrettyDates
      presentation="date"
      className={clsx('date-time-input-block block', required && 'required')}
    />
  );
};

export default DateTimeInputBlock;
