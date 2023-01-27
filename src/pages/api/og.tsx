import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const config = { runtime: 'edge' };

export default async function handler(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const title = searchParams.get('title');
    const imageurl = searchParams.get('imageurl');

    return !imageurl
      ? new ImageResponse(
          (
            <div
              style={{
                display: 'flex',
                height: '100%',
                width: '100%',
                padding: '10px 20px',
                alignItems: 'center',
                alignContent: 'center',
                justifyContent: 'center',
                fontFamily: 'Inter, "Material Icons"',
                fontSize: 40,
                textAlign: 'center',
                backgroundColor: 'white'
              }}
            >
              👋😄 Hello! 你好! 안녕! こんにちは! Χαίρετε! Hallå! &#xe766;
            </div>
          ),
          {
            width: 1200,
            height: 630
          }
        )
      : new ImageResponse(
          (
            <div
              style={{
                display: 'flex',
                fontSize: 60,
                color: 'black',
                background: '#f6f6f6',
                width: '100%',
                height: '100%',
                paddingTop: 50,
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <img
                width="256"
                height="256"
                src={imageurl}
                style={{
                  borderRadius: 128
                }}
                alt=""
              />
              <p>{title}</p>
            </div>
          ),
          {
            width: 1200,
            height: 630
          }
        );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500
    });
  }
}
