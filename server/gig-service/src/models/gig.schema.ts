import { Schema, model, Model, Document, Types } from 'mongoose';

interface IGigAttributes {
  sellerId: Types.ObjectId;
  username: string;
  profilePicture: string;
  email: string;
  title: string;
  description: string;
  basicTitle: string;
  basicDescription: string;
  categories: string;
  subCategories: string[];
  tags: string[];
  active: boolean;
  expectedDelivery: string;
  ratingsCount: number;
  ratingSum: number;
  ratingCategories: {
    five: {
      value: number;
      count: number;
    };
    four: {
      value: number;
      count: number;
    };
    three: {
      value: number;
      count: number;
    };
    two: {
      value: number;
      count: number;
    };
    one: {
      value: number;
      count: number;
    };
  };
  price: number;
  sortId: number;
  coverImage: string;
}

interface IGigDocument extends Document, IGigAttributes {}

interface IGigModel extends Model<IGigDocument> {
  build(attrs: IGigAttributes): IGigDocument;
}

const gigSchema: Schema<IGigDocument, IGigModel> = new Schema(
  {
    sellerId: {
      type: Schema.Types.ObjectId,
      index: true
    },
    username: {
      type: String,
      required: true,
      index: true
    },
    profilePicture: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    basicTitle: {
      type: String,
      required: true
    },
    basicDescription: {
      type: String,
      required: true
    },
    categories: {
      type: String,
      required: true
    },
    subCategories: [
      {
        type: String,
        required: true
      }
    ],
    tags: [
      {
        type: String
      }
    ],
    active: {
      type: Boolean,
      default: true
    },
    expectedDelivery: {
      type: String,
      default: ''
    },
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
    price: {
      type: Number,
      default: 0
    },
    sortId: {
      type: Number
    },
    coverImage: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_doc: IGigDocument, rec: any) => {
        rec.id = rec._id;
        delete rec._id;
        return rec;
      }
    }
  }
);

gigSchema.virtual('id').get(function () {
  return this._id;
});

export const GigModel: Model<IGigDocument> = model<IGigDocument>('Gig', gigSchema);
