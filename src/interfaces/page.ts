import { Document } from 'mongoose';

export interface Page extends Document {
  name: string;
  alias: string;
  content: string;
}
