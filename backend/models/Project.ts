import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  projectName: string;
  roomType: string;
  designStyle: string;
  budget: number;
  ownership: string;
  direction: string;
  location: string;
  textAnalysis: string;
  vastuDetails: string;
  colorPalette: string[];
  detectedObjects: any[];
  originalImageUrl: string;
  daylightImageUrl: string;
  nighttimeImageUrl: string;
  labelledImageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema: Schema = new Schema(
  {
    projectName: { type: String, default: "Untitled Project" },
    roomType: { type: String, default: "Room" },
    designStyle: { type: String, default: "Modern" },
    budget: { type: Number, default: 0 },
    ownership: { type: String, default: "own" },
    direction: { type: String, default: "North" },
    location: { type: String, default: "Unknown" },
    textAnalysis: { type: String, default: "" },
    vastuDetails: { type: String, default: "" },
    colorPalette: { type: [String], default: [] },
    detectedObjects: { type: [Schema.Types.Mixed], default: [] },
    originalImageUrl: { type: String, default: "" },
    daylightImageUrl: { type: String, default: "" },
    nighttimeImageUrl: { type: String, default: "" },
    labelledImageUrl: { type: String, default: "" },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// To normalize _id to id in JSON conversions, mimicking the previous output exactly:
ProjectSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
  }
});

export default mongoose.model<IProject>('Project', ProjectSchema);
