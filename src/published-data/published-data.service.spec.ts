import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { Model } from "mongoose";
import { PublishedDataService } from "./published-data.service";
import { PublishedData } from "./schemas/published-data.schema";

const mockPublishedData: PublishedData = {
  doi: "100.10/random-test-uuid-string",
  _id: "100.10/random-test-uuid-string",
  affiliation: "Test affiliation",
  creator: ["Test Creator"],
  publisher: "Test publisher",
  publicationYear: 2022,
  title: "Test Title",
  url: "https://host.com",
  abstract: "Test abstract",
  dataDescription: "Test dataDescription",
  resourceType: "Test resourceType",
  numberOfFiles: 1,
  sizeOfArchive: 1000000,
  pidArray: ["100.10/test-pid-uuid-string"],
  authors: ["Test Author"],
  registeredTime: new Date("2022-02-15T13:00:00"),
  status: "registered",
  scicatUser: "Test scicatUser",
  thumbnail: "Test thumbnail",
  relatedPublications: ["test RelatedPublications"],
  downloadLink: "https://link.download.com",
  createdAt: new Date("2022-02-15T13:00:00"),
  updatedAt: new Date("2022-02-15T13:00:00"),
};

describe("PublishedDataService", () => {
  let service: PublishedDataService;
  let model: Model<PublishedData>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublishedDataService,
        {
          provide: getModelToken("PublishedData"),
          useValue: {
            new: jest.fn().mockResolvedValue(mockPublishedData),
            constructor: jest.fn().mockResolvedValue(mockPublishedData),
            find: jest.fn(),
            create: jest.fn(),
            exec: jest.fn(),
          },
        },
      ],
    }).compile();

    service = await module.resolve<PublishedDataService>(PublishedDataService);
    model = module.get<Model<PublishedData>>(getModelToken("PublishedData"));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
