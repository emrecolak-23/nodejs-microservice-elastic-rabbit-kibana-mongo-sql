import { Schema, Model, model, Types, Document } from 'mongoose';

interface ILanguage {
  language: string;
  level: string;
}

interface IRatingCategory {
  value: number;
  count: number;
}

interface IRatingCategories {
  five: IRatingCategory;
  four: IRatingCategory;
  three: IRatingCategory;
  two: IRatingCategory;
  one: IRatingCategory;
}

interface IExperience {
  company?: string;
  title?: string;
  startDate?: Date;
  endDate?: Date;
  description?: string;
  currentlyWorkingHere?: boolean;
}

interface IEducation {
  country?: string;
  university?: string;
  title?: string;
  major?: string;
  year?: string;
}

interface ICertificate {
  name?: string;
  from?: string;
  year?: number;
}

export interface ISellerAttributes {
  fullName: string;
  username: string;
  email: string;
  profilePicture: string;
  description: string;
  profilePublicId: string;
  country: string;
  languages: ILanguage[];
  skills: string[];
  oneline?: string;
  ratingsCount?: number;
  ratingSum?: number;
  ratingCategories?: IRatingCategories;
  responseTime?: number;
  recentDelivery?: Date;
  experience?: IExperience[];
  education?: IEducation[];
  socialLinks?: string[];
  certificates?: ICertificate[];
  ongoingJobs?: number;
  completedJobs?: number;
  cancelledJobs?: number;
  totalEarnings?: number;
  totalGigs?: number;
}

interface ISellerModel extends Model<ISellerAttributes> {}

interface ISellerDocument extends Document, ISellerAttributes {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const sellerSchema = new Schema<ISellerDocument, ISellerModel>(
  {
    fullName: {
      type: String,
      required: true
    },
    username: {
      type: String,
      required: true,
      index: true
    },
    email: {
      type: String,
      required: true,
      index: true
    },
    profilePicture: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    profilePublicId: {
      type: String,
      required: true
    },
    oneline: {
      type: String,
      default: ''
    },
    country: {
      type: String,
      required: true
    },
    languages: [
      {
        language: {
          type: String,
          required: true
        },
        level: {
          type: String,
          required: true
        }
      }
    ],
    skills: [
      {
        type: String,
        required: true
      }
    ],
    ratingsCount: {
      type: Number,
      default: 0
    },
    ratingSum: {
      type: Number,
      default: 0
    },
    ratingCategories: {
      five: {
        value: {
          type: Number,
          default: 0
        },
        count: {
          type: Number,
          default: 0
        }
      },
      four: {
        value: {
          type: Number,
          default: 0
        },
        count: {
          type: Number,
          default: 0
        }
      },
      three: {
        value: {
          type: Number,
          default: 0
        },
        count: {
          type: Number,
          default: 0
        }
      },
      two: {
        value: {
          type: Number,
          default: 0
        },
        count: {
          type: Number,
          default: 0
        }
      },
      one: {
        value: {
          type: Number,
          default: 0
        },
        count: {
          type: Number,
          default: 0
        }
      }
    },
    responseTime: {
      type: Number,
      default: 0
    },
    recentDelivery: {
      type: Date,
      default: null
    },
    experience: [
      {
        company: {
          type: String,
          default: ''
        },
        title: {
          type: String,
          default: ''
        },
        startDate: {
          type: Date,
          default: null
        },
        endDate: {
          type: Date,
          default: null
        },
        description: {
          type: String,
          default: ''
        },
        currentlyWorkingHere: {
          type: Boolean,
          default: false
        }
      }
    ],
    education: [
      {
        country: {
          type: String,
          default: ''
        },
        university: {
          type: String,
          default: ''
        },
        title: {
          type: String,
          default: ''
        },
        major: {
          type: String,
          default: ''
        },
        year: {
          type: String,
          default: ''
        }
      }
    ],
    socialLinks: [
      {
        type: String,
        default: ''
      }
    ],
    certificates: [
      {
        name: {
          type: String,
          default: ''
        },
        from: {
          type: String,
          default: ''
        },
        year: {
          type: Number,
          default: null
        }
      }
    ],
    ongoingJobs: {
      type: Number,
      default: 0
    },
    completedJobs: {
      type: Number,
      default: 0
    },
    cancelledJobs: {
      type: Number,
      default: 0
    },
    totalEarnings: {
      type: Number,
      default: 0
    },
    totalGigs: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

sellerSchema.statics.build = (attrs: ISellerAttributes) => {
  return new SellerModel(attrs);
};

export const SellerModel: Model<ISellerDocument> = model<ISellerDocument>('Seller', sellerSchema);
