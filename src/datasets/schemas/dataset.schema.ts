import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty, getSchemaPath } from "@nestjs/swagger";
import { Document } from "mongoose";
import {
  Attachment,
  AttachmentSchema,
} from "src/attachments/schemas/attachment.schema";
import { OwnableClass } from "src/common/schemas/ownable.schema";
import {
  Datablock,
  DatablockSchema,
} from "src/datablocks/schemas/datablock.schema";
import {
  OrigDatablock,
  OrigDatablockSchema,
} from "src/origdatablocks/schemas/origdatablock.schema";
import { v4 as uuidv4 } from "uuid";
import { DatasetType } from "../dataset-type.enum";
import { HistoryClass, HistorySchema } from "./history.schema";
import { LifecycleClass, LifecycleSchema } from "./lifecycle.schema";
import { RelationshipClass, RelationshipSchema } from "./relationship.schema";
import { TechniqueClass, TechniqueSchema } from "./technique.schema";

export type DatasetDocument = DatasetClass & Document;

@Schema({
  collection: "Dataset",
  minimize: false,
  timestamps: true,
  toJSON: {
    getters: true,
  },
})
export class DatasetClass extends OwnableClass {
  @ApiProperty({
    type: String,
    required: true,
    default: function genUUID(): string {
      return (process.env.PID_PREFIX ? process.env.PID_PREFIX : "") + uuidv4();
    },
    description:
      "Persistent Identifier for datasets derived from UUIDv4 and prepended automatically by site specific PID prefix like 20.500.12345/",
  })
  @Prop({
    type: String,
    unique: true,
    required: true,
    default: function genUUID(): string {
      return (process.env.PID_PREFIX ? process.env.PID_PREFIX : "") + uuidv4();
    },
  })
  pid: string;

  @Prop({
    type: String,
  })
  _id: string;

  @ApiProperty({
    type: String,
    required: true,
    description:
      "Owner or custodian of the data set, usually first name + lastname. The string may contain a list of persons, which should then be seperated by semicolons.",
  })
  @Prop({
    type: String,
    required: true,
    index: true,
  })
  owner: string;

  @ApiProperty({
    type: String,
    required: false,
    description:
      "Email of owner or of custodian of the data set. The string may contain a list of emails, which should then be seperated by semicolons.",
  })
  @Prop({
    type: String,
    required: false,
  })
  ownerEmail?: string;

  @ApiProperty({
    type: String,
    required: false,
    description:
      "ORCID of owner/custodian. The string may contain a list of ORCID, which should then be separated by semicolons.",
  })
  @Prop({
    type: String,
    required: false,
  })
  orcidOfOwner?: string;

  @ApiProperty({
    type: String,
    required: true,
    description:
      "Email of contact person for this dataset. The string may contain a list of emails, which should then be seperated by semicolons.",
  })
  @Prop({
    type: String,
    required: true,
    index: true,
  })
  contactEmail: string;

  @ApiProperty({
    type: String,
    required: true,
    description:
      "Absolute file path on file server containing the files of this dataset, e.g. /some/path/to/sourcefolder. In case of a single file dataset, e.g. HDF5 data, it contains the path up to, but excluding the filename. Trailing slashes are removed.",
  })
  @Prop({
    type: String,
    required: true,
    index: true,
    set: function stripSlash(v: string): string {
      if (v === "/") return v;
      return v.replace(/\/$/, "");
    },
  })
  sourceFolder: string;

  @ApiProperty({
    type: String,
    required: false,
    description:
      "DNS host name of file server hosting sourceFolder, optionally including protocol e.g. [protocol://]fileserver1.example.com",
  })
  @Prop({
    type: String,
    required: false,
    index: true,
  })
  sourceFolderHost?: string;

  @ApiProperty({
    type: Number,
    default: 0,
    required: true,
    description:
      "Total size of all source files contained in source folder on disk when unpacked",
  })
  @Prop({
    type: Number,
    required: true,
    index: true,
    default: 0,
  })
  size: number;

  @ApiProperty({
    type: Number,
    default: 0,
    required: false,
    description:
      "Total size of all datablock package files created for this dataset",
  })
  @Prop({ type: Number, required: false, default: 0 })
  packedSize?: number = 0;

  @ApiProperty({
    type: Number,
    default: 0,
    required: true,
    description:
      "Total number of lines in filelisting of all OrigDatablocks for this dataset",
  })
  @Prop({ type: Number, required: true, default: 0 })
  numberOfFiles: number;

  @ApiProperty({
    type: Number,
    default: 0,
    required: false,
    description:
      "Total number of lines in filelisting of all Datablocks for this dataset",
  })
  @Prop({ type: Number, default: 0, required: false })
  numberOfFilesArchived: number;

