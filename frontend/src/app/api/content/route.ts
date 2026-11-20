import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function getContentFilePaths(): { srcPath: string; publicPath: string | null } {
  // Look in both potential directory roots depending on CWD
  const srcPaths = [
    path.join(process.cwd(), 'src/data/portfolioContent.json'),
    path.join(process.cwd(), 'frontend/src/data/portfolioContent.json'),
    path.join(__dirname, '../../../../src/data/portfolioContent.json'),
  ];

  let srcPath = path.join(process.cwd(), 'src/data/portfolioContent.json');
  for (const p of srcPaths) {
    if (fs.existsSync(p)) {
      srcPath = p;
      break;
    }
  }

  const publicPaths = [
    path.join(process.cwd(), 'public/portfolioContent.json'),
    path.join(process.cwd(), 'frontend/public/portfolioContent.json'),
    path.join(__dirname, '../../../../public/portfolioContent.json'),
  ];

  let publicPath: string | null = null;
  for (const p of publicPaths) {
    if (fs.existsSync(p)) {
      publicPath = p;
      break;
    }
  }

  return { srcPath, publicPath };
}

/**
 * GET /api/content
 * Returns the current portfolioContent.json from disk
 */
export async function GET() {
  try {
    const { srcPath } = getContentFilePaths();
    if (!fs.existsSync(srcPath)) {
      return NextResponse.json(
        { error: 'portfolioContent.json file not found' },
        { status: 404 }
      );
    }

    const fileContent = fs.readFileSync(srcPath, 'utf-8');
    const data = JSON.parse(fileContent);

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to read portfolio content', details: err.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/content
 * Updates portfolioContent.json directly on disk (both src/data and public)
 * Local-only security check to prevent public mutation
 */
export async function POST(request: Request) {
  const host = request.headers.get('host') || '';
  const isLocal =
    host.includes('localhost') ||
    host.includes('127.0.0.1') ||
    host.includes('0.0.0.0') ||
    host.includes('::1');

  if (!isLocal && process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Editing is restricted to the local development environment.' },
      { status: 403 }
    );
  }

  try {
    const updatedContent = await request.json();

    if (!updatedContent || typeof updatedContent !== 'object' || !updatedContent.personal) {
      return NextResponse.json(
        { error: 'Invalid portfolio content structure. "personal" object is required.' },
        { status: 400 }
      );
    }

    const { srcPath, publicPath } = getContentFilePaths();
    const formattedJson = JSON.stringify(updatedContent, null, 2) + '\n';

    await fs.promises.writeFile(srcPath, formattedJson, 'utf-8');
    if (publicPath) {
      await fs.promises.writeFile(publicPath, formattedJson, 'utf-8');
    }

    return NextResponse.json({
      success: true,
      message: 'Portfolio content saved successfully to portfolioContent.json',
      updatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to write portfolio content to disk', details: err.message },
      { status: 500 }
    );
  }
}
