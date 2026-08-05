import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(to right, #f16917, #fcbd24)',
                    color: 'white',
                    fontWeight: 700,
                    borderRadius: '8px',
                    fontSize: '18px', // Proportional to how it looks in the Navbar
                    fontFamily: 'sans-serif',
                }}
            >
                G
            </div>
        ),
        { ...size }
    );
}