  @ApiProperty({
    type: Date,
    required: true,
    description:
      "Time when dataset became fully available on disk, i.e. all containing files have been written. Format according to chapter 5.6 internet date/time format in RFC 3339. Local times without timezone/offset info are automatically transformed to UTC using the timezone of the API server.",
  })
  @Prop({ type: Date, required: true, index: true })
  creationTime: Date;

  @ApiProperty({
    type: String,
    required: true,
    enum: [DatasetType.Raw, DatasetType.Derived],
    description:
      "Characterize type of dataset, either 'base' or 'raw' or 'derived'. Autofilled when choosing the proper inherited models",
  })
  @Prop({
    type: String,
    required: true,
    enum: [DatasetType.Raw, DatasetType.Derived],
    index: true,
  })
  type: string;

  @ApiProperty({
    type: String,
    required: false,
    description:
      "Defines a level of trust, e.g. a measure of how much data was verified or used by other persons",
  })
  @Prop({ type: String, required: false })
  validationStatus?: string;

  @ApiProperty({
    type: [String],
    required: false,
    description:
      "Array of tags associated with the meaning or contents of this dataset. Values should ideally come from defined vocabularies, taxonomies, ontologies or knowledge graphs",
  })
  @Prop({ type: [String], required: false })
  keywords: string[];

  @ApiProperty({
    type: String,
    required: false,
    description: "Free text explanation of contents of dataset",
  })
  @Prop({ type: String, required: false })
  description?: string;

  @ApiProperty({
    type: String,
    required: false,
    description:
      "A name for the dataset, given by the creator to carry some semantic meaning. Useful for display purposes e.g. instead of displaying the pid. Will be autofilled if missing using info from sourceFolder",
  })
  @Prop({
    type: String,
    required: false,
    default: function datasetName() {
      const sourceFolder = (this as DatasetDocument).sourceFolder;
      if (!sourceFolder) return "";
      const arr = sourceFolder.split("/");
      if (arr.length == 1) return arr[0];
      else return arr[arr.length - 2] + "/" + arr[arr.length - 1];
    },
  })
  datasetName?: string;

  @ApiProperty({
    type: String,
    required: false,
    description:
      "ACIA information about AUthenticity,COnfidentiality,INtegrity and AVailability requirements of dataset. E.g. AV(ailabilty)=medium could trigger the creation of a two tape copies. Format 'AV=medium,CO=low'",
  })
  @Prop({ type: String, required: false })
  classification?: string;

  @ApiProperty({
    type: String,
    required: false,
    description: "Name of license under which data can be used",
  })
  @Prop({ type: String, required: false })
  license?: string;

  @ApiProperty({
    type: String,
    required: false,
    description: "Version of API used in creation of dataset",
  })
  @Prop({ type: String, required: false })
  version?: string;

  @ApiProperty({
    type: Boolean,
    required: true,
    default: true,
    description: "Flag is true when data are made publically available",
  })
  @Prop({ type: Boolean, required: true, default: false })
  isPublished: boolean;

  @ApiProperty({
    type: HistoryClass,
    required: false,
    description: "List of objects containing old value and new value",
  })
  @Prop({ type: [HistorySchema], required: false })
  history?: HistoryClass[];

  @ApiProperty({
    type: LifecycleClass,
    required: false,
    default: {},
    description:
      "For each dataset there exists an embedded dataset lifecycle document which describes the current status of the dataset during its lifetime with respect to the storage handling systems",
  })
  @Prop({ type: LifecycleSchema, default: {}, required: false })
  datasetlifecycle?: LifecycleClass;

  @ApiProperty({
    type: "array",
    items: { $ref: getSchemaPath(TechniqueClass) },
    required: false,
    default: [],
    description: "Stores the metadata information for techniques",
  })
  @Prop({ type: [TechniqueSchema], required: false, default: [] })
  techniques?: TechniqueClass[];

  @ApiProperty({
    type: "array",
    items: { $ref: getSchemaPath(RelationshipClass) },
    required: false,
    default: [],
    description: "Stores the relationships with other datasets",
  })
  @Prop({ type: [RelationshipSchema], required: false, default: [] })
  relationships?: RelationshipClass[];

  @ApiProperty({
    type: [String],
    required: false,
    default: [],
    description: "List of users that the dataset has been shared with",
  })
  @Prop({
    type: [String],
    required: false,
    default: [],
  })
  sharedWith?: string[];

  @ApiProperty({
    type: "array",
    items: { $ref: getSchemaPath(Attachment) },
    required: false,
    description:
      "Small less than 16 MB attachments, envisaged for png/jpeg previews",
  })
  @Prop({ type: [AttachmentSchema], default: [] })
  attachments?: Attachment[];

