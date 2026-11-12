// The logo as a PNG for emails (most email apps don't show SVG images).
import { ImageResponse } from 'next/og';
import { logoMark } from '@/lib/art.js';

export const dynamic = 'force-static';

export function GET() {
  const logo = `data:image/svg+xml;utf8,${encodeURIComponent(logoMark().replace('<svg ', '<svg width="96" height="96" '))}`;
  // eslint-disable-next-line @next/next/no-img-element
  return new ImageResponse(<img src={logo} width={96} height={96} alt="" />, { width: 96, height: 96, headers: { 'Cache-Control': 'public, max-age=86400' } });
}
