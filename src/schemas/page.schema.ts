import * as mongoose from 'mongoose';

export const pageSchema = new mongoose.Schema({
  name: String,
  alias: String,
  content: String,
});
