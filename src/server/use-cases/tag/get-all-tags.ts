import { getAllTags as getAllTagsFromDb } from 'src/db/data-access/tag/get-all-tags';
import { TagsSelect } from 'src/db/schema';

export const getAllTags = async (): Promise<TagsSelect[]> => getAllTagsFromDb();
