
import React from 'react';

const iconProps = {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 20 20",
    fill: "currentColor",
};

export const KeyIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg {...iconProps} className={className}>
        <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
    </svg>
);

export const CopyIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg {...iconProps} className={className}>
        <path d="M7 3.5A1.5 1.5 0 0 1 8.5 2h5A1.5 1.5 0 0 1 15 3.5v5A1.5 1.5 0 0 1 13.5 10h-5A1.5 1.5 0 0 1 7 8.5v-5Zm1.5-.5a.5.5 0 0 0-.5.5v5a.5.5 0 0 0 .5.5h5a.5.5 0 0 0 .5-.5v-5a.5.5 0 0 0-.5-.5h-5Z" />
        <path d="M2 5.5A1.5 1.5 0 0 1 3.5 4h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 0-.5.5v5a.5.5 0 0 0 .5.5h5a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 1 1 0v1A1.5 1.5 0 0 1 9.5 14h-5A1.5 1.5 0 0 1 3 12.5v-5A1.5 1.5 0 0 1 4.5 6h1a.5.5 0 0 1 0-1h-1A1.5 1.5 0 0 1 2 5.5Z" />
    </svg>
);

export const CheckIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg {...iconProps} className={className}>
        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.052-.143Z" clipRule="evenodd" />
    </svg>
);

export const TrashIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg {...iconProps} className={className}>
        <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75V4.5h8V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 0a4.25 4.25 0 0 0-4.25 4.25V4.5h8.5V4.25A4.25 4.25 0 0 0 10 0ZM4.5 5.5a.5.5 0 0 0 0 1h11a.5.5 0 0 0 0-1h-11ZM5 6.5v9A1.5 1.5 0 0 0 6.5 17h7a1.5 1.5 0 0 0 1.5-1.5v-9H5Zm1.5 1a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0v-6a.5.5 0 0 1 .5-.5Zm3.5 0a.5.5
 0 0 1 .5.5v6a.5.5 0 0 1-1 0v-6a.5.5 0 0 1 .5-.5Z" clipRule="evenodd" />
    </svg>
);

export const EyeOpenIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg {...iconProps} className={className}>
        <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
        <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.18l.88-1.467a1.65 1.65 0 0 1 1.505-.882H16.95a1.65 1.65 0 0 1 1.505.882l.88 1.467c.368.612.368 1.38 0 1.992l-.88 1.467a1.65 1.65 0 0 1-1.505.882H3.05a1.65 1.65 0 0 1-1.505-.882l-.88-1.467ZM1.82 10a.5.5 0 0 1-.06-.223l.88-1.467a.5.5 0 0 1 .456-.269h13.908a.5.5 0 0 1 .456.27l.88 1.466a.5.5 0 0 1 0 .446l-.88 1.467a.5.5 0 0 1-.456.269H3.05a.5.5 0 0 1-.456-.27l-.88-1.466a.5.5 0 0 1 .06-.223Z" clipRule="evenodd" />
    </svg>
);

export const EyeSlashedIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg {...iconProps} className={className}>
        <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
        <path fillRule="evenodd" d="M3.973 5.244c.39-.652.997-1.21 1.72-1.634l-.987-.987a.75.75 0 0 1 1.06-1.06l12.25 12.25a.75.75 0 0 1-1.06 1.06l-1.954-1.954A10.53 10.53 0 0 1 10 14c-3.456 0-6.52-2.013-8.177-5.008a1.651 1.651 0 0 1 0-1.18c.31-.517.676-.99 1.08-1.403l.042.042a.75.75 0 0 1-1.06-1.06l-.987-.987ZM10 6a4 4 0 0 0-3.633 2.266l1.367 1.367a2.5 2.5 0 0 1 3.332 3.332l1.367 1.367A4 4 0 0 0 10 6Z" clipRule="evenodd" />
        <path d="M16.95 7.118a1.65 1.65 0 0 1 1.505.882l.88 1.467c.368.612.368 1.38 0 1.992l-.88 1.467a1.65 1.65 0 0 1-1.505.882H8.45l-2.12-2.121c.23-.203.48-.39.748-.56C7.99 10.99 8.96 10.5 10 10.5c.353 0 .696.03.1028.088l2.12-2.12c.053.01.105.022.157.035l2.645-2.645Z" />
    </svg>
);
