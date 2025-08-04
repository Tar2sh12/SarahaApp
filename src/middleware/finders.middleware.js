import { ErrorClass } from "../utils/index.js";

export const getDocumentByName = (model) => {
  return async (req, res, next) => {
    const modelInstance = new model();
    // Get the model name from the instance
    const modelName = modelInstance.constructor.modelName;
    const { name } = req.body;
    if (name) {
      const document = await model.findOne({ name });
      if (document) {
        return next(
          new ErrorClass(
            modelName+" name already exists",
            400,
            modelName+" name already exists"
          )
        );
      }
    }
    next();
  };
};

/**
 *
 * @param {Mongoose.model} model - Mongoose model e.g Brand, Category, SubCategory,..
 * @returns {Function} - Middleware function to check if the document exist
 * @description - Check if the document exist in the database with the given ids
 */
export const checkIfIdsExit = (model) => {
  return async (req, res, next) => {
    const { category, subCategory, brand } = req.query;
    // Ids check
    const document = await model.findOne({
        _id: brand,
        categoryId: category,
        subCategoryId: subCategory,
      })
      .populate([
        { path: "categoryId", select: "customId" },
        { path: "subCategoryId", select: "customId" },
      ]);
    if (!document)
      return next(
        new ErrorClass(`${model.modelName} is not found`, { status: 404 })
      );

    req.document = document;
    next();
  };
};
