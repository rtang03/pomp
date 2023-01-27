import { NextSeo } from 'next-seo';
import NEXT_SEO_DEFAULT from 'next-seo.config';

const Head = () => <NextSeo {...NEXT_SEO_DEFAULT} useAppDir />;

export default Head;
