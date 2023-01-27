import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const config = { runtime: 'edge' };

const trimify = (value: string): string => value?.replace(/\n\s*\n/g, '\n\n').trim();
const MESSAGE = 'Mission Achieved';
const FONTSIZE = 32;
const defaultTheme = 'light';

export default async function handler(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const title = searchParams.get('title');
  const _fontsize = searchParams.get('fontsize');
  const isDefault =
    searchParams.get('theme') === defaultTheme || searchParams.get('theme') === null;
  const color = isDefault ? 'black' : 'white';
  const background = isDefault ? 'white' : 'black';

  let fontSize = FONTSIZE;
  try {
    fontSize = _fontsize ? parseInt(_fontsize, 10) : FONTSIZE;
  } catch {}

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          fontSize,
          fontWeight: 600,
          color,
          background,
          width: '100%',
          height: '100%',
          textAlign: 'center',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
          style={{ height: '200px', width: '200px' }}
        >
          <defs>
            <filter id="shadow-1" height="300%" width="300%" x="-100%" y="-100%">
              <feFlood floodColor="rgba(253, 235, 5, 1)" result="flood"></feFlood>
              <feComposite
                in="flood"
                in2="SourceGraphic"
                operator="atop"
                result="composite"
              ></feComposite>
              <feGaussianBlur in="composite" stdDeviation="20" result="blur"></feGaussianBlur>
              <feOffset result="offset"></feOffset>
              <feComposite in="SourceGraphic" in2="offset" operator="over"></feComposite>
            </filter>
            <radialGradient id="delapouite-star-formation-gradient-1">
              <stop offset="0%" stopColor="#e5eb70" stopOpacity="1"></stop>
              <stop offset="100%" stopColor="#090719" stopOpacity="1"></stop>
            </radialGradient>
          </defs>
          <g transform="tranclassName(0,0)">
            <path
              d="M143.627 36.361c-2.18 0-16.495 38.303-18.258 39.584-1.763 1.281-42.615 3.06-43.289 5.133-.673 2.073 31.33 27.523 32.004 29.596.674 2.073-10.26 41.475-8.496 42.756 1.763 1.28 35.86-21.291 38.039-21.291 2.18 0 36.276 22.572 38.039 21.29 1.763-1.28-9.17-40.682-8.496-42.755.673-2.073 32.677-27.523 32.004-29.596-.674-2.073-41.526-3.852-43.29-5.133-1.763-1.28-16.077-39.584-18.257-39.584zm224.746 0c-2.18 0-16.494 38.303-18.258 39.584-1.763 1.281-42.615 3.06-43.289 5.133-.673 2.073 31.33 27.523 32.004 29.596.674 2.073-10.26 41.475-8.496 42.756 1.763 1.28 35.86-21.291 38.039-21.291 2.18 0 36.276 22.572 38.04 21.29 1.762-1.28-9.17-40.682-8.497-42.755.674-2.073 32.677-27.523 32.004-29.596-.674-2.073-41.526-3.852-43.29-5.133-1.762-1.28-16.077-39.584-18.257-39.584zM256 39.883c-7.12 0-53.884 125.123-59.645 129.308-5.76 4.185-139.211 9.996-141.412 16.768-2.2 6.772 102.349 89.912 104.55 96.684 2.2 6.771-33.513 135.486-27.753 139.671C137.5 426.5 248.88 352.76 256 352.76c7.12 0 118.5 73.74 124.26 69.554 5.76-4.185-29.952-132.9-27.752-139.671 2.2-6.772 106.749-89.912 104.549-96.684-2.2-6.772-135.652-12.583-141.412-16.768-5.76-4.185-52.525-129.308-59.645-129.308zM77.973 243.102c-2.18 0-16.495 38.302-18.258 39.584-1.763 1.28-42.616 3.06-43.29 5.132-.673 2.073 31.333 27.523 32.007 29.596.673 2.073-10.26 41.475-8.496 42.756 1.763 1.281 35.857-21.291 38.037-21.291 2.18 0 36.275 22.572 38.039 21.29 1.763-1.28-9.17-40.682-8.496-42.755.673-2.073 32.679-27.523 32.005-29.596-.673-2.073-41.525-3.851-43.289-5.132-1.763-1.282-16.08-39.584-18.26-39.584zm356.054 0c-2.18 0-16.496 38.302-18.26 39.584-1.763 1.28-42.615 3.06-43.288 5.132-.674 2.073 31.332 27.523 32.005 29.596.674 2.073-10.26 41.475-8.496 42.756 1.764 1.281 35.86-21.291 38.04-21.291 2.179 0 36.273 22.572 38.036 21.29 1.764-1.28-9.17-40.682-8.496-42.755.674-2.073 32.68-27.523 32.006-29.596-.673-2.073-41.526-3.851-43.289-5.132-1.763-1.282-16.078-39.584-18.258-39.584zM256 369.932c-2.18 0-16.494 38.302-18.258 39.584-1.763 1.28-42.615 3.06-43.289 5.132-.673 2.073 31.33 27.525 32.004 29.598.674 2.073-10.26 41.475-8.496 42.756 1.763 1.281 35.86-21.293 38.039-21.293 2.18 0 36.276 22.574 38.04 21.293 1.762-1.281-9.17-40.683-8.497-42.756.673-2.073 32.677-27.525 32.004-29.598-.674-2.072-41.526-3.851-43.29-5.132-1.763-1.282-16.077-39.584-18.257-39.584z"
              fill="url(#delapouite-star-formation-gradient-1)"
              filter="url(#shadow-1)"
            ></path>
          </g>
        </svg>
        <div style={{ marginTop: 5 }}>{trimify(title || MESSAGE)}</div>
      </div>
    ),
    {
      width: 350,
      height: 350
    }
  );
}
