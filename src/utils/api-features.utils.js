export class ApiFeature {
  constructor(model, query, populate = [],select) {
    // Model for the query (e.g., Product | Category | SubCategory |...)
    this.model = model;
    // Query parameters from the request
    this.query = query;
    // Filters to apply
    this.filterObject = {};
    // Pagination settings
    this.paginationObject = {};
    // Populate settings
    this.populate = populate; // Array of objects { path: 'field', select: 'fields' }
    this.select = select; // Fields to select
    
  }

  // Pagination
  pagination() {
    const { page = 1, limit = 2 } = this.query;
    const skip = (page - 1) * limit;

    this.paginationObject = {
      limit: parseInt(limit),
      skip,
      page: parseInt(page),
      select:this.select ? this.select : "-__v -createdAt -updatedAt",
    };

    // console.log('============ paginationObject in pagination() ==========', this.paginationObject);

    this.mongooseQuery = this.model.paginate(this.filterObject, {
      ...this.paginationObject,
      populate: this.populate,
    });
    return this;
  }

  // Sorting
  sort() {
    const { sort } = this.query;
    if (sort) {
      this.paginationObject.sort = JSON.parse(sort);
      //console.log('============ paginationObject in sort() ==========', this.paginationObject);

      this.mongooseQuery = this.model.paginate(this.filterObject, {
        ...this.paginationObject,
        populate: this.populate,
      });
    }
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
          // Recurse for nested objects
          addRegexOptions(obj[key]);
        }
      }
    }

    addRegexOptions(parsedFilters);
    this.filterObject = parsedFilters;

    this.mongooseQuery = this.model.paginate(this.filterObject, {
      ...this.paginationObject,
      populate: this.populate,
    });

    return this;
  }

  // Populate
  populateFields() {
    if (this.populate.length > 0) {
      // console.log('============ populate settings in populateFields() ==========', this.populate);

      this.mongooseQuery = this.model.paginate(this.filterObject, {
        ...this.paginationObject,
        populate: this.populate,
      });
    }
    return this;
  }
}