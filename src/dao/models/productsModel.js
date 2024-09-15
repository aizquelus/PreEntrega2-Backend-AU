import mongoose from "mongoose";
import paginate from "mongoose-paginate-v2";

const productsColl = "products";
const productsSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            unique: true
        },
        description: String,
        code: {
            type: Number,
            unique: true
        },
        price: Number,
        status: Boolean,
        stock: Number,
        category: String
    },
    {
        timestamps:true
    }
)

productsSchema.plugin(paginate);

export const productsModel = mongoose.model(
    productsColl,
    productsSchema
)
