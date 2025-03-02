import { db } from 'src/db';
import { tags, TagsSelect } from 'src/db/schema';

export const getAllTags = async (): Promise<TagsSelect[]> =>
  db.select().from(tags).orderBy(tags.name);
