
import { ComponentPropsWithoutRef } from 'react';

const RiyalIcon = ({ className, ...props }: ComponentPropsWithoutRef<"svg">) => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M3.33331 12.6667V3.33334H4.66665V5.33334H6.66665C8.13998 5.33334 9.33331 6.52668 9.33331 8.00001C9.33331 9.47334 8.13998 10.6667 6.66665 10.6667H4.66665V12.6667H3.33331ZM4.66665 9.33334H6.66665C7.40331 9.33334 7.99998 8.73668 7.99998 8.00001C7.99998 7.26334 7.40331 6.66668 6.66665 6.66668H4.66665V9.33334Z"
        fill="currentColor"
      />
      <path
        d="M12 12.6667L9.33331 8.00001L12 3.33334H13.3333L10.6666 8.00001L13.3333 12.6667H12Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default RiyalIcon;
