import mongoose, { Document, Schema } from 'mongoose';

// Interface for Google OAuth tokens
export interface GoogleTokens {
  access_token: string;
  refresh_token?: string;
  scope: string;
  token_type: string;
  expiry_date: number;
}

// Interface for User document
export interface IUser extends Document {
  googleId: string;
  email: string;
  name: string;
  profilePicture?: string;
  tokens: GoogleTokens;
  createdAt: Date;
  updatedAt: Date;
}

// Schema for User
const UserSchema: Schema = new Schema({
  googleId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  profilePicture: { type: String },
  tokens: {
    access_token: { type: String, required: true },
    refresh_token: { type: String },
    scope: { type: String, required: true },
    token_type: { type: String, required: true },
    expiry_date: { type: Number, required: true }
  }
}, {
  timestamps: true
});

// Create and export the User model
export default mongoose.model<IUser>('User', UserSchema); 