import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/database';
import { Calculation } from '@/entities/Calculation';

export async function GET() {
  try {
    const ds = await getDataSource();
    const repo = ds.getRepository(Calculation);
    const records = await repo.find({
      order: { createdAt: 'DESC' },
      take: 100,
    });
    return NextResponse.json({ records });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const ds = await getDataSource();
    const repo = ds.getRepository(Calculation);

    if (id) {
      await repo.delete(Number(id));
      return NextResponse.json({ message: 'Deleted successfully.' });
    } else {
      await repo.clear();
      return NextResponse.json({ message: 'All records deleted.' });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
