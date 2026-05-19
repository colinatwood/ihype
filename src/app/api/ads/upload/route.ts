import { uploadToR2 } from '@/lib/r2';

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return Response.json({ error: 'No file provided' }, { status: 400 });
  }

  let creativeAssetUrl: string;

  const result = await uploadToR2({ file, path: `ads/${Date.now()}-${file.name}` });
  creativeAssetUrl = result.url;

  return Response.json({ url: creativeAssetUrl });
}
