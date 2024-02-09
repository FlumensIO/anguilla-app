import clsx from 'clsx';
import { Main } from '@flumens';

type Props = { className?: string; children: any; skipPadding?: boolean };

const MainWithPadding = ({ children, className, skipPadding }: Props) => {
  return (
    <Main>
      <div
        className={clsx(
          skipPadding && 'h-full min-h-full w-full',
          !skipPadding &&
            ' mx-auto h-fit min-h-full w-full max-w-xl bg-[var(--ion-content-background)] px-[4%] py-3',
          className
        )}
      >
        {children}
      </div>
    </Main>
  );
};

export default MainWithPadding;