  @ApiProperty({
    isArray: true,
    type: OrigDatablock,
    items: { $ref: getSchemaPath(OrigDatablock) },
    required: false,
    description:
      "Container list all files and their attributes which make up a dataset. Usually Filled at the time the datasets metadata is created in the data catalog. Can be used by subsequent archiving processes to create the archived datasets.",
  })
  @Prop({ type: [OrigDatablockSchema], default: [] })
  origdatablocks: OrigDatablock[];

  @ApiProperty({
    isArray: true,
    type: Datablock,
    items: { $ref: getSchemaPath(Datablock) },
    required: false,
    description:
      "When archiving a dataset all files contained in the dataset are listed here together with their checksum information. Several datablocks can be created if the file listing is too long for a single datablock. This partitioning decision is done by the archiving system to allow for chunks of datablocks with managable sizes. E.g a dataset consisting of 10 TB of data could be split into 10 datablocks of about 1 TB each. The upper limit set by the data catalog system itself is given by the fact that documents must be smaller than 16 MB, which typically allows for datasets of about 100000 files.",
  })
  @Prop({ type: [DatablockSchema], default: [] })
  datablocks: Datablock[];

  @ApiProperty({
    type: Object,
    required: false,
    default: {},
    description: "JSON object containing the scientific metadata",
  })
  @Prop({ type: Object, required: false, default: {} })
  scientificMetadata?: Record<string, unknown>;

  /*
   * fields related to Raw Datasets
   */
  @ApiProperty({
    type: String,
    required: false,
    description:
      "First name and last name of principal investigator(s). If multiple PIs are present, use a semicolon separated list. This field is required if the dataset is a Raw dataset.",
  })
  @Prop({ type: String, required: false })
  principalInvestigator?: string;

  @ApiProperty({
    type: Date,
    required: false,
    description:
      "Time of end of data acquisition for this dataset, format according to chapter 5.6 internet date/time format in RFC 3339. Local times without timezone/offset info are automatically transformed to UTC using the timezone of the API server. This field is required if the dataset is a Raw dataset",
  })
  @Prop({ type: Date, required: false })
  endTime?: Date;

  @ApiProperty({
    type: String,
    required: true,
    description:
      "Unique location identifier where data was taken, usually in the form /Site-name/facility-name/instrumentOrBeamline-name. This field is required if the dataset is a Raw dataset.",
  })
  @Prop({ type: String, required: false, index: true })
  creationLocation?: string;

  @ApiProperty({
    type: String,
    required: false,
    description:
      "Defines format of subsequent scientific meta data, e.g Nexus Version x.y.This field is required if the dataset is a Raw dataset.",
  })
  @Prop({ type: String, required: false })
  dataFormat?: string;

  @ApiProperty({
    type: String,
    required: false,
    description: "The ID of the proposal to which the dataset belongs.",
  })
  @Prop({ type: String, ref: "Proposal", required: false })
  proposalId?: string;

  @ApiProperty({
    type: String,
    required: false,
    description: "ID of the sample used when collecting the data.",
  })
  @Prop({ type: String, ref: "Sample", required: false })
  sampleId?: string;

  @ApiProperty({
    type: String,
    required: false,
    description: "ID of instrument where the data was created",
  })
  @Prop({ type: String, ref: "Instrument", required: false })
  instrumentId?: string;

  /*
   * Derived Dataset
   */
  @ApiProperty({
    type: String,
    required: false,
    description:
      "First name and last name of person or people pursuing the data analysis. The string may contain a list of emails, which should then be separated by semicolons. This field is required if the dataset is a Derived dataset.",
  })
  @Prop({ type: String, required: false, index: true })
  investigator?: string;

  @ApiProperty({
    type: [String],
    required: false,
    description:
      "Array of input dataset identifiers used in producing the derived dataset. Ideally these are the global identifier to existing datasets inside this or federated data catalogs. This field is required if the dataset is a Derived dataset.",
  })
  @Prop({ type: [String], required: false })
  inputDatasets?: string[];

  @ApiProperty({
    type: [String],
    required: false,
    description:
      "A list of links to software repositories which uniquely identifies the software used and the version for yielding the derived data. This field is required if the dataset is a Derived dataset.",
  })
  @Prop({ type: [String], required: false })
  usedSoftware?: string[];

  @ApiProperty({
    type: Object,
    required: false,
    description:
      "The creation process of the drived data will usually depend on input job parameters. The full structure of these input parameters are stored here",
  })
  @Prop({ type: Object, required: false })
  jobParameters?: Record<string, unknown>;

  @ApiProperty({
    type: String,
    required: false,
    description:
      "The output job logfile. Keep the size of this log data well below 15 MB ",
  })
  @Prop({ type: String, required: false })
  jobLogData?: string;
}

export const DatasetSchema = SchemaFactory.createForClass(DatasetClass);

DatasetSchema.index({ "$**": "text" });
