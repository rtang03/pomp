'use client';

import Markdown from 'markdown-to-jsx';
import type { FC } from 'react';

type Props = {
  content: string;
};

const ContentMarkdown: FC<Props> = ({ content }) => {
  return (
    <Markdown
      className="w-screen overflow-hidden text-clip md:w-[750px]"
      options={{
        forceBlock: true,
        overrides: {
          h1: { props: { className: 'h1' } },
          h2: { props: { className: 'h2' } },
          h3: { props: { className: 'h3' } }
        }
      }}
    >
      {content}
    </Markdown>
  );
};

export default ContentMarkdown;
