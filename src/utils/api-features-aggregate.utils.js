import { Types } from "mongoose";
import mongoose from "mongoose";
export class ApiAggregateFeature {
  constructor(model, query, populate, select = { __v: 0 }) {
    // Model for the query (e.g., Product | Category | SubCategory |...)
    this.model = model;
    // Query parameters from the request
    this.query = query;
    this.populate = populate; // Array of objects { from:"fields" , localField:"fieldId" , foreignField:"_id" , as: "returnedObjectName" }
    this.filterObject = {};
    // Pagination settings
    this.paginationObject = {};
    this.mongooseQuery = this.model.aggregate([]);
    this.pipeline = [];
    this.select = select;
  }
  // Pagination
  pagination() {
    const { page = 1, limit = 2 } = this.query;
    const skip = (page - 1) * limit;

    this.paginationObject = {
      limit: parseInt(limit),
      skip,
      page: parseInt(page),
    };
    return this;
  }

  // Sorting
  sort() {
    const { sort } = this.query;
    if (sort) {
      const parsedSort = JSON.parse(sort); //for example { createdAt: "-1" }
      let sortObj = {};

      for (const key in parsedSort) {
        const val = parsedSort[key];
        // Convert string "-1"/"1" to number -1/1
        sortObj[key] = typeof val === "string" ? parseInt(val, 10) : val;
      }

      this.pipeline.push({ $sort: sortObj });
    }
    this.mongooseQuery = this.model.aggregate(this.pipeline);
    return this;
  }

  // Filtering
  filters() {
    const { page = 1, limit = 2, sort, ...filters } = this.query;

    const filtersAsString = JSON.stringify(filters);
    const replacedFilters = filtersAsString.replace(
      /lt|lte|gt|gte|regex|eq/g,
      (match) => `$${match}`
    );
    let parsedFilters = JSON.parse(replacedFilters);

    // Add $options: 'i' to every $regex
    function addRegexOptions(obj) {
      for (const key in obj) {
        if (typeof obj[key] === "object" && obj[key] !== null) {
          if ("$regex" in obj[key]) {
            obj[key]["$options"] = "i";
          }
          // Convert string comparison values to numbers
          for (const op of ["$gt", "$gte", "$lt", "$lte"]) {
            if (op in obj[key]) {
              const val = obj[key][op];
              if (!isNaN(val)) {
                obj[key][op] = parseFloat(val);
              }
            }
          }
          for (const op of ["$eq"]) {
            if (op in obj[key]) {
              const val = obj[key][op];
              const isValid = Types.ObjectId.isValid(val);
              if (isValid) {
                obj[key][op] = new mongoose.Types.ObjectId(val);
              }
            }
          }
          // Recurse for nested objects
          addRegexOptions(obj[key]);
        }
      }
    }

    addRegexOptions(parsedFilters);
    this.filterObject = parsedFilters;

    this.pipeline.push({
      $match: this.filterObject,
    });

    // Create the mongoose query with the filter object
    this.mongooseQuery = this.model.aggregate(this.pipeline);
    return this;
  }
  // Populate fields
  populateFields() {
    if (!this.pipeline) {
      this.pipeline = [];
    }

    if (this.populate && Array.isArray(this.populate)) {
      this.populate.forEach((pop) => {
        this.pipeline.push({
          $lookup: {
            from: pop.from,
            localField: pop.localField,
            foreignField: pop.foreignField,
            as: pop.as,
          },
        });

        this.pipeline.push({
          $unwind: {
            path: `$${pop.as}`,
            preserveNullAndEmptyArrays: true,
          },
        });
      });
    }

    // for deselecting or selecting fields
    if (this.select) {
      this.pipeline.push({
        $project: this.select,
      });
    }

    this.mongooseQuery = this.model.aggregate(this.pipeline);

    return this;
  }

  async execute() {
    const list = await this.model.aggregatePaginate(this.mongooseQuery, {
      ...this.paginationObject,
    });
    return list;
  }
}
