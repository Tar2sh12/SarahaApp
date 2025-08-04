import mongoose from "mongoose";
import aggregatePaginate  from "mongoose-aggregate-paginate-v2";
import mongoosePaginate from "mongoose-paginate-v2";

mongoose.plugin(mongoosePaginate);
mongoose.plugin(aggregatePaginate);


export default mongoose;
